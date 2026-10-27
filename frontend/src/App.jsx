import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import Assignments from './pages/Assignments';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherRegister from './pages/TeacherRegister';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateCourse from './pages/CreateCourse';
import AddVideo from './pages/AddVideo';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherProgress from './pages/TeacherProgress';
import TeacherQuizzes from './pages/TeacherQuizzes';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teacher-register" element={<TeacherRegister />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses/:id" element={<CoursePlayer />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="quiz/:courseId" element={<QuizPage />} />
          <Route path="progress" element={<ProgressPage />} />
          
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="add-video/:courseId" element={<AddVideo />} />
          <Route path="teacher-assignments" element={<TeacherAssignments />} />
          <Route path="teacher-quizzes" element={<TeacherQuizzes />} />
          <Route path="teacher-progress" element={<TeacherProgress />} />
        </Route>
      </Routes>
    </Router>
  );
}

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
