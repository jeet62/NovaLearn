import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, FileText, HelpCircle, Clock, Plus, Trash2 } from 'lucide-react';
import YouTube from 'react-youtube';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [player, setPlayer] = useState(null);
  const nativePlayerRef = useRef(null);
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(res.data);
        if (res.data.Videos && res.data.Videos.length > 0) {
          setActiveVideo(res.data.Videos[0]);
        }
      } catch (err) {
        console.error('Failed to fetch course details', err);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (activeVideo) {
      fetchNotes();
    }
  }, [activeVideo]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/notes/${activeVideo.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return '';
    // Handle youtu.be/ID
    let match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
    // Handle youtube.com/watch?v=ID
    match = url.match(/v=([^&]+)/);
    if (match) return match[1];
    // Handle youtube.com/embed/ID
    match = url.match(/\/embed\/([^?]+)/);
    if (match) return match[1];
    
    // Return url directly if it might just be the ID itself
    return url;
  };

  const isYouTube = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    let currentTime = 0;
    if (isYouTube(activeVideo.videoUrl)) {
      if (player && typeof player.getCurrentTime === 'function') {
        currentTime = player.getCurrentTime() || 0;
      }
    } else {
      if (nativePlayerRef.current) {
        currentTime = nativePlayerRef.current.currentTime || 0;
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5000/notes', {
        videoId: activeVideo.id,
        text: newNoteText,
        timestamp: currentTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewNoteText('');
      fetchNotes();
    } catch (err) {
      console.error('Failed to add note', err);
      alert('Failed to save note! Check if your backend server is running correctly.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const handleSeek = (time) => {
    if (isYouTube(activeVideo?.videoUrl)) {
      if (player) {
        player.seekTo(time);
        player.playVideo();
      }
    } else {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.currentTime = time;
        nativePlayerRef.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!course) return <div>Loading course...</div>;

  const ytOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
      <div>
        <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
          <h1 className="dashboard-title" style={{ fontSize: '1.5rem' }}>{course.title}</h1>
        </div>

        {activeVideo ? (
          <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            {isYouTube(activeVideo.videoUrl) ? (
              <YouTube 
                videoId={extractYouTubeId(activeVideo.videoUrl)} 
                opts={ytOptions} 
                onReady={(e) => setPlayer(e.target)}
                className="absolute-iframe"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            ) : (
              <video
                ref={nativePlayerRef}
                src={activeVideo.videoUrl}
                controls
                autoPlay
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000' }}
              />
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            <p>No video selected or available for this course.</p>
          </div>
        )}

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Course Description</h3>
          <p style={{ color: 'var(--text-muted)' }}>{course.description}</p>
        </div>

        {/* Video Notes Section */}
        {activeVideo && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} /> Time-Stamped Notes
              </h3>
            </div>
            
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Type a note and press Enter (saves current video time)..." 
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={16} /> Add Note
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notes yet for this video.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => handleSeek(note.timestamp)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {formatTime(note.timestamp)}
                    </button>
                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{note.text}</span>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      style={{ color: 'var(--danger-color)', backgroundColor: 'transparent', padding: '0.25rem' }}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.125rem' }}>Course Content</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {course.Videos?.map(video => (
              <li 
                key={video.id} 
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: activeVideo?.id === video.id ? '#e0e7ff' : 'transparent',
                  color: activeVideo?.id === video.id ? 'var(--primary-color)' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}
                onClick={() => setActiveVideo(video)}
              >
                <PlayCircle size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{video.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.125rem' }}>Activities</h3>
          
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', justifyContent: 'flex-start', gap: '0.5rem' }}
            onClick={() => navigate('/assignments')}
          >
            <FileText size={16} /> View Assignments
          </button>
          
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '0.5rem' }}
            onClick={() => navigate(`/quiz/${course.id}`)}
          >
            <HelpCircle size={16} /> Take Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
