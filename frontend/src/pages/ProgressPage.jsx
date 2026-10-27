import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Award, CheckSquare, Clock } from 'lucide-react';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgressData(res.data);
      } catch (err) {
        console.error('Failed to fetch progress data', err);
      }
    };
    fetchProgress();
  }, []);

  if (!progressData) return <div>Loading progress...</div>;

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Progress</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your learning journey and accomplishments.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '3rem' }}>
        <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-color)' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Enrolled Courses</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{progressData.enrolledCourses}</p>
        </div>

        <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
              <CheckSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Assignments Done</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{progressData.completedAssignments}</p>
        </div>

        <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Avg. Quiz Score</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{progressData.avgQuizScore}%</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Course Progression</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {progressData.courses && progressData.courses.length > 0 ? (
          progressData.courses.map(course => (
            <div key={course.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{course.title}</h3>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{course.Enrollment.progress}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${course.Enrollment.progress}%` }}></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">You haven't enrolled in any courses yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
