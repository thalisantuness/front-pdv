import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo-transparente.png";
import "./styles.css";

export default function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Botão hamburger para mobile */}
      <button 
        className="menu-toggle" 
        onClick={toggleMobileMenu}
        style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}
      >
        ☰
      </button>

      <header className={`navbar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <Link to="/" onClick={() => setIsMobileOpen(false)}>
          <img src={Logo} className="logo-img" alt="Logo" />
        </Link>

        <div className="links">
          <Link to="/produtos" onClick={() => setIsMobileOpen(false)}>
            Produtos
          </Link>
 
          <Link to="/usuarios" onClick={() => setIsMobileOpen(false)}>
            Usuários
          </Link>

          <Link to="/vender" onClick={() => setIsMobileOpen(false)}>
            Vender
          </Link>
        </div>
      </header>
    </>
  );
}