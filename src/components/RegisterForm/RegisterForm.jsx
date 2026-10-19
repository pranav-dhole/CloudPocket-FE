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

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changing the email invalidates the current verification state.
    if (name === "email" && value !== form.email) {
      setOtp("");
      setOtpSent(false);
      setIsEmailVerified(false);
      setMessage("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors("");
  };

  const handleSendOtp = async () => {
    setErrors("");
    setMessage("");

    if (form.name.trim().length < 3) {
      setErrors("Name must be at least 3 characters long.");
      return;
    }

    if (!form.email.trim()) {
      setErrors("Please enter your email address.");
      return;
    }

    try {
      setIsSendingOtp(true);

      const res = await fetch(`${BASE_URL}/auth/sendOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
        }),
      });

      if (!res.ok) {
        setErrors(
          "Unable to send a verification code. Check your email and try again.",
        );
        return;
      }

      setOtpSent(true);
      setIsEmailVerified(false);
      setOtp("");
      setMessage("If the address can receive a code, it will arrive shortly.");
    } catch (err) {
      console.error("OTP send error:", err);
      setErrors("Unable to send the code right now. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrors("");
    setMessage("");

    if (!otp.trim() || otp.length !== 4) {
      setErrors("Please enter the verification code.");
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const res = await fetch(`${BASE_URL}/auth/verifyOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: otp.trim(),
        }),
      });

      if (!res.ok) {
        setIsEmailVerified(false);
        setErrors("The code is invalid or expired. Please try again.");
        return;
      }

      setIsEmailVerified(true);
      setMessage("Email verified successfully.");
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrors("Unable to verify the code right now. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side guard; the backend must enforce this too.
    if (!isEmailVerified) {
      setErrors("Please verify your email before creating an account.");
      return;
    }

    if (form.name.trim().length < 3) {
      setErrors("Name must be at least 3 characters long.");
      return;
    }

    try {
      setIsRegistering(true);
      setErrors("");
      setMessage("");

      const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
        }),
      });

      if (res.ok) {
        setMessage("Account created successfully. Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setErrors(
          "Unable to create your account. Check your details or try again.",
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors("Something went wrong. Please try again.");
    } finally {
      setIsRegistering(false);
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
          {errors && (
            <p className="register-card__error" role="alert">
              {errors}
            </p>
          )}

          {message && (
            <p className="register-card__message" role="status">
              {message}
            </p>
          )}

          <span className="register-card__eyebrow">Register account</span>
          <h1 className="register-card__title">Join cloudpockets</h1>
          <p className="register-card__description">
            Verify your email and start storing your files.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
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
              minLength={3}
              required
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
              required
              disabled={isSendingOtp || isVerifyingOtp || isRegistering}
            />

            {!isEmailVerified && (
              <button
                type="button"
                className="register-submit"
                onClick={handleSendOtp}
                disabled={
                  isSendingOtp ||
                  isVerifyingOtp ||
                  isRegistering ||
                  !form.email.trim()
                }
              >
                {isSendingOtp
                  ? "Sending code..."
                  : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
              </button>
            )}
          </div>

          {otpSent && !isEmailVerified && (
            <div className="register-field">
              <label className="register-label" htmlFor="otp">
                Email verification code
              </label>

              <input
                id="otp"
                type="text"
                className="register-input"
                placeholder="Enter the code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setErrors("");
                }}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={10}
                required
              />

              <button
                type="button"
                className="register-submit"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || isSendingOtp || !otp.trim()}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {isEmailVerified && (
            <p className="register-card__message">✓ Email verified</p>
          )}

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
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={
              !isEmailVerified ||
              isRegistering ||
              isSendingOtp ||
              isVerifyingOtp
            }
          >
            {isRegistering ? "Creating account..." : "Create account"}
          </button>

          {!isEmailVerified && (
            <p className="register-card__description">
              Verify your email to enable account creation.
            </p>
          )}

          <p>
            Already have an account? <Link to="/login">Login here.</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
