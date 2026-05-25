import { useNavigate } from "react-router-dom";
import css from "./Botao.module.css";

export default function Botao({ acao, pagina, texto, cor = "amarelo" }) {
    const navigate = useNavigate();

    function handleClick(e) {
        e.preventDefault();
        if (acao) {
            acao();
        }
        if (pagina) {
            navigate(pagina);
        }
    }

    return (
        <button type="button" className={css[cor]} onClick={handleClick}>
            {texto}
        </button>
    );
}