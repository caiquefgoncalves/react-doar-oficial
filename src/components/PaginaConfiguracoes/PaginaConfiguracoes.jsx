import { useEffect, useState } from 'react'
import css from './PaginaConfiguracoes.module.css'
import Titulo from "../Titulo/Titulo.jsx";
import { useNavigate } from "react-router-dom";
import Mensagem from "../Mensagem/Mensagem.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";

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

    // DADOS DA EMPRESA
    const [nome, setNome] = useState("");
    const [spanNome, setSpanNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [textoBannerPrincipal, setTextoBannerPrincipal] = useState("");
    const [textoBannerSecundario, setTextoBannerSecundario] = useState("");

    // FONTES E CORES
    const [fonteLogo, setFonteLogo] = useState("Playwrite US Trad");
    const [fonteTitulo, setFonteTitulo] = useState("Inter");
    const [fonteTexto, setFonteTexto] = useState("Inter");
    const [corPrimaria, setCorPrimaria] = useState("#167cbf");
    const [corSecundaria, setCorSecundaria] = useState("#f65682");
    const [corTerciaria, setCorTerciaria] = useState("#f7b567");
    const [corTexto, setCorTexto] = useState("#1f1f1f");

    // IMAGENS
    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        if (!api_url) {
            console.error('API URL não definida');
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
                    if (empresa.texto_banner_principal) setTextoBannerPrincipal(empresa.texto_banner_principal);
                    if (empresa.texto_banner_secundario) setTextoBannerSecundario(empresa.texto_banner_secundario);

                    if (empresa.fonte_logo) setFonteLogo(empresa.fonte_logo);
                    if (empresa.cor_primaria) setCorPrimaria(empresa.cor_primaria);
                    if (empresa.cor_secundaria) setCorSecundaria(empresa.cor_secundaria);
                    if (empresa.cor_terceria) setCorTerciaria(empresa.cor_terceria);
                    if (empresa.fonte_titulo) setFonteTitulo(empresa.fonte_titulo);
                    if (empresa.fonte_texto) setFonteTexto(empresa.fonte_texto);
                    if (empresa.fonte_cor) setCorTexto(empresa.fonte_cor);

                    document.documentElement.style.setProperty('--fonte-logo', empresa.fonte_logo || "Playwrite US Trad");
                    document.documentElement.style.setProperty("--fonte-titulo", empresa.fonte_titulo || "Inter");
                    document.documentElement.style.setProperty("--fonte-texto", empresa.fonte_texto || "Inter");
                    document.documentElement.style.setProperty("--cor-primaria", empresa.cor_primaria || "#167cbf");
                    document.documentElement.style.setProperty("--cor-secundaria", empresa.cor_secundaria || "#f65682");
                    document.documentElement.style.setProperty("--cor-terciaria", empresa.cor_terceria || "#f7b567");
                    document.documentElement.style.setProperty("--cor-texto", empresa.fonte_cor || "#1f1f1f");
                }
            }
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        document.documentElement.style.setProperty('--fonte-logo', fonteLogo);
        document.documentElement.style.setProperty("--fonte-titulo", fonteTitulo);
        document.documentElement.style.setProperty("--fonte-texto", fonteTexto);
        document.documentElement.style.setProperty("--cor-primaria", corPrimaria);
        document.documentElement.style.setProperty("--cor-secundaria", corSecundaria);
        document.documentElement.style.setProperty("--cor-terciaria", corTerciaria);
        document.documentElement.style.setProperty("--cor-texto", corTexto);
    }, [fonteLogo, fonteTitulo, fonteTexto, corPrimaria, corSecundaria, corTerciaria, corTexto]);

    async function salvarConfiguracoes() {
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

        if (logo) form.append('logo', logo);
        if (banner) form.append('banner', banner);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${api_url}/alterar_info?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                body: form
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('logoAtualizada', Date.now().toString());
                window.dispatchEvent(new Event('storage'));

                setMensagem({ texto: data.message || 'Configurações salvas com sucesso!', tipo: 'sucesso' });
                setTimeout(() => navigate('/dashboardAdm'), 2000);
            } else {
                setMensagem({ texto: data.error || 'Erro ao salvar configurações', tipo: 'erro' });
            }
        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
        } finally {
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
                setMensagem({ texto: data.message || 'Configurações redefinidas com sucesso!', tipo: 'sucesso' });
                await buscarConfiguracoes();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setMensagem({ texto: data.error || 'Erro ao redefinir configurações', tipo: 'erro' });
            }
        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
        } finally {
            setRedefinindo(false);
        }
    }

    if (carregando) {
        return (
            <div className={css.container}>
                <div className={css.titulo}>
                    <Titulo titulo={'Configurações'} cor={'azul-claro'} />
                </div>
                <div style={{ textAlign: 'center', padding: '50px' }}>Carregando...</div>
            </div>
        );
    }

    return (
        <div className={css.container}>
            {mensagem.texto && (
                <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} onClose={() => setMensagem({ texto: '', tipo: '' })} />
            )}
            <div className={css.titulo}>
                <Titulo titulo={'Configurações'} cor={'azul-claro'} />
            </div>

            {/* INFORMAÇÕES DA EMPRESA */}
            <div className={css.organizar}>
                <div className={css.fonte}>
                    <label>Nome da Empresa</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className={css.selectFonte}
                        placeholder="Digite o nome da empresa"
                    />
                </div>
                <div className={css.fonte}>
                    <label>Span do Nome (texto destacado)</label>
                    <input
                        type="text"
                        value={spanNome}
                        onChange={(e) => setSpanNome(e.target.value)}
                        className={css.selectFonte}
                        placeholder="Ex: +"
                    />
                </div>
                <div className={css.fonte}>
                    <label>Descrição da Empresa</label>
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className={css.selectFonte}
                        rows="3"
                        placeholder="Descrição sobre a empresa"
                    />
                </div>
                <div className={css.fonte}>
                    <label>Texto do Banner Principal</label>
                    <input
                        type="text"
                        value={textoBannerPrincipal}
                        onChange={(e) => setTextoBannerPrincipal(e.target.value)}
                        className={css.selectFonte}
                        placeholder="Texto principal do banner"
                    />
                </div>
                <div className={css.fonte}>
                    <label>Texto do Banner Secundário</label>
                    <input
                        type="text"
                        value={textoBannerSecundario}
                        onChange={(e) => setTextoBannerSecundario(e.target.value)}
                        className={css.selectFonte}
                        placeholder="Texto secundário do banner"
                    />
                </div>
            </div>


            <div className={css.organizar}>
                <div className={css.fonte}>

                    <InputArquivo
                        tamanho={'normal'}
                        tipo={'normaledicao'}
                        label={'Logo da empresa'}
                        alterarInput={(e) => setLogo(e.target.files[0])}
                    />
                </div>
                <div className={css.fonte}>

                    <InputArquivo
                        tamanho={'normal'}
                        tipo={'normaledicao'}
                        label={'Banner da empresa'}
                        alterarInput={(e) => setBanner(e.target.files[0])}
                    />
                </div>
            </div>

            {/* FONTES */}
            <div className={css.organizar}>
                <div className={css.fonte}>
                    <label>Fonte do Logo</label>
                    <select
                        value={fonteLogo}
                        onChange={(e) => setFonteLogo(e.target.value)}
                        className={css.selectFonte}
                    >
                        {fontes.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div className={css.fonte}>
                    <label>Fonte dos títulos</label>
                    <select
                        value={fonteTitulo}
                        onChange={(e) => setFonteTitulo(e.target.value)}
                        className={css.selectFonte}
                    >
                        {fontes.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <div className={css.fonte}>
                    <label>Fonte dos textos</label>
                    <select
                        value={fonteTexto}
                        onChange={(e) => setFonteTexto(e.target.value)}
                        className={css.selectFonte}
                    >
                        {fontes.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CORES */}
            <div className={css.cores}>
                <div>
                    <label>Cor primária</label>
                    <input
                        type="color"
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className={css.inputColor}
                    />
                </div>
                <div>
                    <label>Cor secundária</label>
                    <input
                        type="color"
                        value={corSecundaria}
                        onChange={(e) => setCorSecundaria(e.target.value)}
                        className={css.inputColor}
                    />
                </div>
                <div>
                    <label>Cor terciária</label>
                    <input
                        type="color"
                        value={corTerciaria}
                        onChange={(e) => setCorTerciaria(e.target.value)}
                        className={css.inputColor}
                    />
                </div>
                <div>
                    <label>Cor dos textos</label>
                    <input
                        type="color"
                        value={corTexto}
                        onChange={(e) => setCorTexto(e.target.value)}
                        className={css.inputColor}
                    />
                </div>
            </div>

            {/* BOTÕES */}
            <div className={css.botoesContainer}>
                <button className={css.btnRedefinir} onClick={redefinirConfiguracoes} disabled={redefinindo}>
                    {redefinindo ? 'Redefinindo...' : 'Restaurar Padrão'}
                </button>
                <button className={css.botaoSalvar} onClick={salvarConfiguracoes} disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    )
}