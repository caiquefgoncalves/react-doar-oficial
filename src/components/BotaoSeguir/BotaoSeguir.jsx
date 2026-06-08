// src/components/BotaoSeguir/BotaoSeguir.jsx
import { useState, useEffect } from 'react';
import css from './BotaoSeguir.module.css';

export default function BotaoSeguir({ idOng, apiUrl, onStatusChange, onMensagem }) {
    const [seguindo, setSeguindo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usuarioTipo, setUsuarioTipo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsuarioTipo(payload.tipo);
            } catch (e) {}
        }
        verificarStatus();
    }, [idOng]);

    async function verificarStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // CORRIGIDO: usa apiUrl e envia token como parâmetro na URL
            const response = await fetch(`${apiUrl}/verificar_seguindo/${idOng}?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSeguindo(data.seguindo);
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }

    async function toggleSeguir(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Apenas doadores podem seguir
        if (usuarioTipo !== 1) {
            if (onMensagem) {
                onMensagem('Apenas doadores podem seguir ONGs', 'erro');
            }
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                if (onMensagem) {
                    onMensagem('Faça login para seguir ONGs', 'erro');
                }
                return;
            }

            const endpoint = seguindo ? 'desseguir' : 'seguir';
            // CORRIGIDO: usa apiUrl e envia token como parâmetro na URL
            const response = await fetch(`${apiUrl}/${endpoint}/${idOng}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const novoStatus = !seguindo;
                setSeguindo(novoStatus);
                if (onStatusChange) onStatusChange(novoStatus);

                // Feedback visual
                const btn = document.getElementById(`btn-seguir-${idOng}`);
                if (btn) {
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
                }

                if (onMensagem) {
                    onMensagem(novoStatus ? `Agora você está seguindo esta ONG!` : `Você deixou de seguir esta ONG.`, 'sucesso');
                }
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('nome');
                if (onMensagem) {
                    onMensagem('Sua sessão expirou. Faça login novamente.', 'erro');
                }
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const error = await response.json();
                if (onMensagem) {
                    onMensagem(error.error || 'Erro ao processar solicitação', 'erro');
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            if (onMensagem) {
                onMensagem('Erro de conexão. Tente novamente.', 'erro');
            }
        } finally {
            setLoading(false);
        }
    }

    // Se não estiver logado (usuarioTipo null) mostra botão desabilitado com tooltip
    const estaLogado = usuarioTipo !== null;
    const podeSeguir = usuarioTipo === 1;

    return (
        <button
            id={`btn-seguir-${idOng}`}
            className={`${css.botaoSeguir} ${seguindo ? css.seguindo : ''} ${!podeSeguir ? css.desabilitado : ''}`}
            onClick={toggleSeguir}
            disabled={loading || !podeSeguir}
            title={
                !estaLogado
                    ? 'Faça login como doador para seguir'
                    : usuarioTipo === 0
                        ? 'Administradores não podem seguir ONGs'
                        : usuarioTipo === 2
                            ? 'ONGs não podem seguir outras ONGs'
                            : seguindo
                                ? 'Deixar de seguir esta ONG'
                                : 'Seguir esta ONG'
            }
        >
            {loading ? (
                <span className={css.loader}></span>
            ) : seguindo ? (
                'Seguindo'
            ) : (
                'Seguir'
            )}
        </button>
    );
}