// src/components/Voluntario/Voluntario.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Titulo from "../Titulo/Titulo.jsx";
import css from './Voluntario.module.css'
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";

export default function Voluntario({ api }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const api_url = api; // USA A PROP PASSADA
    const [mensagem, setMensagem] = useState('');
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [enviando, setEnviando] = useState(false);

    async function enviarVoluntariado() {
        if (!mensagem.trim()) {
            setMsgTexto('Escreva uma mensagem para a ONG');
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

        setEnviando(true);

        try {
            // CORRIGIDO: usa api_url e envia token como parâmetro na URL
            const response = await fetch(`${api_url}/voluntario_projeto/${id}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem })
            });

            const data = await response.json();

            if (response.ok) {
                setMsgTexto(data.message || 'Voluntariado enviado com sucesso!');
                setMsgTipo('sucesso');
                setTimeout(() => navigate('/agradecimento'), 2000);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('nome');
                setMsgTexto('Sua sessão expirou. Faça login novamente.');
                setMsgTipo('erro');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMsgTexto(data.error || 'Erro ao enviar solicitação');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão. Tente novamente.');
            setMsgTipo('erro');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section className={css.corpo}>
            <Mensagem tipo={msgTipo} texto={msgTexto} onClose={() => setMsgTexto('')} />
            <div>
                <div className={css.conteudo}>
                    <div className={css.mensagem}>
                        <div className={css.titulo}>
                            <Titulo titulo={'Voluntarie-se!'} cor={'rosa'}/>
                            <p>Mande uma mensagem para a ONG para se voluntariar</p>
                        </div>
                        <div>
                            <Input
                                label={'Mensagem *'}
                                type={'text'}
                                textarea={true}
                                input={mensagem}
                                alterarInput={(e) => setMensagem(e.target.value)}
                                placeholder={'Digite a mensagem para a ONG'}
                            />
                        </div>
                        <div className={css.botoes}>
                            <Botao texto={'Voltar'} cor={'vazadorosa2'} acao={() => navigate(-1)}/>
                            <Botao texto={enviando ? 'Enviando...' : 'Enviar'} cor={'rosa'} acao={enviarVoluntariado} desabilitado={enviando}/>
                        </div>
                    </div>
                    <img className={css.imagem} src={'/voluntario.png'} alt="Voluntário"/>
                </div>
            </div>
        </section>
    );
}