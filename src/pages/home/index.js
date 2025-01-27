import React from "react";
import NavBar from "../../components/NavBar/index";
import RegisterProducts from "../../components/RegisterProducts/index";
import Footer from "../../components/Footer/index";




import "../../global.css"

function Home() {
  return (
    <div className="container"> 
      <NavBar />
    <RegisterProducts/>
      
      
    
      <Footer /> 
    </div>
  );
}

export default Home;
