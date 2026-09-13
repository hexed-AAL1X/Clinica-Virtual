import React from "react";

export const Mark = ({ className = "brand-mark" }) => (
  <img className={className} src="/icono.webp" alt="" />
);

const Logo = () => (
  <img className="brand-logo" src="/logo.webp" alt="Clínica Virtual" />
);

export default Logo;
