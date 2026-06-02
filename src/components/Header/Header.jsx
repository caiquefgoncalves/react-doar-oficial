import React, {useEffect, useState} from 'react';
import css from './Header.module.css';
import {Link, useLocation, useNavigate} from "react-router-dom";
import SeloVoluntario from "../SeloVoluntario/SeloVoluntario.jsx";
import Botao from "../Botao/Botao.jsx";

export default function Header({ api }) {
    const api_url = api;
    const [token, setToken] = useState(false);
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Estado para a empresa
    const [empresa, setEmpresa] = useState({});

    // Função para buscar informações da empresa
    async function buscarInfo() {
        try {
            const resposta = await fetch(`${api_url}/buscar_info`, {
                method: 'GET',
                credentials: 'include'
            });

            const informacoes = await resposta.json();

            if (informacoes.empresa) {
                setEmpresa(informacoes.empresa);

                // Atualizar as variáveis CSS com as configurações do banco
                if (informacoes.empresa.fonte_logo) {
                    document.documentElement.style.setProperty('--fonte-logo', informacoes.empresa.fonte_logo);
                }
                if (informacoes.empresa.fonte_titulo) {
                    document.documentElement.style.setProperty('--fonte-titulo', informacoes.empresa.fonte_titulo);
                }
                if (informacoes.empresa.fonte_texto) {
                    document.documentElement.style.setProperty('--fonte-texto', informacoes.empresa.fonte_texto);
                }
                if (informacoes.empresa.cor_primaria) {
                    document.documentElement.style.setProperty('--cor-primaria', informacoes.empresa.cor_primaria);
                }
                if (informacoes.empresa.cor_secundaria) {
                    document.documentElement.style.setProperty('--cor-secundaria', informacoes.empresa.cor_secundaria);
                }
                if (informacoes.empresa.cor_terceria) {
                    document.documentElement.style.setProperty('--cor-terciaria', informacoes.empresa.cor_terceria);
                }
                if (informacoes.empresa.fonte_cor) {
                    document.documentElement.style.setProperty('--cor-texto', informacoes.empresa.fonte_cor);
                }
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
        }
    }

    // Carregar configurações do localStorage ao iniciar
    useEffect(() => {
        const savedFonteLogo = localStorage.getItem('fonteLogo');
        const savedFonteTitulo = localStorage.getItem('fonteTitulo');
        const savedFonteTexto = localStorage.getItem('fonteTexto');
        const savedCorPrimaria = localStorage.getItem('corPrimaria');
        const savedCorSecundaria = localStorage.getItem('corSecundaria');
        const savedCorTerciaria = localStorage.getItem('corTerciaria');
        const savedCorTexto = localStorage.getItem('corTexto');

        if (savedFonteLogo) document.documentElement.style.setProperty('--fonte-logo', savedFonteLogo);
        if (savedFonteTitulo) document.documentElement.style.setProperty('--fonte-titulo', savedFonteTitulo);
        if (savedFonteTexto) document.documentElement.style.setProperty('--fonte-texto', savedFonteTexto);
        if (savedCorPrimaria) document.documentElement.style.setProperty('--cor-primaria', savedCorPrimaria);
        if (savedCorSecundaria) document.documentElement.style.setProperty('--cor-secundaria', savedCorSecundaria);
        if (savedCorTerciaria) document.documentElement.style.setProperty('--cor-terciaria', savedCorTerciaria);
        if (savedCorTexto) document.documentElement.style.setProperty('--cor-texto', savedCorTexto);
    }, []);

    // Buscar informações da empresa ao montar o componente e quando a rota mudar
    useEffect(() => {
        buscarInfo();
    }, [location.pathname]);

    // Escutar mudanças na logo e configurações
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'logoAtualizada') {
                buscarInfo();
                localStorage.removeItem('logoAtualizada');
            }
            // Recarregar configurações do localStorage
            if (e.key === 'fonteLogo' && e.newValue) {
                document.documentElement.style.setProperty('--fonte-logo', e.newValue);
            }
            if (e.key === 'fonteTitulo' && e.newValue) {
                document.documentElement.style.setProperty('--fonte-titulo', e.newValue);
            }
            if (e.key === 'fonteTexto' && e.newValue) {
                document.documentElement.style.setProperty('--fonte-texto', e.newValue);
            }
            if (e.key === 'corPrimaria' && e.newValue) {
                document.documentElement.style.setProperty('--cor-primaria', e.newValue);
            }
            if (e.key === 'corSecundaria' && e.newValue) {
                document.documentElement.style.setProperty('--cor-secundaria', e.newValue);
            }
            if (e.key === 'corTerciaria' && e.newValue) {
                document.documentElement.style.setProperty('--cor-terciaria', e.newValue);
            }
            if (e.key === 'corTexto' && e.newValue) {
                document.documentElement.style.setProperty('--cor-texto', e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    // Função para fechar o offcanvas
    function fecharMenuMobile() {
        const offcanvasElement = document.getElementById('menuLateral');
        if (offcanvasElement) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    }

    function decodificarToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    function tokenExpirado(token) {
        try {
            const tokenData = decodificarToken(token);
            if (!tokenData || !tokenData.exp) return false;
            const agora = Math.floor(Date.now() / 1000);
            return agora >= tokenData.exp;
        } catch (error) {
            return true;
        }
    }

    function getFotoUsuario() {
        const tokenLocal = localStorage.getItem('token');
        if (tokenLocal) {
            try {
                const payload = JSON.parse(atob(tokenLocal.split('.')[1]));
                const idUsuario = payload.id_usuarios;
                return `${api_url}/uploads/Usuarios/${idUsuario}.jpeg`;
            } catch (e) {
                console.error('Erro ao decodificar token para foto:', e);
            }
        }
        return '/perfil.png';
    }

    function getIdUsuario() {
        const tokenLocal = localStorage.getItem('token');
        if (tokenLocal) {
            try {
                const payload = JSON.parse(atob(tokenLocal.split('.')[1]));
                return payload.id_usuarios;
            } catch (e) {}
        }
        return null;
    }

    useEffect(function () {
        var tokenLocal = localStorage.getItem("token");

        if (tokenLocal) {
            if (tokenExpirado(tokenLocal)) {
                localStorage.removeItem("token");
                localStorage.removeItem("nome");
                localStorage.setItem("sessaoExpirada", "Sua sessão expirou. Faça login novamente.");
                setToken(false);
                setTipoUsuario(null);

                if (window.location.pathname !== '/login') {
                    navigate('/login');
                }
                return;
            }

            setToken(tokenLocal);
            const tokenData = decodificarToken(tokenLocal);
            if (tokenData) {
                setTipoUsuario(tokenData.tipo);
            }
        } else {
            setToken(false);
            setTipoUsuario(null);
        }
    }, [location]);

    function irParaPerfil(){
        fecharMenuMobile();
        if (tipoUsuario === 0) {
            navigate('/dashboardAdm');
        } else if (tipoUsuario === 2) {
            navigate('/dashboardOng');
        } else if (tipoUsuario === 1) {
            navigate('/dashboardDoador');
        } else {
            navigate('/dashboard');
        }
    }

    async function fazerLogout() {
        fecharMenuMobile();
        try {
            const tokenLogout = localStorage.getItem('token');

            if (tokenLogout) {
                await fetch(`${api_url}/logout?token=${tokenLogout}`, {
                    method: 'POST',
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('sucesso');
        localStorage.removeItem('sessaoExpirada');

        navigate('/');
    }

    // URL da logo - atualiza automaticamente quando empresa muda
    const urlLogo = empresa.logo
        ? `${api_url}/uploads/Empresas/${empresa.logo}`
        : "/logo.png";

    if (token) {
        return (
            <header className={css.headerContainer}>
                <div className={css.headerContent}>
                    <a href="/" className={css.logoLink}>
                        <img
                            src={urlLogo}
                            alt={`Logo da plataforma ${empresa.nome || 'Doar+'}`}
                            className={css.logo}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                            }}
                        />
                    </a>

                    <nav className={`d-none d-lg-flex ${css.desktopNav}`}>
                        <ul className={css.navList}>
                            <li><Link to="/" className={css.link}>Home</Link></li>
                            <li><Link to="/" className={css.link}>Benefícios</Link></li>
                            <li><Link to="/" className={css.link}>Junte-se a nós!</Link></li>
                            <li><Link to="/feed" className={css.link}>ONGs e projetos</Link></li>
                        </ul>
                    </nav>

                    <div className={`d-none d-lg-flex ${css.divbotoes}`}>
                        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                            <img
                                src={getFotoUsuario()}
                                onClick={irParaPerfil}
                                className={css.foto}
                                alt="Perfil"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/perfil.png';
                                }}
                            />
                            {tipoUsuario === 1 && <SeloVoluntario api={api_url} idUsuario={getIdUsuario()}/>}
                        </div>
                    </div>

                    <div className={`d-none d-lg-flex ${css.divbotoes}`}>
                        <button onClick={fazerLogout} className={css.sair} style={{ marginLeft: '10px' }}>
                            <img src="/sair.png" alt="Sair"/>
                        </button>
                    </div>

                    <button
                        className={`d-lg-none ${css.actionBtn}`}
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#menuLateral"
                    >
                        <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="2" y1="2" x2="33" y2="2" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                            <line x1="2" y1="12" x2="33" y2="12" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                            <line x1="2" y1="22" x2="33" y2="22" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                        </svg>
                    </button>

                    <div className={`offcanvas offcanvas-end ${css.offcanvasCustom}`} tabIndex="-1" id="menuLateral">
                        <div className={css.offcanvasHeaderCustom}>
                            <button type="button" className={css.actionBtn} data-bs-dismiss="offcanvas" aria-label="Close">
                                <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="5" y1="2" x2="30" y2="23" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                                    <line x1="30" y1="2" x2="5" y2="23" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className={css.offcanvasBodyCustom}>
                            <ul className={css.navListMobile}>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Home</Link></li>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Benefícios</Link></li>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Junte-se a nós!</Link></li>
                                <li><Link to="/feed" className={css.linkMobile} onClick={fecharMenuMobile}>ONGs e projetos</Link></li>
                                <li>
                                    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                                        <img
                                            src={getFotoUsuario()}
                                            onClick={irParaPerfil}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #167cbf',
                                                marginRight: '10px'
                                            }}
                                            alt="Perfil"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/perfil.png';
                                            }}
                                        />
                                        {tipoUsuario === 1 && <SeloVoluntario api={api_url} idUsuario={getIdUsuario()} />}
                                    </div>
                                    <button onClick={fazerLogout} className={css.btnSairMobile} style={{ marginLeft: '10px' }}>
                                        <img src="/sair.png" alt="Sair"/>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        )
    } else {
        return (
            <header className={css.headerContainer}>
                <div className={css.headerContent}>
                    <a href="/" className={css.logoLink}>
                        <img
                            src={urlLogo}
                            alt={`Logo da plataforma ${empresa.nome || 'Doar+'}`}
                            className={css.logo}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                            }}
                        />
                    </a>

                    <nav className={`d-none d-lg-flex ${css.desktopNav}`}>
                        <ul className={css.navList}>
                            <li><Link to="/" className={css.link}>Home</Link></li>
                            <li><Link to="/" className={css.link}>Benefícios</Link></li>
                            <li><Link to="/" className={css.link}>Junte-se a nós!</Link></li>
                            <li><Link to="/feed" className={css.link}>ONGs e projetos</Link></li>
                        </ul>
                    </nav>

                    <div className={`d-none d-lg-flex ${css.divbotoes}`}>
                        <Link to={"/cadastroOng"}><button className={css.cadastro}>Cadastro</button></Link>
                        <Link to={"/login"}><button className={css.login}>Login</button></Link>
                    </div>

                    <button
                        className={`d-lg-none ${css.actionBtn}`}
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#menuLateral"
                    >
                        <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="2" y1="2" x2="33" y2="2" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                            <line x1="2" y1="12" x2="33" y2="12" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                            <line x1="2" y1="22" x2="33" y2="22" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                        </svg>
                    </button>

                    <div className={`offcanvas offcanvas-end ${css.offcanvasCustom}`} tabIndex="-1" id="menuLateral">
                        <div className={css.offcanvasHeaderCustom}>
                            <button type="button" className={css.actionBtn} data-bs-dismiss="offcanvas" aria-label="Close">
                                <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="5" y1="2" x2="30" y2="23" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                                    <line x1="30" y1="2" x2="5" y2="23" stroke="#d9d9d9" strokeWidth="4" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className={css.offcanvasBodyCustom}>
                            <ul className={css.navListMobile}>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Home</Link></li>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Benefícios</Link></li>
                                <li><Link to="/" className={css.linkMobile} onClick={fecharMenuMobile}>Junte-se a nós!</Link></li>
                                <li><Link to="/feed" className={css.linkMobile} onClick={fecharMenuMobile}>ONGs e projetos</Link></li>
                                <li className="mt-4"><Link to={"/cadastroOng"} className={css.linkMobile} onClick={fecharMenuMobile}>Cadastro</Link></li>
                                <li><Link to={"/login"} className={css.linkMobile} onClick={fecharMenuMobile}>Login</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        )
    }
}