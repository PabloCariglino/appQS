import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
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
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
      setError("No se pudo cambiar el estado del usuario.");
    }
  };

  return (
    <>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Lista de Usuarios</h2>
          <button className="btn btn-primary" onClick={handleRegisterUserClick}>
            Registrar Usuario
          </button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {users.length > 0 ? (
          <table className="table table-striped table-bordered mt-4">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.userID}>
                  <td>{index + 1}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        user.userStatus ? "btn-success" : "btn-danger"
                      }`}
                      onClick={() => handleChangeUserStatus(user.userID)}
                    >
                      {user.userStatus ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info mt-4">
            No hay usuarios registrados.
          </div>
        )}
      </div>
      <BackButton />
    </>
  );
}

export default UserList;
