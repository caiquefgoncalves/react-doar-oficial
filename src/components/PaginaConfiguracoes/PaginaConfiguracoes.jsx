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

    function aplicarConfiguracoes(config) {
        if (config.fonte_logo) document.documentElement.style.setProperty('--fonte-logo', config.fonte_logo);
        if (config.fonte_titulo) document.documentElement.style.setProperty("--fonte-titulo", config.fonte_titulo);
        if (config.fonte_texto) document.documentElement.style.setProperty("--fonte-texto", config.fonte_texto);
        if (config.cor_primaria) document.documentElement.style.setProperty("--cor-primaria", config.cor_primaria);
        if (config.cor_secundaria) document.documentElement.style.setProperty("--cor-secundaria", config.cor_secundaria);
        if (config.cor_terceria) document.documentElement.style.setProperty("--cor-terciaria", config.cor_terceria);
        if (config.fonte_cor) document.documentElement.style.setProperty("--cor-texto", config.fonte_cor);
    }

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
            console.error('Erro ao buscar configurações:', error);
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
    }, [fonteLogo, fonteTitulo, fonteTexto, corPrimaria, corSecundaria, corTerciaria, corTexto]);

    async function salvarConfiguracoes() {
        // Validações - TODOS OS CAMPOS OBRIGATÓRIOS
        if (!nome.trim()) {
            setMensagem({ texto: 'O nome da empresa é obrigatório', tipo: 'erro' });
            return;
        }
        if (!spanNome.trim()) {
            setMensagem({ texto: 'O span do nome é obrigatório', tipo: 'erro' });
            return;
        }
        if (!descricao.trim()) {
            setMensagem({ texto: 'A descrição da empresa é obrigatória', tipo: 'erro' });
            return;
        }
        if (!textoBannerPrincipal.trim()) {
            setMensagem({ texto: 'O texto do banner principal é obrigatório', tipo: 'erro' });
            return;
        }
        if (!textoBannerSecundario.trim()) {
            setMensagem({ texto: 'O texto do banner secundário é obrigatório', tipo: 'erro' });
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
                localStorage.setItem('fonteLogo', fonteLogo);
                localStorage.setItem('fonteTitulo', fonteTitulo);
                localStorage.setItem('fonteTexto', fonteTexto);
                localStorage.setItem('corPrimaria', corPrimaria);
                localStorage.setItem('corSecundaria', corSecundaria);
                localStorage.setItem('corTerciaria', corTerciaria);
                localStorage.setItem('corTexto', corTexto);

                setMensagem({ texto: data.message || 'Configurações salvas com sucesso!', tipo: 'sucesso' });

                setTimeout(() => {
                    navigate('/dashboardAdm');
                    window.location.reload();
                }, 1500);
            } else {
                setMensagem({ texto: data.error || 'Erro ao salvar configurações', tipo: 'erro' });
                setSalvando(false);
            }
        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
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
                setTimeout(() => {
                    navigate('/dashboardAdm');
                    window.location.reload();
                }, 1500);
            } else {
                setMensagem({ texto: data.error || 'Erro ao redefinir configurações', tipo: 'erro' });
                setRedefinindo(false);
            }
        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ texto: 'Erro de conexão com o servidor', tipo: 'erro' });
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

            <div className={css.formulario}>
                <div className={"row"}>
                    {/* Nome da Empresa - OBRIGATÓRIO */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Nome da Empresa <span className={css.required}>*</span></label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome da empresa"
                                required
                            />
                        </div>
                    </div>

                    {/* Span do Nome - OBRIGATÓRIO */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Span do Nome (texto destacado) <span className={css.required}>*</span></label>
                            <input
                                type="text"
                                value={spanNome}
                                onChange={(e) => setSpanNome(e.target.value)}
                                placeholder="Ex: +"
                                required
                            />
                        </div>
                    </div>

                    {/* Descrição da Empresa - OBRIGATÓRIA */}
                    <div className={"col-12"}>
                        <div className={css.inputGroup}>
                            <label>Descrição da Empresa <span className={css.required}>*</span></label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows="4"
                                placeholder="Descrição sobre a empresa"
                                required
                            />
                        </div>
                    </div>

                    {/* Texto do Banner Principal - OBRIGATÓRIO */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Texto do Banner Principal <span className={css.required}>*</span></label>
                            <input
                                type="text"
                                value={textoBannerPrincipal}
                                onChange={(e) => setTextoBannerPrincipal(e.target.value)}
                                placeholder="Texto principal do banner"
                                required
                            />
                        </div>
                    </div>

                    {/* Texto do Banner Secundário - OBRIGATÓRIO */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Texto do Banner Secundário <span className={css.required}>*</span></label>
                            <input
                                type="text"
                                value={textoBannerSecundario}
                                onChange={(e) => setTextoBannerSecundario(e.target.value)}
                                placeholder="Texto secundário do banner"
                                required
                            />
                        </div>
                    </div>

                    {/* Logo da Empresa */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Logo da Empresa</label>
                            <InputArquivo
                                tamanho={'normal'}
                                tipo={'normaledicao'}
                                label={''}
                                alterarInput={(e) => setLogo(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Banner da Empresa */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Banner da Empresa</label>
                            <InputArquivo
                                tamanho={'normal'}
                                tipo={'normaledicao'}
                                label={''}
                                alterarInput={(e) => setBanner(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Fonte do Logo */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Fonte do Logo</label>
                            <select value={fonteLogo} onChange={(e) => setFonteLogo(e.target.value)}>
                                {fontes.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fonte dos Títulos */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Fonte dos Títulos</label>
                            <select value={fonteTitulo} onChange={(e) => setFonteTitulo(e.target.value)}>
                                {fontes.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fonte dos Textos */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Fonte dos Textos</label>
                            <select value={fonteTexto} onChange={(e) => setFonteTexto(e.target.value)}>
                                {fontes.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cor Primária */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Cor primária</label>
                            <input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} />
                        </div>
                    </div>

                    {/* Cor Secundária */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Cor secundária</label>
                            <input type="color" value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} />
                        </div>
                    </div>

                    {/* Cor Terciária */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Cor terciária</label>
                            <input type="color" value={corTerciaria} onChange={(e) => setCorTerciaria(e.target.value)} />
                        </div>
                    </div>

                    {/* Cor dos Textos */}
                    <div className={"col-md-6 col-12"}>
                        <div className={css.inputGroup}>
                            <label>Cor dos textos (fora do banner)</label>
                            <input type="color" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={css.botaoContainer}>
                    <button className={css.btnRedefinir} onClick={redefinirConfiguracoes} disabled={redefinindo}>
                        {redefinindo ? 'Redefinindo...' : 'Restaurar Padrão'}
                    </button>
                    <button className={css.btnSalvar} onClick={salvarConfiguracoes} disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}