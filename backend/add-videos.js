require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elearning'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  
  console.log('Connected to MySQL. Adding more videos...');

  // Assuming CourseId 1 is React and CourseId 2 is Node.js based on our initial seed
  const query = `
    INSERT INTO Videos (title, videoUrl, CourseId, createdAt, updatedAt)
    VALUES 
    ('React Hooks in 15 Minutes', 'https://www.youtube.com/embed/O6P86uwfdR0', 1, NOW(), NOW()),
    ('Express Middleware Explained', 'https://www.youtube.com/embed/lY6icfhap2o', 2, NOW(), NOW());
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error adding videos:', err.message);
    } else {
      console.log('Successfully added two new videos!');
    }
    connection.end();
  });
});
