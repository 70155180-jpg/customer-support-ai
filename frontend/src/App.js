import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter a support ticket first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error("Unable to classify this ticket right now.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="support-panel">
        <div className="header">
          <p className="eyebrow">Ticket Classifier</p>
          <h1>Customer Support AI System</h1>
          <p className="subtitle">
            Submit a customer message and get the right support category,
            priority, and agent.
          </p>
        </div>

        <div className="form-area">
          <label htmlFor="ticket">Support ticket</label>
          <textarea
            id="ticket"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: My payment was charged twice and I want a refund."
            rows="6"
          />

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Classifying..." : "Submit Ticket"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result-card">
            <div>
              <span className="label">Ticket ID</span>
              <strong>{result.ticket_id}</strong>
            </div>
            <div>
              <span className="label">Agent</span>
              <strong>{result.agent}</strong>
            </div>
            <div>
              <span className="label">Category</span>
              <strong>{result.category}</strong>
            </div>
            <div>
              <span className="label">Priority</span>
              <strong>{result.priority}</strong>
            </div>
            <p className="response-message">{result.message}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
