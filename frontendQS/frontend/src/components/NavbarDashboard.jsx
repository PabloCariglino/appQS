import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { backendLogout } from "../auth/AuthService";
import useAuthContext from "../auth/UseAuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null); // Ref para el dropdown

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await backendLogout(setIsLoggedIn, setRole);
      console.log("Usuario deslogueado correctamente.");
    } catch (error) {
      console.error("Error al desloguear:", error);
    }
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "OPERATOR") {
        navigate("/operator");
      }
    } else {
      navigate("/");
    }
  };

  const handleHomeClick = () => {
    if (isLoggedIn) {
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "OPERATOR") {
        navigate("/operator");
      }
    }
  };

  const isHome = location.pathname === "/" && !isLoggedIn;

  // Determinar la base de las rutas según el rol
  const basePath =
    role === "ADMIN" ? "/admin" : role === "OPERATOR" ? "/operator" : "";

  return (
    <nav
      className={`fixed top-0 w-full z-10 transition-all duration-300 ${
        isHome ? "bg-transparent absolute" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-1 md:px-6">
        {/* Logo (Izquierda) */}
        <div onClick={handleLogoClick} className="cursor-pointer">
          <img
            src="/assets/LOGO-blanco2.jpg"
            alt="Logo Empresa"
            className="h-12 w-auto"
          />
        </div>

        {/* Navigation Links (Centrado en pantallas grandes) */}
        <ul
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:items-center md:gap-6 absolute md:static top-16 left-0 right-0 bg-gray-800 md:bg-transparent p-4 md:p-0 z-10 md:flex-1 md:justify-center md:max-w-3xl md:mx-auto`}
        >
          {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
            <>
              <li className="my-1 md:my-0">
                <button
                  onClick={handleHomeClick}
                  className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
                >
                  Inicio
                </button>
              </li>
              {isLoggedIn && role === "ADMIN" && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/tasks`}
                    className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
                  >
                    Tareas
                  </Link>
                </li>
              )}
              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/user-tasks`}
                    className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
                  >
                    Mis Tareas
                  </Link>
                </li>
              )}

              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/project-list`}
                    className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
                  >
                    Proyectos
                  </Link>
                </li>
              )}
              <li className="my-1 md:my-0">
                <Link
                  to={`${basePath}/part-scanner`}
                  className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
                >
                  Escanear Piezas
                </Link>
              </li>
            </>
          )}
          {isLoggedIn && role === "ADMIN" && (
            <li className="my-1 md:my-0">
              <Link
                to="/admin/user-list"
                className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
              >
                Usuarios
              </Link>
            </li>
          )}
          {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
            <li className="my-1 md:my-0">
              <Link
                to={`${basePath}/operator-performance`}
                className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
              >
                Rendimiento
              </Link>
            </li>
          )}

          {!isLoggedIn && (
            <li className="my-1 md:my-0">
              <Link
                to="/contact"
                className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
              >
                Contacto
              </Link>
            </li>
          )}
        </ul>

        {/* User Icon and Logout Dropdown (Derecha) */}
        <div className="flex items-center">
          {/* Menu Toggle (Mobile) */}
          <div
            className="md:hidden text-white text-2xl cursor-pointer mr-4"
            onClick={toggleMenu}
          >
            ☰
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex items-center gap-2"
              >
                <User size={20} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-20">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-white font-medium py-1 px-4 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
