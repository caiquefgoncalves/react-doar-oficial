// MenuLateral.jsx
import { useNavigate } from "react-router-dom";
import css from './MenuLateral.module.css'

export default function MenuLateral() {
    const navigate = useNavigate();

    function decodificarToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) { return null; }
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

    function irParaPerfil() {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        if (tokenExpirado(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('nome');
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        const tokenData = decodificarToken(token);
        if (!tokenData) {
            navigate('/login');
            return;
        }

        if (tokenData.tipo === 0) navigate('/dashboardAdm');
        else if (tokenData.tipo === 2) navigate('/dashboardOng');
        else if (tokenData.tipo === 1) navigate('/dashboardDoador');
        else navigate('/dashboard');
    }

    function navegarParaChats() {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        if (tokenExpirado(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('nome');
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        const tokenData = decodificarToken(token);
        if (!tokenData) {
            navigate('/login');
            return;
        }

        // AGORA PERMITE AMBOS: Doador (tipo 1) e ONG (tipo 2)
        if (tokenData.tipo !== 1 && tokenData.tipo !== 2) {
            alert('Apenas doadores e ONGs podem acessar o chat');
            return;
        }

        navigate('/chats');
    }

    return (
        <div className={css.container}>
            <div className={css.funcoes} onClick={() => navigate('/feed')}>
                <img src={'/camera.png'} alt="Feed"/>
                <h2 className={css.desktop}>Feed</h2>
            </div>
            <div className={css.funcoes} onClick={irParaPerfil}>
                <img src={'/perfil.png'} alt="Perfil"/>
                <h2 className={css.desktop}>Perfil</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/ongs')}>
                <img src={'/ongs.png'} alt="ONGs"/>
                <h2 className={css.desktop}>ONGs</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/projetos')}>
                <img src={'/projetos.png'} alt="Projetos"/>
                <h2 className={css.desktop}>Projetos</h2>
            </div>
            <div className={css.funcoes} onClick={navegarParaChats}>
                <img src={'/chat.png'} alt="Chats"/>
                <h2 className={css.desktop}>Chats</h2>
            </div>
        </div>
    )
}