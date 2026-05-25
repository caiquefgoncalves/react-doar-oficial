// CadastroDoador1.jsx
import css from './CadastroDoador1.module.css'
import Titulo from "../Titulo/Titulo.jsx";
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";

export default function CadastroDoador1({api}) {
    const api_url = api
    const [nome, setNome] = useState('')
    const [cpf, setCpf] = useState('')
    const [telefone, setTelefone] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [fotoPerfil, setFotoPerfil] = useState(null) // ALTERADO: de '' para null
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarNome(e) { setNome(e.target.value) }
    function alterarCPF(e) { setCpf(e.target.value) }
    function alterarTelefone(e) { setTelefone(e.target.value) }
    function alterarEmail(e) { setEmail(e.target.value.replace(/\s/g, '')) }
    function alterarSenha(e) { setSenha(e.target.value) }
    function alterarConfirmarSenha(e) { setConfirmarSenha(e.target.value) }
    function alterarFotoPerfil(e) {
        if (e.target.files?.[0]) {
            setFotoPerfil(e.target.files[0])
        } else {
            setFotoPerfil(null)
        }
    }

    async function criarDoador() {
        // Validações em ordem (mesma ordem do formulário)
        if (!nome.trim()) {
            setMensagem({ texto: 'O nome é obrigatório', tipo: 'erro' });
            return;
        }
        if (!cpf.trim()) {
            setMensagem({ texto: 'O CPF é obrigatório', tipo: 'erro' });
            return;
        }
        if (!senha.trim()) {
            setMensagem({ texto: 'A senha é obrigatória', tipo: 'erro' });
            return;
        }
        if (!confirmarSenha.trim()) {
            setMensagem({ texto: 'Confirme sua senha', tipo: 'erro' });
            return;
        }
        if (!telefone.trim()) {
            setMensagem({ texto: 'O telefone é obrigatório', tipo: 'erro' });
            return;
        }
        if (!email.trim()) {
            setMensagem({ texto: 'O email é obrigatório', tipo: 'erro' });
            return;
        }
        // ALTERADO: Verificação da foto de perfil
        if (!fotoPerfil) {
            setMensagem({ texto: 'A foto de perfil é obrigatória', tipo: 'erro' });
            return;
        }

        const form = new FormData();
        form.append('nome', nome)
        form.append('cpf_cnpj', cpf.replace(/\D/g, ''))
        form.append('telefone', telefone.replace(/\D/g, ''))
        form.append('email', email)
        form.append('senha', senha)
        form.append('confirmar_senha', confirmarSenha)
        form.append('tipo', 1)
        form.append('foto_perfil', fotoPerfil);

        try {
            let retorno = await fetch(`${api_url}/criar_usuarios`, {
                method: 'POST', credentials: 'include', body: form
            })
            retorno = await retorno.json();
            if (retorno.message) {
                setMensagem({ texto: retorno.message, tipo: 'sucesso' });
                setTimeout(() => navigate('/ConfirmarEmail'), 2000);
            } else {
                setMensagem({ texto: retorno.error, tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
        }
    }

    return (
        <section className={css.containerSection}>
            {mensagem.texto && (
                <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            )}
            <div className={css.organizar}>
                <Titulo titulo={'Venha fazer parte da mudança!'} cor={'rosa'} />
                <BotaoAlternar ong={false}/>
            </div>
            <div className={css.formulario}>
                <div className={css.linha}>
                    <div className={"row"}>
                        {/* Linha 1: Nome | CPF */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Nome *'} type={'text'} placeholder={'Digite seu nome'} required={true} maxLength={254} input={nome} alterarInput={alterarNome} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'CPF *'} type={'text'} placeholder={'Digite seu CPF'} required={true} input={cpf} alterarInput={alterarCPF} mascara={'cpf'} />
                        </div>
                        {/* Linha 2: Senha | Confirmar Senha */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Senha *'} type={'password'} placeholder={'Digite sua senha'} required={true} maxLength={254} input={senha} alterarInput={alterarSenha} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Confirmar senha *'} type={'password'} placeholder={'Confirme sua senha'} required={true} maxLength={254} input={confirmarSenha} alterarInput={alterarConfirmarSenha} />
                        </div>
                        {/* Linha 3: Telefone | Foto de Perfil */}
                        <div className={"col-md-6 col-12"}>
                            <div className={"row"}>
                                <div className={"col-12"}>
                                    <Input label={'Email *'} type={'text'} placeholder={'Digite seu email'} required={true} maxLength={254} input={email} alterarInput={alterarEmail} />
                                </div>
                                <div className={"col-12"}>
                                    <Input label={'Telefone *'} type={'text'} placeholder={'Digite seu telefone'} required={true} input={telefone} alterarInput={alterarTelefone} mascara={'telefone'} />
                                </div>
                            </div>
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <InputArquivo tamanho={'big'} tipo={'normaledicao'} required={true} alterarInput={alterarFotoPerfil} />
                        </div>
                    </div>
                </div>

                <div className={css.botaoContainer}>
                    <Botao acao={criarDoador} texto={'Cadastre-se'} cor={'rosa'}/>
                </div>
            </div>
        </section>
    )
}