import css from './EsqueciSenha1.module.css'
import Input from "../../components/Input/Input.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";

export default function EsqueciSenha({api}) {
    const api_url = api
    const [email, setEmail] = useState('')
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarEmail(e) {
        // Email não tem primeira letra maiúscula
        let valor = e.target.value;
        // Apenas remove espaços
        valor = valor.replace(/\s/g, '');
        // Não força maiúscula
        setEmail(valor);
    }

    async function esqueciSenha() {
        try {
            let retorno = await fetch(`${api_url}/esqueci_senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: email })
            })
            retorno = await retorno.json();
            if (retorno.message) {
                setMensagem({ texto: retorno.message, tipo: 'sucesso' });
                setTimeout(() => navigate('/verificarCodigo'), 2000);
            } else {
                setMensagem({ texto: retorno.error || 'Erro ao enviar e-mail', tipo: 'erro' });
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
                        <Titulo titulo={'Enviar código para e-mail'} cor={'azul-claro'} texto={'Informe o e-mail cadastrado para receber o código de recuperação.'}/>
                        <form className={css.formulario} onSubmit={(e) => { e.preventDefault(); esqueciSenha(); }}>
                            <div className={css.campo}>
                                <Input
                                    label={"E-mail"}
                                    type={"text"}
                                    placeholder={"Digite seu e-mail"}
                                    required={true}
                                    input={email}
                                    alterarInput={alterarEmail}
                                />
                            </div>
                            <div className={"d-flex flex-column align-items-center gap-3 " + css.areaBotao}>
                                <Botao acao={esqueciSenha} cor={'amarelo'} texto={'Enviar e-mail'} />
                                <Botao cor={'vazadoamarelo'} texto={'Voltar ao login'} pagina={'/login'}/>
                            </div>
                        </form>
                    </div>
                </div>
                <div className={"col-md-6 " + css.colunaImagem}>
                    <img className={css.imagem} src="/cachorro_macaco.png" alt="Cachorro com um macaco de pelúcia" />
                </div>
            </div>
        </div>
    )
}