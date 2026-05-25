// src/components/DashboardDaOng1/DashboardDaOng1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from "./DashboardDaOng1.module.css";
import Acoes from "../Acoes/Acoes.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function DashboardDaOng1({api}) {
    const api_url = api;
    const navigate = useNavigate();
    const [nomeOng, setNomeOng] = useState('');
    const [idOng, setIdOng] = useState('');
    const [projetos, setProjetos] = useState([]);
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [doadoresOng, setDoadoresOng] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [paginaProjetos, setPaginaProjetos] = useState(0);
    const [paginaAtualizacoes, setPaginaAtualizacoes] = useState(0);
    const [paginaDoadores, setPaginaDoadores] = useState(0);

    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [tipoExclusao, setTipoExclusao] = useState('');

    const itensPorPagina = isMobile ? 1 : 3;

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
                localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login');
                return;
            }
        }

        if (!tokenData || tokenData.tipo !== 2) {
            localStorage.clear();
            navigate('/login');
            return;
        }

        const id = tokenData.id_usuarios;
        setIdOng(id);
        const nome = localStorage.getItem('nome_ong');
        if (nome) setNomeOng(nome);

        buscarProjetos();
        buscarAtualizacoes();
        buscarDadosGrafico();
        buscarDoadores(id);

        const handleResize = () => { setIsMobile(window.innerWidth <= 768); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function buscarProjetos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_projetos?token=${token}`, { method: 'GET', credentials: 'include' });
            if (response.status === 401) {
                localStorage.clear();
                localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login');
                return;
            }
            if (response.ok) { const data = await response.json(); if (data.projetos) setProjetos(data.projetos); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarAtualizacoes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_atualizacoes?token=${token}`, { method: 'GET', credentials: 'include' });
            if (response.status === 401) {
                localStorage.clear();
                localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login');
                return;
            }
            if (response.ok) { const data = await response.json(); if (data.atualizacoes) setAtualizacoes(data.atualizacoes); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarDadosGrafico() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/arrecadacao_mensal_ong?token=${token}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setDadosGrafico(data.dados || []);
            }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarDoadores(idOngParam) {
        try {
            const token = localStorage.getItem('token');
            const idUsar = idOngParam || idOng;
            if (!idUsar) return;

            const response = await fetch(`${api_url}/ong/doadores/${idUsar}?token=${token}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setDoadoresOng(data.doadores || []);
            }
        } catch (error) { console.error('Erro:', error); }
    }

    function confirmarExcluirProjeto(projeto) {
        setItemParaExcluir(projeto);
        setTipoExclusao('projeto');
        setModalExcluirAberto(true);
    }

    function confirmarExcluirAtualizacao(atualizacao) {
        setItemParaExcluir(atualizacao);
        setTipoExclusao('atualizacao');
        setModalExcluirAberto(true);
    }

    async function executarExclusao() {
        setModalExcluirAberto(false);
        if (tipoExclusao === 'projeto') {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${api_url}/deletar_projeto/${itemParaExcluir.id}?token=${token}`, { method: 'DELETE', credentials: 'include' });
                const data = await response.json();
                setMensagem(data.message || data.error);
                setTipoMensagem(response.ok ? 'sucesso' : 'erro');
                if (response.ok) buscarProjetos();
            } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
        } else if (tipoExclusao === 'atualizacao') {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${api_url}/deletar_atualizacao/${itemParaExcluir.id}?token=${token}`, { method: 'DELETE', credentials: 'include' });
                const data = await response.json();
                setMensagem(data.message || data.error);
                setTipoMensagem(response.ok ? 'sucesso' : 'erro');
                if (response.ok) buscarAtualizacoes();
            } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
        }
        setItemParaExcluir(null);
        setTipoExclusao('');
    }

    const sucesso = localStorage.getItem('sucesso');
    useEffect(() => {
        if (sucesso) { setMensagem(sucesso); setTipoMensagem('sucesso'); localStorage.removeItem('sucesso'); }
    }, [sucesso]);

    const projetosPaginados = projetos.slice(paginaProjetos * itensPorPagina, (paginaProjetos + 1) * itensPorPagina);
    const atualizacoesPaginadas = atualizacoes.slice(paginaAtualizacoes * itensPorPagina, (paginaAtualizacoes + 1) * itensPorPagina);
    const doadoresPaginados = doadoresOng.slice(paginaDoadores * itensPorPagina, (paginaDoadores + 1) * itensPorPagina);
    const totalPaginasProjetos = Math.ceil(projetos.length / itensPorPagina);
    const totalPaginasAtualizacoes = Math.ceil(atualizacoes.length / itensPorPagina);
    const totalPaginasDoadores = Math.ceil(doadoresOng.length / itensPorPagina);

    function renderGrafico() {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const maxValor = Math.max(...dadosGrafico.map(d => d.valor), 1);

        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '220px', padding: '10px 0', justifyContent: 'center' }}>
                {meses.map((mes, i) => {
                    const dado = dadosGrafico.find(d => d.mes === mes);
                    const valor = dado ? dado.valor : 0;
                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>
                                {valor > 0 ? `R$${valor.toFixed(0)}` : ''}
                            </span>
                            <div style={{
                                width: '30px',
                                height: `${Math.max((valor / maxValor) * 160, 4)}px`,
                                backgroundColor: valor > 0 ? '#f7b567' : '#f0f0f0',
                                borderRadius: '6px 6px 0 0'
                            }} />
                            <span style={{ fontSize: '9px', color: '#999' }}>{mes}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    function renderGraficoPizza() {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const coresMeses = ['#f7b567', '#167cbf', '#f65682', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5', '#8BC34A'];
        const mesesComDados = dadosGrafico.filter(d => d.valor > 0);
        const total = mesesComDados.reduce((acc, d) => acc + d.valor, 0);

        if (total === 0) return <div className={css.cardsAdm}>
            <p>Nenhuma doação ainda</p>
        </div>;


        let gradiente = '';
        let acumulado = 0;
        mesesComDados.forEach((d, i) => {
            const perc = (d.valor / total) * 100;
            const cor = coresMeses[meses.indexOf(d.mes)];
            gradiente += `${cor} ${acumulado}% ${acumulado + perc}%`;
            if (i < mesesComDados.length - 1) gradiente += ', ';
            acumulado += perc;
        });

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '45px' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(${gradiente})` }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '300px' }}>
                    {mesesComDados.map((d) => {
                        const cor = coresMeses[meses.indexOf(d.mes)];
                        return (
                            <div key={d.mes} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cor }} />
                                <span style={{ fontSize: '10px', color: '#666' }}>{d.mes}: R${d.valor.toFixed(0)}</span>
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

                {modalExcluirAberto && (
                    <div className={css.modalOverlay} onClick={() => setModalExcluirAberto(false)}>
                        <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={css.modalTitulo}>Confirmar Exclusão</h3>
                            <p className={css.modalTexto}>
                                Tem certeza que deseja excluir permanentemente{' '}
                                <strong>{itemParaExcluir?.titulo}</strong>?
                            </p>
                            <p className={css.modalAviso}>Esta ação não pode ser desfeita.</p>
                            <div className={css.modalBotoes}>
                                <button className={css.modalBtnCancelar} onClick={() => setModalExcluirAberto(false)}>Cancelar</button>
                                <button className={css.modalBtnExcluir} onClick={executarExclusao}>Sim, excluir</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={css.Titulo}><Titulo titulo={`Olá,`} cor={'saudacao'} span={nomeOng} corSpan={'laranja-span'}/></div>
                <p className={css.acoesRapidas}>Ações rápidas</p>
                <div className={css.acoes}>
                    <Acoes cor={'amarelo'} texto={'Editar Perfil'} pagina={`/editarOng/${idOng}`}/>
                    <Acoes cor={'amarelo'} texto={'Criar Projeto'} pagina={'/criarProjeto'}/>
                    <Acoes cor={'amarelo'} texto={'Criar Atualização'} pagina={'/criarAtualizacao'}/>
                    <Acoes cor={'amarelo'} texto={'Agradecimento'} pagina={'/editarMensagem'}/>
                </div>

                {/* Projetos Ativos */}
                <div className={css.titulos}><Titulo titulo={'Projetos Ativos'} cor={'preto'}/></div>
                <div className={css.cardsAdm}>
                    {projetosPaginados.length === 0 ? <p>Nenhum projeto cadastrado</p> : projetosPaginados.map((projeto) => (
                        <div key={projeto.id} className={css.cardAdm}>
                            <div className={css.cardAdmTopo}>
                                <img src={projeto.foto ? `${api_url}/uploads/Projetos/${projeto.foto}` : '/projeto-default.png'} alt={projeto.titulo} className={css.cardAdmImagem} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                                <h3 className={css.cardAdmNome}>{projeto.titulo}</h3>
                            </div>
                            <span className={css.cardAdmStatus} style={{ color: '#167cbf' }}>{projeto.status || 'Ativo'}</span>
                            <div className={css.cardAdmBotoes}>
                                <button className={css.btnEditar} onClick={() => navigate(`/editarProjeto/${projeto.id}`)}>Editar projeto</button>
                                <button className={css.btnExcluir} onClick={() => confirmarExcluirProjeto(projeto)}>Excluir projeto</button>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPaginasProjetos > 1 && (
                    <div className={css.paginacao}>
                        <button className={css.botaoPagina} onClick={() => setPaginaProjetos(p => p - 1)} disabled={paginaProjetos === 0}>←</button>
                        <span className={css.paginaInfo}>{paginaProjetos + 1} de {totalPaginasProjetos}</span>
                        <button className={css.botaoPagina} onClick={() => setPaginaProjetos(p => p + 1)} disabled={paginaProjetos === totalPaginasProjetos - 1}>→</button>
                    </div>
                )}

                {/* Últimas Atualizações */}
                <div className={css.titulos}><Titulo titulo={'Atualizações'} cor={'preto'}/></div>
                <div className={css.cardsAdm}>
                    {atualizacoesPaginadas.length === 0 ? <p>Nenhuma atualização</p> : atualizacoesPaginadas.map((atualizacao) => (
                        <div key={atualizacao.id} className={css.cardAdm}>
                            <div className={css.cardAdmTopo}>
                                <img src={atualizacao.foto ? `${api_url}/uploads/Atualizacoes/${atualizacao.foto}` : '/atualizacao-default.png'} alt={atualizacao.titulo} className={css.cardAdmImagem} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                                <h3 className={css.cardAdmNome}>{atualizacao.titulo}</h3>
                            </div>
                            <span className={css.cardAdmStatus} style={{ color: '#167cbf' }}>{atualizacao.data || 'Sem data'}</span>
                            <div className={css.cardAdmBotoes}>
                                <button className={css.btnEditar} onClick={() => navigate(`/editarAtualizacao/${atualizacao.id}`)}>Editar atualização</button>
                                <button className={css.btnExcluir} onClick={() => confirmarExcluirAtualizacao(atualizacao)}>Excluir atualização</button>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPaginasAtualizacoes > 1 && (
                    <div className={css.paginacao}>
                        <button className={css.botaoPagina} onClick={() => setPaginaAtualizacoes(p => p - 1)} disabled={paginaAtualizacoes === 0}>←</button>
                        <span className={css.paginaInfo}>{paginaAtualizacoes + 1} de {totalPaginasAtualizacoes}</span>
                        <button className={css.botaoPagina} onClick={() => setPaginaAtualizacoes(p => p + 1)} disabled={paginaAtualizacoes === totalPaginasAtualizacoes - 1}>→</button>
                    </div>
                )}

                {/* Doadores */}
                <div className={css.titulos}><Titulo titulo={'Doadores'} cor={'preto'}/></div>
                <div className={css.cardsAdm}>
                    {doadoresPaginados.length === 0 ? <p>Nenhum doador ainda</p> : doadoresPaginados.map((doador) => (
                        <div key={doador.id} className={css.cardAdm} style={{ borderTop: '4px solid #167cbf' }}>
                            <div className={css.cardAdmTopo}>
                                <img src={`${api_url}/uploads/Usuarios/${doador.foto}`} alt={doador.nome} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />
                                <h3 className={css.cardAdmNome}>{doador.nome}</h3>
                            </div>
                            <span className={css.cardAdmStatus} style={{ color: '#167cbf' }}>Último: {doador.ultimo_valor}</span>
                            <p style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '5px' }}>Última: {doador.ultima_doacao}</p>
                        </div>
                    ))}
                </div>
                {totalPaginasDoadores > 1 && (
                    <div className={css.paginacao}>
                        <button className={css.botaoPagina} onClick={() => setPaginaDoadores(p => p - 1)} disabled={paginaDoadores === 0}>←</button>
                        <span className={css.paginaInfo}>{paginaDoadores + 1} de {totalPaginasDoadores}</span>
                        <button className={css.botaoPagina} onClick={() => setPaginaDoadores(p => p + 1)} disabled={paginaDoadores === totalPaginasDoadores - 1}>→</button>
                    </div>
                )}


                <div className={css.Titulo}><Titulo titulo={`Arrecadação`} cor={'preto'} span={' mensal'} corSpan={'laranja-span'}/></div>
                <div style={{ background: '#fff', borderRadius: '16px', marginBottom: '30px' }}>
                    {isMobile ? renderGraficoPizza() : renderGrafico()}
                </div>
            </div>
        </section>
    );
}