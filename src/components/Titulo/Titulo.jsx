import css from './Titulo.module.css';

// Teste rápido dentro do Titulo.js
export default function Titulo({ titulo, cor = "azul-claro", span = "", corSpan = "azul-claro-span", texto = "" }) {
    return (
        <div>
            <h2 className={css[cor]}>
                {titulo}

                {/* Se isso aqui aparecer em VERMELHO, o erro anterior era no seu arquivo CSS */}
                {span.length > 0 && (
                    <span className={css[corSpan]}> {span}</span>
                )}
            </h2>

            {texto.length > 0 && (
                <p className={css.texto}>{texto}</p>
            )}
        </div>
    );
}