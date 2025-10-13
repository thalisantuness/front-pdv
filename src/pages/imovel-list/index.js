import React from "react";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import ImovelList from "../../components/ImovelList";
import ImovelFilter from "../../components/ImovelFilter";
import ReactWhatsappButton from "react-whatsapp-button";
import "./style.css";
import "../../global.css";

function ImovelListPage() {
  return (
    <div className="container">
      <NavBar />
      <div className="main-content">
        <ReactWhatsappButton countryCode="81" phoneNumber="92200646" />
        
        <h1>Produtos</h1>

        <ImovelFilter />
        <ImovelList />

        {/* <Blog /> */}
        <Footer />
      </div>
    </div>
  );
}

export default ImovelListPage;