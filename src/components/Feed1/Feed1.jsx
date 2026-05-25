// src/components/Feed1/Feed1.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from "./Feed1.module.css";
import Curtida from "../Curtida/Curtida.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import Recomendacoes from "../Recomendacoes/Recomendacoes.jsx";
import InfiniteScroll from 'react-infinite-scroll-component';


export default function Feed({ api }) {
    const navigate = useNavigate();
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [todasAtualizacoes, setTodasAtualizacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState('recentes');
    const [tipoFeed, setTipoFeed] = useState('todas');
    const [textoAberto, setTextoAberto] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

    const [pagina, setPagina] = useState(0);
    const [temMais, setTemMais] = useState(true);

    // Estados para comentários
    const [comentarios, setComentarios] = useState({});
    const [novoComentario, setNovoComentario] = useState({});
    const [mostrarComentarios, setMostrarComentarios] = useState({});
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    // Estado para mensagem
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    // Estado para modal de postagem
    const [modalPostagem, setModalPostagem] = useState(null);

    const api_url = api;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    function decodificarToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) { return null; }
    }

    function tokenExpirado(token) {
        try {
            const tokenData = decodificarToken(token);
            if (!tokenData || !tokenData.exp) return false;
            const agora = Math.floor(Date.now() / 1000);
            return agora >= tokenData.exp;
        } catch (error) { return true; }
    }

    function verificarUsuario() {
        const token = localStorage.getItem('token');
        if (token && !tokenExpirado(token)) {
            try {
                const payload = decodificarToken(token);
                if (payload) {
                    setUsuarioTipo(payload.tipo);
                    setUsuarioId(payload.id_usuarios);
                }
            } catch (error) { console.error('Erro ao decodificar token:', error); }
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && tokenExpirado(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('nome');
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }
        verificarUsuario();
        setTemMais(true);
        setPagina(0)
        buscarAtualizacoes(0, false);

    }, [tipoFeed, filtro]);

    async function buscarAtualizacoes(novaPagina = 0, append = false) {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url;
            if (tipoFeed === 'seguindo') {
                if (!token || usuarioTipo !== 1) {
                    setMsgTexto('Faça login como doador para ver postagens das ONGs que você segue.');
                    setMsgTipo('erro');
                    setTipoFeed('todas');
                    setLoading(false);
                    return;
                }
                url = `${api_url}/feed_favoritas?filtro=${filtro}&pagina=${novaPagina}&limite=4`;
            } else {
                url = `${api_url}/feed_atualizacoes?filtro=${filtro}&pagina=${novaPagina}&limite=4&token=${token || ''}`;
            }
            const response = await fetch(url, { credentials: 'include', headers: { 'Authorization': `Bearer ${token || ''}` } });
            if (response.status === 401) {
                localStorage.removeItem('token'); localStorage.removeItem('nome');
                localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login'); return;
            }
            if (response.status === 403) {
                setMsgTexto('Apenas doadores podem acessar este feed.'); setMsgTipo('erro');
                setTipoFeed('todas'); setLoading(false); return;
            }
            const data = await response.json();
            if (data.atualizacoes) {
                if (append) { setTodasAtualizacoes(prev => [...prev, ...data.atualizacoes]); }
                else { setTodasAtualizacoes(data.atualizacoes); }
                if (data.atualizacoes.length < 4) { setTemMais(false); }
                carregarComentariosAutomaticos(data.atualizacoes);
            } else { if (!append) setTodasAtualizacoes([]); setTemMais(false); }
        } catch (error) { console.error('Erro ao buscar:', error); setTemMais(false); }
        finally { setLoading(false); }
    }

    async function carregarComentariosAutomaticos(atualizacoesLista) {
        const token = localStorage.getItem('token');
        for (const item of atualizacoesLista) {
            try {
                const response = await fetch(`${api_url}/comentarios/${item.id}`, { headers: { 'Authorization': `Bearer ${token || ''}` } });
                if (response.ok) {
                    const data = await response.json();
                    const qtd = data.total || data.comentarios?.length || 0;
                    setTodasAtualizacoes(prev => prev.map(att => att.id === item.id ? { ...att, qtd_comentarios: qtd } : att));
                }
            } catch (error) { console.error(`Erro ao carregar comentários da atualização ${item.id}:`, error); }
        }
    }

    useEffect(() => {
        let filtradas = todasAtualizacoes;
        if (busca.trim()) {
            const termo = busca.toLowerCase();
            filtradas = filtradas.filter(item =>
                (item.titulo && item.titulo.toLowerCase().includes(termo)) ||
                (item.texto && item.texto.toLowerCase().includes(termo)) ||
                (item.ong_nome && item.ong_nome.toLowerCase().includes(termo))
            );
        }
        setAtualizacoes(filtradas);
    }, [busca, todasAtualizacoes]);

    useEffect(() => { setPagina(0); setTemMais(true); buscarAtualizacoes(0, false); }, [filtro]);

    async function carregarComentarios(idAtualizacao) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/comentarios/${idAtualizacao}`, { headers: { 'Authorization': `Bearer ${token || ''}` } });
            if (response.ok) {
                const data = await response.json();
                setComentarios(prev => ({ ...prev, [idAtualizacao]: data.comentarios || [] }));
                const qtd = data.total || data.comentarios?.length || 0;
                setTodasAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_comentarios: qtd } : item));
                setAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_comentarios: qtd } : item));
            }
        } catch (error) { console.error('Erro ao carregar comentários:', error); }
    }

    async function enviarComentario(idAtualizacao) {
        const texto = novoComentario[idAtualizacao]?.trim();
        if (!texto) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) { setMsgTexto('Faça login como doador para comentar.'); setMsgTipo('erro'); return; }
            if (tokenExpirado(token)) {
                localStorage.removeItem('token'); localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login'); return;
            }
            const response = await fetch(`${api_url}/comentar/${idAtualizacao}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ texto })
            });
            if (response.status === 401) {
                localStorage.removeItem('token'); localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login'); return;
            }
            if (response.ok) {
                const data = await response.json();
                setComentarios(prev => ({ ...prev, [idAtualizacao]: [...(prev[idAtualizacao] || []), data.comentario] }));
                setTodasAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_comentarios: (item.qtd_comentarios || 0) + 1 } : item));
                setAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_comentarios: (item.qtd_comentarios || 0) + 1 } : item));
                if (modalPostagem && modalPostagem.id === idAtualizacao) {
                    setModalPostagem(prev => ({ ...prev, qtd_comentarios: (prev.qtd_comentarios || 0) + 1 }));
                }
                setNovoComentario(prev => ({ ...prev, [idAtualizacao]: '' }));
                setMsgTexto('Comentário enviado com sucesso!'); setMsgTipo('sucesso');
            } else {
                const error = await response.json();
                setMsgTexto(error.error || 'Erro ao comentar'); setMsgTipo('erro');
            }
        } catch (error) { console.error('Erro ao enviar comentário:', error); setMsgTexto('Erro ao conectar com o servidor'); setMsgTipo('erro'); }
    }

    function handleCurtidaChange(idAtualizacao, novoStatus) {
        setTodasAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_curtidas: (item.qtd_curtidas || 0) + (novoStatus ? 1 : -1) } : item));
        setAtualizacoes(prev => prev.map(item => item.id === idAtualizacao ? { ...item, qtd_curtidas: (item.qtd_curtidas || 0) + (novoStatus ? 1 : -1) } : item));
        if (modalPostagem && modalPostagem.id === idAtualizacao) {
            setModalPostagem(prev => ({ ...prev, qtd_curtidas: (prev.qtd_curtidas || 0) + (novoStatus ? 1 : -1) }));
        }
    }

    function toggleComentarios(idAtualizacao) {
        if (!mostrarComentarios[idAtualizacao]) { carregarComentarios(idAtualizacao); }
        setMostrarComentarios(prev => ({ ...prev, [idAtualizacao]: !prev[idAtualizacao] }));
    }

    function handleMudarTipoFeed(novoTipo) {
        if (novoTipo === 'seguindo') {
            const token = localStorage.getItem('token');
            if (!token || tokenExpirado(token)) { setMsgTexto('Faça login como doador para acessar este feed.'); setMsgTipo('erro'); return; }
            const payload = decodificarToken(token);
            if (!payload || payload.tipo !== 1) { setMsgTexto('Apenas doadores podem acessar este feed.'); setMsgTipo('erro'); return; }
        }
        setTipoFeed(novoTipo);
    }

    function abrirPostagem(item) { setModalPostagem(item); carregarComentarios(item.id); }
    function fecharPostagem() { setModalPostagem(null); }

    if (loading && pagina === 0) {
        return <section className={css.secao}><MenuLateral /><div className={css.conteudo}><p style={{ textAlign: 'center', padding: '50px' }}>Carregando...</p></div></section>;
    }

    return (
        <div>
            <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            <section className={css.secao}>
                <MenuLateral />
                <div className={css.conteudo}>
                    <div className={css.tabsFeed}>
                        <button className={`${css.tabFeed} ${tipoFeed === 'todas' ? css.tabAtivo : ''}`} onClick={() => handleMudarTipoFeed('todas')}>Todas as ONGs</button>
                        <button className={`${css.tabFeed} ${tipoFeed === 'seguindo' ? css.tabAtivo : ''}`} onClick={() => handleMudarTipoFeed('seguindo')}>Seguindo</button>
                    </div>

                    {/* MUDANÇA 1: Recomendações acima da barra de busca apenas no Celular (d-block d-lg-none) */}
                    <div className="d-block d-lg-none mb-4">
                        <Recomendacoes api={api_url}/>
                    </div>

                    <div className={css.barraTopo}>
                        <div className={css.buscaInput}>
                            <input type="text" placeholder="Busque por Atualizações..." value={busca} onChange={(e) => setBusca(e.target.value)} className={css.inputBusca} />
                        </div>
                        <div className={css.filtro}>
                            <span>Filtrar por:</span>
                            <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={css.selectFiltro}>
                                <option value="recentes">Mais recentes</option>
                                <option value="antigos">Mais antigos</option>
                            </select>
                        </div>
                    </div>

                    {/* Ajuste de colunas para responsividade */}
                    <div className={"row g-4"}>
                        <div className={"col-12 col-lg-8 d-flex flex-column gap-4"}>
                            {atualizacoes.length === 0 ? (
                                <div className={css.vazio}>
                                    {tipoFeed === 'seguindo' ? (
                                        <>
                                            <p>Nenhuma postagem das ONGs que você segue.</p>
                                            <p style={{ fontSize: '13px', color: '#999' }}>Siga ONGs para ver as novidades delas aqui!</p>
                                            <Link to="/ongs" style={{ color: '#167cbf', textDecoration: 'none', fontWeight: '600' }}>Encontrar ONGs</Link>
                                        </>
                                    ) : <p>Nenhuma atualização encontrada.</p>}
                                </div>
                            ) : (
                                <InfiniteScroll
                                    dataLength={todasAtualizacoes.length}
                                    next={() => {
                                        setTimeout(() => {
                                            const proximaPagina = pagina + 1;
                                            setPagina(proximaPagina);
                                            buscarAtualizacoes(proximaPagina, true);
                                        }, 1500); // 1500 milissegundos = 1.5 segundos de espera
                                    }}
                                    hasMore={temMais} // Bloqueia chamadas se a API retornar menos de 4 posts

                                    loader={
                                        <div className={css.fim}>
                                            <p>Carregando próximos posts...</p>
                                        </div>
                                    }
                                    endMessage={<div className={css.fim}><p>Você chegou ao fim das atualizações!</p></div>}
                                    className="d-flex flex-column gap-4"
                                    style={{ overflow: 'visible' }}
                                >
                                    {atualizacoes.map(item => (
                                        <div key={`att-${item.id}`} className={css.cardAtualizacao}>
                                            <Link to={`/ong/${item.ong_id}`} className={css.header} onClick={(e) => e.stopPropagation()}>
                                                <img src={item.ong_foto ? `${api_url}/uploads/Usuarios/${item.ong_foto}` : '/ong-icon.png'} alt={item.ong_nome} className={css.fotoOng} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                                                <div className={css.headerInfo}>
                                                    <h3 className={css.nomeOng}>{item.ong_nome}</h3>
                                                    <span className={css.data}>{item.data}</span>
                                                </div>
                                                {/* Coração só aparece para doadores ou não logados */}
                                                {(usuarioTipo === 1 || usuarioTipo === null) && (
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Curtida idAtualizacao={item.id} apiUrl={api_url} onStatusChange={(status) => handleCurtidaChange(item.id, status)} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className={css.corpo} onClick={() => abrirPostagem(item)} style={{ cursor: 'pointer' }}>
                                                {item.foto && <img src={`${api_url}/uploads/Atualizacoes/${item.foto}`} alt={item.titulo} className={css.fotoAtualizacao} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />}
                                                <div className={css.textoContainer}>
                                                    <h2 className={css.tituloAtualizacao}>{item.titulo}</h2>
                                                    <p className={css.infoPost}>{item.qtd_curtidas || 0} curtidas • {item.qtd_comentarios || 0} comentários</p>
                                                    {item.texto && <p className={css.textoAtualizacao}>{item.texto}</p>}
                                                </div>
                                            </div>
                                            <div className={css.comentariosSecao}>
                                                <button className={css.btnComentarios} onClick={() => toggleComentarios(item.id)}>💬 Comentários ({item.qtd_comentarios || 0})</button>
                                                {mostrarComentarios[item.id] && (
                                                    <div className={css.comentariosContainer}>
                                                        {comentarios[item.id]?.length > 0 ? (
                                                            comentarios[item.id].map(comentario => (
                                                                <div key={comentario.id} className={css.comentario}>
                                                                    <div className={css.comentarioHeader}>
                                                                        <img src={comentario.usuario_foto ? `${api_url}/uploads/Usuarios/${comentario.usuario_foto}` : '/user-icon.png'} alt={comentario.usuario_nome} className={css.comentarioFoto} onError={(e) => { e.currentTarget.src = '/user-icon.png'; }} />
                                                                        <div className={css.comentarioInfo}>
                                                                            <span className={css.comentarioNome}>{comentario.usuario_nome}</span>
                                                                            <span className={css.comentarioData}>{comentario.data_criacao}</span>
                                                                        </div>
                                                                    </div>
                                                                    <p className={css.comentarioTexto}>{comentario.texto}</p>
                                                                </div>
                                                            ))
                                                        ) : <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '10px' }}>Nenhum comentário ainda. Seja o primeiro!</p>}

                                                        {/* Input de comentário - apenas doadores */}
                                                        {usuarioTipo === 1 ? (
                                                            <div className={css.novoComentario}>
                                                                <input type="text" placeholder="Escreva um comentário..." value={novoComentario[item.id] || ''} onChange={(e) => setNovoComentario(prev => ({ ...prev, [item.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { enviarComentario(item.id); } }} className={css.inputComentario} />
                                                                <button onClick={() => enviarComentario(item.id)} className={css.btnEnviarComentario}>Enviar</button>
                                                            </div>
                                                        ) : usuarioTipo === 2 ? (
                                                            <p className={css.msgDoador}>ONGs não podem comentar.</p>
                                                        ) : usuarioTipo === 0 ? (
                                                            <p className={css.msgDoador}>Administradores não podem comentar.</p>
                                                        ) : (
                                                            <p className={css.msgLogin}><Link to="/login">Faça login</Link> como doador para comentar.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </InfiniteScroll>
                            )}
                        </div>
                        {/* MUDANÇA 2: Barra lateral oculta no Celular com STICKY ADICIONADO */}
                        <div className={"col-12 col-lg-4 d-none d-lg-block"}>
                            {/* A div abaixo faz o componente grudar na tela (top: 24px) ao dar scroll */}
                            <div style={{ position: 'sticky', top: '24px' }}>
                                <Recomendacoes/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {modalPostagem && (
                <div className={css.overlay} onClick={fecharPostagem}>
                    <div className={css.modalPost} onClick={(e) => e.stopPropagation()}>
                        <button className={css.modalFechar} onClick={fecharPostagem}>✕</button>
                        <div className={css.modalEsquerda}>
                            <img src={modalPostagem.foto ? `${api_url}/uploads/Atualizacoes/${modalPostagem.foto}` : '/sem_imagem.webp'} alt={modalPostagem.titulo} className={css.modalImagem} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                        </div>


                        <div className={css.modalDireita}>
                            <div className={css.modalHeader}>

                                <div className={css.cabecalho}>
                                    <Link to={`/ong/${modalPostagem.ong_id}`} onClick={fecharPostagem}>
                                        <img src={modalPostagem.ong_foto ? `${api_url}/uploads/Usuarios/${modalPostagem.ong_foto}` : "/ong-icon.png"} alt={modalPostagem.ong_nome} className={css.modalFotoPerfil} />
                                    </Link>
                                    <div className={css.infocabecalho}>
                                        <Link to={`/ong/${modalPostagem.ong_id}`} onClick={fecharPostagem} style={{ textDecoration: 'none', color: 'inherit' }}><h2>{modalPostagem.ong_nome}</h2></Link>
                                        <p>{modalPostagem.data}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={css.modalConteudo}>
                                <h1>{modalPostagem.titulo}</h1>
                                {/* Exibição do Texto */}
                                <p>
                                    {isMobile && modalPostagem.texto.length > 100 && !textoAberto
                                        ? `${modalPostagem.texto.substring(0, 100)}...`
                                        : modalPostagem.texto}
                                </p>

                                {/* Exibição do Botão (Apenas no Mobile) */}
                                {isMobile && modalPostagem.texto.length > 100 && (
                                    <button
                                        onClick={() => setTextoAberto(!textoAberto)}
                                        style={{ backgroundColor: '#167cbf', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', marginLeft: '5px' }}
                                    >
                                        {textoAberto ? "Ler menos" : "Ler mais"}
                                    </button>
                                )}
                                <div className={css.modalInfo}><span>{modalPostagem.qtd_curtidas || 0} curtidas</span><span> • </span><span>{modalPostagem.qtd_comentarios || 0} comentários</span></div>
                            </div>
                            <div className={css.modalComentarios}>
                                <h3>Comentários</h3>
                                {comentarios[modalPostagem.id]?.length > 0 ? (
                                    comentarios[modalPostagem.id].map(comentario => (
                                        <div key={comentario.id} className={css.modalComentario}>
                                            <img src={comentario.usuario_foto ? `${api_url}/uploads/Usuarios/${comentario.usuario_foto}` : "/user-icon.png"} alt="" className={css.modalComentarioFoto} />
                                            <div><strong>{comentario.usuario_nome}</strong><p>{comentario.texto}</p></div>
                                        </div>
                                    ))
                                ) : <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>Nenhum comentário ainda. Seja o primeiro!</p>}
                            </div>
                            <div className={css.modalInputArea}>
                                {usuarioTipo === 1 ? (
                                    <input type="text" placeholder="Adicione um comentário..." className={css.modalInput} value={novoComentario[modalPostagem.id] || ""} onChange={(e) => setNovoComentario(prev => ({ ...prev, [modalPostagem.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { enviarComentario(modalPostagem.id); } }} />
                                ) : usuarioTipo === 2 ? (
                                    <p className={css.msgDoador}>ONGs não podem comentar.</p>
                                ) : usuarioTipo === 0 ? (
                                    <p className={css.msgDoador}>Administradores não podem comentar.</p>
                                ) : (
                                    <p className={css.msgLogin}><Link to="/login">Faça login</Link> como doador para comentar.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <button className={css.botaoVoltar} onClick={() => window.scrollTo(0, 0)}>↑</button>

        </div>
    );
}