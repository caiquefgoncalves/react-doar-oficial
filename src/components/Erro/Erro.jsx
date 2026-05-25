import css from './Erro.module.css'

export default function Erro() {
    return (
        <section className={`container d-flex flex-column justify-content-center align-items-center vh-100 text-center ${css.fundo}`}>

            <h1 className={css.logo}>DOAR +</h1>

            <p className={`text-secondary fw-bold mt-3 ${css.text}`}>Erro 404</p>

            <h2 className={css.titulo}>Página não encontrada!</h2>

            <p className={`text-muted col-md-6 ${css.descricao}`}>
                A página que você está procurando pode ter sido removida
                ou o link está incorreto.
            </p>

            <a href="/" className={`btn btn-link mt-3 ${css.botao}`}>
                Voltar para a Página Inicial
            </a>

        </section>

    )
}