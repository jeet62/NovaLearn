import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const QuizPage = () => {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/quiz/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data);
      if (res.data.length > 0) {
        setActiveQuiz(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    }
  };

  const handleOptionSelect = (questionIndex, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;

    let currentScore = 0;
    activeQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        currentScore += 1;
      }
    });

    const percentage = Math.round((currentScore / activeQuiz.questions.length) * 100);
    setScore(percentage);
    setSubmitted(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/submit-quiz', {
        quizId: activeQuiz.id,
        score: percentage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to submit quiz score', err);
    }
  };

  if (quizzes.length === 0) return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>No quizzes available for this course yet.</div>;
  if (!activeQuiz) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">{activeQuiz.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Test your knowledge. Answer all questions to get your score.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</button>
      </div>

      {!submitted ? (
        <div className="card" style={{ padding: '2rem' }}>
          {activeQuiz.questions.map((q, qIndex) => (
            <div key={qIndex} style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                {qIndex + 1}. {q.question}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map((option, oIndex) => (
                  <label 
                    key={oIndex} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '1rem', 
                      border: `1px solid ${answers[qIndex] === option ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      backgroundColor: answers[qIndex] === option ? '#e0e7ff' : 'var(--surface-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`question-${qIndex}`} 
                      value={option}
                      checked={answers[qIndex] === option}
                      onChange={() => handleOptionSelect(qIndex, option)}
                      style={{ accentColor: 'var(--primary-color)', width: '1.2rem', height: '1.2rem' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== activeQuiz.questions.length}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Quiz Completed!</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Your score:</p>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
            {score}%
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={() => { setSubmitted(false); setAnswers({}); }}>Retake Quiz</button>
            <button className="btn btn-primary" onClick={() => navigate(`/courses/${courseId}`)}>Continue Learning</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
