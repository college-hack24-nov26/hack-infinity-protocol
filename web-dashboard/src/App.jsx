
import { useState } from "react";
import "./App.css";

function App() {
  const [medicine, setMedicine] = useState("");

  return (
    <div className="app">
      <nav className="navbar">
        <h2>💊 MediFind</h2>
        <div>
          <a href="#home">Home</a>
          <a href="#search">Find Medicine</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div>
          <h1>Find Your Medicine,<br />
            <span>Find Your Health.</span>
          </h1>
          <p>
            Search medicines, check availability
            and discover suitable alternatives.
          </p>

          <div className="search-box" id="search">
            <input
              type="text"
              placeholder="Enter medicine name..."
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
            />
            <button onClick={() => alert(
              medicine ? `Searching for ${medicine}` : "Enter medicine name"
            )}>
              Search
            </button>
          </div>
        </div>
        <div className="hero-icon">💊</div>
      </section>

      <section className="features">
        <h2>Why Choose MediFind?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🔍 Medicine Search</h3>
            <p>Search for medicines easily.</p>
          </div>
          <div className="feature-card">
            <h3>🏥 Availability</h3>
            <p>Check medicine availability at pharmacies.</p>
          </div>
          <div className="feature-card">
            <h3>💚 Alternatives</h3>
            <p>Explore alternatives suggested for review by a pharmacist.</p>
          </div>
        </div>
      </section>

      <footer>
        © 2026 MediFind | Your Medicine Discovery Platform
      </footer>
    </div>
  );
}

export default App;
