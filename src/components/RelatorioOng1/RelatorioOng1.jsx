// src/components/RelatorioOng1/RelatorioOng1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import css from "./RelatorioOng1.module.css";
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

export default function RelatorioOng1({ api }) {
    const api_url = api;
    const navigate = useNavigate();
    const [autorizado, setAutorizado] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [baixando, setBaixando] = useState(false);

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
        setAutorizado(true);
    }, []);

    async function baixarRelatorio() {
        setBaixando(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${api_url}/ong/meu_relatorio?token=${token}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.status === 401) {
                localStorage.clear();
                localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const data = await response.json();
                setMensagem(data.error || 'Erro ao gerar relatório');
                setTipoMensagem('erro');
                setBaixando(false);
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `relatorio_doacoes_recebidas.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            setMensagem('Relatório baixado com sucesso!');
            setTipoMensagem('sucesso');
        } catch (error) {
            console.error('Erro:', error);
            setMensagem('Erro de conexão');
            setTipoMensagem('erro');
        } finally {
            setBaixando(false);
            setTimeout(() => setMensagem(''), 3000);
        }
    }

    if (!autorizado) return null;

    return (
        <section className={css.secao}>
            <section className={css.menulateral}><MenuLateral /></section>
            <div className={css.conteudo}>
                <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />

                <h1 className={css.tituloPrincipal}>Ver Relatório</h1>


                <div className={css.relatoriosContainer}>
                    <div className={css.itemRelatorio}>
                        <div className={css.itemInfo}>
                            <h3 className={css.itemTitulo}>Doações Recebidas</h3>
                        </div>
                        <div className={css.itemAcao}>
                            <button
                                className={css.btnBaixar}
                                onClick={baixarRelatorio}
                                disabled={baixando}
                            >
                                {baixando ? 'Baixando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}