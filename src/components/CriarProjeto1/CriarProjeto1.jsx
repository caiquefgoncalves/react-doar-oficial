// src/components/CriarProjeto1/CriarProjeto1.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import Select from "../Select/Select.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import css from "./CriarProjeto1.module.css";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function CriarProjeto1({api}) {
    const api_url = api;
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [tipoAjuda, setTipoAjuda] = useState('');
    const [status, setStatus] = useState('Ativo');
    const [foto, setFoto] = useState(null);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 2) { navigate('/login'); return; }
    }, []);

    async function criarProjeto() {
        if (!titulo.trim()) { setMsgTexto('Preencha o título'); setMsgTipo('erro'); return; }
        if (!descricao.trim()) { setMsgTexto('Preencha a descrição'); setMsgTipo('erro'); return; }
        if (!categoria || categoria.includes('Escolha')) { setMsgTexto('Escolha uma categoria'); setMsgTipo('erro'); return; }
        if (!tipoAjuda || tipoAjuda.includes('Escolha')) { setMsgTexto('Escolha um tipo de ajuda'); setMsgTipo('erro'); return; }
        if (!foto) { setMsgTexto('A foto do projeto é obrigatória'); setMsgTipo('erro'); return; }

        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('titulo', titulo);
        form.append('descricao', descricao);
        form.append('categoria', categoria);
        form.append('localizacao', localizacao);
        form.append('tipo_ajuda', tipoAjuda);
        form.append('status', status);
        form.append('foto', foto);

        try {
            const response = await fetch(`${api_url}/criar_projeto?token=${token}`, { method: 'POST', credentials: 'include', body: form });
            const data = await response.json();
            setMsgTexto(data.message || data.error);
            setMsgTipo(response.ok ? 'sucesso' : 'erro');
            if (response.ok) setTimeout(() => navigate('/dashboardOng'), 2000);
        } catch (error) { setMsgTexto('Erro de conexão'); setMsgTipo('erro'); }
    }

    return (
        <section className={css.containerSection}>
            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}
            <div className={css.titulo}><Titulo titulo={'Criar novo projeto'} cor={'laranja'}/></div>
            <div className={css.formulario}>
                <div className={"row"}>
                    <div className={"col-md-6 col-12"}>
                        <div className={"row"}>
                            <div className={"col-12"}>
                                <Input label={'Título *'} type={'text'} placeholder={'Título do projeto'} input={titulo} alterarInput={(e) => setTitulo(e.target.value)} required={true} apenasTexto={true} />

                            </div>
                            <div className={"col-12"}>
                                <Select label={'Categoria *'} input={categoria} alterarInput={(e) => setCategoria(e.target.value)} options={['Escolha uma categoria', 'Animal', 'Escolar', 'Comida', 'Saúde', 'Outro']} />
                            </div>
                        </div>
                    </div>

                    <div className={"col-md-6 col-12"}>
                        <Input label={'Descrição *'} type={'text'} placeholder={'Descrição do projeto'} input={descricao} alterarInput={(e) => setDescricao(e.target.value)} textarea={true} tamanho={'Big'} apenasTexto={true} />
                    </div>
                    <div className={"col-md-6 col-12"}>
                        <Select label={'Tipo de ajuda *'} input={tipoAjuda} alterarInput={(e) => setTipoAjuda(e.target.value)} options={['Escolha um tipo', 'Dinheiro', 'Voluntariado']} />
                    </div>

                    <div className={"col-md-6 col-12"}>
                        <Input label={'Localização'} type={'text'} placeholder={'Localização'} input={localizacao} alterarInput={(e) => setLocalizacao(e.target.value)} />

                    </div>
                    <div className={"col-md-6 col-12"}>
                        <InputArquivo tamanho={'normal'} tipo={'normaledicao'} label={'Foto do projeto'} required={true} alterarInput={(e) => setFoto(e.target.files[0])} />

                    </div>
                    <div className={"col-md-6 col-12"}>
                        <Select label={'Status *'} input={status} alterarInput={(e) => setStatus(e.target.value)} options={['Ativo', 'Inativo', 'Concluído']} />

                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={criarProjeto} texto={'Criar projeto'} cor={'azul'}/>
                </div>
            </div>
        </section>
    );
}