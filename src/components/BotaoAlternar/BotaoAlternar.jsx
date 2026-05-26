import {Link} from "react-router-dom";
import css from './BotaoAlternar.module.css';

export default function BotaoAlternar({ong = false}) {

    return (
        <div className={css.div}>
            <Link to={"/cadastroOng"}>
                <button className={`${css.btnong} ${ong === true ? css.ativo : ""}`}>ONG</button>
            </Link>
            <Link to={"/cadastroDoador"}>
                <button className={`${css.btndoador} ${ong === false ? css.ativo : ""}`}>Doador</button>
            </Link>
        </div>
    )
}