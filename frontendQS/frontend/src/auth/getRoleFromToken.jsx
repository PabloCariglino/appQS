import jwtDecode from "jwt-decode";

export const getRoleFromToken = () => {
  const token = sessionStorage.getItem("token"); // Usa el mismo storage donde guardas el token
  if (!token) return null;
  try {
    const decodedToken = jwtDecode(token);
    console.log("Token decodificado:", decodedToken); // Esto mostrará todos los claims del token
    return decodedToken.roles || null; // Suponiendo que el claim se llama 'roles'
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};
