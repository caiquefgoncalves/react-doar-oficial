// src/components/PaginaProjeto1/PaginaProjeto1.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from "./PaginaProjeto1.module.css";
import Botao from "../Botao/Botao.jsx";

export default function PaginaProjeto1({ api }) {
    const { id } = useParams();
    const [projeto, setProjeto] = useState(null);
    const [ong, setOng] = useState(null);
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [qtd, setQtd] = useState("");
    const [idsAbertos, setIdsAbertos] = useState("");
    const [loading, setLoading] = useState(true);
    const api_url = api;

    const [paginaAtualizacoes, setPaginaAtualizacoes] = useState(0);
    const atualizacoesPorPagina = 2;

    // Detectar se é mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

    // Quantidade de itens por página (dinâmico)
    const atualizacoesPorPaginaResponsivo = isMobile ? 1 : 2;

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
        buscarDados();

        // Listener para redimensionamento
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 425);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    async function buscarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/ver_projeto_publico/${id}?token=${token || ''}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.projeto) {
                    setProjeto(data.projeto);
                    setOng(data.ong);
                    setAtualizacoes(data.atualizacoes || []);
                    setPaginaAtualizacoes(0);
                    setQtd(data.qtd_atualizacoes || data.atualizacoes?.length || 0);
                }
            }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoading(false); }
    }

    const totalPaginasAtualizacoes = Math.ceil(atualizacoes.length / atualizacoesPorPaginaResponsivo);

    const atualizacoesPaginadas = atualizacoes.slice(
        paginaAtualizacoes * atualizacoesPorPaginaResponsivo,
        (paginaAtualizacoes + 1) * atualizacoesPorPaginaResponsivo
    );

    const proximaPagina = () => {
        if (paginaAtualizacoes < totalPaginasAtualizacoes - 1) {
            setPaginaAtualizacoes(p => p + 1);
        }
    };

    const paginaAnterior = () => {
        if (paginaAtualizacoes > 0) {
            setPaginaAtualizacoes(p => p - 1);
        }
    };

    if (loading) return (
        <section className={css.secao}>
            <div className={css.menulateral}>
                <MenuLateral/>
            </div>
            <div className={css.conteudo}><p>Carregando...</p></div>
        </section>
    );
    if (!projeto) return (
        <section className={css.secao}>
            <div className={css.menulateral}>
                <MenuLateral/>
            </div>
            <div className={css.conteudo}><p>Projeto não encontrado</p></div>
        </section>
    );

    return (
        <section className={css.secao}>
            <div className={css.menulateral}>
                <MenuLateral/>
            </div>
            <div className={css.conteudo}>

                <div className={css.layoutDuasColunas}>
                    {/* Coluna Esquerda */}
                    <div className={css.colunaEsquerda}>

                        <div className={css.headerProjeto}>
                            {ong && (
                                <img
                                    className={css.imagem}
                                    src={`${api_url}/uploads/Usuarios/${ong.id}.jpeg`}
                                    alt={`Logo da ONG ${ong.nome}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.currentTarget.src = '/sem_imagem.webp';
                                    }}
                                />
                            )}
                            <div>
                                <h1 className={css.nome}>{projeto.titulo}</h1>
                                {ong && (
                                    <p className={css.descBreve}>
                                        Projeto desenvolvido pela ONG <Link to={`/ong/${ong.id}`}>{ong.nome}</Link>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sobre Nós */}
                        <div className={css.secaoBox}>
                            <p className={css.sobrenos}>Sobre nós</p>
                            <p className={css.descLonga}>{projeto.descricao}</p>
                        </div>

                        {/* Informações */}
                        <div className={css.secaoBox}>
                            <div className={css.infoGrid}>
                                <div>
                                    <span className={css.infoLabel}>Categoria</span>
                                    <p className={css.infoValor}>{projeto.categoria}</p>
                                </div>
                                <div>
                                    <span className={css.infoLabel}>Localização</span>
                                    <p className={css.infoValor}>{projeto.localizacao || 'Não informada'}</p>
                                </div>
                                <div>
                                    <span className={css.infoLabel}>Tipo de ajuda</span>
                                    <p className={css.infoValor}>{projeto.tipo_ajuda}</p>
                                </div>
                            </div>
                        </div>

                        {/* Últimas atualizações */}
                        {atualizacoes.length > 0 && (
                            <div className={css.secaoBox}>
                                <div className={css.headerAtualizacoes}>
                                    <p className={css.sobrenos}>Últimas atualizações</p>
                                    {qtd == 0 && (
                                        <p className={css.texto}>Não há atualizações</p>
                                    )}
                                    {qtd == 1 && (
                                        <p className={css.texto}>{qtd} atualização</p>
                                    )}
                                    {qtd > 1 && (
                                        <p className={css.texto}>{qtd} atualizações</p>
                                    )}
                                </div>
                                <div className={css.projetosLista}>
                                    {atualizacoesPaginadas.map(att => (
                                        <div key={att.id} className={css.atualizacao}>
                                            {att.foto && (
                                                <img
                                                    className={css.attImagem}
                                                    src={`${api_url}/uploads/Atualizacoes/${att.foto}`}
                                                    alt={att.titulo}
                                                    onError={(e) => { e.target.onerror = null;
                                                        e.currentTarget.src = '/sem_imagem.webp';
                                                    }}
                                                />
                                            )}
                                            <h3 className={css.attTitulo}>{att.titulo}</h3>
                                            {att.texto && (
                                                <p className={css.attTexto}>
                                                    {idsAbertos === att.id || att.texto.length <= 100
                                                        ? att.texto
                                                        : att.texto.substring(0, 100) + "..."}

                                                    {att.texto.length > 100 && (
                                                        <button
                                                            onClick={() => setIdsAbertos(idsAbertos === att.id ? null : att.id)}
                                                            className={css.btnDoar}>
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
                                        <button
                                            className={`${css.botaoCarrossel} ${paginaAtualizacoes === 0 ? css.desabilitado : ''}`}
                                            onClick={paginaAnterior}
                                            disabled={paginaAtualizacoes === 0}
                                        >
                                            ←
                                        </button>
                                        <span className={css.paginaInfo}>{paginaAtualizacoes + 1} de {totalPaginasAtualizacoes}</span>
                                        <button
                                            className={`${css.botaoCarrossel} ${paginaAtualizacoes === totalPaginasAtualizacoes - 1 ? css.desabilitado : ''}`}
                                            onClick={proximaPagina}
                                            disabled={paginaAtualizacoes === totalPaginasAtualizacoes - 1}
                                        >
                                            →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {atualizacoes.length === 0 && (
                            <div className={css.secaoBox}>
                                <p className={css.sobrenos}>Últimas atualizações</p>
                                <p className={css.semAtualizacoes}>Nenhuma atualização disponível no momento.</p>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita - Apoie a ONG */}
                    {ong && (
                        <div className={css.colunaDireita}>
                            <div className={css.cardApoie}>
                                <Titulo titulo={`Apoie o ${ong.nome} diretamente!`} cor={'preto'}/>

                                <img
                                    className={css.pix}
                                    src={ong.pix ? `${api_url}/uploads/Pix/${ong.pix}` : '/sem_imagem.webp'}
                                    alt={`Pix ${ong.nome}`}
                                />

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
                    )}
                </div>
            </div>
        </section>
    );
}