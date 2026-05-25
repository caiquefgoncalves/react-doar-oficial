// Input.jsx
import { useState } from 'react'
import css from './Input.module.css'

export default function Input({
                                  input,
                                  textarea = false,
                                  alterarInput,
                                  tamanho = 'normal',
                                  label,
                                  type = "text",
                                  placeholder,
                                  required = false,
                                  maxLength,
                                  minLength,
                                  mascara = null,
                                  disabled = false,
                                  apenasTexto = false,
                                  senha = false
                              }) {

    const [mostrarSenha, setMostrarSenha] = useState(false)

    function handleChange(e) {
        let valor = e.target.value;

        // Aplica máscara primeiro se tiver
        if (mascara) {
            aplicarMascara(valor);
            return;
        }

        // Remove números se for apenas texto
        if (apenasTexto) {
            valor = valor.replace(/[0-9]/g, '');
        }

        // Força lowercase para email
        if (type === 'email' || (label && (label.includes('Email') || label.includes('E-mail') || label.includes('email') || label.includes('e-mail')))) {
            valor = valor.toLowerCase();
        }
        // Capitaliza apenas para campos de texto comuns (não senha, não email, não com máscara)
        else if (type !== 'password' && !mascara && !apenasTexto && valor.length > 0) {
            // Só capitaliza se o campo não for senha e não tiver máscara
            valor = valor.charAt(0).toUpperCase() + valor.slice(1);
        }

        alterarInput({ target: { value: valor } });
    }

    function aplicarMascara(valor) {
        if (mascara === 'cpf') {
            valor = valor.replace(/\D/g, '').substring(0, 11);
            valor = valor
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            alterarInput({ target: { value: valor } });
        } else if (mascara === 'cnpj') {
            valor = valor.replace(/\D/g, '').substring(0, 14);
            valor = valor
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
            alterarInput({ target: { value: valor } });
        } else if (mascara === 'telefone') {
            valor = valor.replace(/\D/g, '').substring(0, 11);
            if (valor.length <= 10) {
                valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
            alterarInput({ target: { value: valor } });
        }
    }

    return (
        <div className={css.inputGroup}>

            <label className={css.label}>
                {label?.includes('*') ? (
                    <>
                        {label.replace(' *', '').replace('*', '')}
                        <span className={css.asterisco}> *</span>
                    </>
                ) : (
                    label
                )}
            </label>

            {textarea ? (
                <textarea
                    className={css.Big}
                    onChange={handleChange}
                    value={input}
                    required={required}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                />
            ) : (
                <div className={css.inputSenha}>
                    <input
                        className={css[tamanho]}
                        type={
                            senha
                                ? (mostrarSenha ? 'text' : 'password')
                                : (type === 'email' ? 'text' : type)
                        }
                        onChange={handleChange}
                        value={input}
                        required={required}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        disabled={disabled}
                    />

                    {senha && (
                        <button
                            type="button"
                            className={css.olho}
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                        >
                            {mostrarSenha ? <img src='/olhoAberto.png' alt="Ver senha" /> : <img src='/olhoFechado.png' alt="Ocultar senha"/>}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}