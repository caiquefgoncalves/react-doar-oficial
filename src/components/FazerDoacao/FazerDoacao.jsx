// src/components/FazerDoacao/FazerDoacao.jsx
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Botao from "../Botao/Botao.jsx";
import css from "./FazerDoacao.module.css"
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";

export default function FazerDoacao({ api }) {
    const api_url = api
    const { id } = useParams();
    const navigate = useNavigate();
    let [valor, setValor] = useState("");
    let [pix, setPix] = useState("");
    let [chavePix, setChavePix] = useState("");
    let [dadosDoacao, setDadosDoacao] = useState(null);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    let [copiado, setCopiado] = useState("Copiar");
    const [gerando, setGerando] = useState(false);
    const [confirmando, setConfirmando] = useState(false);

    function copiarPix() {
        navigator.clipboard.writeText(chavePix).then(() => {
            setCopiado("Copiado!");
            setTimeout(() => setCopiado("Copiar"), 2000);
        }).catch(err => {
            console.error("Erro ao copiar: ", err);
        });
    }

    function alterarValor(e) {
        let valorDigitado = e.target.value;
        valorDigitado = valorDigitado.replace(/\D/g, '');
        const valorNumerico = parseFloat(valorDigitado) / 100;

        if (valorDigitado === '') {
            setValor('');
        } else {
            const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            setValor(valorFormatado);
        }
    }

    async function gerarQrCode() {
        let valorNumerico = valor.replace(/\D/g, '');
        valorNumerico = parseFloat(valorNumerico) / 100;

        if (!valorNumerico || valorNumerico <= 0) {
            setMensagem({ texto: 'Digite um valor válido', tipo: 'erro' });
            return;
        }

        setGerando(true);
        const token = localStorage.getItem('token');

        try {
            let response = await fetch(`${api_url}/gerar_qr_doacao/${id}?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: valorNumerico }),
                credentials: 'include'
            });

            let retorno = await response.json();

            if (response.ok) {
                setPix(retorno.pix);
                setChavePix(retorno.chave_pix);
                setDadosDoacao({
                    id_projeto: retorno.id_projeto,
                    valor: retorno.valor,
                    id_ong: retorno.id_ong,
                    nome_projeto: retorno.nome_projeto,
                    nome_ong: retorno.nome_ong
                });
                setMensagem({ texto: 'QR Code gerado com sucesso!', tipo: 'sucesso' });
            } else {
                setMensagem({ texto: retorno.error || 'Erro ao gerar QR code', tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão', tipo: 'erro' });
        } finally {
            setGerando(false);
        }
    }

    async function confirmarDoacao() {
        setConfirmando(true);
        const token = localStorage.getItem('token');

        try {
            let response = await fetch(`${api_url}/confirmar_doacao?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosDoacao),
                credentials: 'include'
            });

            let retorno = await response.json();

            if (response.ok) {
                navigate('/agradecimento');
            } else {
                setMensagem({ texto: retorno.error || 'Erro ao confirmar doação', tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão', tipo: 'erro' });
        } finally {
            setConfirmando(false);
        }
    }

    return (
        <section className={css.geral}>
            <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            <div className={css.titulo}>
                <Titulo titulo={'Realizar uma doação'} cor={'rosa'} />
            </div>
            <div className={css.container}>
                <div className={css.informacoes}>
                    <form className={css.secao}>
                        <Input
                            label={'Valor a ser doado *'}
                            placeholder={'R$ 0,00'}
                            input={valor}
                            alterarInput={alterarValor}
                        />

                        {pix ? (
                            <div className={css.botoes}>
                                <p className={css.texto}>Caso queira cancelar a doação, basta sair dessa página</p>
                                <div className={css.botaoQr}>
                                    <Botao
                                        cor={'vazadorosa2'}
                                        texto={'Gerar o QR Code novamente'}
                                        acao={gerarQrCode}
                                        desabilitado={gerando}
                                    />
                                </div>
                                <div className={css.botao}>
                                    <Botao
                                        cor={'rosa'}
                                        texto={confirmando ? 'Confirmando...' : 'Concluir Pagamento'}
                                        acao={confirmarDoacao}
                                        desabilitado={confirmando}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={css.botaoQr}>
                                <Botao
                                    cor={'rosa'}
                                    texto={gerando ? 'Gerando...' : 'Gerar o QR Code'}
                                    acao={gerarQrCode}
                                    desabilitado={gerando}
                                />
                            </div>
                        )}
                    </form>

                    {pix && (
                        <div className={css.qrCode}>
                            <img
                                src={`${api_url}/uploads/Pix/${pix}`}
                                alt="QR Code PIX"
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/sem_imagem.webp'; }}
                            />
                            <div className={css.pixContainer}>
                                <p className={css.pixCode}>
                                    {chavePix}
                                </p>
                                <Botao cor={'rosa'} acao={copiarPix} texto={copiado}/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}