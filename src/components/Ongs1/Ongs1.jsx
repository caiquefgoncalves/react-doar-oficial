// src/components/Ongs1/Ongs1.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from './Ongs1.module.css'
import BotaoSeguir from "../BotaoSeguir/BotaoSeguir.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

export default function Ongs({api}) {
    const api_url = api
    const [ongs, setOngs] = useState([]);
    const [todasOngs, setTodasOngs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsuarioTipo(payload.tipo);
            } catch (e) {}
        }
        buscarOngs();
    }, []);

    async function buscarOngs() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_ongs_publicas?token=${token || ''}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.ongs) {
                    setTodasOngs(data.ongs);
                    setOngs(data.ongs);
                }
            }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoading(false); }
    }

    useEffect(() => {
        let filtradas = todasOngs;
        if (busca.trim()) {
            filtradas = filtradas.filter(ong =>
                ong.nome.toLowerCase().includes(busca.toLowerCase()) ||
                (ong.descricao_breve && ong.descricao_breve.toLowerCase().includes(busca.toLowerCase()))
            );
        }
        if (categoriaFiltro !== 'todas') {
            filtradas = filtradas.filter(ong => ong.categoria === categoriaFiltro);
        }
        setOngs(filtradas);
    }, [busca, categoriaFiltro, todasOngs]);

    const categorias = ['todas', ...new Set(todasOngs.map(o => o.categoria).filter(Boolean))];

    if (loading) return (
        <section className={css.secao}><MenuLateral/><div className={css.conteudo}><p>Carregando...</p></div></section>
    );

    return (
        <section className={css.secao}>
            <MenuLateral/>
            <div className={css.conteudo}>
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />

                <div className={css.barraTopo}>
                    <div className={css.buscaInput}>
                        <input type="text" placeholder="Buscar por ONG..." value={busca} onChange={(e) => setBusca(e.target.value)} className={css.inputBusca} />
                        <button className={css.btnBuscar}></button>
                    </div>
                    <div className={css.filtro}>
                        <span>Filtrar por:</span>
                        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className={css.selectFiltro}>
                            <option value="todas">Todas</option>
                            {categorias.filter(c => c !== 'todas').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>{ongs.length} ONG(s) encontrada(s)</p>

                <div className={css.cardsContainer}>
                    {ongs.length === 0 ? (
                        <p className={css.vazio}>Nenhuma ONG encontrada.</p>
                    ) : (
                        ongs.map(ong => (
                            <div key={ong.id} className={css.cardWrapper}>
                                <Link to={`/ong/${ong.id}`} className={css.card}>
                                    <img
                                        src={ong.foto ? `${api_url}/uploads/Usuarios/${ong.foto}` : '/ong-icon.png'}
                                        alt={ong.nome}
                                        className={css.cardImagem}
                                        onError={(e) => { e.target.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }}
                                    />
                                    <div className={css.cardInfo}>
                                        <h3 className={css.cardNome}>{ong.nome}</h3>
                                        <p className={css.cardDesc}>{ong.descricao_breve?.substring(0, 80) || 'Sem descrição'}...</p>
                                        <span className={css.cardCategoria}>{ong.categoria || 'ONG'}</span>
                                    </div>
                                </Link>
                                {/* Botão seguir apenas para doadores ou não logados */}
                                {(usuarioTipo === 1 || usuarioTipo === null) && (
                                    <BotaoSeguir
                                        idOng={ong.id}
                                        apiUrl={api_url}
                                        onStatusChange={(novoStatus) => {
                                            // Atualizar o estado local
                                            setOngs(prev => prev.map(o => {
                                                if (o.id === ong.id) {
                                                    return {
                                                        ...o,
                                                        qtd_seguidores: (o.qtd_seguidores || 0) + (novoStatus ? 1 : -1)
                                                    };
                                                }
                                                return o;
                                            }));
                                            setTodasOngs(prev => prev.map(o => {
                                                if (o.id === ong.id) {
                                                    return {
                                                        ...o,
                                                        qtd_seguidores: (o.qtd_seguidores || 0) + (novoStatus ? 1 : -1)
                                                    };
                                                }
                                                return o;
                                            }));
                                        }}
                                        onMensagem={(texto, tipo) => {
                                            setMsgTexto(texto);
                                            setMsgTipo(tipo);
                                        }}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}