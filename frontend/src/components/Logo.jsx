import React from "react";

export const Mark = ({ className = "brand-mark", fetchPriority = "auto" }) => (
  <img
    className={className}
    src="/icono.webp"
    alt=""
    width={92}
    height={92}
    decoding="async"
    fetchPriority={fetchPriority}
  />
);

const Logo = () => (
  <img
    className="brand-logo"
    src="/logo.webp"
    alt="Clínica Virtual"
    width={156}
    height={52}
    decoding="async"
  />
);

export default Logo;
