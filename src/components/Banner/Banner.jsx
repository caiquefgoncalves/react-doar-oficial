import css from "./Banner.module.css";
import Botao from "../Botao/Botao.jsx";
import { useEffect, useState } from "react";

export default function Banner({ api }) {
    let [empresa, setEmpresa] = useState({});

    async function buscar_info() {
        try {
            let resposta = await fetch(`${api}/buscar_info`, {
                method: 'GET',
                credentials: 'include'
            });

            let informacoes = await resposta.json();

            if (informacoes.empresa) {
                setEmpresa(informacoes.empresa);
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
        }
    }

    useEffect(() => {
        buscar_info();
    }, []);

    const urlDinâmica = `${api}/uploads/Empresas/${empresa.banner}`;
    const urlPadrao = "/banner.png";

    return (
        <section
            className={css.banner}
            style={{ backgroundImage: `url("${urlDinâmica}"), url("${urlPadrao}")` }}
        >
            <div className={css.textos}>
                <h2 className={css.logo}>{empresa.nome} <span>{empresa.span_nome}</span></h2>
                <h1 className={css.titulo}>{empresa.texto_banner_principal}</h1>
                <p className={css.paragrafo}>{empresa.texto_banner_secundario}</p>
            </div>
            <div className={css.conheca}>
                <Botao pagina="/login" texto="Acesse a plataforma" />
            </div>
        </section>
    );
}