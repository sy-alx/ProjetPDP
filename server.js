const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

app.use(cors());

// Ajoutez la fonction authenticateToken ici
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.post('/login', async (req, res) => {
    const { Email, MotDePasse } = req.body;
    console.log(`Email: ${Email}`);
    console.log(`Password: ${MotDePasse}`);
    const query = 'SELECT * FROM utilisateurs WHERE Email = ?';
    console.log(`Attempting to login with Email: ${Email} and Password: ${MotDePasse}`);
    connection.query(query, [Email], async (err, results) => {
      if (err) {
        console.log('Error executing query:', err);
        throw err;
      }
      console.log('Query results:', results);
      if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(MotDePasse, user.MotDePasse);
        if (match) {
          const token = jwt.sign({ id: user.IDutilisateurs }, 'secret_key');
          res.json({ token });
        } else {
          console.log('Invalid password');
          res.status(401).send('Invalid password');
        }          
      } else {
        console.log('Invalid email');
        res.status(401).send('Invalid email');
      }
    });
});

// Utilisez authenticateToken comme middleware dans vos autres routes
app.get('/dashboard', authenticateToken, (req, res) => {
  res.send('Bienvenue sur le tableau de bord !');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
