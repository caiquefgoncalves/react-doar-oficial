import css from './BotaoConfiguracoes.module.css';
import { Link } from "react-router-dom";

export default function BotaoConfiguracoes() {
    return (
        <div className={css.botao}>
            <Link to={'/configuracoes'}>
                <img src={'engrenagem.png'} alt="Configurações" />
            </Link>
        </div>
    )
}