import React, { useEffect } from 'react';
import css from './Mensagem.module.css';

export default function Mensagem({ tipo, texto, onClose }) {

    useEffect(() => {
        if (texto) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [texto, onClose]);

    if (!texto) return null;

    const isSucesso = tipo === 'sucesso';

    return (
        <div className={`${css.mensagemContainer} ${isSucesso ? css.sucesso : css.erro}`}>
            <div className={css.iconeContainer}>
                {isSucesso ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#00A839" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="12" />
                        <path d="M7 12.5L10.5 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#D32F2F" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="12" />
                        <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                )}
            </div>
            <span className={css.texto}>{texto}</span>
            <button className={css.fechar} onClick={onClose}>X</button>
        </div>
    );
}