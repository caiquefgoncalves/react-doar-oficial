// src/components/Projetos1/Projetos1.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from './Projetos1.module.css'
import BotaoProjetos from "../BotaoProjetos/BotaoProjetos.jsx";

export default function Projetos({api}) {
    const api_url = api
    const [projetos, setProjetos] = useState([]);
    const [todosProjetos, setTodosProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [statusFiltro, setStatusFiltro] = useState('todos');
    const [usuarioTipo, setUsuarioTipo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsuarioTipo(payload.tipo);
            } catch (e) {}
        }
        buscarProjetos();
    }, []);

    async function buscarProjetos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_projetos_publicos?token=${token || ''}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.projetos) {
                    setTodosProjetos(data.projetos);
                    setProjetos(data.projetos);
                }
            }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoading(false); }
    }

    useEffect(() => {
        let filtrados = todosProjetos;
        if (busca.trim()) {
            filtrados = filtrados.filter(proj =>
                proj.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                (proj.descricao && proj.descricao.toLowerCase().includes(busca.toLowerCase())) ||
                (proj.ong_nome && proj.ong_nome.toLowerCase().includes(busca.toLowerCase()))
            );
        }
        if (statusFiltro !== 'todos') {
            filtrados = filtrados.filter(proj => proj.status === statusFiltro);
        }
        setProjetos(filtrados);
    }, [busca, statusFiltro, todosProjetos]);

    if (loading) return (
        <section className={css.secao}><MenuLateral/><div className={css.conteudo}><p>Carregando...</p></div></section>
    );

    return (
        <section className={css.secao}>
            <MenuLateral/>
            <div className={css.conteudo}>

                <div className={css.barraTopo}>
                    <div className={css.buscaInput}>
                        <input type="text" placeholder="Buscar por Projeto..." value={busca} onChange={(e) => setBusca(e.target.value)} className={css.inputBusca} />
                        <button className={css.btnBuscar}></button>
                    </div>
                    <div className={css.filtro}>
                        <span>Filtrar por:</span>
                        <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className={css.selectFiltro}>
                            <option value="todos">Todos</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{projetos.length} projeto(s) encontrado(s)</p>

                <div className={css.cardsContainer}>
                    {projetos.length === 0 ? (
                        <p className={css.vazio}>Nenhum projeto encontrado.</p>
                    ) : (
                        projetos.map(projeto => (
                            <Link to={`/projeto/${projeto.id}`} key={projeto.id} className={css.card}>
                                <img src={projeto.foto ? `${api_url}/uploads/Projetos/${projeto.foto}` : '/projeto-default.png'} alt={projeto.titulo} className={css.cardImagem} onError={(e) => { e.currentTarget.src = '/sem_imagem.webp'; }} />
                                <div className={css.cardInfo}>
                                    <div className={'d-flex justify-content-between align-items-center mb-3'}>
                                        <h3 className={css.cardNome}>{projeto.titulo}</h3>

                                    </div>
                                    <p className={css.cardDesc}>{projeto.descricao?.substring(0, 80)}...</p>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className={css.cardCategoria}>{projeto.status}</span>
                                        <span style={{ fontSize: '11px', color: '#999' }}>{projeto.ong_nome}</span>
                                    </div>
                                    <div className={css.botao}>
                                        <BotaoProjetos status={projeto.tipo_ajuda} projetoId={projeto.id} usuarioTipo={usuarioTipo} apiUrl={api_url}/>
                                    </div>
                                </div>

                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}