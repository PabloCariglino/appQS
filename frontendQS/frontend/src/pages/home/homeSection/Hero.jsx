import { ChevronDown } from "lucide-react";
import PropTypes from "prop-types";

const Hero = ({ scrollToContent }) => {
  return (
    <section className="hero-section relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${
            import.meta.env.BASE_URL
          }lovable-uploads/c52d52bd-d0a2-4f80-b8dc-51dfee23d081.png)`,
          filter: "brightness(0.8)",
        }}
      ></div>

      {/* Hero Content */}
      <div className="relative h-full flex flex-col justify-center container mx-auto px-6">
        <div className="max-w-xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Frentes de parrilla <br />
            <span className="text-grill">a medida</span>
          </h1>

          <div className="h-1 w-20 bg-grill mb-6"></div>

          <ul className="space-y-3 text-white mb-8">
            <li className="flex items-center space-x-2">
              <span className="text-grill">✓</span>
              <span>Cotización en 24hs</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-grill">✓</span>
              <span>Asesoramiento personalizado</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-grill">✓</span>
              <span>Envío y colocación</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="#cotizacion"
              className="py-3 px-8 bg-grill hover:bg-grill-dark text-white rounded-md font-medium transition-all transform hover:scale-105"
            >
              Solicitar cotización
            </a>
            <a
              href="#servicios"
              className="py-3 px-8 bg-white hover:bg-gray-100 text-gray-800 rounded-md font-medium transition-all transform hover:scale-105"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Scroll Down Button */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown size={30} />
        </button>
      </div>
    </section>
  );
};

Hero.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
};

export default Hero;
