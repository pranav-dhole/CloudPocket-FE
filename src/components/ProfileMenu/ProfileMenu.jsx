import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import "./ProfileMenu.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogin() {
    setIsOpen(false);
    navigate("/login");
  }

  async function handleLogout() {
    try {
      const res = await fetch(`${BASE_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }

      setUser(null);
      setIsOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const getInitial = () => {
    if (!user?.name) return "?";

    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className={`profile-menu__trigger ${
          isOpen ? "profile-menu__trigger--active" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <span className="profile-menu__avatar">
          {isLoading ? "..." : getInitial()}
        </span>
      </button>

      {isOpen && (
        <div className="profile-menu__dropdown">
          {user ? (
            <>
              <div className="profile-menu__user">
                <div className="profile-menu__large-avatar">{getInitial()}</div>

                <div className="profile-menu__user-info">
                  <p className="profile-menu__name">{user.name}</p>

                  <p className="profile-menu__email">{user.email}</p>
                </div>
              </div>

              <div className="profile-menu__divider" />

              <button
                type="button"
                className="profile-menu__action profile-menu__action--logout"
                onClick={handleLogout}
              >
                <span>↪</span>
                Log out
              </button>
            </>
          ) : (
            <>
              <div className="profile-menu__guest">
                <div className="profile-menu__large-avatar">?</div>

                <div>
                  <p className="profile-menu__name">Not logged in</p>

                  <p className="profile-menu__email">Log in to your account</p>
                </div>
              </div>

              <div className="profile-menu__divider" />

              <button
                type="button"
                className="profile-menu__action"
                onClick={handleLogin}
              >
                <span>→</span>
                Log in
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
