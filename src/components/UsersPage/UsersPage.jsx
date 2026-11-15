import { useEffect, useState } from "react";
import "./UsersPage.css";
import { useNavigate } from "react-router";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${BASE_URL}/user/users`, {
        credentials: "include",
      });

      if (!res.ok) {
        navigate("/");
        throw new Error("Unable to fetch users.");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError("Could not load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout(userId) {
    try {
      const res = await fetch(`${BASE_URL}/user/logoutByAdmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json();
      fetchUsers();
    } catch (err) {
      console.log("Logout by admin error: ", err);
      setError("Could not logout the user. Please try again.");
    }
  }

  async function handleDelete(userId) {
    try {
      const res = await fetch(`${BASE_URL}/user/deleteByAdmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json();
      fetchUsers();
    } catch (err) {
      console.log("Delete by admin error: ", err);
      setError("Could not delete the user. Please try again.");
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });

      if (!res.ok) {
        setCurrentUser(null);
        return;
      }

      const data = await res.json();

      setCurrentUser(data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="users-page">Loading users...</div>;
  }

  if (error) {
    return <div className="users-page users-page__error">{error}</div>;
  }

  return (
    <main className="users-page">
      <header className="users-page__header">
        <div>
          <p className="users-page__eyebrow">Administration</p>
          <h1>Users</h1>
          <p>Manage and monitor registered users.</p>
          <h3>
            {currentUser.name} : {currentUser.role}
          </h3>
        </div>

        <span className="users-page__count">{users.length} users</span>
      </header>

      <section className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>isLoggedIn</th>
              <th></th>
              {currentUser.role === "Admin" && <th></th>}
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`users-status ${
                        user.isLoggedIn
                          ? "users-status--online"
                          : "users-status--offline"
                      }`}
                    >
                      <span className="users-status__dot" />
                      {user.isLoggedIn ? "Logged In" : "Logged Out"}
                    </span>
                  </td>
                  {currentUser.role !== "User" && (
                    <td>
                      {user.isLoggedIn ? (
                        <button
                          className="logout-btn"
                          onClick={() => handleLogout(user.id)}
                        >
                          Logout
                        </button>
                      ) : (
                        <div>Logged out</div>
                      )}
                    </td>
                  )}
                  {currentUser.role === "Admin" && user && (
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="users-table__empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
