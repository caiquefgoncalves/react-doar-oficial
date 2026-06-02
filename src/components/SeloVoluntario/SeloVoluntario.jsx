// src/components/SeloVoluntario/SeloVoluntario.jsx
import { useState, useEffect } from "react";

export default function SeloVoluntario({api, idUsuario}) {
    const [isVoluntario, setIsVoluntario] = useState(false);
    const API_URL = api;


    useEffect(() => {
        if (idUsuario) {
            verificarVoluntario();
        }
    }, [idUsuario]);

    async function verificarVoluntario() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://10.92.3.154:5000/verificar_voluntario/${idUsuario}`, {
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Verificação voluntário:', data); // Debug
                setIsVoluntario(data.voluntario);
            }
        } catch (error) {
            console.error('Erro ao verificar voluntário:', error);
        }
    }

    if (!isVoluntario) return null;

    return (
        <img
            src="/coracao_dourado.png"
            alt="Selo Voluntário"
            style={{
                width: '30px',
                height: '30px',
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                zIndex: 2
            }}
            title="Este usuário é voluntário!"
        />
    );
}