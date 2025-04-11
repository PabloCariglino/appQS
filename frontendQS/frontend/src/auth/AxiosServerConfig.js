// AxiosServerConfig.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "./AuthService";

const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.warn("Token expirado, redirigiendo...");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("loginTime");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expirado"));
      }
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token enviado:", token);
    } else {
      console.warn("No se encontró token para la solicitud.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("Error 401/403 detectado:", error.response);
      // No redirigir automáticamente, dejar que el componente maneje el error
    }
    return Promise.reject(error);
  }
);

export default api;
