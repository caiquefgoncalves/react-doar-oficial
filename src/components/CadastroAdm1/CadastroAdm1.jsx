// src/components/CadastroAdm1/CadastroAdm1.jsx
import css from './CadastroAdm1.module.css'
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";

export default function CadastroAdm1({ api }) {
    const api_url = api
    const [nome, setNome] = useState('')
    const [cpf, setCpf] = useState('')
    const [telefone, setTelefone] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [fotoPerfil, setFotoPerfil] = useState('')
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarNome(e) { setNome(e.target.value) }
    function alterarCPF(e) { setCpf(e.target.value) }
    function alterarTelefone(e) { setTelefone(e.target.value) }
    function alterarEmail(e) { setEmail(e.target.value.replace(/\s/g, '')) }
    function alterarSenha(e) { setSenha(e.target.value) }
    function alterarConfirmarSenha(e) { setConfirmarSenha(e.target.value) }
    function alterarFotoPerfil(e) { setFotoPerfil(e.target.files[0]) }

    async function criarAdm() {
        if (!nome.trim() || !cpf.trim() || !email.trim() || !telefone.trim() || !senha.trim() || !confirmarSenha.trim() || !fotoPerfil) {
            setMensagem({ texto: 'Preencha todos os campos obrigatórios e envie uma foto de perfil.', tipo: 'erro' });
            return;
        }

        if (senha !== confirmarSenha) {
            setMensagem({ texto: 'As senhas não conferem.', tipo: 'erro' });
            return;
        }

        // 1. Resgata o token do Administrador logado
        const token = localStorage.getItem('token');

        // 2. Cria o FormData e adiciona os campos
        const form = new FormData();
        form.append('token', token); // <-- ANEXA O TOKEN AQUI PARA O BACKEND AUTENTICAR
        form.append('nome', nome.trim());
        form.append('cpf_cnpj', cpf.replace(/\D/g, ''));
        form.append('telefone', telefone.replace(/\D/g, ''));
        form.append('email', email.trim());
        form.append('senha', senha);
        form.append('confirmar_senha', confirmarSenha);
        form.append('foto_perfil', fotoPerfil);
        form.append('tipo', '0'); // Define explicitamente que é do tipo Admin (0)

        try {
            const response = await fetch(`${api_url}/criar_usuarios`, {
                method: 'POST',
                credentials: 'include',
                body: form
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem({ texto: 'Administrador cadastrado com sucesso!', tipo: 'sucesso' });
                setTimeout(() => {
                    navigate('/dashboardAdm');
                }, 1500);
            } else {
                setMensagem({ texto: data.error || data.message || 'Erro ao cadastrar administrador.', tipo: 'erro' });
            }
        } catch (error) {
            console.error(error);
            setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
        }
    }

    return (
        <section className={css.containerSection}>
            {mensagem.texto && (
                <Mensagem
                    tipo={mensagem.tipo}
                    texto={mensagem.texto}
                    onClose={() => setMensagem({ texto: '', tipo: '' })}
                />
            )}
            <div className={css.organizar}>
                <Titulo titulo={'Cadastro ADM'} cor={'azul-claro'} />
            </div>
            <div className={css.formulario}>
                <div className={css.linha}>
                    <div className={"row"}>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Nome *'} type={'text'} placeholder={'Digite seu nome'} required={true} maxLength={254} input={nome} alterarInput={alterarNome} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'CPF *'} type={'text'} placeholder={'Digite seu CPF'} required={true} input={cpf} alterarInput={alterarCPF} mascara={'cpf'} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Senha *'} type={'password'} placeholder={'Digite sua senha'} required={true} maxLength={254} input={senha} alterarInput={alterarSenha} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Confirmar senha *'} type={'password'} placeholder={'Confirme sua senha'} required={true} maxLength={254} input={confirmarSenha} alterarInput={alterarConfirmarSenha} />
                        </div>
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
                            <InputArquivo tamanho={'big'} required={true} alterarInput={alterarFotoPerfil} />
                        </div>
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={criarAdm} texto={'Cadastrar'} cor={'azul'} />
                </div>
            </div>
        </section>
    )
}