import css from "./Beneficios.module.css"
import Card from "../Card/Card.jsx";
import Botao from "../Botao/Botao.jsx";

export default function Beneficios() {
    return (
        <section className={css.secao}>
            <div>
                <h1 className={css.titulo}>Benefícios</h1>
            </div>
            <div className={css.organizarcards}>
                <div className={css.cards}>
                    <Card imagem="/pessoa.png" titulo={'Conexão Direta'} paragrafo={'O sistema aproxima doadores e ONGs de forma simples, criando um canal direto e facilitando o apoio a causas importantes.'}/>
                    <Card imagem="/lupa.png" titulo={'Transparência nas Informações'} paragrafo={'A plataforma reúne dados claros sobre cada organização, ajudando o doador a escolher com confiança.'}/>
                    <Card imagem="/personalidade.png" titulo={'Personalidade'} paragrafo={'O usuário pode descobrir projetos alinhados aos seus valores e interesses de forma personalizada.'}/>
                </div>
            </div>
            <div className={css.botao} >
                <Botao cor={'vazado'} texto={'Doar Agora'}/>
            </div>
        </section>
    )
}