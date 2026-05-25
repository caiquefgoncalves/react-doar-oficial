// src/components/ListaAprovacoes1/ListaAprovacoes1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OngsAprovar1 from "../OngsAprovar1/OngsAprovar1.jsx";
import css from "./ListaAprovacoes1.module.css";
import Titulo from "../Titulo/Titulo.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function ListaAprovacoes1({api}) {
    const api_url = api
    const navigate = useNavigate();
    const [ongs, setOngs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 0) {
            localStorage.clear();
            navigate('/login');
            return;
        }

        buscarOngs();
    }, []);

    async function buscarOngs() {
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            const response = await fetch(`${api_url}/admin/listar_ongs?token=${token}`, {
                method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            });

            if (response.status === 401) { localStorage.clear(); navigate('/login'); return; }

            const data = await response.json();
            if (response.ok) {
                const pendentes = data.ongs.filter(ong => ong.codigo_aprovacao === 0);
                setOngs(pendentes);
            } else {
                setMensagem(data.error || 'Erro ao carregar ONGs');
                setTipoMensagem('erro');
            }
        } catch (error) {
            setMensagem('Erro de conexão com o servidor');
            setTipoMensagem('erro');
        } finally {
            setLoading(false);
        }
    }

    function formatarData(dataString) {
        if (!dataString) return 'Sem data';
        return dataString.split(' ')[0];
    }

    if (loading) return <section className={css.secao}><div className={css.loading}><p>Carregando...</p></div></section>;

    return (
        <section className={css.secao}>
            <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />
            <div className={css.tituloprincipal}><Titulo titulo={'Lista de Pendências'} cor={'preto'} /></div>
            {ongs.length === 0 ? (
                <div className={css.semPendencias}><Titulo titulo={'Nenhuma ONG pendente de aprovação'} cor={'preto-subtitulo'} /></div>
            ) : (
                <div className={css.tabelaContainer}>
                    <div className={css.cabecalho}>
                        <div className={css.informacoes}>
                            <span className={css.colunaNome}>Nome da ONG</span>
                            <span className={css.colunaData}>Data de Cadastro</span>
                            <span className={css.colunaAcoes}>Ações</span>
                        </div>
                    </div>
                    <div className={css.cards}>
                        {ongs.map((ong) => (
                            <OngsAprovar1 key={ong.id} id={ong.id} nomeong={ong.nome} data={formatarData(ong.data_cadastro)} email={ong.email} cpf_cnpj={ong.cpf_cnpj} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}