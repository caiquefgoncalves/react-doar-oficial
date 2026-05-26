import { useEffect, useState } from 'react'
import css from './PaginaConfiguracoes.module.css'

import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Select from "../Select/Select.jsx";
import Botao from "../Botao/Botao.jsx";
import Mensagem from "../Mensagem/Mensagem.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";

import { useNavigate } from "react-router-dom";

const fontes = [
    "Inter",
    "Poppins",
    "Roboto",
    "Montserrat",
    "Playfair Display",
    "Playwrite US Trad"
];

export default function PaginaConfiguracoes({ api }) {

    const api_url = api;
    const navigate = useNavigate();

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [redefinindo, setRedefinindo] = useState(false);

    // DADOS

    const [nome, setNome] = useState("");
    const [spanNome, setSpanNome] = useState("");
    const [descricao, setDescricao] = useState("");

    const [textoBannerPrincipal, setTextoBannerPrincipal] = useState("");
    const [textoBannerSecundario, setTextoBannerSecundario] = useState("");

    // FONTES

    const [fonteLogo, setFonteLogo] = useState("Playwrite US Trad");
    const [fonteTitulo, setFonteTitulo] = useState("Inter");
    const [fonteTexto, setFonteTexto] = useState("Inter");

    // CORES

    const [corPrimaria, setCorPrimaria] = useState("#167cbf");
    const [corSecundaria, setCorSecundaria] = useState("#f65682");
    const [corTerciaria, setCorTerciaria] = useState("#f7b567");
    const [corTexto, setCorTexto] = useState("#1f1f1f");

    // IMAGENS

    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);

    function aplicarConfiguracoes(config) {

        if (config.fonte_logo) {
            document.documentElement.style.setProperty('--fonte-logo', config.fonte_logo);
        }

        if (config.fonte_titulo) {
            document.documentElement.style.setProperty("--fonte-titulo", config.fonte_titulo);
        }

        if (config.fonte_texto) {
            document.documentElement.style.setProperty("--fonte-texto", config.fonte_texto);
        }

        if (config.cor_primaria) {
            document.documentElement.style.setProperty("--cor-primaria", config.cor_primaria);
        }

        if (config.cor_secundaria) {
            document.documentElement.style.setProperty("--cor-secundaria", config.cor_secundaria);
        }

        if (config.cor_terceria) {
            document.documentElement.style.setProperty("--cor-terciaria", config.cor_terceria);
        }

        if (config.fonte_cor) {
            document.documentElement.style.setProperty("--cor-texto", config.fonte_cor);
        }
    }

    useEffect(() => {

        if (!api_url) {
            setCarregando(false);
            return;
        }

        buscarConfiguracoes();

    }, []);

    async function buscarConfiguracoes() {

        try {

            const token = localStorage.getItem('token');

            const response = await fetch(`${api_url}/buscar_info?token=${token}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {

                const data = await response.json();
                const empresa = data.empresa;

                if (empresa) {

                    if (empresa.nome) setNome(empresa.nome);
                    if (empresa.span_nome) setSpanNome(empresa.span_nome);
                    if (empresa.descricao) setDescricao(empresa.descricao);

                    if (empresa.texto_banner_principal) {
                        setTextoBannerPrincipal(empresa.texto_banner_principal);
                    }

                    if (empresa.texto_banner_secundario) {
                        setTextoBannerSecundario(empresa.texto_banner_secundario);
                    }

                    if (empresa.fonte_logo) setFonteLogo(empresa.fonte_logo);
                    if (empresa.fonte_titulo) setFonteTitulo(empresa.fonte_titulo);
                    if (empresa.fonte_texto) setFonteTexto(empresa.fonte_texto);

                    if (empresa.cor_primaria) setCorPrimaria(empresa.cor_primaria);
                    if (empresa.cor_secundaria) setCorSecundaria(empresa.cor_secundaria);
                    if (empresa.cor_terceria) setCorTerciaria(empresa.cor_terceria);
                    if (empresa.fonte_cor) setCorTexto(empresa.fonte_cor);

                    aplicarConfiguracoes({
                        fonte_logo: empresa.fonte_logo,
                        fonte_titulo: empresa.fonte_titulo,
                        fonte_texto: empresa.fonte_texto,
                        cor_primaria: empresa.cor_primaria,
                        cor_secundaria: empresa.cor_secundaria,
                        cor_terceria: empresa.cor_terceria,
                        fonte_cor: empresa.fonte_cor
                    });
                }
            }

        } catch (error) {

            console.error(error);

        } finally {

            setCarregando(false);

        }
    }

    useEffect(() => {

        aplicarConfiguracoes({
            fonte_logo: fonteLogo,
            fonte_titulo: fonteTitulo,
            fonte_texto: fonteTexto,
            cor_primaria: corPrimaria,
            cor_secundaria: corSecundaria,
            cor_terceria: corTerciaria,
            fonte_cor: corTexto
        });

    }, [
        fonteLogo,
        fonteTitulo,
        fonteTexto,
        corPrimaria,
        corSecundaria,
        corTerciaria,
        corTexto
    ]);

    async function salvarConfiguracoes() {

        if (!nome.trim()) {
            setMensagem({ texto: 'O nome da empresa é obrigatório', tipo: 'erro' });
            return;
        }

        if (!spanNome.trim()) {
            setMensagem({ texto: 'O span do nome é obrigatório', tipo: 'erro' });
            return;
        }

        if (!descricao.trim()) {
            setMensagem({ texto: 'A descrição é obrigatória', tipo: 'erro' });
            return;
        }

        if (!textoBannerPrincipal.trim()) {
            setMensagem({ texto: 'O texto principal é obrigatório', tipo: 'erro' });
            return;
        }

        if (!textoBannerSecundario.trim()) {
            setMensagem({ texto: 'O texto secundário é obrigatório', tipo: 'erro' });
            return;
        }

        setSalvando(true);

        const form = new FormData();

        form.append('nome', nome);
        form.append('span_nome', spanNome);
        form.append('descricao', descricao);

        form.append('texto_banner_principal', textoBannerPrincipal);
        form.append('texto_banner_secundario', textoBannerSecundario);

        form.append('cor_primaria', corPrimaria);
        form.append('cor_secundaria', corSecundaria);
        form.append('cor_terciaria', corTerciaria);

        form.append('fonte_logo', fonteLogo);
        form.append('fonte_titulo', fonteTitulo);
        form.append('fonte_texto', fonteTexto);

        form.append('fonte_cor', corTexto);

        if (logo) {
            form.append('logo', logo);
        }

        if (banner) {
            form.append('banner', banner);
        }

        try {

            const token = localStorage.getItem('token');

            const response = await fetch(`${api_url}/alterar_info?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                body: form
            });

            const data = await response.json();

            if (response.ok) {

                setMensagem({
                    texto: data.message || 'Configurações salvas com sucesso!',
                    tipo: 'sucesso'
                });

                setTimeout(() => {

                    navigate('/dashboardAdm');
                    window.location.reload();

                }, 1500);

            } else {

                setMensagem({
                    texto: data.error || 'Erro ao salvar',
                    tipo: 'erro'
                });

                setSalvando(false);
            }

        } catch (error) {

            console.error(error);

            setMensagem({
                texto: 'Erro de conexão com o servidor',
                tipo: 'erro'
            });

            setSalvando(false);
        }
    }

    async function redefinirConfiguracoes() {

        setRedefinindo(true);

        try {

            const token = localStorage.getItem('token');

            const response = await fetch(`${api_url}/redefinir?token=${token}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {

                setMensagem({
                    texto: data.message || 'Configurações redefinidas!',
                    tipo: 'sucesso'
                });

                setTimeout(() => {

                    navigate('/dashboardAdm');
                    window.location.reload();

                }, 1500);

            } else {

                setMensagem({
                    texto: data.error || 'Erro ao redefinir',
                    tipo: 'erro'
                });

                setRedefinindo(false);
            }

        } catch (error) {

            console.error(error);

            setMensagem({
                texto: 'Erro de conexão com o servidor',
                tipo: 'erro'
            });

            setRedefinindo(false);
        }
    }

    if (carregando) {

        return (

            <div className={css.container}>

                <div className={css.titulo}>
                    <Titulo titulo={'Configurações'} cor={'azul-claro'} />
                </div>

                <div className={css.loading}>
                    Carregando...
                </div>

            </div>
        )
    }

    return (

        <section className={css.container}>

            {mensagem.texto && (
                <Mensagem
                    tipo={mensagem.tipo}
                    texto={mensagem.texto}
                    onClose={() => setMensagem({ texto: '', tipo: '' })}
                />
            )}

            <div className={css.titulo}>
                <Titulo titulo={'Configurações'} cor={'azul-claro'} />
            </div>

            <div className={css.formulario}>

                <div className={css.colunas}>

                    <div className={css.colunaEsquerda}>

                        <div className={"row"}>

                            <div className={"col-md-12 col-12"}>
                                <Input
                                    label={'Nome da Empresa *'}
                                    type={'text'}
                                    placeholder={'Digite o nome da empresa'}
                                    required={true}
                                    input={nome}
                                    alterarInput={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Input
                                    label={'Span do Nome *'}
                                    type={'text'}
                                    placeholder={'Ex: +'}
                                    required={true}
                                    input={spanNome}
                                    alterarInput={(e) => setSpanNome(e.target.value)}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Input
                                    textarea={true}
                                    label={'Descrição da Empresa *'}
                                    placeholder={'Descrição sobre a empresa'}
                                    required={true}
                                    input={descricao}
                                    alterarInput={(e) => setDescricao(e.target.value)}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Input
                                    label={'Texto Banner Principal *'}
                                    type={'text'}
                                    placeholder={'Texto principal'}
                                    required={true}
                                    input={textoBannerPrincipal}
                                    alterarInput={(e) => setTextoBannerPrincipal(e.target.value)}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Input
                                    label={'Texto Banner Secundário *'}
                                    type={'text'}
                                    placeholder={'Texto secundário'}
                                    required={true}
                                    input={textoBannerSecundario}
                                    alterarInput={(e) => setTextoBannerSecundario(e.target.value)}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <InputArquivo
                                    tamanho={'normal'}
                                    tipo={'normaledicao'}
                                    label={'Logo da Empresa'}
                                    alterarInput={(e) => setLogo(e.target.files[0])}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <InputArquivo
                                    tamanho={'normal'}
                                    tipo={'normaledicao'}
                                    label={'Banner da Empresa'}
                                    alterarInput={(e) => setBanner(e.target.files[0])}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Select
                                    label={'Fonte do Logo'}
                                    input={fonteLogo}
                                    alterarInput={(e) => setFonteLogo(e.target.value)}
                                    options={fontes}
                                />
                            </div>

                            <div className={"col-md-12 col-12"}>
                                <Select
                                    label={'Fonte dos Títulos'}
                                    input={fonteTitulo}
                                    alterarInput={(e) => setFonteTitulo(e.target.value)}
                                    options={fontes}
                                />
                            </div>

                            <div className={"col-12"}>
                                <Select
                                    label={'Fonte dos Textos'}
                                    input={fonteTexto}
                                    alterarInput={(e) => setFonteTexto(e.target.value)}
                                    options={fontes}
                                />
                            </div>

                        </div>

                    </div>


                    <div className={css.colunaDireita}>

                        <div className={css.coresContainer}>

                            <Input
                                label={'Cor Primária'}
                                type={'color'}
                                input={corPrimaria}
                                alterarInput={(e) => setCorPrimaria(e.target.value)}
                            />

                            <Input
                                label={'Cor Secundária'}
                                type={'color'}
                                input={corSecundaria}
                                alterarInput={(e) => setCorSecundaria(e.target.value)}
                            />

                            <Input
                                label={'Cor Terciária'}
                                type={'color'}
                                input={corTerciaria}
                                alterarInput={(e) => setCorTerciaria(e.target.value)}
                            />

                            <Input
                                label={'Cor dos Textos'}
                                type={'color'}
                                input={corTexto}
                                alterarInput={(e) => setCorTexto(e.target.value)}
                            />

                        </div>

                    </div>

                </div>

                <div className={css.botaoContainer}>

                    <div className={css.botaoWrapper}>
                        <Botao
                            texto={redefinindo ? 'Redefinindo...' : 'Restaurar Padrão'}
                            cor={'vazadorosa'}
                            acao={redefinirConfiguracoes}
                        />
                    </div>

                    <div className={css.botaoWrapper}>
                        <Botao
                            texto={salvando ? 'Salvando...' : 'Salvar'}
                            cor={'azul'}
                            acao={salvarConfiguracoes}
                        />
                    </div>

                </div>

            </div>




        </section>
    )
}