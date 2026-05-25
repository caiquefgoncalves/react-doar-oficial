import css from './Card.module.css'
export default function Card({imagem,titulo, paragrafo} ){
    return (
        <div className={css.container}>
            <div className={css.informacoes}>
                <img className={css.img} src={imagem}/>
                <h3 className={css.titulo}>{titulo}</h3>
                <p className={css.paragrafo}>{paragrafo}</p>
            </div>
        </div>
    )
}