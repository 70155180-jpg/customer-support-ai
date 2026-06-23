import React, { useState } from "react";
import "./App.css";

const sampleTickets = [
  "Enterprise customer says the API is failing with timeout errors during checkout.",
  "My payment was charged twice and I want a refund for my subscription.",
  "I cannot login to my account after resetting my password.",
  "I am unhappy with the bad service and want a manager to contact me."
];

const initialStats = [
  { label: "AI Agents", value: "5", tone: "blue" },
  { label: "Queues", value: "6", tone: "orange" },
  { label: "Automation", value: "Safe Demo", tone: "purple" },
  { label: "Integrations", value: "3", tone: "green" }
];

function App() {
  const [text, setText] = useState("");
  const [customerTier, setCustomerTier] = useState("enterprise");
  const [channel, setChannel] = useState("web");
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
        body: JSON.stringify({
          text,
          customer_tier: customerTier,
          channel
        })
      });

      if (!res.ok) {
        throw new Error("Unable to process this ticket right now.");
      }

      const data = await res.json();
      setResult(data);
      setHistory((items) => [{ ...data, preview: text.trim() }, ...items].slice(0, 6));
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
        <header className="hero">
          <div>
            <p className="eyebrow">Enterprise CrewAI Support Automation</p>
            <h1>Autonomous Customer Support Ecosystem</h1>
            <p>
              Classifier Agent routes tickets, FAQ Agent resolves simple cases,
              Escalation Agent loops in humans, Resolution Agent proposes actions,
              and QA Agent audits the response.
            </p>
          </div>
          <div className="hero-card">
            <span>Stack</span>
            <strong>CrewAI + FastAPI + React</strong>
            <small>Zendesk and PostgreSQL shown as safe integration previews.</small>
          </div>
        </header>

        <section className="metrics">
          {initialStats.map((stat) => (
            <div className={`metric ${stat.tone}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        <section className="ecosystem-grid">
          <div className="panel intake-panel">
            <div className="section-heading">
              <h2>Ticket Intake</h2>
              <p>Submit a customer issue and run it through the multi-agent workflow.</p>
            </div>

            <div className="control-grid">
              <label>
                Customer Tier
                <select value={customerTier} onChange={(e) => setCustomerTier(e.target.value)}>
                  <option value="enterprise">Enterprise</option>
                  <option value="standard">Standard</option>
                  <option value="trial">Trial</option>
                </select>
              </label>
              <label>
                Channel
                <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <option value="web">Web</option>
                  <option value="email">Email</option>
                  <option value="zendesk">Zendesk</option>
                </select>
              </label>
            </div>

            <label htmlFor="ticket">Customer message</label>
            <textarea
              id="ticket"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: Enterprise customer says the API is failing with timeout errors during checkout."
              rows="8"
            />

            <div className="actions">
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Running Agents..." : "Run Agent Workflow"}
              </button>
              <button className="ghost-button" onClick={() => setText("")} disabled={loading}>
                Clear
              </button>
            </div>

            <div className="samples">
              <span>Scenario library</span>
              {sampleTickets.map((sample) => (
                <button className="sample-button" key={sample} onClick={() => setText(sample)} type="button">
                  {sample.split(" ").slice(0, 5).join(" ")}...
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}
          </div>

          <div className="panel outcome-panel">
            <div className="section-heading">
              <h2>Decision Summary</h2>
              <p>Routing, SLA, audit, and response recommendation.</p>
            </div>

            {result ? (
              <div className="result-stack">
                <div className="ticket-title">
                  <div>
                    <span className="label">Ticket ID</span>
                    <strong>{result.ticket_id}</strong>
                  </div>
                  <span className={`priority ${result.priority}`}>{result.priority}</span>
                </div>

                <div className="detail-grid">
                  <Info label="Assigned Agent" value={result.assigned_agent} />
                  <Info label="Category" value={result.category} />
                  <Info label="SLA" value={result.sla} />
                  <Info label="QA Score" value={`${result.qa.qa_score}%`} />
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
                  <span className="label">Resolution Agent Suggested Reply</span>
                  <p>{result.suggested_reply}</p>
                </div>

                <div className="next-action">
                  <span className="label">Next Best Action</span>
                  <strong>{result.next_action}</strong>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <strong>No workflow has run yet</strong>
                <p>Select a scenario or enter a ticket to see the autonomous support pipeline.</p>
              </div>
            )}
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel">
            <div className="section-heading">
              <h2>Agent Workflow</h2>
              <p>How the support crew handles the ticket.</p>
            </div>

            {result ? (
              <div className="workflow">
                {result.workflow.map((step, index) => (
                  <div className="workflow-step" key={step.agent}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{step.agent}</strong>
                      <p>{step.output}</p>
                    </div>
                    <em>{step.status}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Workflow will appear after ticket processing.</p>
            )}
          </div>

          <div className="panel">
            <div className="section-heading">
              <h2>Integration Preview</h2>
              <p>Safe demo payloads for Zendesk and PostgreSQL.</p>
            </div>

            {result ? (
              <div className="integration-grid">
                <Integration title="Zendesk API" data={result.integration_preview.zendesk_payload} />
                <Integration title="PostgreSQL Record" data={result.integration_preview.postgres_record} />
              </div>
            ) : (
              <p className="muted">No integration payload generated yet.</p>
            )}
          </div>
        </section>

        <section className="panel history-panel">
          <div className="section-heading">
            <h2>Operations History</h2>
            <p>Recent workflow runs in this browser session.</p>
          </div>

          {history.length ? (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-row" key={item.ticket_id}>
                  <strong>{item.ticket_id}</strong>
                  <span>{item.category}</span>
                  <span>{item.priority}</span>
                  <span>{item.assigned_agent}</span>
                  <p>{item.preview}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No recent ticket workflows yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Integration({ title, data }) {
  return (
    <div className="integration-card">
      <strong>{title}</strong>
      {Object.entries(data).map(([key, value]) => (
        <p key={key}>
          <span>{key}</span>
          <code>{Array.isArray(value) ? value.join(", ") : value}</code>
        </p>
      ))}
    </div>
  );
}

export default App;
