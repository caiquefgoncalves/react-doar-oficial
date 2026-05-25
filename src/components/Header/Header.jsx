import React, {useEffect, useState} from 'react';
import css from './Header.module.css';
import {Link, useLocation, useNavigate} from "react-router-dom";
import SeloVoluntario from "../SeloVoluntario/SeloVoluntario.jsx";

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
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
        }
    }

    // Buscar informações da empresa ao montar o componente e quando a rota mudar
    useEffect(() => {
        buscarInfo();
    }, [location.pathname]);

    // Escutar mudanças na logo
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'logoAtualizada') {
                buscarInfo();
                localStorage.removeItem('logoAtualizada');
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

    // URL da logo
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
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #167cbf'
                                }}
                                alt="Perfil"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/perfil.png';
                                }}
                            />
                            {tipoUsuario === 1 && <SeloVoluntario idUsuario={getIdUsuario()} api={api_url} />}
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
                                        {tipoUsuario === 1 && <SeloVoluntario idUsuario={getIdUsuario()} api={api_url} />}
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