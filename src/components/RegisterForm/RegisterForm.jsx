import { useState } from "react";
import { Link, useNavigate } from "react-router";

import "./RegisterForm.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
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
      const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          navigate("/login");
        }, 2000);
      } else {
        setErrors(data?.message || "Email already in use");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">
        <div className="register-card__brand">
          <span className="register-card__brand-icon">☁</span>

          <span>cloudpockets</span>
        </div>

        <div className="register-card__header">
          {errors && <p className="register-card__error">{errors}</p>}

          <span className="register-card__eyebrow">Register account</span>

          <h1 className="register-card__title">Join cloudpockets</h1>

          <p className="register-card__description">
            Create your account and start storing your files.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="register-field">
            <label className="register-label" htmlFor="name">
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className="register-input"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="register-input"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="register-input"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={isSuccess}
          >
            {isSuccess ? "Creating account..." : "Create account"}
          </button>

          <p>
            Already have an account, <Link to={"/login"}>Login here.</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
