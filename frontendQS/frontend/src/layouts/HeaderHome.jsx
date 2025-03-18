import { MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HeaderHome = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full py-4 px-6 transition-all duration-300 z-50 ${
        isScrolled ? "fixed bg-white shadow-md" : "absolute bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="z-10">
            <img
              src="/lovable-uploads/c52d52bd-d0a2-4f80-b8dc-51dfee23d081.png"
              alt="Quick Solutions Logo"
              className="h-12 md:h-14"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-grill transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link
              to="/servicios"
              className="text-gray-700 hover:text-grill transition-colors font-medium"
            >
              Servicios
            </Link>
            <Link
              to="/proyectos"
              className="text-gray-700 hover:text-grill transition-colors font-medium"
            >
              Proyectos
            </Link>
            <Link
              to="/contacto"
              className="text-gray-700 hover:text-grill transition-colors font-medium"
            >
              Contacto
            </Link>
            <Link
              to="/login"
              className="py-2 px-6 bg-grill text-white rounded-md transition-all hover:bg-grill-dark"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 z-10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <Link
              to="/"
              className="text-xl font-medium text-gray-700 hover:text-grill transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/servicios"
              className="text-xl font-medium text-gray-700 hover:text-grill transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Servicios
            </Link>
            <Link
              to="/proyectos"
              className="text-xl font-medium text-gray-700 hover:text-grill transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Proyectos
            </Link>
            <Link
              to="/contacto"
              className="text-xl font-medium text-gray-700 hover:text-grill transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contacto
            </Link>
            <Link
              to="/login"
              className="py-2 px-6 bg-grill text-white rounded-md hover:bg-grill-dark transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderHome;
