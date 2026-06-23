import React, { useState } from "react";
import "./App.css";

const sampleTickets = [
  "My payment was charged twice and I want a refund.",
  "I cannot login to my account after resetting my password.",
  "My order delivery is late and tracking is not updating.",
  "The app crashes with an error when I open my dashboard."
];

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
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
      setHistory((items) => [{ ...data, preview: text.trim() }, ...items].slice(0, 5));
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Support Desk</p>
            <h1>Customer Support Intelligence</h1>
          </div>
          <span className="status-pill">Live API</span>
        </header>

        <section className="metrics">
          <div>
            <span>Categories</span>
            <strong>6</strong>
          </div>
          <div>
            <span>Routing Mode</span>
            <strong>Auto</strong>
          </div>
          <div>
            <span>Latest Tickets</span>
            <strong>{history.length}</strong>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="panel intake-panel">
            <div className="section-heading">
              <h2>Ticket Intake</h2>
              <p>Paste a customer message to classify category, urgency, SLA, and owner.</p>
            </div>

            <div className="form-area">
              <label htmlFor="ticket">Customer message</label>
              <textarea
                id="ticket"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: My payment was charged twice and I want a refund."
                rows="8"
              />

              <div className="actions">
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Ticket"}
                </button>
                <button className="ghost-button" onClick={() => setText("")} disabled={loading}>
                  Clear
                </button>
              </div>
            </div>

            <div className="samples">
              <span>Try sample:</span>
              {sampleTickets.map((sample) => (
                <button
                  className="sample-button"
                  key={sample}
                  onClick={() => setText(sample)}
                  type="button"
                >
                  {sample.split(" ").slice(0, 4).join(" ")}...
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}
          </section>

          <section className="panel analysis-panel">
            <div className="section-heading">
              <h2>AI Analysis</h2>
              <p>Classification result appears here after submission.</p>
            </div>

            {result ? (
              <div className="result-card">
                <div className="result-header">
                  <div>
                    <span className="label">Ticket ID</span>
                    <strong>{result.ticket_id}</strong>
                  </div>
                  <span className={`priority ${result.priority}`}>{result.priority}</span>
                </div>

                <div className="detail-grid">
                  <div>
                    <span className="label">Agent</span>
                    <strong>{result.agent}</strong>
                  </div>
                  <div>
                    <span className="label">Category</span>
                    <strong>{result.category}</strong>
                  </div>
                  <div>
                    <span className="label">Confidence</span>
                    <strong>{result.confidence}%</strong>
                  </div>
                  <div>
                    <span className="label">SLA</span>
                    <strong>{result.sla}</strong>
                  </div>
                </div>

                <div className="confidence-bar">
                  <span style={{ width: `${result.confidence}%` }} />
                </div>

                <div className="tags">
                  {result.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="reply-box">
                  <span className="label">Suggested Reply</span>
                  <p>{result.suggested_reply}</p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <strong>No ticket analyzed yet</strong>
                <p>Select a sample or submit a customer message to see routing details.</p>
              </div>
            )}
          </section>
        </div>

        <section className="panel history-panel">
          <div className="section-heading">
            <h2>Recent Ticket History</h2>
            <p>Latest analyzed tickets in this browser session.</p>
          </div>

          {history.length > 0 ? (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-row" key={item.ticket_id}>
                  <strong>{item.ticket_id}</strong>
                  <span>{item.category}</span>
                  <span>{item.priority}</span>
                  <p>{item.preview}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No recent tickets yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
