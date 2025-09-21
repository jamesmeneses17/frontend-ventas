import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Categorias from "./pages/Categorias";
import Subcategorias from "./pages/Subcategorias";
import Productos from "./pages/Productos";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/categorias">Categorías</Link> |{" "}
        <Link to="/subcategorias">Subcategorías</Link> |{" "}
        <Link to="/productos">Productos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/categorias" />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/subcategorias" element={<Subcategorias />} />
        <Route path="/productos" element={<Productos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
