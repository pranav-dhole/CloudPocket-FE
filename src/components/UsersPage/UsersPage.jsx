import { useEffect, useState } from "react";
import "./UsersPage.css";
import { useNavigate } from "react-router";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

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

      if (!res.ok) {
        throw new Error(data?.message || "Logout failed");
      }

      fetchUsers();
    } catch (err) {
      console.log("Logout by admin error: ", err);
      setError("Could not logout the user. Please try again.");
    }
  }

  function openDeleteModal(user) {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;

    setSelectedUser(null);
    setShowDeleteModal(false);
  }

  async function handleDelete(deleteType) {
    if (!selectedUser || isDeleting) return;

    const endpoint =
      deleteType === "soft" ? "/user/softDeleteByAdmin" : "/user/deleteByAdmin";

    try {
      setIsDeleting(true);
      setError("");

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id ?? selectedUser.id,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Delete failed");
      }

      setShowDeleteModal(false);
      setSelectedUser(null);

      await fetchUsers();
    } catch (err) {
      console.error("Delete by admin error:", err);
      setError("Could not delete the user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function openRecoverModal(user) {
    setSelectedUser(user);
    setShowRecoverModal(true);
  }

  function closeRecoverModal() {
    if (isRecovering) return;

    setSelectedUser(null);
    setShowRecoverModal(false);
  }

  async function handleRecover() {
    if (!selectedUser || isRecovering) return;

    try {
      setIsRecovering(true);
      setError("");

      const res = await fetch(`${BASE_URL}/user/recoverUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id ?? selectedUser.id,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Recovery failed");
      }

      setShowRecoverModal(false);
      setSelectedUser(null);

      await fetchUsers();
    } catch (err) {
      console.error("User recovery error:", err);
      setError(err.message || "Could not recover the user. Please try again.");
    } finally {
      setIsRecovering(false);
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

  function toggleActionMenu(userId, event) {
    if (openMenuUserId === userId) {
      setOpenMenuUserId(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const menuWidth = 160;
    const menuHeight = 120;

    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow >= menuHeight + 8
        ? rect.bottom + 6
        : Math.max(8, rect.top - menuHeight - 6);

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    setMenuPosition({ top, left });
    setOpenMenuUserId(userId);
  }

  if (loading) {
    return <div className="users-page">Loading users...</div>;
  }

  if (error && users.length === 0) {
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
            {currentUser?.name} : {currentUser?.role}
          </h3>
        </div>

        <span className="users-page__count">{users.length} users</span>
      </header>

      {error && (
        <p className="users-page__error" role="alert">
          {error}
        </p>
      )}

      <section className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>isLoggedIn</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id ?? user.id}>
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

                  <td>{user.role}</td>

                  <td className="users-table__actions">
                    {currentUser?.role !== "User" && (
                      <div className="action-menu-wrapper">
                        <button
                          type="button"
                          className="action-menu-trigger"
                          onClick={(e) =>
                            toggleActionMenu(user._id ?? user.id, e)
                          }
                          aria-label={`Actions for ${user.name}`}
                          aria-expanded={
                            openMenuUserId === (user._id ?? user.id)
                          }
                        >
                          &#8942;
                        </button>

                        {openMenuUserId === (user._id ?? user.id) && (
                          <div
                            className="action-menu"
                            style={{
                              position: "fixed",
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                          >
                            {user.isLoggedIn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuUserId(null);
                                  handleLogout(user._id ?? user.id);
                                }}
                              >
                                Logout
                              </button>
                            )}

                            {!user.isDeleted &&
                              (currentUser?.role === "Admin" ||
                                currentUser?.role === "Owner") && (
                                <button
                                  type="button"
                                  className="action-menu__danger"
                                  onClick={() => {
                                    setOpenMenuUserId(null);
                                    openDeleteModal(user);
                                  }}
                                >
                                  Delete
                                </button>
                              )}

                            {user.isDeleted &&
                              currentUser?.role === "Owner" && (
                                <button
                                  type="button"
                                  className="action-menu__recover"
                                  onClick={() => {
                                    setOpenMenuUserId(null);
                                    openRecoverModal(user);
                                  }}
                                >
                                  Recover
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="users-table__empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {showDeleteModal && selectedUser && (
        <div className="delete-modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="delete-modal__header">
              <div>
                <p className="users-page__eyebrow">User management</p>

                <h2 id="delete-modal-title">Delete user ?</h2>
              </div>

              <button
                type="button"
                className="delete-modal__close"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            <p className="delete-modal__description">
              Choose how you want to delete <strong>{selectedUser.name}</strong>
            </p>

            <div className="delete-modal__options">
              <button
                type="button"
                className="delete-modal__option delete-modal__option--soft"
                onClick={() => handleDelete("soft")}
                disabled={isDeleting}
              >
                <span className="delete-modal__option-title">Soft Delete</span>

                <span className="delete-modal__option-description">
                  Deactivate the account while keeping its database record.
                </span>
              </button>

              <button
                type="button"
                className="delete-modal__option delete-modal__option--hard"
                onClick={() => handleDelete("hard")}
                disabled={isDeleting}
              >
                <span className="delete-modal__option-title">Hard Delete</span>

                <span className="delete-modal__option-description">
                  Permanently remove the user from the database.
                </span>
              </button>
            </div>

            <div className="delete-modal__footer">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>

              {isDeleting && (
                <span className="delete-modal__loading">Processing...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {showRecoverModal && selectedUser && (
        <div className="delete-modal-backdrop" onClick={closeRecoverModal}>
          <div
            className="delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recover-modal-title"
          >
            <div className="delete-modal__header">
              <div>
                <p className="users-page__eyebrow">User management</p>

                <h2 id="recover-modal-title">Recover user?</h2>
              </div>

              <button
                type="button"
                className="delete-modal__close"
                onClick={closeRecoverModal}
                disabled={isRecovering}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            <p className="delete-modal__description">
              Are you sure you want to recover{" "}
              <strong>{selectedUser.name}</strong>? Their account will be
              reactivated and they will be able to log in again.
            </p>

            <div className="delete-modal__footer">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={closeRecoverModal}
                disabled={isRecovering}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal__option delete-modal__option--soft"
                onClick={handleRecover}
                disabled={isRecovering}
              >
                {isRecovering ? "Recovering..." : "Yes, Recover User"}
              </button>
            </div>

            {isRecovering && (
              <span className="delete-modal__loading">Processing...</span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
