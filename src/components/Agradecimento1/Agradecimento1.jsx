// src/components/Agradecimento1/Agradecimento1.jsx
import Titulo from "../Titulo/Titulo.jsx";
import Botao from "../Botao/Botao.jsx";
import css from './Agradecimento1.module.css'

export default function Agradecimento1() {
    const usuarioTipo = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.tipo;
            } catch (e) {}
        }
        return null;
    };

    const tipo = usuarioTipo();
    const dashboardRoute = tipo === 0 ? '/dashboardAdm' : tipo === 2 ? '/dashboardOng' : '/dashboardDoador';

    return (
        <section className={css.container}>
            <div className={css.titulo}>
                <Titulo titulo={'Agradecemos a contribuição!'} cor={'rosa'} />
            </div>
            <div className={css.botoes}>
                <Botao texto={'Ir para o feed'} cor={'rosa'} pagina={'/feed'} />
                <Botao texto={'Ir para o dashboard'} cor={'vazadorosa2'} pagina={dashboardRoute} />
            </div>
        </section>
    )
}