import Stories from 'react-insta-stories'

import css from './StoryViewer.module.css'

export default function StoryViewer({
                                        story,
                                        fechar
                                    }) {

    const storiesFormatados = story.stories.map((s) => ({
        url:
            `http://localhost:5000/uploads/Stories/${s.arquivo}`
    }))

    return (

        <div className={css.overlay}>

            <button
                className={css.fechar}
                onClick={fechar}
            >
                ✕
            </button>

            <div className={css.storyContainer}>

                <Stories
                    stories={storiesFormatados}
                    defaultInterval={5000}
                    width="100%"
                    height="100%"
                />

            </div>

        </div>

    )
}