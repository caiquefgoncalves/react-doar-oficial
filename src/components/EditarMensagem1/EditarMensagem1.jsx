// src/components/EditarMensagem/EditarMensagem.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import MenuLateral from "../MenuLateral/MenuLateral.jsx";
import css from "./EditarMensagem1.module.css";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function EditarMensagem({ api }) {
    const navigate = useNavigate();
    const api_url = api;
    const [nomeOng, setNomeOng] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [mensagemOriginal, setMensagemOriginal] = useState('');
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [autorizado, setAutorizado] = useState(false);

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
        const nome = localStorage.getItem('nome');
        if (nome) setNomeOng(nome);

        buscarMensagem();
    }, []);

    async function buscarMensagem() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/buscar_mensagem_agradecimento?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setMensagem(data.mensagem || '');
                setMensagemOriginal(data.mensagem || '');
            }
        } catch (error) {
            console.error('Erro ao buscar mensagem:', error);
        } finally {
            setLoading(false);
        }
    }

    async function salvarMensagem() {
        // Validação: campo obrigatório
        if (!mensagem.trim()) {
            setMsgTexto('A mensagem de agradecimento é obrigatória');
            setMsgTipo('erro');
            return;
        }

        setSalvando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/salvar_mensagem_agradecimento?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: mensagem })
            });

            const data = await response.json();
            setMsgTexto(data.message || data.error);
            setMsgTipo(response.ok ? 'sucesso' : 'erro');

            if (response.ok) {
                setMensagemOriginal(mensagem);
                setTimeout(() => navigate('/dashboardOng'), 2000);
            }
        } catch (error) {
            setMsgTexto('Erro de conexão com o servidor');
            setMsgTipo('erro');
        } finally {
            setSalvando(false);
        }
    }

    if (!autorizado) return null;

    if (loading) return (
        <section className={css.containerSection}>
            <p className={css.loading}>Carregando mensagem...</p>
        </section>
    );

    return (
        <section className={css.containerSection}>
            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}
            <div className={css.titulo}>
                <Titulo titulo={'Editar Agradecimento'} cor={'laranja'}/>
            </div>
            <div className={css.formulario}>
                <div className={"row"}>
                    <div className={"col-12"}>
                    </div>
                    <div className={"col-12"}>
                        <div className={css.campoObrigatorio}>
                            <label className={css.labelObrigatorio}>
                                Mensagem de agradecimento <span className={css.asterisco}>*</span>
                            </label>
                            <textarea
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Digite sua mensagem de agradecimento..."
                                rows={6}
                                className={css.textarea}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao
                        acao={salvarMensagem}
                        texto={salvando ? 'Salvando...' : 'Salvar mensagem'}
                        cor={'amarelo'}
                        disabled={salvando}
                    />
                </div>
            </div>
        </section>
    );
}