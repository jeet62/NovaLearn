require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  
  console.log('Connected to MySQL successfully.');
  
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'elearning'}\`;`, (err, results) => {
    if (err) {
      console.error('Error creating database:', err.message);
    } else {
      console.log('Database "elearning" created or already exists!');
    }
    connection.end();
  });
});
