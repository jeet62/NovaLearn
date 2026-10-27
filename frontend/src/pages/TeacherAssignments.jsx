import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, Printer } from 'lucide-react';

const TeacherAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  const [newAssignment, setNewAssignment] = useState({ question: '' });
  const [marksInput, setMarksInput] = useState({});
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
        setAssignments(res.data[0].Assignments || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    setAssignments(course?.Assignments || []);
    setSelectedAssignment(null);
    setSubmissions([]);
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      setSelectedAssignment(assignmentId);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/teacher/submissions/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !newAssignment.question) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/teacher/assignments', {
        courseId: selectedCourse.id,
        question: newAssignment.question
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAssignments([...assignments, res.data]);
      setNewAssignment({ question: '' });
    } catch (err) {
      console.error('Failed to create assignment', err);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      const marks = marksInput[submissionId];
      if (marks === undefined || marks === '') return;

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/teacher/grade-submission', {
        submissionId,
        marks: parseInt(marks)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'Graded', marks: parseInt(marks) } : sub
      ));
    } catch (err) {
      console.error('Failed to grade submission', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="animate-fade-in print-container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Assignments</h1>
          <p className="text-muted">Manage assignments and view student submissions.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center no-print">
          <p className="text-muted">You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Left Column: Courses and Assignments List */}
          <div className="no-print">
            <div className="card mb-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Course</h3>
              <select className="form-input" value={selectedCourse?.id || ''} onChange={handleCourseChange}>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="card mb-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create Assignment</h3>
              <form onSubmit={handleCreateAssignment}>
                <textarea 
                  className="form-input mb-4" 
                  rows="3" 
                  placeholder="Enter assignment question..."
                  value={newAssignment.question}
                  onChange={(e) => setNewAssignment({ question: e.target.value })}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <Plus size={18} /> Add Assignment
                </button>
              </form>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Assignments</h3>
              {assignments.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>No assignments for this course.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {assignments.map(a => (
                    <li 
                      key={a.id} 
                      onClick={() => handleViewSubmissions(a.id)}
                      style={{ 
                        padding: '1rem', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '0.5rem', 
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: selectedAssignment === a.id ? 'var(--bg-color)' : 'transparent',
                        borderColor: selectedAssignment === a.id ? 'var(--primary-color)' : 'var(--border-color)'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.question}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Submissions */}
          <div>
            {selectedAssignment ? (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Submissions</h2>
                  <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                    <Printer size={16} /> Print
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckSquare size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <p>No submissions yet for this assignment.</p>
                  </div>
                ) : (
                  <div className="submissions-list">
                    {submissions.map(sub => (
                      <div key={sub.id} className="submission-item print-submission" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', marginBottom: '1rem', breakInside: 'avoid' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                          <div>
                            <span style={{ fontWeight: 'bold' }}>{sub.User?.name}</span>
                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>({sub.User?.email})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: sub.status === 'Graded' ? 'var(--primary-color)' : 'var(--bg-color)', color: sub.status === 'Graded' ? 'white' : 'inherit', borderRadius: '1rem' }}>
                              {sub.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '1rem' }}>
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                          {sub.answer}
                        </div>
                        
                        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--background-color)', borderRadius: '0.5rem' }}>
                          {sub.status === 'Graded' ? (
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                              Marks Awarded: {sub.marks}
                            </div>
                          ) : (
                            <>
                              <input 
                                type="number" 
                                className="form-input" 
                                placeholder="Enter Marks" 
                                style={{ width: '150px' }}
                                value={marksInput[sub.id] || ''}
                                onChange={(e) => setMarksInput({...marksInput, [sub.id]: e.target.value})}
                              />
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleGradeSubmission(sub.id)}
                                disabled={!marksInput[sub.id]}
                              >
                                Grade Submission
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center" style={{ padding: '4rem 2rem' }}>
                <CheckSquare size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Select an Assignment</h3>
                <p className="text-muted">Click on an assignment from the list to view its submissions.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Print-only Header */}
      <div className="print-only" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
          Assignment Submissions
        </h1>
        {selectedCourse && <p><strong>Course:</strong> {selectedCourse.title}</p>}
        {selectedAssignment && assignments.find(a => a.id === selectedAssignment) && (
          <p style={{ marginBottom: '2rem' }}><strong>Question:</strong> {assignments.find(a => a.id === selectedAssignment).question}</p>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
