import css from './Cards.module.css'

export default function Cards({texto, imagem}){
    return (
        <div className={css.card}>
            <img src={imagem} className={css.img}  />
            <h2 className={css.textoo}>{texto}</h2>
        </div>
    )
}