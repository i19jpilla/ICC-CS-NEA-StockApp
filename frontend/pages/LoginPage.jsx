import { useState } from "react";
import { InputField, SubmitButton, ErrorAlert } from "./AuthComponents";
import "./auth.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentPage, setCurrentPage } = useNav();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status !== "success") {
          setError(data.message || "Login failed.");
        } else {
          console.log("Login successful for user:", data.username);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          setCurrentPage("dashboard")
        }
      } else {
        setError(data.detail || "Login failed.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">
        <h2 className="auth-heading">Login</h2>
        <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />
          <InputField
            id="username"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <SubmitButton loading={loading} label="Login" loadingLabel="Signing in..." />
        </form>
        <p className="auth-footer-text">
          Don't have an account?{" "}
          <a href="/pages/register" className="auth-link">Register here</a>
        </p>
      </div>
    </div>
  );
}