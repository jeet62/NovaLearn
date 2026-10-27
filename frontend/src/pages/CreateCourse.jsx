import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Video, Upload, Link as LinkIcon } from 'lucide-react';

const CreateCourse = () => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const thumbnailInputRef = useRef(null);
  
  // Video state
  const [videoType, setVideoType] = useState('youtube'); // 'youtube' or 'upload'
  const [videoData, setVideoData] = useState({ title: '', videoUrl: '' });
  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [courseCreated, setCourseCreated] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      const response = await axios.post('http://localhost:5000/teacher/courses', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setCourseId(response.data.id);
      setCourseCreated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      let submitData;
      let headers = { Authorization: `Bearer ${token}` };

      if (videoType === 'upload') {
        if (!videoFile) {
          setError('Please select a video file.');
          setLoading(false);
          return;
        }
        submitData = new FormData();
        submitData.append('title', videoData.title);
        submitData.append('courseId', courseId);
        submitData.append('videoFile', videoFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        submitData = { ...videoData, courseId };
      }

      await axios.post('http://localhost:5000/teacher/videos', submitData, { headers });
      navigate('/teacher-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Create New Course</h1>

      {!courseCreated ? (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
            <BookOpen size={24} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Course Details</h2>
          </div>
          
          <form onSubmit={handleCourseSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Course Title</label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="e.g. Advanced Mathematics"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="description">Course Description</label>
              <textarea
                id="description"
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={5}
                placeholder="Describe what students will learn..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Course Thumbnail (Optional)</label>
              <div 
                style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '2rem', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--background-color)'
                }}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ margin: 0, fontWeight: '500' }}>{thumbnailFile ? thumbnailFile.name : 'Click to select an image'}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</p>
                
                <input
                  type="file"
                  id="thumbnailFile"
                  ref={thumbnailInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setThumbnailFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            {error && <p className="text-error mb-4">{error}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card animate-fade-in">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#22c55e' }}>
            <Video size={24} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Add First Video (Optional)</h2>
          </div>
          
          <p className="text-muted mb-4">Your course has been created successfully! Add an introductory video, or skip to dashboard.</p>
          
          <form onSubmit={handleVideoSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="videoTitle">Video Title</label>
              <input
                type="text"
                id="videoTitle"
                className="form-input"
                value={videoData.title}
                onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                required
                placeholder="e.g. Introduction"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Video Source</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className={`btn ${videoType === 'youtube' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setVideoType('youtube')}
                  style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <LinkIcon size={18} /> YouTube Link
                </button>
                <button
                  type="button"
                  className={`btn ${videoType === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setVideoType('upload')}
                  style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Upload size={18} /> Upload File
                </button>
              </div>
            </div>
            
            {videoType === 'youtube' ? (
              <div className="form-group animate-fade-in">
                <label className="form-label" htmlFor="videoUrl">YouTube URL</label>
                <input
                  type="url"
                  id="videoUrl"
                  className="form-input"
                  value={videoData.videoUrl}
                  onChange={(e) => setVideoData({...videoData, videoUrl: e.target.value})}
                  required={videoType === 'youtube'}
                  placeholder="e.g. https://www.youtube.com/watch?v=XXXX"
                />
              </div>
            ) : (
              <div className="form-group animate-fade-in">
                <label className="form-label" htmlFor="videoFile">Video File (MP4, WEBM, OGG)</label>
                <div 
                  style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '2rem', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--background-color)'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontWeight: '500' }}>{videoFile ? videoFile.name : 'Click to select a video file'}</p>
                  
                  <input
                    type="file"
                    id="videoFile"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                    required={videoType === 'upload'}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-error mb-4">{error}</p>}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Video & Finish'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/teacher-dashboard')}>
                Skip for now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
