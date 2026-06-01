// src/components/Chats1/Chats1.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from 'socket.io-client';
import css from './Chats1.module.css';
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import Input from "../Input/Input.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import Titulo from "../Titulo/Titulo.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function Chats1({ api }) {
    const api_url = api;
    const navigate = useNavigate();
    const location = useLocation();

    const [autorizado, setAutorizado] = useState(false);
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    // Estado para conversas existentes
    const [conversas, setConversas] = useState([]);
    const [carregandoConversas, setCarregandoConversas] = useState(true);
    const [conversaSelecionada, setConversaSelecionada] = useState(null);

    // Estado para mensagens
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [enviando, setEnviando] = useState(false);

    // Estado para feedback
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [iniciando, setIniciando] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    // Estado para status online do contato
    const [contatoOnline, setContatoOnline] = useState(false);
    const [ultimaAtividade, setUltimaAtividade] = useState(null);

    const mensagensEndRef = useRef(null);
    const socketRef = useRef(null);
    const mensagemIdsRef = useRef(new Set());

    // Verificar se veio parâmetro na URL para abrir conversa direta
    useEffect(() => {
        if (conversas.length > 0) {
            const params = new URLSearchParams(location.search);
            const conversaId = params.get('conversa');
            const ongId = params.get('ong');

            if (conversaId) {
                const conversa = conversas.find(c => c.conversa_id === parseInt(conversaId));
                if (conversa) {
                    setConversaSelecionada(conversa);
                }
            } else if (ongId) {
                const conversaExistente = conversas.find(c => c.usuario_id === parseInt(ongId));
                if (conversaExistente) {
                    setConversaSelecionada(conversaExistente);
                } else {
                    iniciarConversaAutomatica(parseInt(ongId));
                }
            }
        }
    }, [conversas, location.search]);

    // Obter token do localStorage
    const getToken = () => {
        const token = localStorage.getItem('token');
        return token;
    };

    // Configurar Socket.IO
    useEffect(() => {
        const token = getToken();
        if (!token || !autorizado) return;

        const socket = io(api_url, {
            transports: ['polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 10000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket.IO conectado');
            setSocketConnected(true);
            socket.emit('authenticate', { token });
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO desconectado');
            setSocketConnected(false);
            setContatoOnline(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Erro de conexão no Socket.IO:', error);
            setSocketConnected(false);
        });

        socket.on('authenticated', (data) => {
            console.log('Autenticado no socket:', data);
        });

        socket.on('user_status', (data) => {
            console.log('Status do usuário:', data);
            if (conversaSelecionada && data.usuario_id === conversaSelecionada.usuario_id) {
                setContatoOnline(data.status);
                if (!data.status && data.ultima_atividade) {
                    setUltimaAtividade(data.ultima_atividade);
                }
            }
            // Atualizar lista de conversas para mostrar indicador
            carregarConversas();
        });

        socket.on('participant_status', (data) => {
            console.log('Status do participante:', data);
            setContatoOnline(data.status);
            if (!data.status && data.ultima_atividade) {
                setUltimaAtividade(data.ultima_atividade);
            }
        });

        socket.on('new_message', (data) => {
            console.log('Nova mensagem recebida:', data);

            if (conversaSelecionada && data.conversa_id === conversaSelecionada.conversa_id) {
                if (!mensagemIdsRef.current.has(data.id)) {
                    mensagemIdsRef.current.add(data.id);
                    const novaMsg = {
                        id: data.id,
                        remetente_id: data.remetente_id,
                        mensagem: data.mensagem,
                        data: data.data,
                        is_meu_envio: data.remetente_id === usuarioId
                    };
                    setMensagens(prev => [...prev, novaMsg].sort((a, b) => a.id - b.id));
                }
            }
            carregarConversas();
        });

        socket.on('error', (data) => {
            console.error('Erro no socket:', data);
            setMsgTexto(data.error || 'Erro na conexão do chat');
            setMsgTipo('erro');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [api_url, autorizado, usuarioId]);

    // Entrar na sala da conversa selecionada
    useEffect(() => {
        if (socketConnected && conversaSelecionada && socketRef.current) {
            socketRef.current.emit('join_conversa', { conversa_id: conversaSelecionada.conversa_id });
            setContatoOnline(false);
            setUltimaAtividade(null);
        }
    }, [socketConnected, conversaSelecionada]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        const tokenData = decodificarToken(token);
        if (!tokenData) {
            navigate('/login');
            return;
        }

        if (tokenData.exp) {
            const agora = Math.floor(Date.now() / 1000);
            if (tokenData.exp < agora) {
                localStorage.clear();
                navigate('/login');
                return;
            }
        }

        if (tokenData.tipo !== 1) {
            navigate('/dashboard');
            return;
        }

        setAutorizado(true);
        setUsuarioTipo(tokenData.tipo);
        setUsuarioId(tokenData.id_usuarios);

        carregarConversas(token);
    }, []);

    // Carregar mensagens da conversa selecionada
    useEffect(() => {
        if (conversaSelecionada) {
            setMensagens([]);
            mensagemIdsRef.current.clear();
            carregarMensagens(conversaSelecionada.conversa_id);
        }
    }, [conversaSelecionada]);

    // Scroll automático
    useEffect(() => {
        if (mensagensEndRef.current) {
            mensagensEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensagens]);

    async function carregarConversas(tokenParam) {
        const token = tokenParam || getToken();
        if (!token) return;

        try {
            const response = await fetch(`${api_url}/dm/listar_conversas?token=${token}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversas(data.conversas || []);
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        } finally {
            setCarregandoConversas(false);
        }
    }

    async function carregarMensagens(conversaId) {
        const token = getToken();
        if (!token) return;

        try {
            setCarregandoMensagens(true);
            const response = await fetch(`${api_url}/dm/mensagens/${conversaId}?token=${token}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const mensagensCarregadas = data.mensagens || [];
                mensagensCarregadas.forEach(msg => mensagemIdsRef.current.add(msg.id));
                setMensagens(mensagensCarregadas.sort((a, b) => a.id - b.id));
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        } finally {
            setCarregandoMensagens(false);
        }
    }

    async function iniciarConversaAutomatica(ongId) {
        const token = getToken();
        if (!token) return;

        setIniciando(true);
        try {
            const response = await fetch(`${api_url}/dm/iniciar_conversa/${ongId}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                await carregarConversas();
                setTimeout(async () => {
                    await carregarConversas();
                    const novaConversa = conversas.find(c => c.usuario_id === ongId);
                    if (novaConversa) {
                        setConversaSelecionada(novaConversa);
                    }
                }, 500);
            } else {
                setMsgTexto(data.error || 'Erro ao iniciar conversa');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão');
            setMsgTipo('erro');
        } finally {
            setIniciando(false);
        }
    }

    async function enviarMensagem() {
        if (!novaMensagem.trim()) return;
        if (!conversaSelecionada) return;

        const token = getToken();
        if (!token) {
            setMsgTexto('Token não encontrado. Faça login novamente.');
            setMsgTipo('erro');
            return;
        }

        const mensagemTexto = novaMensagem.trim();

        const mensagemTemp = {
            id: Date.now(),
            remetente_id: usuarioId,
            mensagem: mensagemTexto,
            data: new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            is_meu_envio: true,
            isTemp: true
        };

        setMensagens(prev => [...prev, mensagemTemp]);
        setNovaMensagem('');

        setTimeout(() => {
            if (mensagensEndRef.current) {
                mensagensEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);

        setEnviando(true);

        try {
            const response = await fetch(`${api_url}/dm/enviar_mensagem/${conversaSelecionada.conversa_id}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: mensagemTexto })
            });

            if (response.ok) {
                setMensagens(prev => prev.filter(msg => !msg.isTemp));
                await carregarMensagens(conversaSelecionada.conversa_id);
                await carregarConversas();
            } else {
                const data = await response.json();
                setMensagens(prev => prev.filter(msg => msg.id !== mensagemTemp.id));
                setMsgTexto(data.error || 'Erro ao enviar mensagem');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMensagens(prev => prev.filter(msg => msg.id !== mensagemTemp.id));
            setMsgTexto('Erro de conexão. Tente novamente.');
            setMsgTipo('erro');
        } finally {
            setEnviando(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    }

    function voltarParaConversas() {
        setConversaSelecionada(null);
        mensagemIdsRef.current.clear();
        setContatoOnline(false);
        setUltimaAtividade(null);
    }

    function getImagemUrl(id) {
        return `${api_url}/uploads/Usuarios/${id}.jpeg`;
    }

    function getStatusText() {
        if (contatoOnline) {
            return 'Online';
        } else if (ultimaAtividade) {
            return `Visto por último em ${ultimaAtividade}`;
        }
        return 'Offline';
    }

    if (!autorizado) return null;

    return (
        <section className={css.secao}>
            <MenuLateral />

            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}

            {!conversaSelecionada ? (
                <div className={css.container}>
                    {/* Conversas Existentes */}
                    <div className={css.secaoConversas}>
                        <Titulo titulo={"Minhas Conversas"} cor={"preto"}/>
                        {carregandoConversas ? (
                            <p className={css.carregando}>Carregando conversas...</p>
                        ) : conversas.length === 0 ? (
                            <p className={css.semConversas}>Nenhuma conversa ainda.</p>
                        ) : (
                            conversas.map(conv => (
                                <div
                                    key={conv.conversa_id}
                                    className={css.conversaItem}
                                    onClick={() => setConversaSelecionada(conv)}
                                >
                                    <img
                                        className={css.imagem}
                                        src={getImagemUrl(conv.usuario_id)}
                                        onError={(e) => { e.target.src = '/sem_imagem.webp'; }}
                                        alt={conv.usuario_nome}
                                    />
                                    <div className={css.conversaInfo}>
                                        <p className={css.nome}>{conv.usuario_nome}</p>
                                        <p className={css.mensagem}>{conv.ultimo_texto?.substring(0, 35) || 'Nenhuma mensagem'}</p>
                                    </div>
                                    <div className={`${css.statusDot} ${conv.online ? css.online : css.offline}`}></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className={css.chatArea}>
                    <div className={css.header}>
                        <button className={css.btnVoltar} onClick={voltarParaConversas}>←</button>
                        <img
                            className={css.imagem}
                            src={getImagemUrl(conversaSelecionada.usuario_id)}
                            onError={(e) => { e.target.src = '/sem_imagem.webp'; }}
                            alt={conversaSelecionada.usuario_nome}
                        />
                        <div>
                            <p>{conversaSelecionada.usuario_nome}</p>
                            <span className={`${css.statusText} ${contatoOnline ? css.statusOnline : css.statusOffline}`}>
                                {getStatusText()}
                            </span>
                        </div>
                    </div>

                    <div className={css.mensagens}>
                        {carregandoMensagens && mensagens.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Carregando mensagens...</p>
                        ) : mensagens.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhuma mensagem ainda. Envie uma mensagem!</p>
                        ) : (
                            mensagens.map(msg => (
                                <div
                                    key={msg.id}
                                    className={msg.is_meu_envio ? css.mensagemEu : css.mensagemVoce}
                                >
                                    <div>
                                        <p>{msg.mensagem}</p>
                                        <span className={css.dataMensagem}>{msg.data}</span>
                                        {msg.isTemp && <span className={css.enviando}> Enviando...</span>}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={mensagensEndRef} />
                    </div>

                    <div className={css.chat}>
                        <Input
                            placeholder="Digite uma mensagem..."
                            input={novaMensagem}
                            alterarInput={(e) => setNovaMensagem(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className={css.mandar}
                            onClick={enviarMensagem}
                            disabled={enviando || !novaMensagem.trim()}
                        >
                            <img src={"/mandar.png"} alt="Enviar mensagem" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}