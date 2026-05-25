import css from './CardsDoadores.module.css'

export default function CardsDoadores({imagem, nome, valor}){
    return (
        <div className={css.card}>
            <img src={imagem} className={css.img}  />
            <h2 className={css.textoo}>{nome}</h2>
            <p>Última Doação <span>{valor}</span></p>
        </div>
    )
}