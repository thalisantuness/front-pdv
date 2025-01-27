import React from "react";
import { Link } from "react-router-dom"; // Importa o Link
import Logo from "../../assets/logo.png";
import "./styles.css";

export default function NavBar() {
  return (
    <header className="navbar">
      <Link to="/"> {/* Substitui a tag <a> pelo componente <Link> */}
        <img src={Logo} className="logo-img" alt="Logo" />
      </Link>

      <div className="links">
        <Link to="/" className="link">
          Produtos
        </Link>
        
        <Link to="/vendas" className="link">
          Venda
        </Link>
        
        <Link to="/gestao" className="link">
          Gestão
        </Link>
      </div>
    </header>
  );
}
