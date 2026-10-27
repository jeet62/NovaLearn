import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Award, CheckCircle, Search } from 'lucide-react';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [coursesRes, enrolledRes, progressRes] = await Promise.all([
        axios.get(`http://localhost:5000/courses?search=${search}`, config),
        axios.get('http://localhost:5000/enrollments', config),
        axios.get('http://localhost:5000/progress', config)
      ]);

      setCourses(coursesRes.data);
      setEnrolledCourses(enrolledRes.data.map(c => c.id));
      setProgressData(progressRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/enroll', { courseId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Enrollment failed', err);
    }
  };

  const getCourseThumbnail = (course) => {
    if (course.thumbnailUrl) {
      return course.thumbnailUrl;
    }
    
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
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
    }
    // Fallback: Unique generic image based on course ID
    return `https://picsum.photos/seed/${course.id + 100}/400/225`;
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's an overview of your learning journey.</p>
      </div>

      {progressData && (
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>Enrolled Courses</h3>
              <p>{progressData.enrolledCourses}</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>Assignments Completed</h3>
              <p>{progressData.completedAssignments}</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3>Avg. Quiz Score</h3>
              <p>{progressData.avgQuizScore}%</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Available Courses</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search courses..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-grid">
        {courses.map(course => {
          const isEnrolled = enrolledCourses.includes(course.id);
          // Find progress if enrolled
          const enrollmentInfo = progressData?.courses?.find(c => c.id === course.id);
          const progress = enrollmentInfo ? enrollmentInfo.Enrollment.progress : 0;

          return (
            <div key={course.id} className="card course-card">
              <div className="course-image" style={{ 
                backgroundImage: `url(${getCourseThumbnail(course)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">by {course.instructorName}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                  {course.description.substring(0, 100)}...
                </p>
                
                {isEnrolled ? (
                  <div className="course-progress-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <button 
                      className="btn btn-primary mt-4" 
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      Continue Course
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
