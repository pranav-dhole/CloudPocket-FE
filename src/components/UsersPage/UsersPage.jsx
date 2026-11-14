import { useEffect, useState } from "react";
import "./UsersPage.css";
import { useNavigate } from "react-router";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
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
                  {user.isLoggedIn !== undefined &&
                    user.isLoggedIn !== null && (
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
