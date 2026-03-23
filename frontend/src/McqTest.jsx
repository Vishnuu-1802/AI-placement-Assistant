import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function McqTest({ skill, onPass }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [searchParams] = useSearchParams();
  const testSkill = skill || searchParams.get("skill");

  // ✅ Auto-generate test on load
  useEffect(() => {
    if (!testSkill) return;

    const generateTest = async () => {
      try {
        setLoading(true);

        const res = await axios.post("http://127.0.0.1:8000/generate_mcq", {
          skill: testSkill,
        });

        setQuestions(res.data.questions || []);
        setResult(null);
        setAnswers({});
      } catch (err) {
        console.error("❌ Error generating MCQs:", err);
        alert("Failed to generate test.");
      } finally {
        setLoading(false);
      }
    };

    generateTest();
  }, [testSkill]);

  const submitTest = () => {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setResult(score);

    if (score >= 70 && onPass) {
      onPass();
    }
  };

  if (!testSkill) return null;

  return (
    <div className="mcq-box">
      <h3>📝 Skill Test: {testSkill}</h3>

      {loading && <p>Generating test...</p>}

      {!loading && questions.length === 0 && (
        <p>No questions available.</p>
      )}

      {!loading &&
        questions.map((q, index) => (
          <div key={index} className="mcq-question">
            <p>
              <strong>Q{index + 1}. {q.question}</strong>
            </p>

            {q.options.map((opt, i) => (
              <label key={i} style={{ display: "block" }}>
                <input
                  type="radio"
                  name={`q-${index}`}
                  value={opt}
                  checked={answers[index] === opt}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [index]: opt,
                    }))
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

      {!loading && questions.length > 0 && (
        <button onClick={submitTest} style={{ marginTop: "10px" }}>
          Submit Test
        </button>
      )}

      {result !== null && (
        <p style={{ marginTop: "10px" }}>
          Score: {result}% {result >= 70 ? "✅ Passed" : "❌ Try again"}
        </p>
      )}
    </div>
  );
}

export default McqTest;
