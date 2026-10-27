require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ==========================================
// Database Configuration (Sequelize)
// ==========================================
const sequelize = new Sequelize(
  process.env.DB_NAME || 'elearning',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// ==========================================
// Models Definition
// ==========================================

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  university: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student', 'teacher'), defaultValue: 'student' },
});

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  instructorName: { type: DataTypes.STRING, allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
});

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 }, // percentage 0-100
});

const Video = sequelize.define('Video', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  videoUrl: { type: DataTypes.STRING, allowNull: false }, // Store YouTube embed URL
});

const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.TEXT, allowNull: false },
});

const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  answer: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('Submitted', 'Pending', 'Graded'), defaultValue: 'Submitted' },
  marks: { type: DataTypes.INTEGER, allowNull: true },
});

const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  questions: { type: DataTypes.JSON, allowNull: false }, // Array of objects: { question, options, answer }
});

const Result = sequelize.define('Result', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  score: { type: DataTypes.INTEGER, allowNull: false },
});

const Note = sequelize.define('Note', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.FLOAT, allowNull: false }, // seconds in video
});

// Relationships
User.belongsToMany(Course, { through: Enrollment });
Course.belongsToMany(User, { through: Enrollment });

// A Teacher creates courses
User.hasMany(Course, { as: 'CreatedCourses', foreignKey: 'CreatorId' });
Course.belongsTo(User, { as: 'Creator', foreignKey: 'CreatorId' });

Course.hasMany(Video);
Video.belongsTo(Course);

Course.hasMany(Assignment);
Assignment.belongsTo(Course);

Assignment.hasMany(Submission);
Submission.belongsTo(Assignment);
User.hasMany(Submission);
Submission.belongsTo(User);

Course.hasMany(Quiz);
Quiz.belongsTo(Course);

Quiz.hasMany(Result);
Result.belongsTo(Quiz);
User.hasMany(Result);
Result.belongsTo(User);

Video.hasMany(Note);
Note.belongsTo(Video);
User.hasMany(Note);
Note.belongsTo(User);

// ==========================================
// Middleware
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==========================================
// Routes
// ==========================================

// Authentication
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, university, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'teacher' ? 'teacher' : 'student';
    const user = await User.create({ name, email, password: hashedPassword, university, role: userRole });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '24h' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, university: user.university, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Courses
