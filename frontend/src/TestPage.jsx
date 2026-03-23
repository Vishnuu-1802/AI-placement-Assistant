import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./TestPage.css";
import SiteShell from "./SiteShell";

function TestPage() {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [questionTimeSec, setQuestionTimeSec] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [finished, setFinished] = useState(false);

  const currentIndexRef = useRef(0);
  const enteredAtRef = useRef(Date.now());

  const skill = new URLSearchParams(window.location.search).get("skill") || "javascript";

  useEffect(() => {
    let cancelled = false;

    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");
        const requestBody = { skill, level: "mixed" };
        const requestConfig = { timeout: 70000 };
        let res;

        try {
          res = await axios.post("http://127.0.0.1:8000/generate_test", requestBody, requestConfig);
        } catch {
          res = await axios.post("http://127.0.0.1:8000/generate_test", requestBody, requestConfig);
        }

        if (!cancelled) {
          setTest(res.data);
          setCurrentIndex(0);
          currentIndexRef.current = 0;
          setAnswers({});
          setConfidence({});
          setQuestionTimeSec({});
          setFinished(false);
          setTimeLeft(1800);
          enteredAtRef.current = Date.now();
        }
      } catch (err) {
        if (!cancelled) {
          const apiMessage = err?.response?.data?.error;
          const timeoutMessage =
            err?.code === "ECONNABORTED"
              ? "Test generation timed out. Please retry; fallback questions will load if Ollama is slow."
              : "";
          setError(apiMessage || timeoutMessage || "Failed to generate test. Make sure AI service and Ollama are running, then retry.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTest();
    return () => {
      cancelled = true;
    };
  }, [skill]);

  useEffect(() => {
    if (timeLeft <= 0) {
      commitCurrentQuestionTime();
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const handleBlur = () => alert("Do not switch tabs during test!");
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  const commitCurrentQuestionTime = () => {
    const idx = currentIndexRef.current;
    const elapsed = Math.max(1, Math.round((Date.now() - enteredAtRef.current) / 1000));
    setQuestionTimeSec((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + elapsed }));
    enteredAtRef.current = Date.now();
  };

  const goToQuestion = (nextIndex) => {
    commitCurrentQuestionTime();
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
  };

  const submitTest = () => {
    commitCurrentQuestionTime();
    setFinished(true);
  };

  if (loading) {
    return (
      <SiteShell title="Skill Assessment" subtitle="Preparing your assessment...">
        <section className="card"><h2>Loading Test...</h2></section>
      </SiteShell>
    );
  }

  if (error) {
    return (
      <SiteShell title="Skill Assessment" subtitle="Could not start the assessment.">
        <section className="card">
          <h2>Unable to start test</h2>
          <p>{error}</p>
        </section>
      </SiteShell>
    );
  }

  if (!test) {
    return (
      <SiteShell title="Skill Assessment" subtitle="No data returned.">
        <section className="card"><h2>No test data returned.</h2></section>
      </SiteShell>
    );
  }

  if (finished) {
    return <ResultPage answers={answers} confidence={confidence} questionTimeSec={questionTimeSec} test={test} skill={skill} />;
  }

  const questions = test.mcqs || [];
  if (questions.length === 0) {
    return (
      <SiteShell title="Skill Assessment" subtitle="No questions available.">
        <section className="card"><h2>No questions available for this skill.</h2></section>
      </SiteShell>
    );
  }

  const q = questions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const difficulty = (q.difficulty || "medium").toLowerCase();

  return (
    <SiteShell
      title={`Skill Test: ${skill.toUpperCase()}`}
      subtitle="Technical, multi-level assessment with live analytics capture."
    >
      <div className="test-container card">
        <div className="test-meta">
          <span>Questions: {questions.length}</span>
          <span>Progress: {currentIndex + 1}/{questions.length}</span>
          <span>Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

        <div className="question-box">
          <div className="question-head">
            <h3>Q{currentIndex + 1}. {q.question}</h3>
            <div className="question-tags">
              <span className={`difficulty ${difficulty}`}>{difficulty.toUpperCase()}</span>
              <span className="topic-pill">{q.topic || "General"}</span>
            </div>
          </div>

          {q.options && q.options.map((opt, i) => (
            <label key={i} className={`option ${answers[currentIndex] === opt ? "selected" : ""}`}>
              <input
                type="radio"
                name={`q-${currentIndex}`}
                checked={answers[currentIndex] === opt}
                onChange={() => setAnswers({ ...answers, [currentIndex]: opt })}
              />
              {opt}
            </label>
          ))}

          <div className="confidence-box">
            <p>Confidence:</p>
            <div className="confidence-buttons">
              {[{ key: "low", label: "Low" }, { key: "medium", label: "Medium" }, { key: "high", label: "High" }].map((c) => (
                <button
                  key={c.key}
                  className={confidence[currentIndex] === c.key ? "active" : ""}
                  onClick={() => setConfidence({ ...confidence, [currentIndex]: c.key })}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-buttons">
          <button disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)}>Previous</button>
          <button disabled={currentIndex === questions.length - 1} onClick={() => goToQuestion(currentIndex + 1)}>Next</button>
          <button className="submit-btn" onClick={submitTest}>Submit Test</button>
        </div>
      </div>
    </SiteShell>
  );
}

function ResultPage({ answers, confidence, questionTimeSec, test, skill }) {
  const questions = test.mcqs || [];
  let score = 0;
  const topicMap = {};
  const confidenceMap = { low: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, high: { total: 0, correct: 0 }, unmarked: { total: 0, correct: 0 } };
  const timeRows = [];

  questions.forEach((q, i) => {
    const topic = q.topic || "General";
    const isCorrect = answers[i] === q.answer;
    const spent = questionTimeSec[i] || 0;
    const conf = confidence[i] || "unmarked";

    if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0, time: 0 };
    topicMap[topic].total += 1;
    topicMap[topic].time += spent;
    if (isCorrect) topicMap[topic].correct += 1;

    confidenceMap[conf].total += 1;
    if (isCorrect) confidenceMap[conf].correct += 1;
    if (isCorrect) score++;

    timeRows.push({ id: i + 1, topic, seconds: spent, correct: isCorrect });
  });

  const percentage = Math.round((score / Math.max(questions.length, 1)) * 100);
  const passed = percentage >= 75;
  const topicRows = Object.entries(topicMap).map(([topic, v]) => ({
    topic,
    ...v,
    accuracy: Math.round((v.correct / Math.max(v.total, 1)) * 100),
    avgSec: Math.round(v.time / Math.max(v.total, 1)),
  })).sort((a, b) => a.accuracy - b.accuracy);

  const weakTopics = topicRows.slice(0, 5);
  const topTimeQuestions = [...timeRows].sort((a, b) => b.seconds - a.seconds).slice(0, 8);
  const confidenceRows = ["low", "medium", "high", "unmarked"].map((k) => {
    const row = confidenceMap[k];
    return { key: k, ...row, accuracy: row.total ? Math.round((row.correct / row.total) * 100) : 0 };
  });

  useEffect(() => {
    if (!passed || !skill) return;
    try {
      const key = "acp_passed_tests";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const clean = Array.isArray(existing) ? existing : [];
      const now = new Date().toISOString();
      const current = clean.find((item) => String(item.skill).toLowerCase() === String(skill).toLowerCase());

      let next;
      if (!current) {
        next = [...clean, { skill, percentage, passed: true, completed_at: now }];
      } else {
        next = clean.map((item) =>
          String(item.skill).toLowerCase() === String(skill).toLowerCase()
            ? {
                ...item,
                percentage: Math.max(Number(item.percentage || 0), percentage),
                passed: true,
                completed_at: now,
              }
            : item
        );
      }
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Best-effort client cache; ignore storage errors.
    }
  }, [passed, percentage, skill]);

  return (
    <SiteShell title="Assessment Analysis" subtitle="Performance summary across topics, time, and confidence.">
      <div className="result-page analytics-page card">
        <h2>Your Score: {score} / {questions.length}</h2>
        <p>{percentage}% Accuracy</p>
        <p>
          Result: <strong style={{ color: passed ? "#22c55e" : "#ef4444" }}>{passed ? "PASS" : "FAIL"}</strong> ({passed ? ">= 75%" : "< 75%"})
        </p>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Topic-Wise Accuracy</h3>
            {topicRows.map((row) => (
              <div key={row.topic} className="metric-row">
                <span>{row.topic}</span>
                <span>{row.correct}/{row.total} ({row.accuracy}%)</span>
                <span>{row.avgSec}s avg</span>
              </div>
            ))}
          </div>

          <div className="analytics-card">
            <h3>Confidence Map</h3>
            {confidenceRows.map((row) => (
              <div key={row.key} className="metric-row">
                <span>{row.key.toUpperCase()}</span>
                <span>{row.total} answered</span>
                <span>{row.accuracy}% correct</span>
              </div>
            ))}
          </div>

          <div className="analytics-card full-width">
            <h3>Weak-Skill Heatmap</h3>
            {weakTopics.map((row) => (
              <div key={row.topic} className="heat-row">
                <span className="heat-label">{row.topic}</span>
                <div className="heat-track">
                  <div className={`heat-fill ${row.accuracy >= 70 ? "ok" : row.accuracy >= 45 ? "warn" : "bad"}`} style={{ width: `${row.accuracy}%` }} />
                </div>
                <span className="heat-score">{row.accuracy}%</span>
              </div>
            ))}
          </div>

          <div className="analytics-card full-width">
            <h3>Time Per Question (Slowest First)</h3>
            {topTimeQuestions.map((row) => (
              <div key={row.id} className="metric-row">
                <span>Q{row.id} ({row.topic})</span>
                <span>{row.seconds}s</span>
                <span>{row.correct ? "Correct" : "Wrong"}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => (window.location.href = "/")}>Back to Home</button>
      </div>
    </SiteShell>
  );
}

export default TestPage;
