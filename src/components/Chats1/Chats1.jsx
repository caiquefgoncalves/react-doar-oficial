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

    const [conversas, setConversas] = useState([]);
    const [carregandoConversas, setCarregandoConversas] = useState(true);
    const [conversaSelecionada, setConversaSelecionada] = useState(null);

    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [iniciando, setIniciando] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const mensagensEndRef = useRef(null);
    const socketRef = useRef(null);
    const mensagemIdsRef = useRef(new Set());
    const mensagensContainerRef = useRef(null);
    const isFirstLoadRef = useRef(true);

    // Função para rolar para o final do chat (mais recente)
    const scrollToBottom = () => {
        if (mensagensContainerRef.current) {
            const container = mensagensContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    // Função para atualizar a URL com o ID do contato (pode ser ONG ou DOADOR)
    const atualizarUrl = (contatoId) => {
        if (contatoId) {
            navigate(`/chats?contato=${contatoId}`, { replace: false });
        } else {
            navigate('/chats', { replace: false });
        }
    };

    // Verificar se veio parâmetro na URL para abrir conversa direta
    useEffect(() => {
        if (conversas.length > 0) {
            const params = new URLSearchParams(location.search);
            const conversaId = params.get('conversa');
            const contatoId = params.get('contato');

            if (conversaId) {
                const conversa = conversas.find(c => c.conversa_id === parseInt(conversaId));
                if (conversa) {
                    setConversaSelecionada(conversa);
                }
            } else if (contatoId) {
                const conversaExistente = conversas.find(c => c.usuario_id === parseInt(contatoId));
                if (conversaExistente) {
                    setConversaSelecionada(conversaExistente);
                } else if (usuarioTipo === 1) {
                    // Se for doador, tenta iniciar conversa com a ONG
                    iniciarConversaAutomatica(parseInt(contatoId));
                }
            }
        }
    }, [conversas, location.search, usuarioTipo]);

    const getToken = () => localStorage.getItem('token');

    // Configurar Socket.IO
    useEffect(() => {
        const token = getToken();
        if (!token || !autorizado) return;

        const socket = io(api_url, {
            transports: ['polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            timeout: 10000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket conectado');
            setSocketConnected(true);
            socket.emit('authenticate', { token });
        });

        socket.on('disconnect', () => {
            console.log('Socket desconectado');
            setSocketConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Erro no socket:', error);
            setSocketConnected(false);
        });

        socket.on('authenticated', (data) => {
            console.log('Autenticado:', data);
        });

        socket.on('new_message', (data) => {
            console.log('Nova mensagem recebida:', data);

            if (conversaSelecionada && data.conversa_id === conversaSelecionada.conversa_id) {
                if (!mensagemIdsRef.current.has(data.id)) {
                    mensagemIdsRef.current.add(data.id);
                    setMensagens(prev => {
                        const existe = prev.some(msg => msg.id === data.id);
                        if (!existe) {
                            return [...prev, {
                                id: data.id,
                                remetente_id: data.remetente_id,
                                mensagem: data.mensagem,
                                data: data.data,
                                is_meu_envio: data.remetente_id === usuarioId
                            }].sort((a, b) => a.id - b.id);
                        }
                        return prev;
                    });
                }
            }

            setConversas(prev => {
                const conversaAtualizada = prev.find(c => c.conversa_id === data.conversa_id);
                if (conversaAtualizada) {
                    const outras = prev.filter(c => c.conversa_id !== data.conversa_id);
                    return [{ ...conversaAtualizada, ultimo_texto: data.mensagem.substring(0, 35) }, ...outras];
                }
                return prev;
            });
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
    }, [api_url, autorizado, usuarioId, conversaSelecionada]);

    useEffect(() => {
        if (socketConnected && conversaSelecionada && socketRef.current) {
            socketRef.current.emit('join_conversa', { conversa_id: conversaSelecionada.conversa_id });
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

        if (tokenData.tipo !== 1 && tokenData.tipo !== 2) {
            setMsgTexto('Apenas doadores e ONGs podem acessar o chat');
            setMsgTipo('erro');
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
            return;
        }

        setAutorizado(true);
        setUsuarioTipo(tokenData.tipo);
        setUsuarioId(tokenData.id_usuarios);

        carregarConversas(token);
    }, []);

    useEffect(() => {
        if (conversaSelecionada) {
            setMensagens([]);
            mensagemIdsRef.current.clear();
            isFirstLoadRef.current = true;
            carregarMensagens(conversaSelecionada.conversa_id);
        }
    }, [conversaSelecionada]);

    // Rolar para o final quando as mensagens são carregadas pela primeira vez
    useEffect(() => {
        if (mensagens.length > 0 && isFirstLoadRef.current) {
            setTimeout(() => {
                scrollToBottom();
                isFirstLoadRef.current = false;
            }, 100);
        }
    }, [mensagens]);

    async function carregarConversas(tokenParam) {
        const token = tokenParam || getToken();
        if (!token) return;

        try {
            const response = await fetch(`${api_url}/dm/listar_conversas?token=${token}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
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
                headers: { 'Content-Type': 'application/json' }
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

    async function iniciarConversaAutomatica(contatoId) {
        const token = getToken();
        if (!token) return;

        setIniciando(true);
        try {
            const response = await fetch(`${api_url}/dm/iniciar_conversa/${contatoId}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                await carregarConversas();
                setTimeout(async () => {
                    await carregarConversas();
                    const novaConversa = conversas.find(c => c.usuario_id === contatoId);
                    if (novaConversa) {
                        setConversaSelecionada(novaConversa);
                        atualizarUrl(contatoId);
                    }
                }, 500);
            } else {
                const data = await response.json();
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

    function voltarParaConversas() {
        setConversaSelecionada(null);
        mensagemIdsRef.current.clear();
        isFirstLoadRef.current = true;
        navigate('/chats', { replace: true });
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    };

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
                minute: '2-digit'
            }),
            is_meu_envio: true,
            isTemp: true
        };

        setMensagens(prev => [...prev, mensagemTemp]);
        setNovaMensagem('');

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
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            } else {
                setMensagens(prev => prev.filter(msg => msg.id !== mensagemTemp.id));
                const data = await response.json();
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

    function getImagemUrl(id) {
        return `${api_url}/uploads/Usuarios/${id}.jpeg`;
    }

    if (!autorizado) return null;

    return (
        <section className={css.secao}>
            <MenuLateral />

            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}

            <div className={css.container}>
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
                                onClick={() => {
                                    setConversaSelecionada(conv);
                                    atualizarUrl(conv.usuario_id);
                                }}
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
                            </div>
                        ))
                    )}
                </div>
            </div>

            {conversaSelecionada ? (
                <div className={css.chatArea}>
                    <div className={css.header}>
                        <button className={css.btnVoltar} onClick={voltarParaConversas}>
                            <img src='/voltar.png' alt="Voltar" />
                        </button>
                        <img
                            className={css.imagem}
                            src={getImagemUrl(conversaSelecionada.usuario_id)}
                            onError={(e) => { e.target.src = '/sem_imagem.webp'; }}
                            alt={conversaSelecionada.usuario_nome}
                        />
                        <div>
                            <p>{conversaSelecionada.usuario_nome}</p>
                        </div>
                    </div>

                    <div className={css.mensagens} ref={mensagensContainerRef}>
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

                    <form className={css.chat} onSubmit={(e) => e.preventDefault()}>
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
                    </form>
                </div>
            ) : (
                <div className={css.chatAreaVazio}>
                    <div className={css.mensagemVazio}>
                        <img src={"/baterPapo.png"} alt="Chats" />
                        <p>Selecione uma conversa ou inicie uma nova conversa</p>
                    </div>
                </div>
            )}
        </section>
    );
}