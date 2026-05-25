import css from "../CadastroAdm1/CadastroAdm1.module.css";
import Titulo from "../Titulo/Titulo.jsx";
import Input from "../Input/Input.jsx";
import Select from "../Select/Select.jsx";
import InputArquivo from "../InputArquivo/InputArquivo.jsx";
import Botao from "../Botao/Botao.jsx";

export default function EditarPostagem() {
    return(
        <section className={css.secao}>
            <div className={css.organizar}>
                <Titulo titulo={'Editar atualização'} cor={'azul-claro'} />
            </div>
            <div className={css.formulario}>
                <div>
                    <Input
                        label={'Título'}
                        placeholder={'Insira o título da sua postagem'}
                        required={true}

                    />
                    <Input
                        tamanho={'Big'}
                        label={'Texto'}
                        type={'text'}
                        placeholder={'Insira o texto da sua postagem '}
                        required={true}
                        minLength={50}
                        maxLength={200}
                        textarea={true}
                    />
                </div>
                <div>
                    <Select
                        label={'Projeto'}
                    />

                    <InputArquivo
                        tamanho={'big'}
                        required={false}
                    />
                </div>
            </div>
            <div className={css.botao}>
                <Botao  texto={'Editar atualização'} cor={'azul'} />
            </div>
        </section>
    )
}