import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaQrcode, FaTruck } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { backendLogout, getCurrentUser } from "../auth/AuthService";
import useAuthContext from "../auth/UseAuthContext";

function NavbarDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScannerDropdownOpen, setIsScannerDropdownOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const { isLoggedIn, role, setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef(null);
  const scannerDropdownRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

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
    setIsOpen((prev) => !prev);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleScannerDropdown = () => {
    setIsScannerDropdownOpen(!isScannerDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutsideUserDropdown = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideUserDropdown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideUserDropdown);
    };
  }, [isUserDropdownOpen]);

  useEffect(() => {
    const handleClickOutsideScannerDropdown = (event) => {
      if (
        scannerDropdownRef.current &&
        !scannerDropdownRef.current.contains(event.target)
      ) {
        setIsScannerDropdownOpen(false);
      }
    };

    if (isScannerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideScannerDropdown);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutsideScannerDropdown
      );
    };
  }, [isScannerDropdownOpen]);

  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
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
      className={`fixed top-0 w-full h-20 z-10 transition-all duration-300 ${
        isHome ? "bg-transparent absolute" : "bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-full md:px-6 lg:px-8">
        {/* Logo (Izquierda) */}
        <div onClick={() => navigate(getHomePath())} className="cursor-pointer">
          <img
            src="/assets/LOGO-blanco2.jpg"
            alt="Logo Empresa"
            className="h-12 w-auto sm:h-14"
          />
        </div>

        {/* Navigation Links (Centrado en pantallas grandes) */}
        <ul
          ref={menuRef}
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:items-center md:gap-4 lg:gap-6 absolute md:static top-20 left-0 right-0 bg-gray-800 md:bg-transparent p-4 md:p-0 z-10 md:flex-1 md:justify-center md:max-w-[90%] lg:max-w-4xl md:mx-auto`}
        >
          {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
            <>
              <li className="my-1 md:my-0">
                <Link
                  to={getHomePath()}
                  className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
                >
                  Inicio
                </Link>
              </li>
              {isLoggedIn && role === "ADMIN" && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/part-state-dashboard`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
                  >
                    Produccion
                  </Link>
                </li>
              )}

              {isLoggedIn && role === "OPERATOR" && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/user-tasks`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
                  >
                    Mis Tareas
                  </Link>
                </li>
              )}
              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0">
                  <Link
                    to={`${basePath}/project-list`}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
                  >
                    Proyectos
                  </Link>
                </li>
              )}
              {/* Dropdown para Scanner */}
              {isLoggedIn && (role === "ADMIN" || role === "OPERATOR") && (
                <li className="my-1 md:my-0 relative" ref={scannerDropdownRef}>
                  <button
                    onClick={toggleScannerDropdown}
                    className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
                  >
                    Scanner
                  </button>
                  {isScannerDropdownOpen && (
                    <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-52 bg-white rounded-lg shadow-md z-20">
                      <Link
                        to={`${basePath}/part-scanner`}
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsScannerDropdownOpen(false)}
                      >
                        <FaQrcode className="text-sm text-blue-600 mr-2" />
                        Ingreso Recepción
                      </Link>
                      <Link
                        to={`${basePath}/packaged-part-scanner`}
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsScannerDropdownOpen(false)}
                      >
                        <FaTruck className="text-sm text-blue-600 mr-2" />
                        Salida a Instalación
                      </Link>
                    </div>
                  )}
                </li>
              )}
            </>
          )}
          {isLoggedIn && role === "ADMIN" && (
            <li className="my-1 md:my-0">
              <Link
                to="/admin/user-list"
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
              >
                Usuarios
              </Link>
            </li>
          )}

          {isLoggedIn && role === "OPERATOR" && (
            <li className="my-1 md:my-0">
              <Link
                to={`${basePath}/operator-performance`}
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
              >
                Rendimiento
              </Link>
            </li>
          )}
          {!isLoggedIn && (
            <li className="my-1 md:my-0">
              <Link
                to="/contact"
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex justify-center items-center whitespace-nowrap text-center text-sm sm:text-base w-full"
              >
                Contacto
              </Link>
            </li>
          )}
        </ul>

        {/* User Icon, Username, and Logout Dropdown (Derecha) */}
        <div className="flex items-center">
          <div
            ref={hamburgerRef}
            className="md:hidden text-white text-2xl cursor-pointer mr-4"
            onClick={toggleMenu}
          >
            ☰
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 flex items-center gap-2"
              >
                <User size={18} className="sm:size-6" />
                <span className="text-base">{username || "Usuario"}</span>
              </button>
              {isUserDropdownOpen && (
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
              className="text-white font-medium py-1 px-3 rounded hover:bg-gray-600 hover:text-gray-200 transition-all duration-300 text-sm sm:text-base"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarDashboard;
