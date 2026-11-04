
import { useState } from "react";
import "./App.css";
import Assistant from "./Assistant";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [page, setPage] = useState("home");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const [topic, setTopic] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [medicines, setMedicines] = useState([]);

  // LOGIN AND REGISTRATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const endpoint =
      page === "signup" ? "/api/register" : "/api/login";

    const payload =
      page === "signup"
        ? { name, email, password }
        : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Something went wrong.");
      }

      if (page === "signup") {
        setMessage(data.message || "Registration successful. Please login.");
        setPage("login");
        setPassword("");
        return;
      }

      if (!data.user || !data.token) {
        throw new Error("Login response is missing user or token.");
      }

      setUser(data.user);
      setToken(data.token);
      setMessage("");
      setPage("dashboard");
    } catch (error) {
      setMessage(error.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setUser(null);
    setToken("");
    setName("");
    setEmail("");
    setPassword("");
    setTopic("");
    setMedicines([]);
    setSearchMessage("");
    setMessage("");
    setPage("home");
  };

  // MEDICINE SEARCH
  const handleMedicineSearch = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setSearchMessage("Please enter a medicine name.");
      return;
    }

    setSearchMessage("Searching medicines...");
    setMedicines([]);

    try {
      const response = await fetch(
        `${API_URL}/api/medicines/search?name=${encodeURIComponent(topic)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Medicine search failed.");
      }

      const results = Array.isArray(data.medicines)
        ? data.medicines
        : [];

      setMedicines(results);

      setSearchMessage(
        data.message ||
          (results.length
            ? `${results.length} result(s) found.`
            : "No medicines found.")
      );
    } catch (error) {
      setSearchMessage(error.message || "Unable to search medicines.");
    }
  };

  // NAVBAR
  const Navbar = () => (
    <nav className="navbar">
      <h2 onClick={() => setPage(user ? "dashboard" : "home")}>
        💊 MediFind
      </h2>

      <div className="nav-links">
        {!user ? (
          <>
            <button onClick={() => setPage("home")}>Home</button>
            <button onClick={() => setPage("login")}>Login</button>
            <button onClick={() => setPage("signup")}>Register</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage("dashboard")}>Dashboard</button>
            <button onClick={() => setPage("assistant")}>AI Assistant</button>
            <button onClick={() => setPage("profile")}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <div className="app">
      <Navbar />

      {/* HOME PAGE */}
      {page === "home" && (
        <main className="hero">
          <div>
            <h1>
              Find Your Medicine
              <br />
              <span>Without Worry.</span>
            </h1>

            <p>
              MediFind helps you discover medicine availability
              and explore alternatives with a simple and
              convenient platform.
            </p>

            <button onClick={() => setPage("login")}>
              Get Started →
            </button>
          </div>

          <div className="hero-icon">
            💊
          </div>
        </main>
      )}

      {/* LOGIN AND SIGNUP */}
      {(page === "login" || page === "signup") && (
        <main className="auth-section">
          <div className="medical-art">
            <div className="medical-symbol">✚</div>
            <h1>MediFind</h1>
            <p>
              Your trusted companion for medicine availability
              and healthcare information.
            </p>
          </div>

          <div className="auth-card">
            <h2>
              {page === "signup" ? "Create Account" : "Welcome Back"}
            </h2>

            <p>
              {page === "signup"
                ? "Register to get started with MediFind."
                : "Login to continue to your MediFind account."}
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : page === "signup"
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

            {message && <p className="switch-text">{message}</p>}

            <p className="switch-text">
              {page === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}

              <span
                onClick={() => {
                  setMessage("");
                  setPage(page === "signup" ? "login" : "signup");
                }}
              >
                {page === "signup" ? " Login" : " Register"}
              </span>
            </p>
          </div>
        </main>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && (
        <main className="dashboard">
          <section className="dashboard-welcome">
            <h1>
              Welcome, {user?.name || "User"}! 👋
            </h1>
            <p>
              Find medicines and explore available healthcare options
              with MediFind.
            </p>
          </section>

          <section className="medicine-search">
            <h2>🔍 Medicine Availability Finder</h2>
            <p>
              Enter a medicine name to search for available medicines.
            </p>

            <form onSubmit={handleMedicineSearch}>
              <input
                type="text"
                placeholder="Enter medicine name..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <button type="submit">Search Medicine</button>
            </form>

            {searchMessage && (
              <p className="source-note">{searchMessage}</p>
            )}
          </section>

          {medicines.length > 0 && (
            <section className="results-section">
              <h2>Search Results</h2>

              <div className="results-grid">
                {medicines.map((medicine, index) => (
                  <div className="result-card" key={medicine.id || index}>
                    <h3>
                      {medicine.name || medicine.medicine_name || "Medicine"}
                    </h3>

                    {medicine.price != null && (
                      <p>Price: ₹{medicine.price}</p>
                    )}

                    {medicine.quantity != null && (
                      <p>Available quantity: {medicine.quantity}</p>
                    )}

                    {medicine.pharmacy_name && (
                      <p>Pharmacy: {medicine.pharmacy_name}</p>
                    )}

                    {medicine.address && (
                      <p>Address: {medicine.address}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Medicine Search</h3>
              <p>Search for medicines by name.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Pharmacy Finder</h3>
              <p>Explore pharmacy-related information.</p>
            </div>

            <div
              className="feature-card"
              onClick={() => setPage("assistant")}
            >
              <div className="feature-icon">🤖</div>
              <h3>AI Assistant</h3>
              <p>Open the MediFind AI Assistant.</p>
            </div>
          </section>
        </main>
      )}

      {/* AI ASSISTANT */}
      {page === "assistant" && (
        <main className="assistant-page">
          <h1>🤖 MediFind AI Assistant</h1>
          <p>Welcome to your MediFind assistant.</p>
          <Assistant />
        </main>
      )}

      {/* PROFILE */}
      {page === "profile" && (
        <main className="profile-card">
          <h1>👤 My Profile</h1>

          <p>
            <strong>Name:</strong> {user?.name || "Not available"}
          </p>

          <p>
            <strong>Email:</strong> {user?.email || "Not available"}
          </p>

          <button onClick={() => setPage("dashboard")}>
            Back to Dashboard
          </button>
        </main>
      )}

      <footer>
        <p>© 2026 MediFind | Medicine Availability & Alternative Finder</p>
      </footer>
    </div>
  );
}

export default App;
