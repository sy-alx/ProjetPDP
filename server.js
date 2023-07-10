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

  console.log('Auth Header:', authHeader); // Affiche l'en-tête d'autorisation
  console.log('Token:', token); // Affiche le token

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, 'secret_key', (err, user) => {
    console.log('User:', user);
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

// Route pour obtenir les détails de l'utilisateur
app.get('/api/user', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM utilisateurs WHERE IDutilisateurs = ?';
  connection.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.log('Error executing query:', err);
      throw err;
    }

    if (results.length > 0) {
      const user = results[0];
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Route pour modifier les détails de l'utilisateur
app.put('/api/user', authenticateToken, (req, res) => {
    const { Email, NumeroTelephone } = req.body;
    const query = 'UPDATE utilisateurs SET Email = ?, NumeroTelephone = ? WHERE IDutilisateurs = ?';
    
    connection.query(query, [Email, NumeroTelephone, req.user.id], (err, results) => {
      if (err) {
        console.log('Error executing query:', err);
        res.status(500).json({ message: 'Error updating user' });
      } else {
        res.status(200).json({ message: 'User updated successfully' });
      }
    });
  });



  
  app.post('/api/verifyPassword', authenticateToken, (req, res) => {
    const { oldPassword } = req.body;
    const query = 'SELECT * FROM utilisateurs WHERE IDutilisateurs = ?';
    connection.query(query, [req.user.id], async (err, results) => {
      if (err) {
        console.log('Error executing query:', err);
        throw err;
      }
  
      if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(oldPassword, user.MotDePasse);
        if (match) {
          res.json({ isValid: true });
        } else {
          res.json({ isValid: false });
        }
      } else {
        res.status(404).send('User not found');
      }
    });
  });
  
  app.put('/api/updatePassword', authenticateToken, (req, res) => {
    const { newPassword } = req.body;
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.log('Error hashing password:', err);
        res.status(500).json({ message: 'Error updating password' });
        return;
      }
  
      const query = 'UPDATE utilisateurs SET MotDePasse = ? WHERE IDutilisateurs = ?';
      connection.query(query, [hashedPassword, req.user.id], (err, results) => {
        if (err) {
          console.log('Error executing query:', err);
          res.status(500).json({ message: 'Error updating password' });
        } else {
          res.status(200).json({ message: 'Password updated successfully' });
        }
      });
    });
  });
  
  
  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
