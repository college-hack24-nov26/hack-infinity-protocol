
import { useState } from "react";
import "./Admin.css";

const API_URL = "http://127.0.0.1:5000";

function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    pharmacy: "",
    medicine: "",
    quantity: "",
    location: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      setLoggedIn(true);
      loadRecords(data.token);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load records");
      }

      setRecords(data.records || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    setMessage("Stock management API is not connected yet.");
  };

  const logout = () => {
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setRecords([]);
  };

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-icon">🛡️</div>
          <h1>Admin Login</h1>
          <p>MediFind Administration Portal</p>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login as Admin"}
          </button>

          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>🛡️ MediFind Admin</h1>
          <p>Pharmacy Inventory Management</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <main className="admin-content">
        <h2>Inventory Overview</h2>

        <div className="admin-stats">
          <div className="admin-stat">
            <h3>{records.length}</h3>
            <p>Stock Records</p>
          </div>
          <div className="admin-stat">
            <h3>{records.filter(r => Number(r.quantity) > 0).length}</h3>
            <p>Available Records</p>
          </div>
        </div>

        <section className="admin-panel">
          <h2>Add Stock Record</h2>

          <form className="stock-form" onSubmit={saveRecord}>
            <input
              placeholder="Pharmacy Name"
              value={form.pharmacy}
              onChange={(e) => setForm({...form, pharmacy: e.target.value})}
              required
            />

            <input
              placeholder="Medicine Name"
              value={form.medicine}
              onChange={(e) => setForm({...form, medicine: e.target.value})}
              required
            />

            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value})}
              required
            />

            <input
              placeholder="Pharmacy Location"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              required
            />

            <button type="submit">Save Stock Record</button>
          </form>

          {message && <p className="admin-message">{message}</p>}
        </section>

        <section className="admin-panel">
          <h2>Inventory Records</h2>

          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Pharmacy</th>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.pharmacy}</td>
                    <td>{record.medicine}</td>
                    <td>{record.quantity}</td>
                    <td>{record.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {records.length === 0 && (
              <p>No inventory records available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;
