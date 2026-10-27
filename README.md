# NovaLearn

NovaLearn is a full-stack e-learning platform built for managing online courses, class content, student progress, assignments, and quizzes. It supports both student and teacher roles, making it suitable for academic or training use cases.

## Features

- User authentication and role-based access
- Student dashboard and course enrollment
- Teacher dashboard for creating and managing courses
- Video lesson management
- Assignment creation and submission tracking
- Quiz creation, results, and progress analytics
- Progress overview for students and teachers
- Responsive React frontend with Vite
- Express + Sequelize backend with MySQL

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Sequelize, MySQL
- Authentication: JWT, bcrypt
- File upload: Multer

## Project Structure

```text
NovaLearn/
├── backend/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── setup-db.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
├── LICENSE
├── README.md
├── Project_Report NEW.docx
├── Bhargab_ppt.pptx
└── Project_Report_files/
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- MySQL server running locally or on a remote host
- npm

## Backend Setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create an environment file:

```bash
cp .env.example .env
```

4. Update the values in `.env`:

```env
DB_NAME=elearning
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
JWT_SECRET=your_super_secret_key
PORT=5000
```

5. Start the backend:

```bash
npm start
```

## Frontend Setup

1. Go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file if needed:

```bash
cp .env.example .env
```

4. Start the frontend:

```bash
npm run dev
```

## Default Application Flow

- Register a new user account
- Choose a role: `student` or `teacher`
- Teachers can create courses, videos, assignments, and quizzes
- Students can enroll in courses, submit assignments, and track their progress

## Database Notes

The backend uses Sequelize with MySQL. On first run, the app will sync tables automatically and seed a few demo course records if the database is empty.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome. You can fork the repository, create a feature branch, and open a pull request.

## Project Status

This repository is intended as a learning project and a portfolio-ready application showcasing a modern e-learning platform.
