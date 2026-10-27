import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', university: '', role: 'teacher' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ borderTop: '4px solid #f59e0b' }}>
        <h2 className="auth-title">Teacher Registration</h2>
        <p className="auth-subtitle">Join as an instructor to create courses and assignments</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="university">Institution/University Name</label>
            <input
              type="text"
              id="university"
              name="university"
              className="form-input"
              value={formData.university}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <p className="text-error mb-4">{error}</p>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register as Teacher'}
          </button>
        </form>
        
        <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          Are you a student? <Link to="/register">Student Registration</Link>
        </p>
        <p className="text-center mt-2" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegister;
