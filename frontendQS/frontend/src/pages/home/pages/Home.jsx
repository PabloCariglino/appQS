import { motion } from "framer-motion"; // Asegúrate de tener framer-motion instalado
import { useEffect, useState } from "react";
import "../Home.css"; // Importamos Home.css para estilos personalizados

const Home = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar el navbar apenas el usuario empieza a scrollear (scrollY > 0)
      setShowNavbar(window.scrollY > 0);

      // Mostrar el botón de scroll top después de pasar la sección Hero (h-screen)
      const heroSection = document.querySelector(".hero-section");
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowScrollTop(heroBottom <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });

  const [formStatus, setFormStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando datos:", formData);
      setFormStatus("Mensaje enviado con éxito!");
      setFormData({ nombre: "", correo: "", telefono: "", mensaje: "" });
    } catch (error) {
      setFormStatus("Error al enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  // URL de WhatsApp con el número de la empresa (ajústalo al número real)
  const whatsappNumber = "+541112345678"; // Reemplaza con el número de tu empresa
  const whatsappMessage = "¡Hola! Quiero más información sobre sus servicios.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navbar con transición lenta */}
      <motion.nav
        className="fixed top-0 left-0 w-full bg-white shadow-md z-50 py-4 px-10 flex justify-between items-center"
        initial={{ y: -100, opacity: 0 }} // Comienza fuera de la vista
        animate={{ y: showNavbar ? 0 : -100, opacity: showNavbar ? 1 : 0 }} // Transición al scrollear
        transition={{ duration: 0.6, ease: "easeInOut" }} // Transición más lenta (0.6s)
      >
        <div className="flex items-center">
          <img src="/assets/LOGO-sin-fondo2.png" alt="Logo" className="h-12" />
        </div>
        <div className="space-x-6">
          <a
            href="#inicio"
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Inicio
          </a>
          <a
            href="#servicios"
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Servicios
          </a>
          <a
            href="#proyectos"
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Proyectos
          </a>
          <a
            href="#contacto"
            className="text-gray-800 hover:text-grill transition-colors duration-300"
          >
            Contacto
          </a>
          <a
            href="#login"
            className="bg-grill text-white px-4 py-2 rounded hover:bg-grill-dark transition-colors duration-300"
          >
            Login
          </a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section relative h-screen">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex items-center h-full justify-between px-10">
          <div className="text-white text-left">
            <h1 className="text-6xl font-bold mb-4 leading-tight">
              Frentes <span className="block">de parrilla</span>{" "}
              <span className="text-grill block">a medida</span>
            </h1>
            <div className="space-y-2 text-lg">
              <p>✓ Cotización en 24hs</p>
              <p>✓ Asesoramiento personalizado</p>
              <p>✓ Envío y colocación</p>
            </div>
            <div className="mt-6 space-x-4">
              <button className="bg-grill text-white px-6 py-2 rounded hover:bg-grill-dark transition-colors duration-300">
                Solicitar cotización
              </button>
              <button className="border border-white text-white px-6 py-2 rounded hover:bg-white hover:text-gray-800 transition-colors duration-300">
                Ver servicios
              </button>
            </div>
          </div>
          <img
            src="/assets/QUICK-solutions-logo.png"
            alt="Quick Solutions Logo"
            className="h-80"
          />
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-16 px-10 bg-white">
        <h2 className="text-4xl font-bold text-center mb-4">
          Nuestros <span className="text-grill">Servicios</span>
        </h2>
        <div className="w-16 h-1 bg-grill mx-auto mb-8"></div>
        <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Ofrecemos soluciones completas para la construcción e instalación de
          frentes de parrillas personalizados, adaptados a tus necesidades.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">📏</div>

            <h3 className="text-xl font-semibold mb-2">Diseño a medida</h3>
            <p className="text-gray-600">
              Creamos frentes de parrilla que se adaptan perfectamente a tu
              espacio y estilo, garantizando una integración perfecta con tu
              hogar.
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">🔥</div>

            <h3 className="text-xl font-semibold mb-2">
              Materiales de alta calidad
            </h3>
            <p className="text-gray-600">
              Utilizamos solo los mejores materiales, resistentes al calor y
              duraderos, para asegurar que tu inversión perdure en el tiempo.
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">🔧</div>

            <h3 className="text-xl font-semibold mb-2">
              Instalación profesional
            </h3>
            <p className="text-gray-600">
              Nuestro equipo especializado se encarga de la instalación
              completa, asegurando un funcionamiento óptimo y seguro.
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">👤</div>

            <h3 className="text-xl font-semibold mb-2">
              Asesoramiento personalizado
            </h3>
            <p className="text-gray-600">
              Te guiamos durante todo el proceso, desde la elección del diseño
              hasta la instalación final, para que logres la parrilla de tus
              sueños.
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">🚚</div>

            <h3 className="text-xl font-semibold mb-2">Envío y colocación</h3>
            <p className="text-gray-600">
              Nos encargamos de la logística completa, llevando todo lo
              necesario hasta tu domicilio y realizando una instalación
              impecable.
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 text-center"
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="text-grill mb-4 text-2xl">🛡️</div>

            <h3 className="text-xl font-semibold mb-2">Garantía y soporte</h3>
            <p className="text-gray-600">
              Todos nuestros trabajos cuentan con garantía y ofrecemos servicio
              post-venta para cualquier consulta o mantenimiento que necesites.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proceso Section */}
      <section id="proceso" className="py-16 px-10 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-4">
          Nuestro <span className="text-grill">Proceso</span>
        </h2>
        <div className="w-16 h-1 bg-grill mx-auto mb-8"></div>
        <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Conoce cómo trabajamos para garantizar un resultado de calidad, desde
          la consulta inicial hasta la instalación final.
        </p>
        <div className="relative flex justify-between max-w-5xl mx-auto">
          <div className="absolute top-6 left-0 h-1 bg-gray-300 w-full"></div>
          <motion.div
            className="absolute top-6 left-0 h-1 bg-grill"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-grill text-white rounded-full flex items-center justify-center mb-2">
              1
            </div>
            <h3 className="text-lg font-semibold">Consulta inicial</h3>
            <p className="text-gray-600 max-w-xs">
              Conversamos sobre tus necesidades, espacio disponible y
              preferencias de diseño para tu frente de parrilla.
            </p>
          </div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center mb-2">
              2
            </div>
            <h3 className="text-lg font-semibold">Diseño personalizado</h3>
            <p className="text-gray-600 max-w-xs">
              Desarrollamos un diseño a medida que se adapte perfectamente a tu
              espacio y cumple con tus requisitos específicos.
            </p>
          </div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center mb-2">
              3
            </div>
            <h3 className="text-lg font-semibold">Presupuesto detallado</h3>
            <p className="text-gray-600 max-w-xs">
              Te presentamos un presupuesto transparente con todos los costos,
              materiales y tiempos de ejecución.
            </p>
          </div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center mb-2">
              4
            </div>
            <h3 className="text-lg font-semibold">Fabricación</h3>
            <p className="text-gray-600 max-w-xs">
              Comenzamos la fabricación de tu frente de parrilla utilizando los
              mejores materiales y técnicas de construcción.
            </p>
          </div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center mb-2">
              5
            </div>
            <h3 className="text-lg font-semibold">Instalación</h3>
            <p className="text-gray-600 max-w-xs">
              Nuestro equipo especializado se encarga de la instalación
              completa, asegurando un funcionamiento óptimo.
            </p>
          </div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center mb-2">
              6
            </div>
            <h3 className="text-lg font-semibold">Entrega y garantía</h3>
            <p className="text-gray-600 max-w-xs">
              Realizamos la entrega final con todas las verificaciones y te
              brindamos la garantía de nuestro trabajo.
            </p>
          </div>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section id="proyectos" className="py-16 px-10 bg-white">
        <h2 className="text-4xl font-bold text-center mb-4">
          Proyectos <span className="text-grill">Destacados</span>
        </h2>
        <div className="w-16 h-1 bg-grill mx-auto mb-8"></div>
        <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Explora nuestra galería de trabajos realizados y descubre las
          posibilidades para tu hogar.
        </p>
        <div className="relative flex justify-center items-center max-w-4xl mx-auto">
          <button className="absolute left-0 text-gray-500 z-10">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0L5.586 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="w-full relative">
            <img
              src="/assets/project-image.jpg"
              alt="Proyecto destacado"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold">Parrilla Moderna</p>
              <p className="text-sm">
                Frente de parrilla con diseño contemporáneo, ideal para espacios
                urbanos modernos.
              </p>
              <a href="#" className="text-grill hover:underline mt-1 block">
                Ver detalles
              </a>
            </div>
            <button className="absolute top-4 right-4 bg-grill text-white px-4 py-1 rounded hover:bg-grill-dark transition-colors duration-300">
              Residencial
            </button>
          </div>
          <button className="absolute right-0 text-gray-500 z-10">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L11.586 10 7.293 5.707a1 1 0 011.414-1.414L14.414 10l-5.707 5.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <span className="w-3 h-3 bg-grill rounded-full"></span>
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-12 bg-[#1A202C] text-white text-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-[#2D3748] rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-grill">500+</h3>
            <p className="text-gray-400">Proyectos completados</p>
          </div>
          <div className="p-6 bg-[#2D3748] rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-grill">50+</h3>
            <p className="text-gray-400">Diseños exclusivos</p>
          </div>
          <div className="p-6 bg-[#2D3748] rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-grill">98%</h3>
            <p className="text-gray-400">Clientes satisfechos</p>
          </div>
          <div className="p-6 bg-[#2D3748] rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-grill">10+</h3>
            <p className="text-gray-400">Años de experiencia</p>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-16 px-10 bg-white">
        <h2 className="text-4xl font-bold text-center mb-4">
          <span className="text-grill">Contacto</span>
        </h2>
        <div className="w-16 h-1 bg-grill mx-auto mb-8"></div>
        <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">
          Solicita tu cotización o consulta cualquier duda que tengas. Estamos
          aquí para ayudarte.
        </p>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Solicita tu cotización
            </h3>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-grill"
                required
              />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder="tucorreo@ejemplo.com"
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-grill"
                required
              />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+54 (11) 1234-5678"
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-grill"
                required
              />
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                placeholder="Describe tu proyecto o consulta"
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-grill"
                rows="4"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-grill text-white p-2 rounded hover:bg-grill-dark transition-colors duration-300"
              >
                Enviar mensaje
              </button>
              {formStatus && (
                <p
                  className={`mt-2 text-center ${
                    formStatus.includes("éxito")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {formStatus}
                </p>
              )}
            </form>
          </div>
          <div className="bg-[#1A202C] text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Información de contacto
            </h3>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">📍</span> Av. Principal 1234,
              Buenos Aires, Argentina
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">📞</span> +54 11 1234-5678
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">📞</span> +54 11 8765-4321
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">📧</span>{" "}
              info@quicksolutions.com
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">📧</span>{" "}
              ventas@quicksolutions.com
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">⏰</span> Lunes a Viernes: 9:00
              AM - 6:00 PM
            </p>
            <p className="flex items-center mb-2">
              <span className="text-grill mr-2">⏰</span> Sábados: 9:00 AM -
              1:00 PM
            </p>
            <p className="mt-4">Síguenos en redes sociales</p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-grill hover:text-grill-dark">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-grill hover:text-grill-dark">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10S6.486 2 12 2zm0 2c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.293-.293a1 1 0 011.414 1.414l-1.5 1.5a1 1 0 01-1.414-1.414l1.5-1.5z" />
                </svg>
              </a>
              <a href="#" className="text-grill hover:text-grill-dark">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.459 4.79c-.81.36-1.68.61-2.59.72A4.52 4.52 0 0021.85 2.8a9.05 9.05 0 01-2.87 1.1 4.51 4.51 0 00-7.68 4.11 12.79 12.79 0 01-9.3-4.71 4.51 4.51 0 001.39 6.02 4.49 4.49 0 01-2.04-.56v.06a4.51 4.51 0 003.62 4.42 4.49 4.49 0 01-2.03.08 4.51 4.51 0 004.21 3.13 9.05 9.05 0 01-5.6 1.93c-.36 0-.72-.02-1.07-.06a12.77 12.77 0 006.92 2.03c8.31 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58a9.16 9.16 0 002.25-2.33z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A202C] text-white py-6 px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div>
            <p>
              Especialistas en el diseño, fabricación e instalación de frentes
              de parrillas a medida para su hogar, garantizando calidad y
              durabilidad.
            </p>
            <div className="flex justify-start space-x-4 mt-4">
              <a href="#" className="text-white hover:text-grill">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-grill">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10S6.486 2 12 2zm0 2c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.293-.293a1 1 0 011.414 1.414l-1.5 1.5a1 1 0 01-1.414-1.414l1.5-1.5z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-grill">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.459 4.79c-.81.36-1.68.61-2.59.72A4.52 4.52 0 0021.85 2.8a9.05 9.05 0 01-2.87 1.1 4.51 4.51 0 00-7.68 4.11 12.79 12.79 0 01-9.3-4.71 4.51 4.51 0 001.39 6.02 4.49 4.49 0 01-2.04-.56v.06a4.51 4.51 0 003.62 4.42 4.49 4.49 0 01-2.03.08 4.51 4.51 0 004.21 3.13 9.05 9.05 0 01-5.6 1.93c-.36 0-.72-.02-1.07-.06a12.77 12.77 0 006.92 2.03c8.31 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58a9.16 9.16 0 002.25-2.33z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Servicios</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Diseño personalizado
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Fabricación de frentes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Instalación profesional
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Mantenimiento y reparación
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Accesorios para parrillas
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Enlaces rápidos</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Proyectos realizados
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-grill">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contacto</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-gray-400 flex items-center">
                  <span className="text-grill mr-2">📍</span> Av. Principal
                  1234, Buenos Aires, Argentina
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 flex items-center">
                  <span className="text-grill mr-2">📞</span> +54 11 1234-5678
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 flex items-center">
                  <span className="text-grill mr-2">📧</span>{" "}
                  info@quicksolutions.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-gray-400 text-center">
          © 2025 Quick Solutions. Todos los derechos reservados.
        </p>
        <div className="mt-2 space-x-4 text-center">
          <a href="#" className="text-gray-400 hover:text-grill">
            Términos de servicio
          </a>
          <a href="#" className="text-gray-400 hover:text-grill">
            Política de privacidad
          </a>
        </div>
      </footer>

      {/* Botón de WhatsApp (fijo abajo a la izquierda) */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors duration-300 z-50"
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.486 2 2 6.486 2 12c0 2.126.667 4.097 1.803 5.708L2.5 21.5l4.791-1.303A9.969 9.969 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm4.5 13.5c-.133-.266-.667-.667-1.5-1.167-.833-.5-1.5-.833-1.666-.916-.167-.083-.334-.125-.5-.125s-.334.042-.5.125c-.166.083-.833.416-1.666.916-.833.5-1.367 1-1.5 1.167-.133.166-.227.25-.283.25-.059 0-.159-.084-.3-.25-.141-.166-1.041-1.208-2.541-2.708-1.5-1.5-2-2.625-2-3.25 0-.625.416-1.125 1.25-1.5.833-.375 1.75-.541 2.75-.541.916 0 1.75.25 2.5.75.75.5 1.25 1.083 1.5 1.583.25.5.375.916.375 1.25 0 .334-.083.708-.25 1.125-.167.417-.375.792-.625 1.125-.083.083-.166.167-.25.25.458.458.875.958 1.25 1.5.375.542.625 1.042.75 1.5.083.375.125.708.125 1 0 .584-.208 1.083-.625 1.5-.416.416-1.042.625-1.875.625z" />
        </svg>
      </a>

      {/* Botón de Scroll to Top (fijo abajo a la derecha, aparece tras Hero, con flecha hacia arriba y transición lenta) */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-grill text-white p-3 rounded-full hover:bg-grill-dark transition-colors duration-300 z-50"
        initial={{ y: 50, opacity: 0 }} // Comienza desplazado hacia abajo y con opacidad 0
        animate={{ y: showScrollTop ? 0 : 50, opacity: showScrollTop ? 1 : 0 }} // Transición al aparecer/desaparecer
        transition={{ duration: 0.6, ease: "easeInOut" }} // Transición más lenta (0.6s)
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 15a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L10 12.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 15z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default Home;
