import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, CheckSquare, Award, BarChart, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for dark mode preference on load
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      if (newMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return newMode;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isTeacher = user && user.role === 'teacher';

  const navItems = isTeacher ? [
    { name: 'Dashboard', path: '/teacher-dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Create Course', path: '/create-course', icon: <BookOpen size={18} /> },
    { name: 'Assignments', path: '/teacher-assignments', icon: <CheckSquare size={18} /> },
    { name: 'Quizzes', path: '/teacher-quizzes', icon: <CheckSquare size={18} /> },
    { name: 'Student Progress', path: '/teacher-progress', icon: <BarChart size={18} /> }
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Assignments', path: '/assignments', icon: <CheckSquare size={18} /> },
    { name: 'Progress', path: '/progress', icon: <BarChart size={18} /> }
  ];

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <BookOpen size={24} />
          NovaLearn
        </Link>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          <button 
            onClick={toggleDarkMode} 
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem' }}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
