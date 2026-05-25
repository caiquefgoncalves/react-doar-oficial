// src/components/InputArquivo/InputArquivo.jsx
import { useState } from 'react'
import css from './InputArquivo.module.css'

export default function InputArquivo({ required = false, tipo = 'hint' , tamanho = "normal", alterarInput, label = "Foto de Perfil" }) {

    const [nomeArquivo, setNomeArquivo] = useState("Nenhum arquivo selecionado")
    const [erro, setErro] = useState(false)

    function handleChange(e) {
        const file = e.target.files[0]

        if (file) {
            setNomeArquivo(file.name)
            setErro(false)
        } else {
            setNomeArquivo("Nenhum arquivo selecionado")
            if (required) setErro(true)
        }

        if (alterarInput) {
            alterarInput(e)
        }
    }

    return (
        <div className={css.inputGroup}>
            <label className={css.label}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>

            <label className={`${css.botao} ${css[tamanho]}`} style={erro ? { border: '2px solid red' } : {}}>
                Selecionar arquivo
                <div className={css[tipo]}>
                    <p>Deixe vazio caso não for alterar</p>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className={css.inputFile}
                />
            </label>

            <span className={css.nome} style={erro ? { color: 'red' } : {}}>
                {erro ? '⚠️ Foto obrigatória' : nomeArquivo}
            </span>
        </div>
    )
}