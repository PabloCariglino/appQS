import jwtDecode from "jwt-decode";

export const getRoleFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null; // No hay token
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role; // Suponiendo que el token tiene el campo `role`
  } catch (error) {
    return null; // Token inválido o expirado
  }
};
