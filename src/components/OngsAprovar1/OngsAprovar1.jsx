// OngsAprovar1.jsx
import { useNavigate } from "react-router-dom";
import css from "./OngsAprovar1.module.css";
import Botao from "../Botao/Botao.jsx";

export default function OngsAprovar1({ id, nomeong, data, email, cpf_cnpj }) {
    const navigate = useNavigate();

    function verDetalhes() {
        navigate(`/aprovarOng1/${id}`);
    }

    return (
        <div className={css.card}>
            <div className={css.informacoes}>
                <span className={css.nome}>{nomeong}</span>
                <span className={css.data}>{data}</span>
            </div>
            <div className={css.acoes}>
                <Botao
                    texto={'Analisar'}
                    cor={'amarelo-menor'}
                    acao={verDetalhes}
                />
            </div>
        </div>
    )
}