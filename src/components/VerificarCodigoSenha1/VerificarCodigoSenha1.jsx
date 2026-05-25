import Input from "../../components/Input/Input.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import css from "./VerificarCodigoSenha1.module.css"
import {useNavigate} from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";
import {useState} from "react";

export default function VerificarCodigoSenha1({api}) {
    const api_url = api
    const [codigo, setCodigo] = useState('')
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarCodigo(e) {
        // Apenas números, máximo 6 dígitos
        let valor = e.target.value.replace(/\D/g, '');
        valor = valor.substring(0, 6);
        setCodigo(valor);
    }

    async function verificarCodigoSenha() {
        if (!codigo || codigo.length < 6) {
            setMensagem({ texto: 'Digite o código de 6 dígitos', tipo: 'erro' });
            return;
        }

        try {
            let retorno = await fetch(`${api_url}/verificar_codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ codigo_digitado: codigo })
            })
            retorno = await retorno.json();

            if (retorno.message) {
                localStorage.setItem("id", retorno.id)
                localStorage.setItem("token", retorno.token)
                setMensagem({ texto: retorno.message, tipo: 'sucesso' });
                setTimeout(() => navigate('/redefinirSenha'), 2000);
            } else {
                setMensagem({ texto: retorno.error || 'Código inválido', tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão', tipo: 'erro' });
        }
    }

    return (
        <div className={"container-fluid " + css.secao}>
            <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            <div className="row g-0">
                <div className={"col-md-6 " + css.colunaFormulario}>
                    <div className={css.conteudoFormulario}>
                        <Titulo titulo={'Verificação de código'} cor={'azul-claro'} texto={'Enviamos um código de 6 dígitos para o seu e-mail.'}/>
                        <form className={css.formulario} onSubmit={(e) => { e.preventDefault(); verificarCodigoSenha(); }}>
                            <div className={css.campo}>
                                <Input
                                    label={"Digite o código"}
                                    type={"text"}
                                    placeholder={"Digite o código enviado por e-mail"}
                                    required={true}
                                    input={codigo}
                                    alterarInput={alterarCodigo}
                                    maxLength={6}
                                />
                            </div>
                        </form>
                        <div className={"d-flex flex-column align-items-center gap-3 " + css.areaBotao}>
                            <Botao acao={verificarCodigoSenha} cor={'amarelo'} texto={'Verificar código'} />
                            <Botao pagina={"/esquecisenha"} cor={'vazadoamarelo'} texto={'Mudar e-mail'} />
                        </div>
                    </div>
                </div>
                <div className={"col-md-6 " + css.colunaImagem}>
                    <img className={css.imagem} src="/cachorro_macaco.png" alt="Cachorro com um macaco de pelúcia" />
                </div>
            </div>
        </div>
    )
}