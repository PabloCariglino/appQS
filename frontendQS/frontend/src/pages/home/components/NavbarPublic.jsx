import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NavbarPublic = ({ isFixed = false }) => {
  const [showNavbar, setShowNavbar] = useState(isFixed);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Manejar el scroll para mostrar/ocultar el navbar (si no está fijo)
  useEffect(() => {
    if (isFixed) return;

    const handleScroll = () => {
      setShowNavbar(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFixed]);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Función para manejar el scroll suave a las secciones
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Botón de Login siempre visible */}
      <div className="absolute top-0 right-0 h-full flex items-center pr-6 md:pr-10">
        <a
          href="/login"
          className="bg-grill text-white px-4 py-2 rounded hover:bg-grill-dark transition-colors duration-300"
        >
          Login
        </a>
      </div>

      {/* Navbar animado (sin el botón de Login) */}
      <motion.nav
        className="w-full bg-white shadow-md py-4 px-6 md:px-10 flex justify-between items-center"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: showNavbar ? 0 : -100, opacity: showNavbar ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <a href="/">
            <img
              src="/public/assets/LOGO-sin-fondo2.png"
              alt="Logo"
              className="h-12"
            />
          </a>
        </div>

        {/* Ícono del menú hamburguesa (visible solo en móviles) */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X className="w-8 h-8 text-gray-800" />
            ) : (
              <Menu className="w-8 h-8 text-gray-800" />
            )}
          </button>
        </div>

        {/* Enlaces del navbar (visible en pantallas grandes) */}
        <div className="hidden md:flex flex-1 justify-center space-x-6">
          <a
            href="/"
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Inicio
          </a>
          <a
            href="#servicios"
            onClick={(e) => handleScrollToSection(e, "#servicios")}
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Servicios
          </a>
          <a
            href="#proyectos"
            onClick={(e) => handleScrollToSection(e, "#proyectos")}
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Proyectos
          </a>
          <a
            href="#contacto"
            onClick={(e) => handleScrollToSection(e, "#contacto")}
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Contacto
          </a>
        </div>

        {/* Espacio vacío para mantener el centrado */}
        <div className="hidden md:block w-[100px]"></div>
      </motion.nav>

      {/* Menú desplegable para móviles */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-16 left-0 w-full h-screen bg-white flex flex-col items-center justify-center space-y-6 md:hidden z-40"
        >
          <a
            href="#inicio"
            onClick={(e) => handleScrollToSection(e, "#inicio")}
            className="text-gray-800 text-lg hover:text-grill transition-colors duration-300"
          >
            Inicio
          </a>
          <a
            href="#servicios"
            onClick={(e) => handleScrollToSection(e, "#servicios")}
            className="text-gray-800 text-lg hover:text-grill transition-colors duration-300"
          >
            Servicios
          </a>
          <a
            href="#proyectos"
            onClick={(e) => handleScrollToSection(e, "#proyectos")}
            className="text-gray-800 text-lg hover:text-grill transition-colors duration-300"
          >
            Proyectos
          </a>
          <a
            href="#contacto"
            onClick={(e) => handleScrollToSection(e, "#contacto")}
            className="text-gray-800 text-lg hover:text-grill transition-colors duration-300"
          >
            Contacto
          </a>
          <a
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="bg-grill text-white px-6 py-2 rounded hover:bg-grill-dark transition-colors duration-300"
          >
            Login
          </a>
        </div>
      )}
    </div>
  );
};

export default NavbarPublic;
