import css from './StoriesBar.module.css'

export default function StoryCircle({
                                        story,
                                        abrir
                                    }) {

    return (

        <div
            className={css.story}
            onClick={() => abrir(story)}
        >

            <div className={css.borda}>

                <img
                    src={`http://localhost:5000/uploads/Usuarios/${story.ong_foto}`}
                    alt={story.ong_nome}
                    className={css.imagem}
                />

            </div>

            <span className={css.nome}>
                {story.ong_nome}
            </span>

        </div>

    )
}