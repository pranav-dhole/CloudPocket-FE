import { useState } from "react";
import { Link, useNavigate } from "react-router";

import "./LoginForm.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          navigate("/");
        }, 1500);
      } else {
        setErrors(data?.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__brand-icon">☁</span>

          <span>cloudpockets</span>
        </div>

        <div className="login-card__header">
          {errors && <p className="login-card__error">{errors}</p>}

          <span className="login-card__eyebrow">Welcome back</span>

          <h1 className="login-card__title">Log in to cloudpockets</h1>

          <p className="login-card__description">
            Access your files and folders.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-submit" disabled={isSuccess}>
            {isSuccess ? "Logging in..." : "Log in"}
          </button>

          <p>
            Don't have an account, <Link to={"/register"}>Register here.</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