app.get('/courses', authenticateToken, async (req, res) => {
  try {
    // Include search functionality
    const { search } = req.query;
    let whereClause = {};
    if (search) {
      whereClause = {
        title: { [Sequelize.Op.like]: `%${search}%` }
      };
    }
    const courses = await Course.findAll({ 
      where: whereClause,
      include: [Video]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [Video, Assignment, Quiz]
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Enrollments
app.get('/enrollments', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Course,
        through: { attributes: ['progress'] }
      }]
    });
    res.json(user.Courses || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

app.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const user = await User.findByPk(req.user.id);
    await user.addCourse(course);
    
    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// Assignments
app.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Course });
    const courseIds = user.Courses.map(c => c.id);

    const assignments = await Assignment.findAll({
      where: { CourseId: courseIds },
      include: [{ model: Course, attributes: ['title'] }, { model: Submission, required: false, where: { UserId: req.user.id } }]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/submit-assignment', authenticateToken, async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;
    
    const [submission, created] = await Submission.findOrCreate({
      where: { AssignmentId: assignmentId, UserId: req.user.id },
      defaults: { answer, status: 'Submitted' }
    });

    if (!created) {
      submission.answer = answer;
      await submission.save();
    }

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Quizzes
app.get('/quiz/:courseId', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: { CourseId: req.params.courseId },
      include: [{ model: Result, required: false, where: { UserId: req.user.id } }]
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.post('/submit-quiz', authenticateToken, async (req, res) => {
  try {
    const { quizId, score } = req.body;
    
    const [result, created] = await Result.findOrCreate({
      where: { QuizId: quizId, UserId: req.user.id },
      defaults: { score }
    });

    if (!created && score > result.score) {
        result.score = score;
        await result.save();
    }

    res.json({ message: 'Quiz submitted successfully', score });
  } catch (error) {
    res.status(500).json({ error: 'Quiz submission failed' });
  }
});

// Notes
app.get('/notes/:videoId', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { VideoId: req.params.videoId, UserId: req.user.id },
      order: [['timestamp', 'ASC']]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { videoId, text, timestamp } = req.body;
    const note = await Note.create({
      text,
      timestamp,
      VideoId: videoId,
      UserId: req.user.id
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

app.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    await Note.destroy({ where: { id: req.params.id, UserId: req.user.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Progress Overview
app.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total enrolled courses
    const user = await User.findByPk(userId, { include: Course });
    const enrolledCoursesCount = user.Courses ? user.Courses.length : 0;
    
    // Get total submissions
    const submissionsCount = await Submission.count({ where: { UserId: userId } });
    
    // Get average quiz score
    const results = await Result.findAll({ where: { UserId: userId } });
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const avgQuizScore = results.length > 0 ? (totalScore / results.length).toFixed(1) : 0;

    res.json({
        enrolledCourses: enrolledCoursesCount,
        completedAssignments: submissionsCount,
        avgQuizScore,
        courses: user.Courses
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ==========================================
// Teacher Routes
// ==========================================

const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Forbidden: Teacher access required' });
  }
  next();
};

app.post('/teacher/courses', authenticateToken, authorizeTeacher, upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    let thumbnailUrl = null;
    if (req.file) {
      thumbnailUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    
    // Fetch the user to get their name
    const user = await User.findByPk(req.user.id);
    
    const course = await Course.create({
      title,
      description,
      instructorName: user.name,
      CreatorId: req.user.id,
      thumbnailUrl
    });
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.post('/teacher/videos', authenticateToken, authorizeTeacher, upload.single('videoFile'), async (req, res) => {
  try {
    const { title, courseId } = req.body;
    let videoUrl = req.body.videoUrl;
    
    if (req.file) {
      videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const course = await Course.findOne({ where: { id: courseId, CreatorId: req.user.id } });
    if (!course) return res.status(403).json({ error: 'Course not found or unauthorized' });

    const video = await Video.create({ title, videoUrl, CourseId: courseId });
    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

app.post('/teacher/assignments', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { question, courseId } = req.body;
    const course = await Course.findOne({ where: { id: courseId, CreatorId: req.user.id } });
    if (!course) return res.status(403).json({ error: 'Course not found or unauthorized' });

    const assignment = await Assignment.create({ question, CourseId: courseId });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

app.get('/teacher/courses', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { CreatorId: req.user.id },
      include: [Video, Assignment]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/teacher/submissions/:assignmentId', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId, {
      include: [
        { model: Course, where: { CreatorId: req.user.id } }
      ]
    });
    if (!assignment) return res.status(403).json({ error: 'Assignment not found or unauthorized' });

    const submissions = await Submission.findAll({
      where: { AssignmentId: req.params.assignmentId },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/teacher/students', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    // Get all courses created by this teacher
    const courses = await Course.findAll({
      where: { CreatorId: req.user.id },
      include: [
        {
          model: User,
          through: { attributes: ['progress'] },
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Flatten to a list of students with their progress per course
    const studentProgress = [];
    courses.forEach(course => {
      course.Users.forEach(student => {
        studentProgress.push({
          courseId: course.id,
          courseTitle: course.title,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          progress: student.Enrollment.progress
        });
      });
    });

    res.json(studentProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
});

app.post('/teacher/grade-submission', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { submissionId, marks } = req.body;
    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Assignment, include: [{ model: Course, where: { CreatorId: req.user.id } }] }]
    });

    if (!submission || !submission.Assignment || !submission.Assignment.Course) {
      return res.status(403).json({ error: 'Submission not found or unauthorized' });
    }

    submission.marks = marks;
    submission.status = 'Graded';
    await submission.save();

    res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

app.post('/teacher/quizzes', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { title, questions, courseId } = req.body;
    const course = await Course.findOne({ where: { id: courseId, CreatorId: req.user.id } });
    
    if (!course) return res.status(403).json({ error: 'Course not found or unauthorized' });

    const quiz = await Quiz.create({ title, questions, CourseId: courseId });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

app.get('/teacher/quiz-results/:courseId', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.courseId, CreatorId: req.user.id } });
    if (!course) return res.status(403).json({ error: 'Course not found or unauthorized' });

    const quizzes = await Quiz.findAll({
      where: { CourseId: req.params.courseId },
      include: [
        { 
          model: Result, 
          include: [{ model: User, attributes: ['name', 'email'] }]
        }
      ]
    });
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
});

// ==========================================
// Server Start & Sync
// ==========================================

const seedDatabase = async () => {
    // Check if courses exist to avoid duplicate seeding
    const courseCount = await Course.count();
    if (courseCount === 0) {
        console.log('Seeding mock data...');
        const course1 = await Course.create({
            title: 'Modern React Web Development',
            description: 'Learn React from scratch with hooks, context, and modern patterns.',
            instructorName: 'Jane Doe'
        });
        
        await Video.create({
            title: 'React Crash Course',
            videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
            CourseId: course1.id
        });

        await Assignment.create({
            question: 'Create a simple counter component in React using useState.',
            CourseId: course1.id
        });

        await Quiz.create({
            title: 'React Basics',
            questions: [
                {
                    question: 'What is a functional component?',
                    options: ['A function that returns HTML', 'A class', 'A state manager', 'A database query'],
                    answer: 'A function that returns HTML'
                },
                {
                    question: 'Which hook is used for state?',
                    options: ['useEffect', 'useState', 'useContext', 'useRef'],
                    answer: 'useState'
                }
            ],
            CourseId: course1.id
        });

        const course2 = await Course.create({
            title: 'Advanced Node.js & Express',
            description: 'Master backend development with Node.js and Express framework.',
            instructorName: 'John Smith'
        });

        await Video.create({
            title: 'Node.js Full Course',
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            CourseId: course2.id
        });

        await Assignment.create({
            question: 'Set up an Express server with a GET route returning "Hello World".',
            CourseId: course2.id
        });

        console.log('Mock data seeded.');
    }
};

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
