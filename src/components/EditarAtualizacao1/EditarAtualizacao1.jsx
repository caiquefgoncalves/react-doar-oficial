// src/components/EditarAtualizacao1/EditarAtualizacao1.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import Select from "../Select/Select.jsx";
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

export default function EditarAtualizacao1({api}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const api_url = api;
    const [titulo, setTitulo] = useState('');
    const [projetoId, setProjetoId] = useState('');
    const [projetoTitulo, setProjetoTitulo] = useState('');
    const [texto, setTexto] = useState('');
    const [foto, setFoto] = useState(null);
    const [fotoAtual, setFotoAtual] = useState('');
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 2) { navigate('/login'); return; }
        buscarProjetos();
        buscarAtualizacao();
    }, [id]);

    async function buscarProjetos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/listar_projetos?token=${token}`, { credentials: 'include' });
            if (response.ok) { const data = await response.json(); if (data.projetos) setProjetos(data.projetos); }
        } catch (error) { console.error('Erro:', error); }
    }

    async function buscarAtualizacao() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/buscar_atualizacao/${id}?token=${token}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.atualizacao) {
                    setTitulo(data.atualizacao.titulo || '');
                    setProjetoId(data.atualizacao.projeto_id || '');
                    setTexto(data.atualizacao.texto || '');
                    setFotoAtual(`${api_url}/uploads/Atualizacoes/${id}.jpeg`);
                }
            }
        } catch (error) { console.error('Erro:', error); }
        finally {
            if (projetos.length > 0) {
                const projeto = projetos.find(p => p.id === projetoId);
                if (projeto) setProjetoTitulo(projeto.titulo);
            }
            setLoading(false);
        }
    }

    async function salvarEdicao() {
        if (!titulo.trim()) { setMsgTexto('Preencha o título'); setMsgTipo('erro'); return; }

        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('titulo', titulo);
        form.append('projeto_id', projetoId);
        form.append('texto', texto);
        if (foto) form.append('foto', foto);

        try {
            const response = await fetch(`${api_url}/editar_atualizacao/${id}?token=${token}`, { method: 'PUT', credentials: 'include', body: form });
            const data = await response.json();
            setMsgTexto(data.message || data.error);
            setMsgTipo(response.ok ? 'sucesso' : 'erro');
            if (response.ok) setTimeout(() => navigate('/dashboardOng'), 2000);
        } catch (error) { setMsgTexto('Erro de conexão'); setMsgTipo('erro'); }
    }

    if (loading) return <section className={css.containerSection}><p className={css.loading}>Carregando...</p></section>;

    return (
        <section className={css.containerSection}>
            {msgTexto && (
                <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            )}
            <div className={css.titulo}><Titulo titulo={'Editar atualização'} cor={'laranja'}/></div>
            <div className={css.formulario}>
                <div className={"row"}>
                    <div className={"col-md-6 col-12"}>
                        <Input label={'Título *'} type={'text'} placeholder={'Título da atualização'} input={titulo} alterarInput={(e) => setTitulo(e.target.value)} required={true} apenasTexto={true} />
                    </div>
                    <div className={"col-md-6 col-12"}>
                        {projetos.length === 0 ? (
                            <div className={css.aviso}><p>⚠️ Nenhum projeto encontrado. Crie um projeto primeiro.</p></div>
                        ) : (
                            <Select label={'Projeto *'} input={projetoTitulo} alterarInput={handleProjetoChange} options={['Escolha um projeto', ...projetos.map(p => p.titulo)]} />
                        )}
                    </div>
                    <div className={"col-md-6 col-12"}>
                        <Input label={'Texto (opcional)'} type={'text'} placeholder={'Texto da atualização'} input={texto} alterarInput={(e) => setTexto(e.target.value)} textarea={true} tamanho={'Big'} apenasTexto={true} />
                    </div>
                    <div className={"col-md-6 col-12"}>
                        <InputArquivo tamanho={'big'} tipo={'normaledicao'} label={'Foto da atualização'} required={true} alterarInput={(e) => setFoto(e.target.files[0])} />
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={salvarEdicao} texto={'Editar atualização'} cor={'azul'}/>
                </div>
            </div>
        </section>
    );
}