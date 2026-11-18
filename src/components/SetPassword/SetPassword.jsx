import { useState } from "react";
import { useNavigate } from "react-router";
import "./SetPassword.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      return setError("Please fill in both password fields.");
    }

    if (password.length < 4) {
      return setError("Password must be at least 4 characters long.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/auth/setPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to set password.");
      }

      setSuccess("Password successfully created!");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Set password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="set-password-page">
      <section className="set-password-card">
        <div className="set-password-header">
          <p className="set-password-eyebrow">Account security</p>

          <h1>Set your password</h1>

          <p className="set-password-description">
            Your Google account has been verified. Create a password to complete
            your account setup.
          </p>
        </div>

        <form className="set-password-form" onSubmit={handleSubmit}>
          <div className="set-password-field">
            <label htmlFor="password">New Password</label>

            <div className="set-password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="set-password-field">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="set-password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="set-password-message set-password-error">{error}</p>
          )}

          {success && (
            <p className="set-password-message set-password-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="set-password-submit"
            disabled={loading}
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </section>
    </main>
  );
}
