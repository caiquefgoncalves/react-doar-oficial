import { useState } from 'react'

export default function StoryUpload({ api }) {

    const [arquivo, setArquivo] = useState(null)

    async function publicarStory() {

        try {

            if (!arquivo) {
                alert('Selecione uma imagem')
                return
            }

            const token = localStorage.getItem('token')

            if (!token) {
                alert('Token inválido')
                return
            }

            const formData = new FormData()

            // 🔥 TEM QUE SER "arquivos" (plural)
            formData.append('arquivos', arquivo)

            const resposta = await fetch(
                `${api}/criar_story`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            )

            const dados = await resposta.json()

            if (resposta.ok) {
                alert('Story publicado!')
                setArquivo(null)
            } else {
                alert(dados.error || 'Erro')
            }

        } catch (erro) {
            console.log(erro)
        }
    }

    return (
        <div>

            <input
                type='file'
                onChange={(e) =>
                    setArquivo(e.target.files[0])
                }
            />

            <button onClick={publicarStory}>
                Publicar Story
            </button>

        </div>
    )
}