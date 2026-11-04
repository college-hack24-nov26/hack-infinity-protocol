
import { useState } from "react";
import "./Assistant.css";

function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Welcome to MediFind AI Health Assistant. Ask me a general health information question."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userQuestion }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: userQuestion
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error.message || "Unable to connect. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-page">

      <div className="assistant-header">
        <h1>🤖 MediFind AI Assistant</h1>
        <p>Your General Health Information Companion</p>
        <span className="online-status">● Assistant Interface</span>
      </div>

      <div className="chat-container">

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
            >
              <div className="message-avatar">
                {msg.role === "assistant" ? "🤖" : "👤"}
              </div>

              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            placeholder="Ask a general health question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            Send ➤
          </button>
        </form>

      </div>

      <p className="assistant-disclaimer">
        This assistant provides general health information only.
        It does not diagnose conditions or recommend treatments.
        For personal medical advice, consult a qualified healthcare professional.
      </p>

    </div>
  );
}

export default Assistant;
