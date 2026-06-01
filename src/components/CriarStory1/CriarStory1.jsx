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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 2) { navigate('/login');}
    }, []);


    async function criarStory() {
        if (!texto) { setMsgTexto('O texto do story é obrigatório'); setMsgTipo('error'); return; }
        if (!arquivo) { setMsgTexto('O arquivo do story é obrigatório'); setMsgTipo('erro'); return; }

        const form = new FormData();
        form.append('arquivos', arquivo);

        try {
            const response = await fetch(`${api_url}/criar_story`, { method: 'POST', credentials: 'include', body: form });

            const data = await response.json()

            setMsgTexto(data.message || data.error);
            setMsgTipo(response.ok ? 'sucesso' : 'erro');

        } catch (error) { setMsgTexto('Erro de conexão'); setMsgTipo('erro'); }
    }

    return (
        <section className={css.containerSection}>
            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}
            <div className={css.titulo}><Titulo titulo={'Criar story'} cor={'laranja'}/></div>
            <div className={css.formulario}>
                <div className={"row"}>
                    <div className={"col-md-6 col-12"}>
                        <Input label={'Texto do story*'} type={'text'} placeholder={'Texto do story'} input={texto} alterarInput={(e) => setTexto(e.target.value)} required={true} apenasTexto={true} />
                    </div>
                    <div className={"col-md-6 col-12"}>
                        <InputArquivo tamanho={'big'} tipo={'normaledicao'} label={'Foto/vídeo do story'} required={true} alterarInput={(e) => setArquivo(e.target.files[0])} />
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={criarStory} texto={'Criar Story'} cor={'azul'}/>
                </div>
            </div>
        </section>
    );
}