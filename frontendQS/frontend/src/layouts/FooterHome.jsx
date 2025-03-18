import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const FooterHome = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - About */}
          <div className="space-y-4">
            <img
              src="/lovable-uploads/c52d52bd-d0a2-4f80-b8dc-51dfee23d081.png"
              alt="Quick Solutions Logo"
              className="h-16 mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Especialistas en el diseño, fabricación e instalación de frentes
              de parrillas a medida para su hogar, garantizando calidad y
              durabilidad.
            </p>
            <div className="flex space-x-4 pt-4">
              <a
                href="https://facebook.com"
                className="text-gray-300 hover:text-grill transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                className="text-gray-300 hover:text-grill transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-300 hover:text-grill transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Servicios</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/servicios/diseno"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Diseño personalizado
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios/fabricacion"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Fabricación de frentes
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios/instalacion"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Instalación profesional
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios/mantenimiento"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Mantenimiento y reparación
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios/accesorios"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Accesorios para parrillas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Enlaces rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/sobre-nosotros"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/proyectos"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Proyectos realizados
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonios"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Testimonios
                </Link>
              </li>
              <li>
                <Link
                  to="/preguntas-frecuentes"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-grill mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Av. Principal 1234, Buenos Aires, Argentina
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-grill flex-shrink-0" />
                <span className="text-gray-300 text-sm">+54 11 1234-5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-grill flex-shrink-0" />
                <a
                  href="mailto:info@quicksolutions.com"
                  className="text-gray-300 hover:text-grill transition-colors text-sm"
                >
                  info@quicksolutions.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Quick Solutions. Todos los derechos
              reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link
                    to="/terminos"
                    className="text-gray-400 hover:text-grill transition-colors text-sm"
                  >
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacidad"
                    className="text-gray-400 hover:text-grill transition-colors text-sm"
                  >
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterHome;
