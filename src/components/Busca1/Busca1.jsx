// src/components/Busca1/Busca1.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import css from "./Busca1.module.css";

export default function Busca1({ api }) {
    const api_url = api
    const [termo, setTermo] = useState('');
    const [tipo, setTipo] = useState('todos');
    const [resultados, setResultados] = useState({ ongs: [], projetos: [] });
    const [buscou, setBuscou] = useState(false);


    async function buscar() {
        if (!termo.trim() && tipo === 'todos') return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/buscar?q=${encodeURIComponent(termo)}&tipo=${tipo}&token=${token || ''}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setResultados(data);
                setBuscou(true);
            }
        } catch (error) { console.error('Erro:', error); }
    }

    return (
        <section className={css.secao}>
            <MenuLateral/>
            <div className={css.conteudo}>
                <Titulo titulo={'Buscar'} cor={'preto'}/>

                {/* Barra de busca */}
                <div className={css.barraBusca}>
                    <input
                        type="text"
                        placeholder="Busque por ONGs ou Projetos..."
                        value={termo}
                        onChange={(e) => setTermo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()}
                        className={css.inputBusca}
                    />
                    <button onClick={buscar} className={css.btnBuscar}>Buscar</button>
                </div>

                {/* Filtros */}
                <div className={css.filtros}>
                    <button className={`${css.filtroBtn} ${tipo === 'todos' ? css.ativo : ''}`} onClick={() => setTipo('todos')}>Todos</button>
                    <button className={`${css.filtroBtn} ${tipo === 'ongs' ? css.ativo : ''}`} onClick={() => setTipo('ongs')}>ONGs</button>
                    <button className={`${css.filtroBtn} ${tipo === 'projetos' ? css.ativo : ''}`} onClick={() => setTipo('projetos')}>Projetos</button>
                </div>

                {/* Resultados */}
                {buscou && (
                    <div className={css.resultados}>
                        {/* ONGs */}
                        {(tipo === 'todos' || tipo === 'ongs') && resultados.ongs?.length > 0 && (
                            <div className={css.secaoResultado}>
                                <h2 className={css.tituloResultado}>ONGs</h2>
                                <div className={css.grid}>
                                    {resultados.ongs.map(ong => (
                                        <Link to={`/ong/${ong.id}`} key={ong.id} className={css.card}>
                                            <img src={ong.foto ? `${api_url}/uploads/Usuarios/${ong.foto}` : '/ong-icon.png'} alt={ong.nome} className={css.cardImg} />
                                            <div className={css.cardInfo}>
                                                <h3>{ong.nome}</h3>
                                                <p>{ong.descricao_breve?.substring(0, 80)}...</p>
                                                <span className={css.tag}>{ong.categoria || 'ONG'}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projetos */}
                        {(tipo === 'todos' || tipo === 'projetos') && resultados.projetos?.length > 0 && (
                            <div className={css.secaoResultado}>
                                <h2 className={css.tituloResultado}>Projetos</h2>
                                <div className={css.grid}>
                                    {resultados.projetos.map(proj => (
                                        <Link to={`/projeto/${proj.id}`} key={proj.id} className={css.card}>
                                            <img src={proj.foto ? `${api_url}/uploads/Projetos/${proj.foto}` : '/projeto-default.png'} alt={proj.titulo} className={css.cardImg} />
                                            <div className={css.cardInfo}>
                                                <h3>{proj.titulo}</h3>
                                                <p>{proj.descricao?.substring(0, 80)}...</p>
                                                <span className={css.tag}>{proj.status}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nenhum resultado */}
                        {resultados.ongs?.length === 0 && resultados.projetos?.length === 0 && (
                            <p className={css.semResultados}>Nenhum resultado encontrado.</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}