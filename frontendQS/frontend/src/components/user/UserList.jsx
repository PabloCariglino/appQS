import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/user-dashboard/user-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error);
        setError(
          error.response?.data || "No se pudo obtener la lista de usuarios."
        );
      }
    };

    fetchUsers();
  }, []);

  const handleRegisterUserClick = () => {
    navigate("/register-user");
  };

  const handleChangeUserStatus = async (userID) => {
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8080/api/user-dashboard/change-user-status/${userID}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userID === userID
            ? { ...user, userStatus: !user.userStatus }
            : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userID === userID
            ? { ...user, userStatus: !user.userStatus }
            : user
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
      setError("No se pudo cambiar el estado del usuario.");
    }
  };

  const handleDeleteUser = async () => {
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/user-dashboard/delete-user/${userToDelete.userID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userID !== userToDelete.userID)
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => user.userID !== userToDelete.userID)
      );
      setShowModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      setError("No se pudo eliminar el usuario.");
      setShowModal(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          [user.userID, user.userName, user.email].some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Lista de Usuarios
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="w-full max-w-[89vw] mx-auto border border-dashboard-border rounded-lg shadow-md p-6 bg-dashboard-background">
          {/* Botón de acción */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRegisterUserClick}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Registrar Usuario
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
            />
          </div>

          {/* Tabla de usuarios */}
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre</th>
                    <th className="p-3 text-center">Email</th>
                    <th className="p-3 text-center">Rol</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.userID}
                      className="border-b border-dashboard-border hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text">
                        {user.userID}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {user.userName}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {user.email}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {user.role}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleChangeUserStatus(user.userID)}
                          className={`font-medium py-1 px-3 rounded-lg transition-colors duration-300 ${
                            user.userStatus
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {user.userStatus ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
              No hay usuarios registrados.
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold text-dashboard-text mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-dashboard-text mb-6">
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                <span className="font-semibold">{userToDelete?.userName}</span>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-300 hover:bg-gray-400 text-dashboard-text font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón Volver centrado */}
        <div className="mt-6 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
}

export default UserList;
