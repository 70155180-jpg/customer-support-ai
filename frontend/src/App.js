import React, { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const res = await fetch("http://127.0.0.1:8000/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Customer Support AI System</h2>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your ticket"
        style={{ padding: "10px", width: "300px" }}
      />

      <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
        Submit
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <p><b>Agent:</b> {result.agent}</p>
          <p><b>Category:</b> {result.category}</p>
        </div>
      )}
    </div>
  );
}

export default App;