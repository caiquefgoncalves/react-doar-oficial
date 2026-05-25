import Banner from "../components/Banner/Banner.jsx";
import Beneficios from "../components/Beneficios/Beneficios.jsx";
import Header from "../components/Header/Header.jsx";
import Chamada from "../components/Chamada/Chamada.jsx";
import Footer from "../components/Footer/Footer.jsx";
// import Botao from "../components/Botao/Botao.jsx";

export default function Home({api}){
    return(
        <>
            <Banner api={api}/>
            <Beneficios/>
            <Chamada/>
        </>
    )
}