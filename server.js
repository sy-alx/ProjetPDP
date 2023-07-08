const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // pour le parsing du JSON

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'utilisateurspdp'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM utilisateurs WHERE Email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.MotDePasse, (err, result) => {
        if (err) throw err;
        if (result) {
          const token = jwt.sign({ id: user.IDutilisateurs }, 'secret_key');
          res.json({ token });
        } else {
          res.status(401).send('Invalid password');
        }
      });
    } else {
      res.status(401).send('Invalid email');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
