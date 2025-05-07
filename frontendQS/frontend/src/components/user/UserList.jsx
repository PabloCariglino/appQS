import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa"; // Importamos el ícono de papelera
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const basePath = role === "ADMIN" ? "/admin" : "/operator";

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
    navigate(`${basePath}/register-user`);
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
      <div className="flex-grow mt-5 px-4 sm:px-6 md:px-10 py-10">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="w-full max-w-[96vw] mx-auto border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
          <h2 className="text-center text-2xl md:text-3xl font-bold mb-2 text-red-600">
            Lista de Usuarios
          </h2>
          {/* Botón de acción */}
          <div className="flex justify-start mb-4">
            <button
              onClick={handleRegisterUserClick}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
            >
              <FaPlus className="text-sm sm:text-base" />
              Registrar Usuario
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-64 p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
            />
          </div>

          {/* Tabla de usuarios */}
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto max-h-[calc(99vh-20rem)] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
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
                          className="text-red-600 hover:text-red-700 transition-colors duration-300"
                        >
                          <FaTrash className="text-lg" />
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
      </div>
    </div>
  );
}

export default UserList;
