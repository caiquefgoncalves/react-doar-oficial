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

    const totalPaginasDoacoes = Math.ceil(atividades.length / doacoesPorPagina);
    const atividadesPaginadas = atividades.slice(paginaDoacoes * doacoesPorPagina, (paginaDoacoes + 1) * doacoesPorPagina);

    const coresMeses = ['#f7b567', '#167cbf', '#f65682', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5', '#8BC34A'];

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
                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>{qtd || ''}</span>
                            <div style={{ width: '30px', height: `${Math.max((qtd / maxQtd) * 160, 4)}px`, backgroundColor: qtd > 0 ? '#f7b567' : '#f0f0f0', borderRadius: '6px 6px 0 0' }} />
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
                                <span style={{ fontSize: '10px', color: '#666' }}>{d.mes}: {d.qtd}</span>
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
                <div className={css.acoes}><Acoes cor={'amarelo'} texto={'Editar perfil'} pagina={`/editarDoador/${idDoador}`}/></div>

                {/* ONGs do coração */}
                <div className={css.Titulo}><Titulo titulo={`Suas ONGs`} cor={'preto'}/></div>
                <div className={css.cardsAdm}>
                    {loadingOngs ? <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Carregando...</p> : ongsSeguidas.length === 0 ? (
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>Você ainda não segue nenhuma ONG</p>
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

                {/* Suas Doações */}
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333', marginTop: '40px', marginBottom: '25px' }}>
                    Suas <span style={{ color: '#000' }}>doações</span>
                </h2>
                {loadingAtividades ? <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Carregando...</p> : atividades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '16px' }}>
                        <p style={{ fontSize: '16px', color: '#666' }}>Você ainda não realizou nenhuma doação ou voluntariado</p>
                    </div>
                ) : (
                    <>
                        <div className={css.cardsAdm}>
                            {atividadesPaginadas.map((ativ, i) => (
                                <div key={i} className={css.cardAdm} style={{ borderTop: '4px solid #f65682' }}>
                                    <div className={css.cardAdmTopo}>
                                        <img src={ativ.ong_foto ? `${api_url}/uploads/Usuarios/${ativ.ong_foto}` : '/ong-icon.png'} alt={ativ.ong || 'ONG'} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/ong-icon.png'; }} />
                                        <h3 className={css.cardAdmNome} style={{ fontSize: '11px' }}>{ativ.ong || 'ONG'}</h3>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-block', backgroundColor: '#f65682', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {ativ.tipo === 'Monetário' ? 'Monetária' : 'Voluntariado'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#333', margin: '5px 10px 2px 10px', textAlign: 'center' }}>{ativ.valor}</p>
                                    <p style={{ fontSize: '10px', color: '#888', margin: '0 10px 5px 10px', textAlign: 'center', wordBreak: 'break-word' }}>{ativ.projeto}</p>
                                    {ativ.data && <p style={{ fontSize: '9px', color: '#aaa', textAlign: 'center'}}>{ativ.data}</p>}
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
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#333' }}>
                    Sua frequência de <span style={{ color: '#f7b567' }}>doações</span>
                </h2>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '25px' }}>
                    {isMobile ? renderGraficoPizza() : renderGrafico()}
                </div>
            </div>
        </section>
    );
}