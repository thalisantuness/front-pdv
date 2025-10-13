import React from "react";
import NavBar from "../../components/NavBar/index";
import BannerPrimary from "../../components/BannerPrimary/index";
import OurSolutions from "../../components/OurSolutions/index";
import Footer from "../../components/Footer/index";
import ReactWhatsappButton from "react-whatsapp-button";
import Statistics from "../../components/Statistics";
import Blog from "../../components/Blog";
import Companies from "../../components/CompaniesWorked"; 
import "../../global.css";

function Home() {
  return (
    <div className="container">
      <NavBar />
      <div className="main-content">
        <BannerPrimary />
      {/*   <OurSolutions />
        <Statistics />
        <Blog />
        <Companies /> */}
        <ReactWhatsappButton
          countryCode="55"
          phoneNumber="123456789"
          animated={true}
        />
        <Footer />
      </div>
    </div>
  );
}

export default Home;