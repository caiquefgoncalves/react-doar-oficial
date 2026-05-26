// StoriesBar.jsx

import css from './StoriesBar.module.css'

export default function StoriesBar({ stories, api }) {

    return (

        <div className={css.container}>

            {stories.map((story) => (

                <div key={story.id} className={css.story}>

                    <img
                        src={`${api}/uploads/Stories/${story.foto}`}
                        alt=""
                        className={css.foto}
                    />

                    <p>{story.ong_nome}</p>

                </div>

            ))}

        </div>
    )
}