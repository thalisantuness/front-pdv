import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./global.css";

import Home from "../src/pages/home/index";
import Sales from "../src/pages/sales/index"

function App() {
  return (
    <Router>
      <div className="container">
        <Routes> 
          <Route path="/" element={<Home />} />       
          <Route path="/vendas" element={<Sales />} />       
        </Routes>
      </div>
    </Router>
  );
}

export default App;