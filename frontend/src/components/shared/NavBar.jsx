import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { MenuIcon, PhoneIcon, UserIcon } from "../Icons";
import Logo from "../Logo";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className={`nav-links ${open ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Inicio
          </NavLink>
          <NavLink to="/consulta" onClick={() => setOpen(false)}>
            Consulta
          </NavLink>
        </nav>

        <div className="header-actions">
          <a className="header-phone" href="tel:+5117143030">
            <PhoneIcon />
            (01) 714 3030
          </a>
          <button type="button" className="icon-btn" aria-label="Mi cuenta">
            <UserIcon />
          </button>
          <Link className="btn btn-primary" to="/consulta">
            Agendar cita
          </Link>
          <button
            className="icon-btn menu-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menú"
            type="button"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
