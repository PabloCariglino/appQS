const FooterDashboard = () => {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 px-6 md:px-10 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Descripción */}
        <p className="text-gray-400 text-sm">
          © 2025 Quick Solutions. Todos los derechos reservados.
        </p>

        {/* Botones */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <a
            href="#"
            className="text-gray-300 hover:text-grill transition-colors duration-300 text-sm"
          >
            Términos de servicio
          </a>
          <a
            href="#"
            className="text-gray-300 hover:text-grill transition-colors duration-300 text-sm"
          >
            Política de privacidad
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterDashboard;
