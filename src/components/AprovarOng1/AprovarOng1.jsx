// src/components/AprovarOng1/AprovarOng1.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from "./AprovarOng1.module.css";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function AprovarOng1({ api }) {
    const api_url = api
    const { id } = useParams();
    const navigate = useNavigate();
    const [ong, setOng] = useState(null);
    const [loading, setLoading] = useState(true);
    const [motivoReprovacao, setMotivoReprovacao] = useState('');
    const [mostrarMotivo, setMostrarMotivo] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const tokenData = decodificarToken(token);
        if (!tokenData || tokenData.tipo !== 0) {
            localStorage.clear();
            navigate('/login');
            return;
        }

        buscarOng();
    }, [id]);

    async function buscarOng() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/buscar_ong?id=${id}&token=${token}`, {
                method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            });
            if (response.status === 401) { localStorage.clear(); navigate('/login'); return; }
            const data = await response.json();
            if (response.ok) setOng(data.ong);
            else { setMensagem(data.error || 'Erro'); setTipoMensagem('erro'); }
        } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
        finally { setLoading(false); }
    }

    async function aprovarOng() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/aprovar_ong/${id}?token=${token}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            });
            const data = await response.json();
            setMensagem(data.message || data.error);
            setTipoMensagem(response.ok ? 'sucesso' : 'erro');
            if (response.ok) setTimeout(() => navigate('/listaAprovacoes'), 2000);
        } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
    }

    async function reprovarOng() {
        if (!motivoReprovacao.trim()) { setMensagem('Informe o motivo'); setTipoMensagem('erro'); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/admin/reprovar_ong/${id}?token=${token}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ motivo: motivoReprovacao })
            });
            const data = await response.json();
            setMensagem(data.message || data.error);
            setTipoMensagem(response.ok ? 'sucesso' : 'erro');
            if (response.ok) setTimeout(() => navigate('/listaAprovacoes'), 2000);
        } catch (error) { setMensagem('Erro de conexão'); setTipoMensagem('erro'); }
    }

    if (loading) return <section className={css.containerSection}><p>Carregando...</p></section>;
    if (!ong) return <section className={css.containerSection}><p>ONG não encontrada</p><Botao texto={'Voltar'} cor={'azul'} acao={() => navigate('/listaAprovacoes')} /></section>;

    return (
        <section className={css.containerSection}>
            <Mensagem tipo={tipoMensagem} texto={mensagem} onClose={() => setMensagem('')} />
            <div className={css.titulo}><Titulo titulo={'Analisar ONG'} cor={'laranja'}/></div>
            <div className={css.formulario}>
                <div className={css.linha}>
                    <div className={css.campos}>
                        <Input label={'Nome'} type={'text'} input={ong.nome} disabled={true} />
                        <Input label={'Email'} type={'text'} input={ong.email} disabled={true} />
                        <Input label={'Descrição breve'} type={'text'} input={ong.descricao_breve || 'Não informado'} disabled={true} />
                        <Input label={'Localização'} type={'text'} input={ong.localizacao || 'Não informado'} disabled={true} />
                        <Input label={'Código do banco'} type={'text'} input={ong.cod_banco || 'Não informado'} disabled={true} />
                        <Input label={'Número da conta'} type={'text'} input={ong.num_conta || 'Não informado'} disabled={true} />
                        <Input label={'Tipo de conta'} type={'text'} input={ong.tipo_conta || 'Não informado'} disabled={true} />
                    </div>
                    <div className={css.campos}>
                        <Input tamanho={'Big'} label={'Descrição longa'} type={'text'} input={ong.descricao_longa || 'Não informado'} disabled={true} textarea={true} />
                        <Input label={'CNPJ'} type={'text'} input={ong.cpf_cnpj} disabled={true} />
                        <Input label={'Categoria'} type={'text'} input={ong.categoria || 'Não informado'} disabled={true} />
                        <Input label={'Número da agência'} type={'text'} input={ong.num_agencia || 'Não informado'} disabled={true} />
                        <Input label={'Chave PIX'} type={'text'} input={ong.chave_pix || 'Não informado'} disabled={true} />
                        <Input label={'Status do Email'} type={'text'} input={ong.email_confirmado ? 'Confirmado' : 'Não confirmado'} disabled={true} />
                        <Input label={'Data de Cadastro'} type={'text'} input={ong.data_cadastro} disabled={true} />
                    </div>
                </div>
                <div className={css.botoes}>
                    <Botao texto={'Aprovar'} cor={'azul'} acao={aprovarOng} />
                    <Botao texto={'Reprovar'} cor={'rosa'} acao={() => setMostrarMotivo(true)} />
                </div>
                {mostrarMotivo && (
                    <div className={css.motivoReprovacao}>
                        <Input label={'Motivo da Reprovação'} type={'text'} placeholder={'Descreva o motivo'} input={motivoReprovacao} alterarInput={(e) => setMotivoReprovacao(e.target.value)} textarea={true} required={true} />
                        <div className={css.botaoConfirmar}>
                            <Botao texto={'Confirmar Reprovação'} cor={'vermelho'} acao={reprovarOng} />
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}