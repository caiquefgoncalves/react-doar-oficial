import { useNavigate } from 'react-router-dom';
import css from './ConfirmarEmail1.module.css';
import Input from "../../components/Input/Input.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import {useState} from "react";

;

export default function ConfirmarEmail1({api}) {
    const api_url = api
    const [codigo, setCodigo] = useState('');
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarCodigo(e) {
        // Apenas números, máximo 6 dígitos
        let valor = e.target.value.replace(/\D/g, '');
        valor = valor.substring(0, 6);
        setCodigo(valor);
    }

    async function verificarCodigoEmail() {
        if (!codigo || codigo.length < 6) {
            setMensagem({ texto: 'Digite o código de 6 dígitos', tipo: 'erro' });
            return;
        }

        try {
            let retorno = await fetch(`${api_url}/confirmar_email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_digitado: codigo })
            });
            retorno = await retorno.json();
            if (retorno.message) {
                setMensagem({ texto: retorno.message, tipo: 'sucesso' });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMensagem({ texto: retorno.error || 'Código incorreto', tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão', tipo: 'erro' });
        }
    }

    return (
        <div className={"container-fluid " + css.secao}>
            <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            <div className="row">
                <div className={"col-md-6 " + css.colunaFormulario}>
                    <div className={css.conteudoFormulario}>
                        <Titulo titulo={'Digite o código de confirmação'} cor={'azul-claro'} texto={'Enviamos um código de 6 dígitos para o e-mail cadastrado'} />
                        <form className={css.formulario} onSubmit={(e) => { e.preventDefault(); verificarCodigoEmail(); }}>
                            <div className={css.campo}>
                                <Input
                                    label={"Código de confirmação"}
                                    type={"text"}
                                    placeholder={"Digite o código de 6 dígitos"}
                                    required={true}
                                    maxLength={6}
                                    input={codigo}
                                    alterarInput={alterarCodigo}
                                />
                            </div>
                            <div className={"d-flex flex-column align-items-center gap-3 " + css.areaBotao}>
                                <Botao cor={'amarelo'} texto={'Confirmar e-mail'} acao={verificarCodigoEmail} />
                                <Botao cor={'vazadoamarelo'} texto={'Voltar'} pagina={'/login'} />
                            </div>
                        </form>
                    </div>
                </div>
                <div className={"col-md-6 " + css.colunaImagem}>
                    <img className={css.imagem} src='/cachorro_macaco.png' alt="Cachorro com um macaco de pelúcia"/>
                </div>
            </div>
        </div>
    );
}