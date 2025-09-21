import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Categorias from "./pages/Categorias";
import Subcategorias from "./pages/Subcategorias";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/categorias">Categorías</Link> |{" "}
        <Link to="/subcategorias">Subcategorías</Link>
      </nav>
      <Routes>
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/subcategorias" element={<Subcategorias />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
