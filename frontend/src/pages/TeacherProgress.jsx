import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart } from 'lucide-react';

const TeacherProgress = () => {
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/teacher/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentProgress(res.data);
      } catch (err) {
        console.error('Failed to fetch student progress', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) return <div className="text-center py-8">Loading progress...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <BarChart size={32} color="var(--primary-color)" />
        <div>
          <h1 className="page-title" style={{ marginBottom: '0' }}>Student Progress</h1>
          <p className="text-muted">Track the progress of students enrolled in your courses.</p>
        </div>
      </div>

      <div className="card">
        {studentProgress.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p>No students have enrolled in your courses yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Course</th>
                  <th style={{ padding: '1rem' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {studentProgress.map((student, idx) => (
                  <tr key={`${student.studentId}-${student.courseId}-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{student.studentName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{student.studentEmail}</td>
                    <td style={{ padding: '1rem' }}>{student.courseTitle}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'var(--border-color)', borderRadius: '1rem', height: '0.5rem', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              backgroundColor: student.progress === 100 ? '#22c55e' : 'var(--primary-color)',
                              width: `${student.progress}%`
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{student.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProgress;
