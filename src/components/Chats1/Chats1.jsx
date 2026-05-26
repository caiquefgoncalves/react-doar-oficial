import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

    const [autorizado, setAutorizado] = useState(false);
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    // Estado para conversas existentes
    const [conversas, setConversas] = useState([]);
    const [carregandoConversas, setCarregandoConversas] = useState(true);
    const [conversaSelecionada, setConversaSelecionada] = useState(null);

    // Estado para ONGs disponíveis (apenas para doadores)
    const [ongsDisponiveis, setOngsDisponiveis] = useState([]);
    const [carregandoOngs, setCarregandoOngs] = useState(false);
    const [buscaOng, setBuscaOng] = useState('');

    // Estado para mensagens
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [enviando, setEnviando] = useState(false);

    // Estado para mensagens de feedback
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [iniciando, setIniciando] = useState(false);

    // Referência para scroll automático
    const mensagensEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        const tokenData = decodificarToken(token);
        if (tokenData && tokenData.exp) {
            const agora = Math.floor(Date.now() / 1000);
            if (tokenData.exp < agora) {
                localStorage.clear();
                navigate('/login');
                return;
            }
        }

        if (!tokenData) {
            navigate('/login');
            return;
        }

        setAutorizado(true);
        setUsuarioTipo(tokenData.tipo);
        setUsuarioId(tokenData.id_usuarios);

        carregarConversas();

        // Se for doador, carregar ONGs disponíveis
        if (tokenData.tipo === 1) {
            carregarOngsDisponiveis();
        }
    }, []);

    // Scroll automático quando novas mensagens chegam
    useEffect(() => {
        if (mensagensEndRef.current) {
            mensagensEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensagens]);

    async function carregarConversas() {
        try {
            setCarregandoConversas(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/dm/listar_conversas?token=${token}`, {
                method: 'GET',
                credentials: 'include'
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

    async function carregarOngsDisponiveis() {
        try {
            setCarregandoOngs(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_ongs_ativas?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setOngsDisponiveis(data.ongs || []);
            }
        } catch (error) {
            console.error('Erro ao carregar ONGs:', error);
        } finally {
            setCarregandoOngs(false);
        }
    }

    async function iniciarConversa(ongId) {
        setIniciando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/dm/iniciar_conversa/${ongId}?token=${token}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Recarregar conversas e selecionar a nova
                await carregarConversas();
                // Buscar a conversa criada
                const conversaExistente = conversas.find(c => c.usuario_id === ongId);
                if (conversaExistente) {
                    selecionarConversa(conversaExistente);
                } else {
                    // Recarregar a página para mostrar a nova conversa
                    window.location.reload();
                }
            } else {
                setMsgTexto(data.error || 'Erro ao iniciar conversa');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro ao iniciar conversa:', error);
            setMsgTexto('Erro de conexão');
            setMsgTipo('erro');
        } finally {
            setIniciando(false);
        }
    }

    async function selecionarConversa(conversa) {
        setConversaSelecionada(conversa);
        await carregarMensagens(conversa.conversa_id);
    }

    async function carregarMensagens(conversaId) {
        try {
            setCarregandoMensagens(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/dm/mensagens/${conversaId}?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setMensagens(data.mensagens || []);
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        } finally {
            setCarregandoMensagens(false);
        }
    }

    async function enviarMensagem() {
        if (!novaMensagem.trim()) return;
        if (!conversaSelecionada) return;

        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/dm/enviar_mensagem/${conversaSelecionada.conversa_id}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: novaMensagem })
            });

            if (response.ok) {
                await carregarMensagens(conversaSelecionada.conversa_id);
                setNovaMensagem('');
                await carregarConversas();
            } else {
                const data = await response.json();
                setMsgTexto(data.error || 'Erro ao enviar mensagem');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMsgTexto('Erro ao enviar mensagem');
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
    }

    function getImagemUrl(id) {
        return `${api_url}/uploads/Usuarios/${id}.jpeg`;
    }

    const ongsFiltradas = ongsDisponiveis.filter(ong =>
        ong.nome.toLowerCase().includes(buscaOng.toLowerCase()) ||
        (ong.categoria && ong.categoria.toLowerCase().includes(buscaOng.toLowerCase()))
    );

    if (!autorizado) return null;

    return (
        <section className={css.secao}>
            <MenuLateral />

            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}

            {/* Lista de Conversas e ONGs */}
            <div className={`${css.container} ${conversaSelecionada ? css.containerOculto : ''}`}>
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
                                className={`${css.conversaItem}`}
                                onClick={() => selecionarConversa(conv)}
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

                {/* Apenas para doadores: Lista de ONGs disponíveis para conversar */}
                {usuarioTipo === 1 && (
                    <div className={css.secaoOngs}>
                        <h3 className={css.tituloSecao}>Iniciar Nova Conversa</h3>
                        <div className={css.buscaOng}>
                            <input
                                type="text"
                                placeholder="Buscar ONG por nome..."
                                value={buscaOng}
                                onChange={(e) => setBuscaOng(e.target.value)}
                                className={css.inputBusca}
                            />
                        </div>

                        {carregandoOngs ? (
                            <p className={css.carregando}>Carregando ONGs...</p>
                        ) : ongsFiltradas.length === 0 ? (
                            <p className={css.semOngs}>Nenhuma ONG encontrada</p>
                        ) : (
                            <div className={css.listaOngs}>
                                {ongsFiltradas.map(ong => (
                                    <div key={ong.id} className={css.ongItem}>
                                        <img
                                            className={css.imagem}
                                            src={getImagemUrl(ong.id)}
                                            onError={(e) => { e.target.src = '/sem_imagem.webp'; }}
                                            alt={ong.nome}
                                        />
                                        <div className={css.ongInfo}>
                                            <p className={css.nome}>{ong.nome}</p>
                                            <p className={css.categoria}>{ong.categoria || 'ONG'}</p>
                                        </div>
                                        <button
                                            className={css.btnConversar}
                                            onClick={() => iniciarConversa(ong.id)}
                                            disabled={iniciando}
                                        >
                                            {iniciando ? '...' : 'Conversar'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Área do Chat */}
            {conversaSelecionada ? (
                <div className={css.chatArea}>
                    <div className={css.header}>
                        <button className={css.btnVoltar} onClick={voltarParaConversas}>
                            ←
                        </button>
                        <img
                            className={css.imagem}
                            src={getImagemUrl(conversaSelecionada.usuario_id)}
                            onError={(e) => { e.target.src = '/sem_imagem.webp'; }}
                            alt={conversaSelecionada.usuario_nome}
                        />
                        <p>{conversaSelecionada.usuario_nome}</p>
                    </div>

                    <div className={css.mensagens}>
                        {carregandoMensagens ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Carregando mensagens...</p>
                        ) : mensagens.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhuma mensagem ainda. Envie uma mensagem para começar!</p>
                        ) : (
                            mensagens.map(msg => (
                                <div
                                    key={msg.id}
                                    className={msg.is_meu_envio ? css.mensagemEu : css.mensagemVoce}
                                >
                                    <div>
                                        <p>{msg.mensagem}</p>
                                        <span className={css.dataMensagem}>{msg.data}</span>
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
            ) : (
                <div className={css.chatAreaVazio}>
                    <div className={css.mensagemVazio}>
                        <img src={"/baterPapo.png"} alt="Chats" />
                        <p>Selecione uma conversa ou inicie uma nova com uma ONG</p>
                    </div>
                </div>
            )}
        </section>
    );
}