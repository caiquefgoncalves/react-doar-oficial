// CadastroOng1.jsx
import Titulo from "../Titulo/Titulo.jsx";
import css from "./CadastroOng1.module.css"
import Input from "../Input/Input.jsx";
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";
import Botao from "../Botao/Botao.jsx";
import Select from "../Select/Select.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";

export default function CadastroOng1({api}) {
    const api_url = api
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [descBreve, setDescBreve] = useState('')
    const [descLonga, setDescLonga] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [localizacao, setLocalizacao] = useState('')
    const [categoria, setCategoria] = useState('')
    const [codBanco, setCodBanco] = useState('')
    const [numAgencia, setNumAgencia] = useState('')
    const [numConta, setNumConta] = useState('')
    const [tipoConta, setTipoConta] = useState('')
    const [chavePix, setChavePix] = useState('')
    const [fotoPerfil, setFotoPerfil] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    function alterarNome(e) { setNome(e.target.value) }
    function alterarEmail(e) { setEmail(e.target.value.replace(/\s/g, '')) }
    function alterarDescBreve(e) { setDescBreve(e.target.value) }
    function alterarDescLonga(e) { setDescLonga(e.target.value) }
    function alterarLocalizacao(e) { setLocalizacao(e.target.value) }
    function alterarCategoria(e) { setCategoria(e.target.value) }
    function alterarTipoConta(e) { setTipoConta(e.target.value) }
    function alterarCNPJ(e) { setCnpj(e.target.value) }
    function alterarCodBanco(e) { setCodBanco(e.target.value.replace(/\D/g, '')) }
    function alterarNumAgencia(e) { setNumAgencia(e.target.value.replace(/\D/g, '')) }
    function alterarNumConta(e) { setNumConta(e.target.value.replace(/\D/g, '')) }
    function alterarChavePix(e) { setChavePix(e.target.value) }
    function alterarSenha(e) { setSenha(e.target.value) }
    function alterarConfirmarSenha(e) { setConfirmarSenha(e.target.value) }
    function alterarFotoPerfil(e) { if (e.target.files?.[0]) setFotoPerfil(e.target.files[0]) }

    async function criarOng() {
        // Validações em ordem (mesma ordem do formulário)
        if (!nome.trim()) {
            setMensagem({ texto: 'O nome é obrigatório', tipo: 'erro' });
            return;
        }
        if (!cnpj.trim()) {
            setMensagem({ texto: 'O CNPJ é obrigatório', tipo: 'erro' });
            return;
        }
        if (!email.trim()) {
            setMensagem({ texto: 'O email é obrigatório', tipo: 'erro' });
            return;
        }
        if (!categoria || categoria.includes('Escolha')) {
            setMensagem({ texto: 'Escolha uma categoria', tipo: 'erro' });
            return;
        }
        if (!descBreve.trim()) {
            setMensagem({ texto: 'A descrição breve é obrigatória', tipo: 'erro' });
            return;
        }
        if (!localizacao.trim()) {
            setMensagem({ texto: 'A localização é obrigatória', tipo: 'erro' });
            return;
        }
        if (!descLonga.trim()) {
            setMensagem({ texto: 'A descrição longa é obrigatória', tipo: 'erro' });
            return;
        }
        if (!senha.trim()) {
            setMensagem({ texto: 'A senha é obrigatória', tipo: 'erro' });
            return;
        }
        if (!confirmarSenha.trim()) {
            setMensagem({ texto: 'Confirme sua senha', tipo: 'erro' });
            return;
        }
        if (!chavePix.trim()) {
            setMensagem({ texto: 'A chave PIX é obrigatória', tipo: 'erro' });
            return;
        }
        if (!numConta.trim()) {
            setMensagem({ texto: 'O número da conta é obrigatório', tipo: 'erro' });
            return;
        }
        if (!codBanco.trim()) {
            setMensagem({ texto: 'O código do banco é obrigatório', tipo: 'erro' });
            return;
        }
        if (!tipoConta || tipoConta.includes('Escolha')) {
            setMensagem({ texto: 'Escolha um tipo de conta', tipo: 'erro' });
            return;
        }
        if (!numAgencia.trim()) {
            setMensagem({ texto: 'O número da agência é obrigatório', tipo: 'erro' });
            return;
        }
        if (!fotoPerfil) {
            setMensagem({ texto: 'A foto de perfil é obrigatória', tipo: 'erro' });
            return;
        }

        let form = new FormData();
        form.append('nome', nome)
        form.append('cpf_cnpj', cnpj.replace(/\D/g, ''))
        form.append('email', email)
        form.append('senha', senha)
        form.append('confirmar_senha', confirmarSenha)
        form.append('tipo', 2)
        form.append('descricao_breve', descBreve)
        form.append('descricao_longa', descLonga)
        form.append('localizacao', localizacao)
        form.append('categoria', categoria)
        form.append('cod_banco', codBanco.replace(/\D/g, ''))
        form.append('num_agencia', numAgencia.replace(/\D/g, ''))
        form.append('num_conta', numConta.replace(/\D/g, ''))
        form.append('tipo_conta', tipoConta)
        form.append('chave_pix', chavePix)
        form.append('foto_perfil', fotoPerfil);

        try {
            let retorno = await fetch(`${api_url}/criar_usuarios`, {
                method: 'POST', credentials: 'include', body: form
            })
            retorno = await retorno.json();
            if (retorno.message) {
                setMensagem({ texto: retorno.message, tipo: 'sucesso' });
                setTimeout(() => navigate('/ConfirmarEmail'), 2000);
            } else {
                setMensagem({ texto: retorno.error, tipo: 'erro' });
            }
        } catch (error) {
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
        }
    }

    return(
        <section className={css.containerSection}>
            {mensagem.texto && (
                <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            )}
            <div className={css.cadastroOng1}>
                <Titulo titulo={'Venha fazer parte da mudança!'} cor={'laranja'}/>
                <BotaoAlternar ong={true}/>
            </div>
            <div className={css.formulario}>
                <div className={css.linha}>
                    <div className={"row"}>
                        {/* Linha 1: Nome | CNPJ */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Nome *'} type={'text'} placeholder={'Digite seu nome'} required={true} maxLength={254} input={nome} alterarInput={alterarNome} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'CNPJ *'} type={'text'} placeholder={'Digite o CNPJ'} required={true} input={cnpj} alterarInput={alterarCNPJ} mascara={'cnpj'} />
                        </div>
                        {/* Linha 2: Email | Categoria */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Email *'} type={'text'} placeholder={'Digite seu email'} required={true} maxLength={254} input={email} alterarInput={alterarEmail} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Select label={'Categoria *'} input={categoria} alterarInput={alterarCategoria} options={['Escolha uma categoria', 'Animal', 'Escolar', 'Comida', 'Outro']}/>
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <div className={"row"}>
                                <div className={"col-12"}>
                                    <Input label={'Descrição breve *'} type={'text'} placeholder={'Descrição breve sobre sua ONG'} required={true} maxLength={50} input={descBreve} alterarInput={alterarDescBreve} />
                                </div>
                                <div className={"col-12"}>
                                    <Input label={'Localização *'} type={'text'} placeholder={'Digite sua localização'} required={true} maxLength={254} input={localizacao} alterarInput={alterarLocalizacao} />
                                </div>

                            </div>
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input tamanho={'Big'} label={'Descrição longa *'} type={'text'} placeholder={'Descrição longa sobre sua ONG'} required={true} maxLength={254} textarea={true} alterarInput={alterarDescLonga} />
                        </div>
                        {/* Linha 4: Localização | (vazio) */}
                        {/* Linha 5: Senha | Confirmar Senha */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Senha *'} type={'password'} placeholder={'Crie uma senha'} required={true} maxLength={254} input={senha} alterarInput={alterarSenha} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Confirmar senha *'} type={'password'} placeholder={'Confirme sua senha'} required={true} maxLength={254} input={confirmarSenha} alterarInput={alterarConfirmarSenha} />
                        </div>
                        {/* Linha 6: Chave PIX | Número da Conta */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Chave PIX *'} type={'text'} placeholder={'Digite sua chave PIX'} required={true} maxLength={254} input={chavePix} alterarInput={alterarChavePix} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Número da conta *'} type={'text'} placeholder={'Digite o número da conta'} required={true} input={numConta} alterarInput={alterarNumConta} maxLength={12} />
                        </div>
                        {/* Linha 7: Código do Banco | Tipo de Conta */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Código do banco *'} type={'text'} placeholder={'Digite o código do banco'} required={true} maxLength={3} input={codBanco} alterarInput={alterarCodBanco} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <Select label={'Tipo de conta *'} options={['Escolha um tipo de conta', 'Conta-corrente', 'Poupança', 'Conta salário', 'Conta digital', 'Conta PJ']} input={tipoConta} alterarInput={alterarTipoConta} />
                        </div>
                        {/* Linha 8: Número da Agência | Foto de Perfil */}
                        <div className={"col-md-6 col-12"}>
                            <Input label={'Número da agência *'} type={'text'} placeholder={'Digite o número da sua agência'} required={true} maxLength={4} input={numAgencia} alterarInput={alterarNumAgencia} />
                        </div>
                        <div className={"col-md-6 col-12"}>
                            <InputArquivo tamanho={'normal'} tipo={'normaledicao'} required={true} alterarInput={alterarFotoPerfil} />
                        </div>
                    </div>
                </div>
                <div className={css.botaoContainer}>
                    <Botao acao={criarOng} texto={'Cadastre-se'} cor={'rosa'}/>
                </div>
            </div>
        </section>
    )
}