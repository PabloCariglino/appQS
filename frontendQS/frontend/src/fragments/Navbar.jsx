import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav>
      <div className="menu-toggle" onClick={toggleMenu}>
        &#9776; {/* Ícono del menú hamburguesa */}
      </div>
      <ul className={isOpen ? "active" : ""}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/project-list">Proyectos</Link>
        </li>
        <li>
          <Link to="/register-user">Crear usuario</Link>
        </li>
        <li>
          <Link to="/contact">Contacto</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        {/* <li>
          <Link to="/logout">Logout</Link>
        </li> */}
      </ul>
    </nav>
  );
}

export default Navbar;
