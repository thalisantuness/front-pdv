import React from "react";
import NavBar from "../../components/NavBar/index";
import DoSale from "../../components/DoSale/index";
import Footer from "../../components/Footer/index";




import "../../global.css"

function Sales() {
  return (
    <div className="container"> 
      <NavBar />
    <DoSale/>
      
      
    
      <Footer /> 
    </div>
  );
}

export default Sales;
