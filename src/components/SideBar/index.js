import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlataforma } from "../../context/PlataformaContext";
import Logo from "../../assets/logo-transparente.png";
import "./styles.css";

export default function SideBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { logout } = usePlataforma();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Botão hamburger para mobile */}
      {isMobile && (
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </button>
      )}

      <header className={`navbar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="logo-container">
          <Link to="/home" onClick={closeMobileMenu}>
            <img src={Logo} className="logo-img" alt="Logo" />
          </Link>
        </div>

        <div className="links">
          <Link to="/produtos" onClick={closeMobileMenu}>
            Produtos
          </Link>

          <Link to="/pedidos" onClick={closeMobileMenu}>
            Pedidos
          </Link>

          <Link to="/meu-perfil" onClick={closeMobileMenu}>
            Meu Perfil
          </Link>

          <Link to="/usuarios" onClick={closeMobileMenu}>
            Usuários
          </Link>

          <Link to="/chat" onClick={closeMobileMenu}>
            Chat
          </Link>

          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
    </>
  );
}