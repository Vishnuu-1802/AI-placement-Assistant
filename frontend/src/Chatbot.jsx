import { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

function Chatbot({ userSkills }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chatbot", {
        message: input,
        skills: userSkills || [],
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.response || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Make sure Ollama + Flask are running." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <section className="card chat-shell elevate">
      <h2>Live Conversation</h2>
      <p className="muted">Ask about concepts, debugging, interview prep, or learning plans.</p>
      <div className="chip-wrap quick-prompts">
        <button className="chip prompt-chip" type="button" onClick={() => setInput("Explain semantic HTML with examples.")}>
          Semantic HTML
        </button>
        <button className="chip prompt-chip" type="button" onClick={() => setInput("Give me 5 SQL indexing interview questions.")}>
          SQL Indexing
        </button>
        <button className="chip prompt-chip" type="button" onClick={() => setInput("How can I improve my resume for frontend roles?")}>
          Resume Advice
        </button>
      </div>
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="chat-bubble bot">Start by asking a technical question.</div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble bot">Typing...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage} type="button">
          Send
        </button>
      </div>
    </section>
  );
}

export default Chatbot;
