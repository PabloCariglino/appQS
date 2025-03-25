import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, login } from "../../../auth/AuthService";
import useAuthContext from "../../../auth/UseAuthContext";
import FooterPublic from "./../components/FooterPublic";
import NavbarPublic from "./../components/NavbarPublic";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        const role = getRoleFromToken();
        console.log("Rol obtenido desde el token:", role);

        if (role) {
          setIsLoggedIn(true);
          setRole(role);

          if (role === "ADMIN") {
            navigate("/admin");
          } else if (role === "OPERATOR") {
            navigate("/operator");
          } else {
            setError("Rol no autorizado.");
          }
        } else {
          setError("No se pudo determinar el rol del usuario.");
        }
      } else {
        setError("Error al iniciar sesión.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas o error del servidor.");
    }
  };

  return (
    <div>
      <div className="relative min-h-screen flex flex-col">
        <NavbarPublic isFixed={true} />
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/fondo-parrilla-encendida.jpg)",
          }}
        ></div>
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Form Container */}
        <div className="relative flex items-center justify-center flex-grow py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Iniciar Sesión
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-grill hover:bg-grill-dark text-white rounded-md font-medium transition-all"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>{" "}
        </div>
      </div>{" "}
      <FooterPublic />
    </div>
  );
};

export default Login;
