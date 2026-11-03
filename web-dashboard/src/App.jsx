
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const isSignup = page === "signup";

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/${isSignup ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isSignup
              ? { name, email, password }
              : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isSignup) {
        setMessage("Account created successfully! Please login.");
        setPage("login");
        setPassword("");
      } else {
        localStorage.setItem("medifind_token", data.token);
        setMessage(`Welcome ${data.user.name}! Login successful.`);
        setPage("home");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message || "Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h2>💊 MediFind</h2>
        <div>
          <button onClick={() => { setPage("home"); setMessage(""); }}>
            Home
          </button>
          <button onClick={() => { setPage("login"); setMessage(""); }}>
            Login
          </button>
          <button onClick={() => { setPage("signup"); setMessage(""); }}>
            Sign Up
          </button>
        </div>
      </nav>

      {page === "home" && (
        <section className="hero">
          <div>
            <h1>
              Find Your Medicine,<br />
              <span>Find Your Health.</span>
            </h1>
            <p>
              Search medicines, check availability
              and explore medicine information.
            </p>
            <button onClick={() => setPage("login")}>
              Get Started
            </button>
          </div>
          <div className="hero-icon">💊</div>
        </section>
      )}

      {(page === "login" || page === "signup") && (
        <section className="auth-section">
          <div className="medical-art">
            <div className="medical-symbol">✚</div>
            <h1>Welcome to MediFind</h1>
            <p>Your medicine discovery platform.</p>
          </div>

          <div className="auth-card">
            <h2>
              {page === "login" ? "Welcome Back!" : "Create Account"}
            </h2>

            <p>
              {page === "login"
                ? "Login to continue"
                : "Join MediFind today"}
            </p>

            <form onSubmit={handleSubmit}>
              {page === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              <button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : page === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            {message && (
              <p role="status" className="status-message">
                {message}
              </p>
            )}

            <p className="switch-text">
              {page === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <span
                onClick={() => {
                  setPage(page === "login" ? "signup" : "login");
                  setMessage("");
                }}
              >
                {page === "login" ? " Sign Up" : " Login"}
              </span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
