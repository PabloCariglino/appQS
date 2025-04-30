import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { backendLogout, getCurrentUser } from "../auth/AuthService";
import useAuthContext from "../auth/UseAuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate(); // Importamos y definimos useNavigate
  const location = useLocation();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (isLoggedIn) {
        const userData = await getCurrentUser();
        if (userData) {
          setUsername(userData.userName);
        }
      }
    };
    fetchUsername();
  }, [isLoggedIn]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideDropdown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await backendLogout(setIsLoggedIn, setRole);
      setUsername(null);
      console.log("Usuario deslogueado correctamente.");
    } catch (error) {
      console.error("Error al desloguear:", error);
    }
  };

  const getHomePath = () => {
    if (isLoggedIn) {
      if (role === "ADMIN") {
        return "/admin";
      } else if (role === "OPERATOR") {
        return "/operator";
      }
    }
    return "/";
  };

  const isHome = location.pathname === "/" && !isLoggedIn;
  const basePath =
    role === "ADMIN" ? "/admin" : role === "OPERATOR" ? "/operator" : "";

  return (
    <nav
      className={`fixed top-0 w-full z-10 transition-all duration-300 ${
        isHome ? "bg-transparent absolute" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 md:px-6 lg:px-8">
        {/* Logo (Izquierda) */}
        <div onClick={() => navigate(getHomePath())} className="cursor-pointer">
          <img
            src="/assets/LOGO-blanco2.jpg"
            alt="Logo Empresa"
            className="h-10 w-auto sm:h-12"
          />
        </div>

        {/* Navigation Links (Centrado en pantallas grandes) */}
        <ul
          ref={menuRef}
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:items-center md:gap-4 lg:gap-6 absolute md:static top-14 left-0 right-0 bg-gray-800 md:bg-transparent p-4 md:p-0 z-10 md:flex-1 md:justify-center md:max-w-[90%] lg:max-w-4xl md:mx-auto`}
        >
          {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
            <>
              <li className="my-1 md:my-0">
                <Link
                  to={getHomePath()}
                  className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
                >
                  Inicio
                </Link>
              </li>
              {isLoggedIn && role === "ADMIN" && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/tasks`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
                  >
                    Tareas
                  </Link>
                </li>
              )}
              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/user-tasks`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
                  >
                    Mis Tareas
                  </Link>
                </li>
              )}
              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/project-list`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
                  >
                    Proyectos
                  </Link>
                </li>
              )}
              <li className="my-1 md:my-0">
                <Link
                  to={`${basePath}/part-scanner`}
                  className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
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
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
              >
                Usuarios
              </Link>
            </li>
          )}
          {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
            <li className="my-1 md:my-0">
              <Link
                to={`${basePath}/operator-performance`}
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
              >
                Rendimiento
              </Link>
            </li>
          )}
          {!isLoggedIn && (
            <li className="my-1 md:my-0">
              <Link
                to="/contact"
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base"
              >
                Contacto
              </Link>
            </li>
          )}
        </ul>

        {/* User Icon, Username, and Logout Dropdown (Derecha) */}
        <div className="flex items-center">
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
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 flex items-center gap-2"
              >
                <User size={18} className="sm:size-6" />
                <span className="text-base">{username || "Usuario"}</span>
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
              className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-grill transition-all duration-300 text-sm sm:text-base"
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
