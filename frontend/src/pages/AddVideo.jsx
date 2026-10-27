import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Video, ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';

const AddVideo = () => {
  const { courseId } = useParams();
  const [videoType, setVideoType] = useState('youtube'); // 'youtube' or 'upload'
  const [videoData, setVideoData] = useState({ title: '', videoUrl: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Add Video to Course</h1>
      </div>

      <div className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#22c55e' }}>
          <Video size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Video Details</h2>
        </div>
        
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
              placeholder="e.g. Chapter 1: Introduction"
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
              <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
                Paste the standard YouTube link or embed URL.
              </small>
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
              {loading ? 'Adding...' : 'Add Video'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/teacher-dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideo;
