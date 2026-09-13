import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import FooterComponent from "./components/shared/Footer";
import NavBar from "./components/shared/NavBar";
import SmoothScroll from "./components/SmoothScroll";
import Consulta from "./pages/Consulta/Consulta";
import Home from "./pages/Home/Home";

export const App = () => {
  const location = useLocation();

  return (
    <>
      <SmoothScroll />
      <NavBar />
      <div className="content">
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/consulta" element={<Consulta />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
      <FooterComponent />
    </>
  );
};
