import {Link} from "react-router-dom";

export default function BotaoAlternar({ong = false}) {

    return (
        <div className="div">
            <Link to={"/cadastroOng"}>
                <button className={"btnong " + (ong === true ? "ativo" : "")}>ONG</button>
            </Link>
            <Link to={"/cadastroDoador"}>
                <button className={"btndoador " + (ong ===  false ? "ativo" : "")}>Doador</button>
            </Link>
        </div>
    )
}