// App.jsx
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import CadastroOng from "./pages/CadastroOng.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import CadastroDoador from "./pages/CadastroDoador.jsx";
import RelatoriosAdm from "./pages/RelatoriosAdm.jsx";
import CadastroAdm from "./pages/CadastroAdm.jsx";
import EsqueciSenha from "./pages/EsqueciSenha.jsx";
import VerificarCodigoSenha from "./pages/VerificarCodigoSenha.jsx";
import TelaErro from "./pages/TelaErro.jsx";
import RedefinirSenha from "./pages/RedefinirSenha.jsx";
import ConfirmarEmail1 from "./components/ConfirmarEmail1/ConfirmarEmail1.jsx";
import Atualizacao from "./pages/Atualizacao.jsx";
import EditarAtualizacao from "./pages/EditarAtualizacao.jsx";
import DashboardDaOng from "./pages/DashboardDaOng.jsx";
import AprovarOngs from "./pages/AprovarOngs.jsx";
import EdicaoOng from "./pages/EdicaoOng.jsx";
import AprovacoesReprovacoes from "./pages/AprovacoesReprovacoes.jsx";
import DashboardAdm from "./pages/DashboardAdm.jsx";
import ListaAprovacoes from "./pages/ListaAprovacoes.jsx";
import AprovarOng1 from "./components/AprovarOng1/AprovarOng1.jsx";
import EditarOng1 from './components/EditarOng1/EditarOng1.jsx';
import EditarDoador1 from './components/EditarDoador1/EditarDoador1.jsx';
import EditarAdm1 from './components/EditarAdm1/EditarAdm1.jsx';
import DashboardDaOng1 from './components/DashboardDaOng1/DashboardDaOng1.jsx';
import CriarProjeto1 from './components/CriarProjeto1/CriarProjeto1.jsx';
import EditarProjeto1 from './components/EditarProjeto1/EditarProjeto1.jsx';
import CriarAtualizacao1 from './components/CriarAtualizacao1/CriarAtualizacao1.jsx';
import EditarAtualizacao1 from './components/EditarAtualizacao1/EditarAtualizacao1.jsx';
import Feed1 from './components/Feed1/Feed1.jsx';
import PaginaOng1 from './components/PaginaOng1/PaginaOng1.jsx';
import PaginaProjeto1 from './components/PaginaProjeto1/PaginaProjeto1.jsx';
import Busca1 from './components/Busca1/Busca1.jsx';
import Ongs1 from './components/Ongs1/Ongs1.jsx';
import Projetos1 from './components/Projetos1/Projetos1.jsx';
import DashboardDoador1 from './components/DashboardDoador1/DashboardDoador1.jsx';
import Doacoes from "./pages/Doacoes.jsx";
import Agradecimento from "./pages/Agradecimento.jsx";
import MensagemVoluntario from "./pages/MensagemVoluntario.jsx";
import EditarMensagem from './pages/EditarMensagem.jsx';
import Configuracoes from "./pages/Configuracoes.jsx";
import RelatorioDoador from './pages/RelatorioDoador.jsx';
import RelatorioOng from './pages/RelatorioOng.jsx';

const API_URL = "http://10.92.3.131:5000"

export default function App() {
    return (
        <BrowserRouter>
            <Header api={API_URL}/>
            <Routes>
                <Route path="/" element={<Home api={API_URL}/>} />
                <Route path="/login" element={<Login api={API_URL} />} />
                <Route path="/cadastroOng" element={<CadastroOng api={API_URL}/>} />
                <Route path="/cadastroDoador" element={<CadastroDoador api={API_URL}/>} />
                <Route path="/cadastroAdm" element={<CadastroAdm api={API_URL}/>} />
                <Route path={"/confirmaremail"} element={<ConfirmarEmail1 api={API_URL}/>} />
                <Route path="/esqueciSenha" element={<EsqueciSenha api={API_URL}/>} />
                <Route path="/redefinirSenha" element={<RedefinirSenha api={API_URL}/>} />
                <Route path="/verificarCodigo" element={<VerificarCodigoSenha api={API_URL}/>} />
                <Route path="/postagem" element={<Atualizacao/>} />
                <Route path="/editarPostagem" element={<EditarAtualizacao api={API_URL}/>} />
                <Route path="/dashboardAdm" element={<DashboardAdm api={API_URL}/>} />
                <Route path="/aprovarOngs" element={<AprovarOngs api={API_URL}/>} />
                <Route path="/editarOng" element={<EdicaoOng api={API_URL}/>} />
                <Route path="/aprovarReprovar" element={<AprovacoesReprovacoes/>} />
                <Route path="/listaAprovacoes" element={<ListaAprovacoes api={API_URL}/>} />
                <Route path="/aprovarOng1/:id" element={<AprovarOng1 api={API_URL} />} />
                <Route path="/editarOng/:id" element={<EditarOng1 api={API_URL}/>} />
                <Route path="/editarDoador/:id" element={<EditarDoador1 api={API_URL}/>} />
                <Route path="/editarAdm/:id" element={<EditarAdm1 api={API_URL}/>} />
                <Route path="/dashboardOng" element={<DashboardDaOng1 api={API_URL}/>} />
                <Route path="/dashboardDoador" element={<DashboardDoador1 api={API_URL}/>} />
                <Route path="/criarProjeto" element={<CriarProjeto1 api={API_URL}/>} />
                <Route path="/editarProjeto/:id" element={<EditarProjeto1 api={API_URL}/>} />
                <Route path="/criarAtualizacao" element={<CriarAtualizacao1 api={API_URL}/>} />
                <Route path="/editarAtualizacao/:id" element={<EditarAtualizacao1 api={API_URL}/>} />
                <Route path="/feed" element={<Feed1 api={API_URL}/>} />
                <Route path="/ong/:id" element={<PaginaOng1 api={API_URL}/>} />
                <Route path="/projeto/:id" element={<PaginaProjeto1 api={API_URL}/>} />
                <Route path="/busca" element={<Busca1 api={API_URL}/>} />
                <Route path="/ongs" element={<Ongs1 api={API_URL}/>} />
                <Route path="/projetos" element={<Projetos1 api={API_URL}/>} />
                <Route path="/doar/:id" element={<Doacoes api={API_URL}/>}/>
                <Route path="/voluntario/:id" element={<MensagemVoluntario api={API_URL}/>}/>
                <Route path="/agradecimento" element={<Agradecimento api={API_URL}/>}/>
                <Route path="/relatorios" element={<RelatoriosAdm api={API_URL} />} />
                <Route path="/editarMensagem" element={<EditarMensagem api={API_URL} />} />
                <Route path="/configuracoes" element={<Configuracoes api={API_URL} />} />
                <Route path="/relatorio_doador" element={<RelatorioDoador api={API_URL} />} />
                <Route path="/relatorio_ong" element={<RelatorioOng api={API_URL} />} />
                <Route path="/*" element={<TelaErro/>} />
            </Routes>
            <Footer api={API_URL}/>
        </BrowserRouter>
    )
}