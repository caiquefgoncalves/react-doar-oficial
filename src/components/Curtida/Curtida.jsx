// src/components/Curtida/Curtida.jsx
import { useState, useEffect } from "react";
import css from "./Curtida.module.css";

export default function Curtida({ idAtualizacao, apiUrl, onStatusChange }) {
    const [curtido, setCurtido] = useState(false);
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
    }, [idAtualizacao]);

    async function verificarStatus() {
        try {
            const token = localStorage.getItem('token');
            // Envia token como parâmetro na URL
            const response = await fetch(`${apiUrl}/verificar_curtida/${idAtualizacao}?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setCurtido(data.curtido);
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }

    async function toggleCurtir(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }

        if (usuarioTipo === 0 || usuarioTipo === 2) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const endpoint = curtido ? 'descurtir' : 'curtir';
            // Envia token como parâmetro na URL (NÃO usa Authorization header)
            const response = await fetch(`${apiUrl}/${endpoint}/${idAtualizacao}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const novoStatus = !curtido;
                setCurtido(novoStatus);
                if (onStatusChange) onStatusChange(novoStatus);
            } else if (response.status === 401) {
                console.log('Sessão expirada, faça login novamente');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={`${css.curtida} ${(usuarioTipo === 0 || usuarioTipo === 2) ? css.desabilitado : ''}`}
            onClick={toggleCurtir}
            id={`btn-curtir-${idAtualizacao}`}
            disabled={loading || usuarioTipo !== 1}
            title={usuarioTipo === 1
                ? 'Curtida'
                : (usuarioTipo === 0 || usuarioTipo === 2)
                    ? 'Apenas doadores podem curtir'
                    : 'Logue como doador para curtir'}
        >
            {loading ? (
                <span className={css.loader}></span>
            ) : curtido ? (
                <img className={css.coracao} src="/curtido.png" alt="Curtido" />
            ) : (
                <img className={css.coracao} src="/curtir.png" alt="Curtir" />
            )}
        </button>
    );
}