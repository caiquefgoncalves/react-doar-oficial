import css from './Acoes.module.css';
import {Link} from "react-router-dom";

export default function Acoes({cor = 'amarelo', pagina, texto}){
    return (
        <div className={css.cards}>
            <div className={css[cor]}></div>
            <div className={css.organizar}>
                <Link to={pagina}>
                    <button type="button" className={css.link}>{texto}</button>
                </Link>
            </div>
        </div>
    )
}