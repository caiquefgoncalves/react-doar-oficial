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
    const [mensagem, setMensagem] = useState('');
    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');

    async function enviarVoluntariado() {
        if (!mensagem.trim()) {
            setMsgTexto('Escreva uma mensagem para a ONG');
            setMsgTipo('erro');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://10.92.3.131:5000/voluntario_projeto/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ mensagem }),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setMsgTexto('Voluntariado enviado com sucesso!');
                setMsgTipo('sucesso');
                setTimeout(() => navigate('/agradecimento'), 2000);
            } else {
                setMsgTexto(data.error || 'Erro ao enviar');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão');
            setMsgTipo('erro');
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
                            <Botao texto={'Enviar'} cor={'rosa'} acao={enviarVoluntariado}/>
                        </div>
                    </div>
                    <img className={css.imagem} src={'/voluntario.png'} alt="Voluntário"/>
                </div>
            </div>
        </section>
    )
}