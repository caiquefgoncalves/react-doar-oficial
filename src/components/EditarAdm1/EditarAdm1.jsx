// src/components/EditarAdm1/EditarAdm1.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from "../CadastroAdm1/CadastroAdm1.module.css";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function EditarAdm1({ api }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const api_url = api;

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData) { localStorage.clear(); navigate('/login'); return; }

        if (tokenData.tipo !== 0) {
            navigate('/dashboardOng'); return;
        }

        // Guarda o ID do usuário logado
        setUsuarioLogadoId(tokenData.id_usuarios);

        setLoading(true);
        setNome('');
        setEmail('');
        setTelefone('');
        setSenha('');
        setConfirmarSenha('');

        buscarDadosAdm();
    }, [id]);

    async function buscarDadosAdm() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/buscar_usuario_id/${id}?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.status === 401) { localStorage.clear(); navigate('/login'); return; }
            if (response.ok) {
                const data = await response.json();
                const adm = data.usuario;
                if (adm) {
                    setNome(adm.nome || '');
                    setEmail(adm.email || '');
                    // Aplica máscara ao telefone
                    const telefoneNumerico = (adm.telefone || '').replace(/\D/g, '');
                    if (telefoneNumerico.length === 11) {
                        setTelefone(telefoneNumerico.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'));
                    } else if (telefoneNumerico.length === 10) {
                        setTelefone(telefoneNumerico.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'));
                    } else {
                        setTelefone(telefoneNumerico);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    }

    // Função para formatar telefone enquanto digita
    const formatarTelefone = (valor) => {
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 7) return numeros.replace(/(\d{2})(\d+)/, '($1) $2');
        if (numeros.length <= 11) {
            return numeros.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3').slice(0, 15);
        }
        return numeros.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    // Função para redirecionar e recarregar a página
    const redirecionarParaDashboard = () => {
        // Recarrega a página para forçar atualização de todos os dados
        window.location.href = '/dashboardAdm';
    };

    async function salvarEdicao() {
        const telefoneNumerico = String(telefone || '').replace(/\D/g, '');

        if (!nome?.trim()) { setMsgTexto('O nome é obrigatório'); setMsgTipo('erro'); return; }
        if (!email?.trim()) { setMsgTexto('O email é obrigatório'); setMsgTipo('erro'); return; }
        if (!telefoneNumerico || (telefoneNumerico.length !== 10 && telefoneNumerico.length !== 11)) {
            setMsgTexto('Telefone inválido. Digite um telefone com 10 ou 11 dígitos');
            setMsgTipo('erro');
            return;
        }

        if (senha && senha !== confirmarSenha) {
            setMsgTexto('As senhas não conferem');
            setMsgTipo('erro');
            return;
        }

        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('token', token);
        form.append('nome', nome.trim());
        form.append('email', email.trim());
        form.append('telefone', telefoneNumerico);
        if (senha) form.append('senha', senha);
        if (confirmarSenha) form.append('confirmar_senha', confirmarSenha);
        if (fotoPerfil) form.append('foto_perfil', fotoPerfil);

        try {
            const response = await fetch(`${api_url}/editar_usuarios/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: form
            });
            const data = await response.json();

            setMsgTexto(data.message || data.error);
            setMsgTipo(response.ok ? 'sucesso' : 'erro');

            if (response.ok) {
                // Atualiza o localStorage com o novo nome
                localStorage.setItem('nome_adm', nome.trim());
                localStorage.setItem('nome', nome.trim());

                // Se está editando a si mesmo, atualiza o nome no localStorage
                if (String(usuarioLogadoId) === String(id)) {
                    localStorage.setItem('nome_adm', nome.trim());
                    localStorage.setItem('nome', nome.trim());
                }

                // Redireciona após 1.5 segundos
                setTimeout(() => {
                    redirecionarParaDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão');
            setMsgTipo('erro');
        }
    }

    if (loading) return <section className={css.containerSection}><p style={{ textAlign: 'center', padding: '50px' }}>Carregando...</p></section>;

    return (
        <section className={css.containerSection}>
            {msgTexto && <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />}
            <div className={css.organizar}><Titulo titulo={'Editar ADM'} cor={'azul-claro'} /></div>
            <div className={css.formulario}>
                <div className={css.linha}>
                    <div className={"row"}>
                        <div className={"col-md-6 col-12"}>
                            <Input
                                label={'Nome *'}
                                type={'text'}
                                placeholder={'Digite seu nome'}
                                required={true}
                                maxLength={254}
                                input={nome}
                                alterarInput={(e) => setNome(e.target.value)}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input
                                label={'Senha'}
                                type={'password'}
                                placeholder={'Digite uma nova senha (opcional)'}
                                maxLength={254}
                                input={senha}
                                alterarInput={(e) => setSenha(e.target.value)}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input
                                label={'Confirmar senha'}
                                type={'password'}
                                placeholder={'Confirme sua senha'}
                                maxLength={254}
                                input={confirmarSenha}
                                alterarInput={(e) => setConfirmarSenha(e.target.value)}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input
                                label={'Email *'}
                                type={'text'}
                                placeholder={'Digite seu email'}
                                required={true}
                                maxLength={254}
                                input={email}
                                alterarInput={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input
                                label={'Telefone *'}
                                type={'text'}
                                placeholder={'Digite seu telefone'}
                                required={true}
                                input={telefone}
                                alterarInput={(e) => setTelefone(formatarTelefone(e.target.value))}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <InputArquivo
                                tamanho={'big'}
                                required={false}
                                alterarInput={(e) => setFotoPerfil(e.target.files[0])}
                            />
                        </div>
                        <div className={"col-md-6 col-12"}></div>
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={salvarEdicao} texto={'Salvar Alterações'} cor={'azul'} />
                </div>
            </div>
        </section>
    );
}