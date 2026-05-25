// src/components/DashboardAdm1/DashboardAdm1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from "../DashboardAdm1/DashboardAdm1.module.css";
import Acoes from "../Acoes/Acoes.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import SeloVoluntario from "../SeloVoluntario/SeloVoluntario.jsx";
import BotaoConfiguracoes from "../BotaoConfiguracoes/BotaoConfiguracoes.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function DashboardAdm1({ api }) {
    const api_url = api;
    const navigate = useNavigate();
    const [nomeADM, setNomeADM] = useState('');
    const [idAdm, setIdAdm] = useState('');
    const [ongs, setOngs] = useState([]);
    const [doadores, setDoadores] = useState([]);
    const [adms, setAdms] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [autorizado, setAutorizado] = useState(false);

    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [tipoExclusao, setTipoExclusao] = useState('');

    const [modalBloqueioAberto, setModalBloqueioAberto] = useState(false);
    const [usuarioParaBloquear, setUsuarioParaBloquear] = useState(null);
    const [motivoBloqueio, setMotivoBloqueio] = useState('');

    const [paginaOngs, setPaginaOngs] = useState(0);
    const [paginaDoadores, setPaginaDoadores] = useState(0);
    const [paginaAdms, setPaginaAdms] = useState(0);

    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const ongsPorPagina = isMobile ? 1 : 3;
    const doadoresPorPagina = isMobile ? 1 : 3;
    const admsPorPagina = isMobile ? 1 : 3;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 0) { localStorage.clear(); navigate('/login'); return; }
        setAutorizado(true);
        const nome = localStorage.getItem('nome_adm');
        if (nome) setNomeADM(nome);
        setIdAdm(tokenData.id_usuarios);
        buscarOngs();
        buscarDoadores();
        buscarAdms();
        buscarDadosGrafico();

        const handleResize = () => { setIsMobile(window.innerWidth <= 768); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function buscarOngs() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/listar_ongs?token=${token}`, { method: 'GET', credentials: 'include' });
            if (response.status === 401) { localStorage.clear(); navigate('/login'); return; }
            if (response.ok) { const data = await response.json(); if (data.ongs) setOngs(data.ongs); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarDoadores() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_usuarios?token=${token}`, { method: 'GET', credentials: 'include' });
            if (response.ok) { const data = await response.json(); if (data.usuarios) setDoadores(data.usuarios.filter(u => u[17] === 1)); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarAdms() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_usuarios?token=${token}`, { method: 'GET', credentials: 'include' });
            if (response.ok) { const data = await response.json(); if (data.usuarios) setAdms(data.usuarios.filter(u => u[17] === 0)); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarDadosGrafico() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/arrecadacao_global?token=${token}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setDadosGrafico(data.dados || []);
            }
        } catch (error) { console.error('Erro:', error); }
    }

    function abrirModalBloqueio(usuario, tipoUsuario = 'ong') {
        setUsuarioParaBloquear({ ...usuario, tipoUsuario: tipoUsuario });
        setMotivoBloqueio('');
        setModalBloqueioAberto(true);
    }

    async function executarBloqueio() {
        if (usuarioParaBloquear?.ativo && !motivoBloqueio.trim()) {
            setMensagem('Informe o motivo do bloqueio');
            setTipoMensagem('erro');
            return;
        }
        setModalBloqueioAberto(false);
        const acao = usuarioParaBloquear?.ativo ? 'bloquear' : 'desbloquear';
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/bloquear/${usuarioParaBloquear.id}?token=${token}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ acao, motivo: motivoBloqueio })
            });
            const data = await response.json();
            setMensagem(data.message || data.error);
            setTipoMensagem(response.ok ? 'sucesso' : 'erro');
            if (response.ok) { buscarOngs(); buscarDoadores(); buscarAdms(); }
        } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
        setUsuarioParaBloquear(null);
        setMotivoBloqueio('');
    }

    function confirmarExcluir(tipo, item) {
        setItemParaExcluir(item);
        setTipoExclusao(tipo);
        setModalExcluirAberto(true);
    }

    async function executarExclusao() {
        setModalExcluirAberto(false);
        const token = localStorage.getItem('token');
        try {
            let response;
            if (tipoExclusao === 'ong') {
                response = await fetch(`${api_url}/admin/deletar_ong/${itemParaExcluir.id}?token=${token}`, { method: 'DELETE', credentials: 'include' });
            } else if (tipoExclusao === 'doador' || tipoExclusao === 'adm') {
                response = await fetch(`${api_url}/deletar_usuarios/${itemParaExcluir[0]}?token=${token}`, { method: 'DELETE', credentials: 'include' });
            }
            const data = await response.json();
            setMensagem(data.message || data.error);
            setTipoMensagem(response.ok ? 'sucesso' : 'erro');
            if (response.ok) { buscarOngs(); buscarDoadores(); buscarAdms(); }
        } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
        setItemParaExcluir(null);
        setTipoExclusao('');
    }

    function getCorStatus(codigo) {
        if (codigo === 0) return { cor: '#f7b567', texto: 'Pendente' };
        if (codigo === 1) return { cor: '#167cbf', texto: 'Aprovada' };
        if (codigo === 2) return { cor: '#f65682', texto: 'Reprovada' };
        return { cor: '#999', texto: 'Desconhecido' };
    }

    function getImagemUrl(id) { return `${api_url}/uploads/Usuarios/${id}.jpeg`; }

    const sucesso = localStorage.getItem('sucesso');
    useEffect(() => { if (sucesso) { setMensagem(sucesso); setTipoMensagem('sucesso'); localStorage.removeItem('sucesso'); } }, [sucesso]);

    if (!autorizado) return null;

    const totalPaginasOngs = Math.ceil(ongs.length / ongsPorPagina);
    const ongsPaginadas = ongs.slice(paginaOngs * ongsPorPagina, (paginaOngs + 1) * ongsPorPagina);
    const totalPaginasDoadores = Math.ceil(doadores.length / doadoresPorPagina);
    const doadoresPaginados = doadores.slice(paginaDoadores * doadoresPorPagina, (paginaDoadores + 1) * doadoresPorPagina);
    const totalPaginasAdms = Math.ceil(adms.length / admsPorPagina);
    const admsPaginados = adms.slice(paginaAdms * admsPorPagina, (paginaAdms + 1) * admsPorPagina);

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
            <p>Nenhuma arrecadação ainda</p>
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
            <section className={css.menulateral}><MenuLateral /></section>
            <div className={css.conteudo}>
                <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />

                {modalExcluirAberto && (
                    <div className={css.modalOverlay} onClick={() => setModalExcluirAberto(false)}>
                        <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={css.modalTitulo}>Confirmar Exclusão</h3>
                            <p className={css.modalTexto}>Tem certeza que deseja excluir permanentemente <strong>{tipoExclusao === 'ong' ? itemParaExcluir?.nome : itemParaExcluir?.[1]}</strong>?</p>
                            <p className={css.modalAviso}>Esta ação não pode ser desfeita.</p>
                            <div className={css.modalBotoes}>
                                <button className={css.modalBtnCancelar} onClick={() => setModalExcluirAberto(false)}>Cancelar</button>
                                <button className={css.modalBtnExcluir} onClick={executarExclusao}>Sim, excluir</button>
                            </div>
                        </div>
                    </div>
                )}

                {modalBloqueioAberto && (
                    <div className={css.modalOverlay} onClick={() => setModalBloqueioAberto(false)}>
                        <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={css.modalTitulo}>{usuarioParaBloquear?.ativo ? '🔒 Bloquear ' : '🔓 Desbloquear '}{usuarioParaBloquear?.tipoUsuario === 'ong' ? 'ONG' : usuarioParaBloquear?.tipoUsuario === 'doador' ? 'Doador' : 'ADM'}</h3>
                            <p className={css.modalTexto}><strong>{usuarioParaBloquear?.nome}</strong></p>
                            {usuarioParaBloquear?.ativo && (
                                <div className={css.motivoReprovacao}>
                                    <textarea className={css.modalTextarea} placeholder="Descreva o motivo do bloqueio..." value={motivoBloqueio} onChange={(e) => setMotivoBloqueio(e.target.value)} rows={4} />
                                </div>
                            )}
                            {!usuarioParaBloquear?.ativo && <p className={css.modalSubtexto}>Deseja realmente desbloquear este usuário?</p>}
                            <div className={css.modalBotoes}>
                                <button className={css.modalBtnCancelar} onClick={() => setModalBloqueioAberto(false)}>Cancelar</button>
                                <button className={usuarioParaBloquear?.ativo ? css.modalBtnExcluir : css.modalBtnAtivar} onClick={executarBloqueio}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={css.inicio}>
                    <div className={css.Titulo}>
                        <Titulo titulo={`Olá,`} cor={'saudacao'} span={nomeADM} />
                    </div>
                    <div>
                        <BotaoConfiguracoes/>
                    </div>
                </div>

                <p className={css.acoesRapidas}>Ações rápidas</p>
                <div className={css.acoes}>
                    <Acoes cor={'amarelo'} texto={'Aprovar ONGs'} pagina={'/listaAprovacoes'} />
                    <Acoes cor={'amarelo'} texto={'Cadastrar ADM'} pagina={'/cadastroAdm'} />
                    <Acoes cor={'amarelo'} texto={'Editar Perfil'} pagina={`/editarAdm/${idAdm}`} />
                    <Acoes cor={'amarelo'} texto={'Ver Relatório'} pagina={'/relatorios'} />
                </div>

                {/* ONGs */}
                <div className={css.titulos}><Titulo titulo={'ONGs Cadastradas'} cor={'preto'} /></div>
                <div className={css.cardsAdm}>
                    {ongsPaginadas.length === 0 ? <p>Nenhuma ONG cadastrada</p> : ongsPaginadas.map((ong) => {
                        const status = getCorStatus(ong.codigo_aprovacao);
                        return (
                            <div key={ong.id} className={css.cardAdm} style={{ borderTop: `4px solid ${status.cor}` }}>
                                <div className={css.cardAdmTopo}>
                                    <img src={getImagemUrl(ong.id)} alt={ong.nome} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />
                                    <h3 className={css.cardAdmNome}>{ong.nome}</h3>
                                </div>
                                <span className={css.cardAdmStatus} style={{ color: status.cor }}>{status.texto}</span>
                                <div className={css.cardAdmBotoes}>
                                    {ong.codigo_aprovacao === 0 ? (
                                        <button className={css.btnAtivar} onClick={() => navigate(`/listaAprovacoes`)}>Aprovar ONG</button>
                                    ) : (
                                        <>
                                            <button className={css.btnEditar} onClick={() => navigate(`/editarOng/${ong.id}`)}>Editar ONG</button>
                                            <button className={ong.ativo ? css.btnInativar : css.btnAtivar} onClick={() => abrirModalBloqueio({ id: ong.id, nome: ong.nome, ativo: ong.ativo }, 'ong')}>{ong.ativo ? 'Bloquear ONG' : 'Desbloquear ONG'}</button>
                                            {ong.codigo_aprovacao === 2 && <button className={css.btnExcluir} onClick={() => confirmarExcluir('ong', ong)}>Excluir ONG</button>}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {totalPaginasOngs > 1 && (
                    <div className={css.paginacao}>
                        <button className={css.botaoPagina} onClick={() => setPaginaOngs(p => p - 1)} disabled={paginaOngs === 0}>←</button>
                        <span className={css.paginaInfo}>{paginaOngs + 1} de {totalPaginasOngs}</span>
                        <button className={css.botaoPagina} onClick={() => setPaginaOngs(p => p + 1)} disabled={paginaOngs === totalPaginasOngs - 1}>→</button>
                    </div>
                )}

                {/* Doadores */}
                <div className={css.titulos}><Titulo titulo={'Doadores'} cor={'preto'} /></div>
                <div className={css.cardsAdm}>
                    {doadoresPaginados.length === 0 ? <p>Nenhum doador cadastrado</p> : doadoresPaginados.map((doador) => (
                        <div key={doador[0]} className={css.cardAdm} style={{ borderTop: `4px solid ${doador[15] === 1 ? '#167cbf' : '#f65682'}` }}>
                            <div className={css.cardAdmTopo}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img src={getImagemUrl(doador[0])} alt={doador[1]} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />
                                    <SeloVoluntario idUsuario={doador[0]} api={api_url} />
                                </div>
                                <h3 className={css.cardAdmNome}>{doador[1]}</h3>
                            </div>
                            <span className={css.cardAdmStatus} style={{ color: doador[15] === 1 ? '#167cbf' : '#f65682' }}>{doador[15] === 1 ? 'Ativo' : 'Inativo'}</span>
                            <div className={css.cardAdmBotoes}>
                                <button className={css.btnEditar} onClick={() => navigate(`/editarDoador/${doador[0]}`)}>Editar Doador</button>
                                <button className={doador[15] === 1 ? css.btnInativar : css.btnAtivar} onClick={() => abrirModalBloqueio({ id: doador[0], nome: doador[1], ativo: doador[15] === 1 }, 'doador')}>{doador[15] === 1 ? 'Bloquear Doador' : 'Desbloquear Doador'}</button>
                                {doador[15] === 0 && <button className={css.btnExcluir} onClick={() => confirmarExcluir('doador', doador)}>Excluir Doador</button>}
                            </div>
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

                {/* ADMs */}
                <div className={css.titulos}><Titulo titulo={'Administradores'} cor={'preto'} /></div>
                <div className={css.cardsAdm}>
                    {admsPaginados.length === 0 ? <p>Nenhum ADM cadastrado</p> : admsPaginados.map((adm) => (
                        <div key={adm[0]} className={css.cardAdm} style={{ borderTop: `4px solid ${adm[15] === 1 ? '#167cbf' : '#f65682'}` }}>
                            <div className={css.cardAdmTopo}>
                                <img src={getImagemUrl(adm[0])} alt={adm[1]} className={css.cardAdmImagem} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />
                                <h3 className={css.cardAdmNome}>{adm[1]}</h3>
                            </div>
                            <span className={css.cardAdmStatus} style={{ color: adm[15] === 1 ? '#167cbf' : '#f65682' }}>{adm[15] === 1 ? 'Ativo' : 'Inativo'}</span>
                            <div className={css.cardAdmBotoes}>
                                <button className={css.btnEditar} onClick={() => navigate(`/editarAdm/${adm[0]}`)}>Editar ADM</button>
                                <button className={adm[15] === 1 ? css.btnInativar : css.btnAtivar} onClick={() => abrirModalBloqueio({ id: adm[0], nome: adm[1], ativo: adm[15] === 1 }, 'adm')}>{adm[15] === 1 ? 'Bloquear ADM' : 'Desbloquear ADM'}</button>
                                {adm[15] === 0 && <button className={css.btnExcluir} onClick={() => confirmarExcluir('adm', adm)}>Excluir ADM</button>}
                            </div>
                        </div>
                    ))}
                </div>
                {totalPaginasAdms > 1 && (
                    <div className={css.paginacao}>
                        <button className={css.botaoPagina} onClick={() => setPaginaAdms(p => p - 1)} disabled={paginaAdms === 0}>←</button>
                        <span className={css.paginaInfo}>{paginaAdms + 1} de {totalPaginasAdms}</span>
                        <button className={css.botaoPagina} onClick={() => setPaginaAdms(p => p + 1)} disabled={paginaAdms === totalPaginasAdms - 1}>→</button>
                    </div>
                )}


                <div className={css.Titulo}><Titulo titulo={`Arrecadação`} cor={'preto'} span={'global'} corSpan={'laranja-span'}/></div>
                <div style={{ background: '#fff', borderRadius: '16px', marginBottom: '30px' }}>
                    {isMobile ? renderGraficoPizza() : renderGrafico()}
                </div>
            </div>
        </section>
    );
}