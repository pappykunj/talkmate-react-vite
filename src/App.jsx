import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    setError(null);
    const userMessage = { type: 'user', text: userInput };
    setChatLog((prev) => [...prev, userMessage]);
    setLoading(true);
    // Clear input after successful response
      setUserInput('');
    try {
      const payload = {
        contents: [
          {
            parts: [{ text: `Respond in Markdown format: ${userInput}` }],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '⚠️ No response generated.';
      const aiMessage = { type: 'ai', text: aiText };
      setChatLog((prev) => [...prev, aiMessage]);

      // Clear input after successful response
      setUserInput('');
    } catch (err) {
      console.error('API error:', err);
      setError(err.message);
      setChatLog((prev) => [
        ...prev,
        { type: 'ai', text: `❌ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setChatLog([]);
    setUserInput('');
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>AI Content Generator</h1>
        {error && <div className="error-message">{error}</div>}
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Got a question? Fire away!"
        />
        <div className="buttons">
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button onClick={handleClear} className="clear-btn">
            Clear
          </button>
        </div>
        <div className="chat-log">
          {chatLog.map((entry, idx) => (
            <div key={idx} className={`chat-entry ${entry.type}`}>
              <strong>{entry.type === 'user' ? 'User:' : 'AI:'}</strong>
              <ReactMarkdown>{entry.text}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
