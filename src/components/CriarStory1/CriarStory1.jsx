// src/components/CriarStory1/CriarStory1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import css from "../CriarProjeto1/CriarProjeto1.module.css";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function CriarStory1({api}) {
    const navigate = useNavigate();
    const api_url = api;
    const [arquivo, setArquivo] = useState(null);
    const [texto, setTexto] = useState("");
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setMsgTexto('Faça login para criar stories');
            setMsgTipo('erro');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const tokenData = decodificarToken(token);

        if (!tokenData) {
            setMsgTexto('Token inválido. Faça login novamente.');
            setMsgTipo('erro');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (tokenData.tipo !== 2) {
            setMsgTexto('Apenas ONGs podem criar stories');
            setMsgTipo('erro');
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
        }

        setCarregando(false);
    }, []);

    async function criarStory() {
        if (!texto.trim()) {
            setMsgTexto('O texto do story é obrigatório');
            setMsgTipo('erro');
            return;
        }
        if (!arquivo) {
            setMsgTexto('Selecione uma imagem ou vídeo para o story');
            setMsgTipo('erro');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMsgTexto('Token não encontrado. Faça login novamente.');
            setMsgTipo('erro');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const formData = new FormData();
        formData.append('texto', texto);
        formData.append('arquivos', arquivo);

        setEnviando(true);

        try {
            const response = await fetch(`${api_url}/criar_story`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('nome');
                setMsgTexto('Sua sessão expirou. Faça login novamente.');
                setMsgTipo('erro');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (response.ok) {
                setMsgTexto('Story criado com sucesso!');
                setMsgTipo('sucesso');
                setTexto('');
                setArquivo(null);
                // Limpar o input de arquivo
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                setTimeout(() => navigate('/feed'), 2000);
            } else {
                setMsgTexto(data.error || 'Erro ao criar story');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão com o servidor');
            setMsgTipo('erro');
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) {
        return (
            <section className={css.containerSection}>
                <div className={css.titulo}>
                    <Titulo titulo={'Criar Story'} cor={'laranja'}/>
                </div>
                <div className={css.formulario}>
                    <p style={{ textAlign: 'center', padding: '50px' }}>Verificando permissões...</p>
                </div>
            </section>
        );
    }

    return (
        <section className={css.containerSection}>
            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}
            <div className={css.titulo}>
                <Titulo titulo={'Criar Story'} cor={'laranja'}/>
            </div>
            <div className={css.formulario}>
                <div className={"row"}>
                    <div className={"col-md-6 col-12"}>
                        <Input
                            label={'Texto do story*'}
                            type={'text'}
                            placeholder={'Digite o texto do seu story...'}
                            input={texto}
                            alterarInput={(e) => setTexto(e.target.value)}
                            required={true}
                            apenasTexto={true}
                        />
                    </div>
                    <div className={"col-md-6 col-12"}>
                        <InputArquivo
                            tamanho={'big'}
                            tipo={'normaledicao'}
                            label={'Imagem ou vídeo do story*'}
                            required={true}
                            alterarInput={(e) => setArquivo(e.target.files[0])}
                        />
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={criarStory} texto={enviando ? 'Criando...' : 'Criar Story'} cor={'azul'} desabilitado={enviando}/>
                </div>
            </div>
        </section>
    );
}