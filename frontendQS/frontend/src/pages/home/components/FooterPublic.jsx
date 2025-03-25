const FooterPublic = () => {
  return (
    <footer className="bg-[#1A202C] text-white py-6 px-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <div>
          <p>
            Especialistas en el diseño, fabricación e instalación de frentes de
            parrillas a medida para su hogar, garantizando calidad y
            durabilidad.
          </p>
          <div className="flex justify-start space-x-4 mt-4">
            <a href="#" className="text-white hover:text-grill">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-grill">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10-10S6.486 2 12 2zm0 2c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.293-.293a1 1 0 011.414 1.414l-1.5 1.5a1 1 0 01-1.414-1.414l1.5-1.5z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-grill">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                <span className="text-grill mr-2">📍</span> Av. Principal 1234,
                Buenos Aires, Argentina
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
  );
};

export default FooterPublic;
