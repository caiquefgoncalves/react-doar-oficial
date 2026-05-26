import { useState, useEffect } from 'react';
import css from './Recomendacoes.module.css';
import BotaoSeguir from "../BotaoSeguir/BotaoSeguir.jsx";

export default function Recomendacoes() {

    const api_url = "http://10.218.141.146:5000";

    const [ongs, setOngs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    const buscarRecomendacoes = async () => {
        try {
            setCarregando(true);
            setErro(false);

            // 1. Pegar o token do localStorage
            const token = localStorage.getItem('token');

            let url = `${api_url}/ongs_recomendacoes`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 2. Enviar o token puro no cabeçalho
                    'Authorization': token || ''
                }
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();

                if (response.ok && data.ongs) {
                    setOngs(data.ongs);
                } else {
                    setOngs([]);
                }
            } else {
                setOngs([]);
            }
        } catch (error) {
            console.error('Erro ao buscar recomendações:', error);
            setErro(true);
            setOngs([]);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        buscarRecomendacoes();
    }, []);

    function getImagemUrl(id) {
        return `${api_url}/uploads/Usuarios/${id}.jpeg`;
    }

    if (carregando) {
        return (
            <div className={css.card}>
                <div>
                    <h2>Recomendações</h2>
                </div>
                <div className={css.carregando}>
                    <div className={css.spinner}></div>
                    Carregando recomendações...
                </div>
            </div>
        );
    }

    // Se não houver nenhuma ONG recomendada (ou se o usuário já seguir todas)
    if (ongs.length === 0) {
        return (
            <div className={css.card}>
                <div>
                    <h2>Recomendações</h2>
                </div>
                <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '15px 0' }}>
                    Nenhuma nova recomendação no momento.
                </p>
            </div>
        );
    }

    return (
        <div className={css.card}>
            <div>
                <h2>Recomendações</h2>
            </div>
            {ongs.map((ong) => (
                <div key={ong.id} className={css.ongs}>
                    <div className={css.info}>
                        <img
                            src={getImagemUrl(ong.id)}
                            alt={ong.nome}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                            }}
                        />
                        <p>{ong.nome}</p>
                    </div>
                    <div className={css.botaoseguir}>
                        <BotaoSeguir
                            idOng={ong.id}
                            apiUrl={api_url}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}