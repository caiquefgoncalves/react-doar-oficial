import Input from "../../components/Input/Input.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import css from "./VerificarCodigo1.module.css"

export default function VerificarCodigo1() {

    return (
        <div className={"container-fluid " + css.secao}>
            <div className="row g-0">
                <div className={"col-md-6 col-md-6 " + css.colunaFormulario}>
                    <div className={css.conteudoFormulario}>
                        <Titulo titulo={'Verificação de código'} cor={'azul-claro'} texto={'Enviamos um código de 6 dígitos para o seu e-mail.'}/>

                        <form className={css.formulario}>
                            <div className={css.campo}>
                                <Input
                                    label={"Digite o código"}
                                    type={"text"}
                                    placeholder={"Digite o código enviado por e-mail"}
                                    required={true}
                                />
                            </div>

                        </form>
                        <div className={css.areaBotao}>
                            <Botao cor={'amarelo'} texto={'Mudar e-mail'} />
                            <Botao cor={'amarelo'} texto={'Verificar código'} pagina={'/redefinirSenha'} />
                        </div>
                    </div>
                </div>

                <div className={"col-md-6 " + css.colunaImagem}>
                    <img
                        className={css.imagem}
                        src="/cachorro_macaco.png"
                        alt="Cachorro com um macaco de pelúcia"
                    />
                </div>
            </div>
        </div>
    )
}