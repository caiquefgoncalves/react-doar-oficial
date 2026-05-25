import css from './Chamada.module.css'

export default function Chamada() {
    return (
        <section className={css.espacamento}>
            <div className="container-fluid">
                <div className="row d-flex justify-content-between">
                    <div className={"col-md-6 col-12 d-flex justify-content-center align-items-start flex-column " + css.rosaClaro}>
                        <h4 className={css.tituloh4}>Junte-se a nós!</h4>
                        <p className={css.paragrafo}>
                            Cadastre sua ONG para receber doações ou se cadastre para contribuir com projetos de todo Brasil!
                        </p>
                    </div>
                    <div className={"col-3 " + css.rosaMedio}>
                        <img className={css.imagem} src='/mulhervoluntaria.png' alt=""/>
                    </div>
                    <div className={"col-2 " + css.rosaEscuro}>
                    </div>
                </div>
            </div>
        </section>


    )
}