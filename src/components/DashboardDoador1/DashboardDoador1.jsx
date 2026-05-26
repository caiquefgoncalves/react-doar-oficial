// src/components/DashboardDoador1/DashboardDoador1.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from "../DashboardDoador1/DashboardDoador1.module.css";
import Acoes from "../Acoes/Acoes.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import SeloVoluntario from "../SeloVoluntario/SeloVoluntario.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function DashboardDoador1({ api }) {
    const navigate = useNavigate();
    const api_url = api;
    const [nomeDoador, setNomeDoador] = useState('');
    const [idDoador, setIdDoador] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [ongsSeguidas, setOngsSeguidas] = useState([]);
    const [loadingOngs, setLoadingOngs] = useState(true);
    const [paginaOngs, setPaginaOngs] = useState(0);

    const [atividades, setAtividades] = useState([]);
    const [loadingAtividades, setLoadingAtividades] = useState(true);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [paginaDoacoes, setPaginaDoacoes] = useState(0);

    // NOVO ESTADO: Filtro de doações
    const [filtroDoacao, setFiltroDoacao] = useState('todas');

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const ongsPorPagina = isMobile ? 1 : 3;
    const doacoesPorPagina = isMobile ? 1 : 3;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 1) { localStorage.clear(); navigate('/login'); return; }

        const id = tokenData.id_usuarios;
        setIdDoador(id);

        const nome = localStorage.getItem('nome_doador');
        if (nome) setNomeDoador(nome);

        buscarOngsSeguidas(token);
        buscarAtividades(token);
        buscarDadosGrafico(token);

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sucesso = localStorage.getItem('sucesso');
    useEffect(() => {
        if (sucesso) { setMensagem(sucesso); setTipoMensagem('sucesso'); localStorage.removeItem('sucesso'); }
    }, [sucesso]);

    // Reseta a página de doações sempre que o filtro mudar
    useEffect(() => {
        setPaginaDoacoes(0);
    }, [filtroDoacao]);

    async function buscarOngsSeguidas(token) {
        try {
            const response = await fetch(`${api_url}/minhas_ongs_seguidas?token=${token}`, { credentials: 'include' });
            if (response.ok) { const data = await response.json(); setOngsSeguidas(data.ongs || []); }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoadingOngs(false); }
    }

    async function buscarAtividades(token) {
        try {
            const response = await fetch(`${api_url}/minhas_doacoes?token=${token}`, { credentials: 'include' });
            if (response.ok) { const data = await response.json(); setAtividades(data.atividades || []); }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoadingAtividades(false); }
    }

    async function buscarDadosGrafico(token) {
        try {
            const response = await fetch(`${api_url}/frequencia_doacoes?token=${token}`, { credentials: 'include' });
            if (response.ok) { const data = await response.json(); setDadosGrafico(data.dados || []); }
        } catch (error) { console.error('Erro:', error); }
    }

    const totalPaginasOngs = Math.ceil(ongsSeguidas.length / ongsPorPagina);
    const ongsPaginadas = ongsSeguidas.slice(paginaOngs * ongsPorPagina, (paginaOngs + 1) * ongsPorPagina);

    // LÓGICA DE FILTRO APLICADA
    const atividadesFiltradas = filtroDoacao === 'todas'
        ? atividades
        : atividades.filter(ativ => ativ.tipo === filtroDoacao);

    const totalPaginasDoacoes = Math.ceil(atividadesFiltradas.length / doacoesPorPagina);
    const atividadesPaginadas = atividadesFiltradas.slice(paginaDoacoes * doacoesPorPagina, (paginaDoacoes + 1) * doacoesPorPagina);

    const coresMeses = [
        "var(--cor-terciaria)",
        "var(--cor-primaria)",
        "var(--cor-secundaria)",
        "color-mix(in srgb, var(--cor-primaria) 30%, #7cfc00)",
        "color-mix(in srgb, var(--cor-primaria) 40%, var(--cor-secundaria))",
        "color-mix(in srgb, var(--cor-terciaria) 85%, #ff0000)",
        "color-mix(in srgb, var(--cor-primaria) 60%, #00ffcc)",
        "color-mix(in srgb, var(--cor-terciaria) 50%, #4b0082)",
        "color-mix(in srgb, var(--cor-primaria) 50%, #555555)",
        "color-mix(in srgb, var(--cor-secundaria) 80%, #ff0000)",
        "color-mix(in srgb, var(--cor-primaria) 65%, #000080)",
        "color-mix(in srgb, var(--cor-primaria) 20%, #ffff00)"
    ];

    function renderGrafico() {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const maxQtd = Math.max(...dadosGrafico.map(d => d.qtd), 1);
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '220px', padding: '10px 0', justifyContent: 'center' }}>
                {meses.map((mes, i) => {
                    const dado = dadosGrafico.find(d => d.mes === mes);
                    const qtd = dado ? dado.qtd : 0;
                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'color-mix(in srgb, var(--cor-texto) 75%, #ffffff)', fontWeight: '600' }}>{qtd || ''}</span>
                            <div style={{ width: '30px', height: `${Math.max((qtd / maxQtd) * 160, 4)}px`, backgroundColor: qtd > 0 ? 'var(--cor-terciaria)' : '#f0f0f0', borderRadius: '6px 6px 0 0' }} />
                            <span style={{ fontSize: '9px', color: '#999' }}>{mes}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderGraficoPizza() {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mesesComDados = dadosGrafico.filter(d => d.qtd > 0);
        const total = mesesComDados.reduce((acc, d) => acc + d.qtd, 0);
        if (total === 0) return <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Nenhuma doação realizada ainda</p>;
        let gradiente = '';
        let acumulado = 0;
        mesesComDados.forEach((d, i) => {
            const perc = (d.qtd / total) * 100;
            const cor = coresMeses[meses.indexOf(d.mes)];
            gradiente += `${cor} ${acumulado}% ${acumulado + perc}%`;
            if (i < mesesComDados.length - 1) gradiente += ', ';
            acumulado += perc;
        });
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(${gradiente})` }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '300px' }}>
                    {mesesComDados.map((d) => {
                        const cor = coresMeses[meses.indexOf(d.mes)];
                        return (
                            <div key={d.mes} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cor }} />
                                <span style={{ fontSize: '10px', color: 'color-mix(in srgb, var(--cor-texto) 75%, #ffffff)' }}>{d.mes}: {d.qtd}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <section className={css.secao}>
            <section className={css.menulateral}><MenuLateral/></section>
            <div className={css.conteudo}>
                <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />
                <div className={css.Titulo}><Titulo titulo={`Olá,`} cor={'saudacao'} span={nomeDoador} corSpan={'rosa-span'}/></div>

                <p className={css.acoesRapidas}>Ações rápidas</p>
                <div className={css.acoes}>
                    <Acoes cor={'amarelo'} texto={'Editar perfil'} pagina={`/editarDoador/${idDoador}`}/>
                    <Acoes cor={'amarelo'} texto={'Ver Relatório'} pagina={'/relatorio_doador'} />
                </div>

                {/* ONGs do coração */}
                <div className={css.Titulo}><Titulo titulo={`Suas ONGs`} cor={'preto'}/></div>
                <div className={css.cardsAdm}>
                    {loadingOngs ? <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Carregando...</p> : ongsSeguidas.length === 0 ? (
                        <p style={{ fontSize: '16px', color: 'color-mix(in srgb, var(--cor-texto) 75%, #ffffff)', marginBottom: '15px' }}>Você ainda não segue nenhuma ONG</p>
                    ) : (
                        <>
                            <div className={css.ongsContainer}>
                                {ongsPaginadas.map(ong => (
                                    <Link to={`/ong/${ong.id}`} key={ong.id} className={css.ongCard}>
                                        <div className={css.ongCardImageWrapper}>
                                            <img src={ong.foto ? `${api_url}/uploads/Usuarios/${ong.foto}` : '/ong-icon.png'} alt={ong.nome} className={css.ongCardImage} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                                        </div>
                                        <span className={css.ongCardNome}>{ong.nome}</span>
                                    </Link>
                                ))}
                            </div>
                            {totalPaginasOngs > 1 && (
                                <div className={css.paginacao}>
                                    <button onClick={() => setPaginaOngs(p => p - 1)} disabled={paginaOngs === 0} className={css.botaoPagina}>←</button>
                                    <span className={css.paginaInfo}>{paginaOngs + 1} de {totalPaginasOngs}</span>
                                    <button onClick={() => setPaginaOngs(p => p + 1)} disabled={paginaOngs === totalPaginasOngs - 1} className={css.botaoPagina}>→</button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Suas Doações COM FILTRO */}
                <div className={css.headerSecaoFiltrada}>
                    <div className={css.Titulo}><Titulo titulo={`Suas `} cor={'preto'} span={'contribuições'} corSpan={'laranja-span'}/></div>
                    <div className={css.filtro}>
                        <span>Filtrar por:</span>
                        <select value={filtroDoacao} onChange={(e) => setFiltroDoacao(e.target.value)} className={css.selectFiltro}>
                            <option value="todas">Todos</option>
                            <option value="Monetário">Monetárias</option>
                            <option value="Voluntariado">Voluntariados</option>
                        </select>
                    </div>
                </div>

                {loadingAtividades ? <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Carregando...</p> : atividades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '16px' }}>
                        <p style={{ fontSize: '16px', color: 'color-mix(in srgb, var(--cor-texto) 75%, #ffffff' }}>Você ainda não realizou nenhuma doação ou voluntariado</p>
                    </div>
                ) : atividadesFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '16px' }}>
                        <p style={{ fontSize: '16px', color: 'color-mix(in srgb, var(--cor-texto) 75%, #ffffff)' }}>Nenhuma doação encontrada para este filtro.</p>
                    </div>
                ) : (
                    <>
                        <div className={css.cardsAdm}>
                            {atividadesPaginadas.map((ativ, i) => (
                                <div key={i} className={css.cardAdm}>
                                    <div className={css.cardAdmTopo}>
                                        <img src={ativ.ong_foto ? `${api_url}/uploads/Usuarios/${ativ.ong_foto}` : '/ong-icon.png'} alt={ativ.ong || 'ONG'} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/ong-icon.png'; }} />
                                        <h3 className={css.cardAdmNome} style={{ fontSize: '11px' }}>{ativ.ong || 'ONG'}</h3>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-block', backgroundColor: 'var(--cor-secundaria)', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {ativ.tipo === 'Monetário' ? 'Monetária' : 'Voluntariado'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--cor-texto)', margin: '5px 10px 2px 10px', textAlign: 'center' }}>{ativ.valor}</p>
                                    <p style={{ fontSize: '10px', color: 'color-mix(in srgb, var(--cor-texto) 60%, #ffffff)', margin: '0 10px 5px 10px', textAlign: 'center', wordBreak: 'break-word' }}>{ativ.projeto}</p>
                                    {ativ.data && <p style={{ fontSize: '9px', color: 'color-mix(in srgb, var(--cor-texto) 45%, #ffffff)', textAlign: 'center'}}>{ativ.data}</p>}
                                </div>
                            ))}
                        </div>
                        {totalPaginasDoacoes > 1 && (
                            <div className={css.paginacao}>
                                <button onClick={() => setPaginaDoacoes(p => p - 1)} disabled={paginaDoacoes === 0} className={css.botaoPagina}>←</button>
                                <span className={css.paginaInfo}>{paginaDoacoes + 1} de {totalPaginasDoacoes}</span>
                                <button onClick={() => setPaginaDoacoes(p => p + 1)} disabled={paginaDoacoes === totalPaginasDoacoes - 1} className={css.botaoPagina}>→</button>
                            </div>
                        )}
                    </>
                )}

                {/* Gráfico */}
                <div className={css.Titulo}><Titulo titulo={`Sua frequência de `} cor={'preto'} span={'doações'} corSpan={'laranja-span'}/></div>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '25px' }}>
                    {isMobile ? renderGraficoPizza() : renderGrafico()}
                </div>
            </div>
        </section>
    );
}