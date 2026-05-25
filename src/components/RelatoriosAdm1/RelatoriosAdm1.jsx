// src/components/RelatoriosAdm/RelatoriosAdm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import css from "./RelatoriosAdm1.module.css";
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

export default function RelatoriosAdm({ api }) {
    const api_url = api;
    const navigate = useNavigate();
    const [autorizado, setAutorizado] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [baixando, setBaixando] = useState(false);
    const [tipoBaixando, setTipoBaixando] = useState('');

    // Datas para o relatório de doações no período
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

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

        if (!tokenData || tokenData.tipo !== 0) {
            localStorage.clear();
            navigate('/login');
            return;
        }
        setAutorizado(true);

        // Set default dates (last 30 days)
        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);

        setDataFim(hoje.toISOString().split('T')[0]);
        setDataInicio(trintaDiasAtras.toISOString().split('T')[0]);
    }, []);

    async function baixarRelatorio(tipo) {
        setBaixando(true);
        setTipoBaixando(tipo);
        try {
            const token = localStorage.getItem('token');
            let url = '';
            let options = { method: 'GET', credentials: 'include' };

            if (tipo === 'doadores') {
                url = `${api_url}/admin/relatorio_doadores?token=${token}`;
            } else if (tipo === 'ongs') {
                url = `${api_url}/admin/relatorio_ongs?token=${token}`;
            } else if (tipo === 'doacoes_periodo') {
                if (!dataInicio || !dataFim) {
                    setMensagem('Selecione as datas de início e fim');
                    setTipoMensagem('erro');
                    setBaixando(false);
                    return;
                }
                if (new Date(dataInicio) > new Date(dataFim)) {
                    setMensagem('Data inicial não pode ser maior que data final');
                    setTipoMensagem('erro');
                    setBaixando(false);
                    return;
                }
                url = `${api_url}/admin/relatorio_doacoes_periodo?token=${token}`;
                options = {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data_inicio: dataInicio, data_fim: dataFim })
                };
            }

            const response = await fetch(url, options);

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

            let filename = '';
            if (tipo === 'doadores') filename = 'relatorio_doadores.pdf';
            else if (tipo === 'ongs') filename = 'relatorio_ongs.pdf';
            else filename = `relatorio_doacoes_${dataInicio}_a_${dataFim}.pdf`;

            link.download = filename;
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
            setTipoBaixando('');
            setTimeout(() => setMensagem(''), 3000);
        }
    }

    if (!autorizado) return null;

    return (
        <section className={css.secao}>
            <section className={css.menulateral}><MenuLateral /></section>
            <div className={css.conteudo}>
                <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />

                <h1 className={css.tituloPrincipal}>Ver Relatórios</h1>
                <h2 className={css.subtitulo}>Tipos de Relatório</h2>

                <div className={css.relatoriosContainer}>

                    {/* Lista de Doadores */}
                    <div className={css.itemRelatorio}>
                        <div className={css.itemInfo}>
                            <h3 className={css.itemTitulo}>Lista de Doadores</h3>
                        </div>
                        <div className={css.itemAcao}>
                            <button
                                className={css.btnBaixar}
                                onClick={() => baixarRelatorio('doadores')}
                                disabled={baixando}
                            >
                                {baixando && tipoBaixando === 'doadores' ? 'Baixando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>

                    {/* Lista de ONGs */}
                    <div className={css.itemRelatorio}>
                        <div className={css.itemInfo}>
                            <h3 className={css.itemTitulo}>Lista de ONG's</h3>
                        </div>
                        <div className={css.itemAcao}>
                            <button
                                className={css.btnBaixar}
                                onClick={() => baixarRelatorio('ongs')}
                                disabled={baixando}
                            >
                                {baixando && tipoBaixando === 'ongs' ? 'Baixando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>

                    {/* Doações no Período */}
                    <div className={css.itemRelatorio}>
                        <div className={css.itemInfo}>
                            <h3 className={css.itemTitulo}>Doações no Período</h3>
                        </div>
                        <div className={css.itemPeriodo}>
                            <div className={css.campoPeriodo}>
                                <label>Data Início</label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    className={css.inputData}
                                />
                            </div>
                            <div className={css.campoPeriodo}>
                                <label>Data Fim</label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    className={css.inputData}
                                />
                            </div>
                            <button
                                className={css.btnBaixarPeriodo}
                                onClick={() => baixarRelatorio('doacoes_periodo')}
                                disabled={baixando}
                            >
                                {baixando && tipoBaixando === 'doacoes_periodo' ? 'Baixando...' : 'Baixar'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}