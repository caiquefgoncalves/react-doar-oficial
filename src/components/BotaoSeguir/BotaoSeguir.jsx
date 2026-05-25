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
            const response = await fetch(`${apiUrl}/verificar_seguindo/${idOng}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSeguindo(data.seguindo);
            }
        } catch (error) { console.error('Erro ao verificar status:', error); }
    }

    async function toggleSeguir(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }

            const endpoint = seguindo ? 'desseguir' : 'seguir';
            const response = await fetch(`${apiUrl}/${endpoint}/${idOng}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
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
            }
        } catch (error) { console.error('Erro:', error); }
        finally { setLoading(false); }
    }


    return (
        <button
            id={`btn-seguir-${idOng}`}
            className={`${css.botaoSeguir} ${seguindo ? css.seguindo : ''} ${(usuarioTipo === 0 || usuarioTipo === 2) ? css.desabilitado : ''}`}
            onClick={toggleSeguir}
            disabled={loading || usuarioTipo !== 1}
            title={usuarioTipo !== 0 && usuarioTipo !== 1 && usuarioTipo !== 2 ? 'Logue como doador para seguir' : usuarioTipo === 0 || usuarioTipo === 2 ? 'Apenas doadores podem seguir' : seguindo ? 'Deixar de seguir' : 'Seguir esta ONG'}
        >
            {loading ? (
                <span className={css.loader}></span>
            ) : seguindo ? 'Seguindo' : 'Seguir'}
        </button>
    );
}