import { useState, useEffect } from 'react';
import axios from 'axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
      
      const initialAnswers = {};
      res.data.forEach(a => {
        if (a.Submissions && a.Submissions.length > 0) {
          initialAnswers[a.id] = a.Submissions[0].answer;
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    }
  };

  const handleAnswerChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/submit-assignment', {
        assignmentId,
        answer: answers[assignmentId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Assignment submitted successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Submission failed', err);
      alert('Failed to submit assignment');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Assignments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete your pending assignments to improve your progress.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {assignments.length === 0 ? (
          <p>No assignments found. Enroll in more courses!</p>
        ) : (
          assignments.map(assignment => {
            const submission = assignment.Submissions && assignment.Submissions.length > 0 ? assignment.Submissions[0] : null;
            const isSubmitted = !!submission;

            return (
              <div key={assignment.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {assignment.Course.title}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem' }}>{assignment.question}</h3>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: isSubmitted ? '#d1fae5' : '#fef3c7',
                    color: isSubmitted ? '#065f46' : '#92400e'
                  }}>
                    {isSubmitted ? submission.status : 'Pending'}
                  </span>
                </div>

                <div className="form-group">
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Type your answer here..."
                    value={answers[assignment.id] || ''}
                    onChange={(e) => handleAnswerChange(assignment.id, e.target.value)}
                    disabled={isSubmitted && submission.status === 'Graded'}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSubmit(assignment.id)}
                    disabled={!answers[assignment.id] || (isSubmitted && submission.status === 'Graded')}
                  >
                    {isSubmitted ? 'Update Submission' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Assignments;
