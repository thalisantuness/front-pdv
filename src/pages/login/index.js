import React from "react";
import NavBar from "../../components/NavBar/index";
import BannerPrimary from "../../components/BannerPrimary/index";
import OurSolutions from "../../components/OurSolutions/index";
import Footer from "../../components/Footer/index";
import Statistics from "../../components/Statistics";
import Companies from "../../components/CompaniesWorked"; 


import "../../global.css"

function Home() {
  return (
    <div className="container"> 
      <NavBar />
      <BannerPrimary />
      <OurSolutions />
         <Companies />
      <Statistics />
      <Footer /> 
    </div>
  );
}

export default Home;
