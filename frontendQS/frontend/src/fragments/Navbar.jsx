import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { backendLogout } from "../auth/AuthService";
import useAuthContext from "../auth/useAuthContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await backendLogout();
    setIsLoggedIn(false);
    setRole(null);
    navigate("/");
  };

  // Determinar si estamos en la página de inicio y no logueado para aplicar navbar transparente
  const isHome = location.pathname === "/" && !isLoggedIn;

  return (
    <nav className={`${styles.nav} ${isHome ? styles.transparentNav : ""}`}>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        &#9776; {/* Ícono del menú hamburguesa */}
      </div>
      <Link to="/" className={styles.logoLink}>
        <img
          src="/assets/LOGO-blanco2.jpg"
          alt="Logo Empresa"
          className={styles.logo}
        />
      </Link>
      <ul className={`${styles.ul} ${isOpen ? styles.active : ""}`}>
        {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
          <li className={styles.li}>
            <Link to="/project-list" className={styles.a}>
              Proyectos
            </Link>
          </li>
        )}
        {isLoggedIn && role === "ADMIN" && (
          <li className={styles.li}>
            <Link to="/register-user" className={styles.a}>
              Crear usuario
            </Link>
          </li>
        )}
        {!isLoggedIn && (
          <li className={styles.li}>
            <Link to="/contact" className={styles.a}>
              Contacto
            </Link>
          </li>
        )}
        {isLoggedIn ? (
          <li className={styles.li}>
            <Link onClick={handleLogout} className={styles.a}>
              Logout
            </Link>
          </li>
        ) : (
          <li className={styles.li}>
            <Link to="/login" className={styles.a}>
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
