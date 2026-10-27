import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckSquare, Users } from 'lucide-react';

const TeacherQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  
  // Create Quiz State
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/teacher/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
      if (res.data.length > 0) {
        setSelectedCourse(res.data[0]);
        fetchQuizResults(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/teacher/quiz-results/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to fetch quiz results', err);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    fetchQuizResults(courseId);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !quizTitle) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/teacher/quizzes', {
        courseId: selectedCourse.id,
        title: quizTitle,
        questions: questions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuizTitle('');
      setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
      fetchQuizResults(selectedCourse.id);
    } catch (err) {
      console.error('Failed to create quiz', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Quizzes</h1>
          <p className="text-muted">Create quizzes and view student scores.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Create Quiz */}
          <div>
            <div className="card mb-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Course</h3>
              <select className="form-input" value={selectedCourse?.id || ''} onChange={handleCourseChange}>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create New Quiz</h3>
              <form onSubmit={handleCreateQuiz}>
                <div className="form-group">
                  <label className="form-label">Quiz Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={quizTitle} 
                    onChange={e => setQuizTitle(e.target.value)} 
                    placeholder="e.g. Midterm Quiz" 
                    required 
                  />
                </div>

                {questions.map((q, qIndex) => (
                  <div key={qIndex} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Question {qIndex + 1}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={q.question} 
                        onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                      {q.options.map((opt, oIndex) => (
                        <input 
                          key={oIndex} 
                          type="text" 
                          className="form-input" 
                          placeholder={`Option ${oIndex + 1}`} 
                          value={opt} 
                          onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} 
                          required 
                        />
                      ))}
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Correct Answer (Must match exactly one option)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={q.answer} 
                        onChange={e => handleQuestionChange(qIndex, 'answer', e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                ))}

                <button type="button" onClick={handleAddQuestion} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Add Question
                </button>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Quiz</button>
              </form>
            </div>
          </div>

          {/* Right Column: Quiz Results */}
          <div>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> Student Scores
              </h3>
              
              {quizzes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckSquare size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                  <p>No quizzes created for this course yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {quizzes.map(quiz => (
                    <div key={quiz.id} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                        {quiz.title} (Total Questions: {quiz.questions.length})
                      </div>
                      <div style={{ padding: '1rem' }}>
                        {quiz.Results && quiz.Results.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ paddingBottom: '0.5rem' }}>Student</th>
                                <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quiz.Results.map(result => (
                                <tr key={result.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.5rem 0' }}>
                                    <div>{result.User?.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{result.User?.email}</div>
                                  </td>
                                  <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    {result.score}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted" style={{ fontSize: '0.875rem' }}>No student has taken this quiz yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
