import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, CheckSquare, BarChart, PlusCircle } from 'lucide-react';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        const coursesResponse = await axios.get('http://localhost:5000/teacher/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-center py-8 text-error">{error}</div>;

  const getCourseThumbnail = (course) => {
    if (course.thumbnailUrl) return course.thumbnailUrl;
    
    if (course.Videos && course.Videos.length > 0) {
      const firstVideoUrl = course.Videos[0].videoUrl;
      if (firstVideoUrl && (firstVideoUrl.includes('youtube.com') || firstVideoUrl.includes('youtu.be'))) {
        let videoId = '';
        let match = firstVideoUrl.match(/youtu\.be\/([^?]+)/);
        if (match) videoId = match[1];
        else {
          match = firstVideoUrl.match(/v=([^&]+)/);
          if (match) videoId = match[1];
          else {
            match = firstVideoUrl.match(/\/embed\/([^?]+)/);
            if (match) videoId = match[1];
          }
        }
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    return `https://picsum.photos/seed/${course.id + 100}/400/225`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Welcome, Professor {user?.name}</h1>
          <p className="text-muted">Manage your courses, assignments, and view student progress.</p>
        </div>
        <Link to="/create-course" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} />
          Create New Course
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <BookOpen size={32} />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>{courses.length}</h3>
          <p className="text-muted" style={{ margin: '0' }}>Active Courses</p>
        </div>
        
        <Link to="/teacher-assignments" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', color: '#22c55e', marginBottom: '1rem' }}>
            <CheckSquare size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0', marginTop: '1rem' }}>Manage Assignments</h3>
          <p className="text-muted" style={{ margin: '0' }}>View Submissions</p>
        </Link>

        <Link to="/teacher-progress" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: '#f59e0b', marginBottom: '1rem' }}>
            <BarChart size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0', marginTop: '1rem' }}>Student Progress</h3>
          <p className="text-muted" style={{ margin: '0' }}>Track Performance</p>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your Courses</h2>
      
      {courses.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Courses Yet</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>You haven't created any courses yet. Get started by creating your first one!</p>
          <Link to="/create-course" className="btn btn-primary">Create Course</Link>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="card course-card">
              <div className="course-image" style={{ 
                backgroundImage: `url(${getCourseThumbnail(course)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="course-content">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{course.title}</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span>{course.Videos?.length || 0} Videos</span>
                <span>{course.Assignments?.length || 0} Assignments</span>
              </div>
              
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <Link to={`/add-video/${course.id}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    <PlusCircle size={14} /> Add Video
                  </Link>
                  <Link to="/teacher-assignments" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    <CheckSquare size={14} /> Assignments
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
