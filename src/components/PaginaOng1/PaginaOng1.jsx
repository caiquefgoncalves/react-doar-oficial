// src/components/PaginaOng1/PaginaOng1.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from "./PaginaOng1.module.css";
import BotaoSeguir from "../BotaoSeguir/BotaoSeguir.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import BotaoProjetos from "../BotaoProjetos/BotaoProjetos.jsx";
import Botao from "../Botao/Botao.jsx";

export default function PaginaOng1({api}) {
    const api_url = api;
    const { id } = useParams();
    const navigate = useNavigate();
    let [ong, setOng] = useState(null);
    let [projetos, setProjetos] = useState([]);
    let [qtdProjetos, setQtdProjetos] = useState('');
    let [qtdAtualizacoes, setQtdAtualizacoes] = useState('');
    let [atualizacoes, setAtualizacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    let [paginaProjetos, setPaginasProjetos] = useState(0);
    let [idsAbertos, setIdsAbertos] = useState("");
    let [paginaAtualizacoes, setPaginaAtualizacoes] = useState(0);
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    // Estado local para seguidores
    const [qtdSeguidores, setQtdSeguidores] = useState(0);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
    const projetosPorPagina = isMobile ? 1 : 2;
    const atualizacoesPorPagina = isMobile ? 1 : 2;

    let [copiado, setCopiado] = useState("Copiar"); // Estado para o botão de copiar

    function copiarPix() {
        navigator.clipboard.writeText(ong.chave_pix).then(() => {
            setCopiado("Copiado!");
            setTimeout(() => setCopiado("Copiar"), 2000);
        }).catch(err => {
            console.error("Erro ao copiar: ", err);
        });
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsuarioTipo(payload.tipo);
            } catch (e) {}
        }
        buscarDados();
        const handleResize = () => { setIsMobile(window.innerWidth <= 425); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    async function buscarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/ver_ong_publica/${id}?token=${token || ''}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.ong) {
                    setOng(data.ong);
                    setQtdSeguidores(data.ong.qtd_seguidores || 0);
                }
                if (data.projetos) setProjetos(data.projetos);
                if (data.atualizacoes) setAtualizacoes(data.atualizacoes || []);
                if (data.qtd_projetos !== undefined) setQtdProjetos(data.qtd_projetos);
                if (data.qtd_atualizacoes !== undefined) setQtdAtualizacoes(data.qtd_atualizacoes);
            }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoading(false); }
    }

    function handleSeguirChange(novoStatus) {
        setQtdSeguidores(prev => prev + (novoStatus ? 1 : -1));
    }

    function handleVoluntariar(projetoId) {
        navigate(`/voluntario/${projetoId}`);
    }

    function handleDoar(projetoId) {
        navigate(`/doar/${projetoId}`);
    }

    function getTextoSeguidores() {
        if (qtdSeguidores === 0) return 'Não há seguidores';
        if (qtdSeguidores === 1) return `${qtdSeguidores} seguidor`;
        return `${qtdSeguidores} seguidores`;
    }

    if (loading) return (
        <section className={css.secao}>
            <div className={css.menulateral}><MenuLateral/></div>
            <div className={css.conteudo}><p>Carregando...</p></div>
        </section>
    );

    if (!ong) return (
        <section className={css.secao}>
            <div className={css.menulateral}><MenuLateral/></div>
            <div className={css.conteudo}><p>ONG não encontrada</p></div>
        </section>
    );

    const totalPaginasProjetos = Math.ceil(projetos.length / projetosPorPagina);
    const projetosPaginados = projetos.slice(paginaProjetos * projetosPorPagina, (paginaProjetos + 1) * projetosPorPagina);
    const totalPaginasAtualizacoes = Math.ceil(atualizacoes.length / atualizacoesPorPagina);
    const atualizacoesPaginadas = atualizacoes.slice(paginaAtualizacoes * atualizacoesPorPagina, (paginaAtualizacoes + 1) * atualizacoesPorPagina);

    return (
        <section className={css.secao}>
            <div className={css.menulateral}><MenuLateral/></div>
            <div className={css.conteudo}>
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />

                <div className={css.layoutDuasColunas}>
                    <div className={css.colunaEsquerda}>
                        <div className={css.titulo}>
                            <div className={css.headerONG}>
                                {ong && (
                                    <img
                                        className={css.imagem}
                                        src={ong.foto ? `${api_url}/uploads/Usuarios/${ong.foto}` : '/ong-icon.png'}
                                        alt={`Logo da ONG ${ong.nome}`}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }}
                                    />
                                )}
                                <div>
                                    <h1 className={css.nome}>{ong.nome}</h1>
                                    <p className={css.descBreve}>{ong.descricao_breve}</p>
                                    <p className={css.texto}>{getTextoSeguidores()}</p>
                                </div>
                            </div>
                            {/* Botão seguir - apenas doadores ou não logados */}
                            {(usuarioTipo === 1 || usuarioTipo === null) && (
                                <BotaoSeguir
                                    idOng={id}
                                    apiUrl={api_url}
                                    onStatusChange={handleSeguirChange}
                                    onMensagem={(texto, tipo) => { setMsgTexto(texto); setMsgTipo(tipo); }}
                                />
                            )}
                        </div>

                        {/* Sobre Nós */}
                        <div className={css.secaoBox}>
                            <p className={css.sobrenos}>Sobre nós</p>
                            <p className={css.descLonga}>{ong.descricao_longa || 'Sem descrição detalhada.'}</p>
                        </div>

                        {/* Informações */}
                        <div className={css.secaoBox}>
                            <div className={css.infoGrid}>
                                <div><span className={css.infoLabel}>Categoria</span><p className={css.infoValor}>{ong.categoria || 'Não informada'}</p></div>
                                <div><span className={css.infoLabel}>Localização</span><p className={css.infoValor}>{ong.localizacao || 'Não informada'}</p></div>
                            </div>
                        </div>

                        {/* Projetos */}
                        {projetos.length > 0 && (
                            <div className={css.secaoBox}>
                                <div className={css.headerAtualizacoes}>
                                    <p className={css.sobrenos}>Projetos ativos</p>
                                    {qtdProjetos == 1 && <p className={css.texto}>{qtdProjetos} projeto</p>}
                                    {qtdProjetos > 1 && <p className={css.texto}>{qtdProjetos} projetos</p>}
                                </div>
                                <div className={css.projetosLista}>
                                    {projetosPaginados.map(proj => (
                                        <div key={proj.id} className={css.atualizacao}>
                                            <Link to={`/projeto/${proj.id}`}>
                                                <img
                                                    className={css.attImagem}
                                                    src={`${api_url}/uploads/Projetos/${proj.id}.jpeg`}
                                                    alt={proj.titulo}
                                                    onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }}
                                                />
                                            </Link>
                                            <h3 className={css.attTitulo}>{proj.titulo}</h3>
                                            <p className={css.attTexto}>{proj.descricao?.substring(0, 100)}...</p>
                                            <span className={css.tipoAjuda}>{proj.tipo_ajuda}</span>
                                            <BotaoProjetos status={proj.tipo_ajuda_numero} projetoId={proj.id} usuarioTipo={usuarioTipo} apiUrl={api_url}/>
                                        </div>
                                    ))}
                                </div>
                                {totalPaginasProjetos > 1 && (
                                    <div className={css.controlesCarrossel}>
                                        <button className={`${css.botaoCarrossel} ${paginaProjetos === 0 ? css.desabilitado : ''}`} onClick={() => setPaginasProjetos(p => p - 1)} disabled={paginaProjetos === 0}>←</button>
                                        <span className={css.paginaInfo}>{paginaProjetos + 1} de {totalPaginasProjetos}</span>
                                        <button className={`${css.botaoCarrossel} ${paginaProjetos === totalPaginasProjetos - 1 ? css.desabilitado : ''}`} onClick={() => setPaginasProjetos(p => p + 1)} disabled={paginaProjetos === totalPaginasProjetos - 1}>→</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {projetos.length === 0 && (
                            <div className={css.secaoBox}><p className={css.sobrenos}>Projetos ativos</p><p className={css.semAtualizacoes}>Nenhuma projeto disponível no momento.</p></div>
                        )}

                        {/* Atualizações */}
                        {atualizacoes.length > 0 && (
                            <div className={css.secaoBox}>
                                <div className={css.headerAtualizacoes}>
                                    <p className={css.sobrenos}>Últimas atualizações</p>
                                    {qtdAtualizacoes == 1 && <p className={css.texto}>{qtdAtualizacoes} atualização</p>}
                                    {qtdAtualizacoes > 1 && <p className={css.texto}>{qtdAtualizacoes} atualizações</p>}
                                </div>
                                <div className={css.projetosLista}>
                                    {atualizacoesPaginadas.map(att => (
                                        <div key={att.id} className={css.atualizacao}>
                                            {att && <img className={css.attImagem} src={`${api_url}/uploads/Atualizacoes/${att.id}.jpeg`} alt={att.titulo} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />}
                                            <h3 className={css.attTitulo}>{att.titulo}</h3>
                                            {att.texto && (
                                                <p className={css.attTexto}>
                                                    {idsAbertos === att.id || att.texto.length <= 100 ? att.texto : att.texto.substring(0, 100) + "..."}
                                                    {att.texto.length > 100 && (
                                                        <button onClick={() => setIdsAbertos(idsAbertos === att.id ? null : att.id)} style={{ backgroundColor: '#167cbf', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', marginLeft: '5px' }}>
                                                            {idsAbertos === att.id ? "Ler menos" : "Ler mais"}
                                                        </button>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {totalPaginasAtualizacoes > 1 && (
                                    <div className={css.controlesCarrossel}>
                                        <button className={`${css.botaoCarrossel} ${paginaAtualizacoes === 0 ? css.desabilitado : ''}`} onClick={() => setPaginaAtualizacoes(p => p - 1)} disabled={paginaAtualizacoes === 0}>←</button>
                                        <span className={css.paginaInfo}>{paginaAtualizacoes + 1} de {totalPaginasAtualizacoes}</span>
                                        <button className={`${css.botaoCarrossel} ${paginaAtualizacoes === totalPaginasAtualizacoes - 1 ? css.desabilitado : ''}`} onClick={() => setPaginaAtualizacoes(p => p + 1)} disabled={paginaAtualizacoes === totalPaginasAtualizacoes - 1}>→</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {atualizacoes.length === 0 && (
                            <div className={css.secaoBox}><p className={css.sobrenos}>Últimas atualizações</p><p className={css.semAtualizacoes}>Nenhuma atualização disponível no momento.</p></div>
                        )}
                    </div>

                    <div className={css.colunaDireita}>
                        <div className={css.cardApoie}>
                            <Titulo titulo={`Apoie o ${ong.nome} diretamente!`} cor={'preto'}/>
                            <img className={css.pix} src={ong.pix ? `${api_url}/uploads/Pix/${ong.pix}` : '/sem_imagem.webp'} alt={`Pix ${ong.nome}`} onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }} />
                            <div className={css.pixContainer}>
                                <p className={css.pixCode}>
                                    {ong.chave_pix}
                                </p>
                                <Botao cor={'rosa'} acao={copiarPix} texto={copiado}/>
                            </div>
                            <div className={css.dadosBancarios}>
                                <p><strong>Instituição:</strong><br/>{ong.cod_banco || 'Não informado'}</p>
                                <p><strong>Agência:</strong><br/>{ong.num_agencia || 'Não informada'}</p>
                                <p><strong>Titular:</strong><br/>{ong.nome}</p>
                                <p><strong>CNPJ:</strong><br/>{ong.cpf_cnpj}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}