import Input from "../../components/Input/Input.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import css from "./RedefinirSenha1.module.css"
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";

export default function RedefinirSenha1({api}) {
    const api_url = api
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("token");

    function alterarSenha(e) {
        // Senha: mantém exatamente como digitado (não força maiúscula)
        setSenha(e.target.value);
    }

    function alterarConfirmarSenha(e) {
        // Senha: mantém exatamente como digitado (não força maiúscula)
        setConfirmarSenha(e.target.value);
    }

    async function redefinirSenha() {
        if (!senha || !confirmarSenha) {
            setMensagem({ texto: 'Preencha todos os campos', tipo: 'erro' });
            return;
        }

        if (senha !== confirmarSenha) {
            setMensagem({ texto: 'Senhas não correspondem', tipo: 'erro' });
            return;
        }

        if (senha.length < 8) {
            setMensagem({ texto: 'A senha deve ter pelo menos 8 caracteres', tipo: 'erro' });
            return;
        }

        const form = new FormData();
        form.append('senha', senha);
        form.append('confirmar_senha', confirmarSenha);
        form.append('token', token);

        try {
            let retorno = await fetch(`${api_url}/editar_usuarios/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: form
            })
            retorno = await retorno.json();

            if (retorno.message) {
                localStorage.removeItem("token");
                localStorage.removeItem("nome");
                localStorage.removeItem("id");
                setMensagem({ texto: 'Senha alterada com sucesso! Redirecionando...', tipo: 'sucesso' });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMensagem({ texto: retorno.message || retorno.error || 'Erro ao alterar senha', tipo: 'erro' });
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
                        <Titulo titulo={'Redefinir senha'} cor={'azul-claro'} texto={'Digite a nova senha abaixo'}/>
                        <form className={css.formulario} onSubmit={(e) => { e.preventDefault(); redefinirSenha(); }}>
                            <div className={css.campo}>
                                <Input
                                    label={"Nova senha"}
                                    type={"password"}
                                    placeholder={"Digite sua nova senha"}
                                    required={true}
                                    input={senha}
                                    alterarInput={alterarSenha}
                                />
                            </div>
                            <div className={css.campo}>
                                <Input
                                    label={"Confirme sua nova senha"}
                                    type={"password"}
                                    placeholder={"Confirme sua nova senha"}
                                    required={true}
                                    input={confirmarSenha}
                                    alterarInput={alterarConfirmarSenha}
                                />
                            </div>
                            <div className={css.areaBotao}>
                                <Botao acao={redefinirSenha} cor={'amarelo'} texto={'Alterar senha'} />
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