const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const xml = require('xml');
const convert = require('xml-js');


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

    mongoose.connect('mongodb://127.0.0.1:27017/ProjetPDP', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
    console.log

    const statusMapping = {
        1: 'En cours',
        2: 'Accepté',
        3: 'Refusé'
    };
      
    const InvoiceSchema = new mongoose.Schema({
        emetteur: {
          NomEntreprise: String,
          NumeroSiret: String,
          NumeroTVA: String,
          CodePays: String
        },
        correspondant: {
          NomEntreprise: String,
          NumeroSiret: String,
          NumeroTVA: String,
          CodePays: String
        },
        invoice: {
          CodeDevise: String,
          NumeroFacture: String,
          TotalHT: String,
          TotalTVA: String,
          TotalTTC: String,
          RestantAPayer: String
        },
        status: {
          type: String,
          default: 'En cours'
        }
      });
    
    const Invoice = mongoose.model('Invoice', InvoiceSchema);
    
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
            console.log('Query results:', results);
            res.status(200).json({ message: 'User updated successfully' });
        }
        });
    });

    // Route to get all users
    app.get('/api/users', authenticateToken, (req, res) => {
        const query = 'SELECT * FROM utilisateurs';
        connection.query(query, (err, results) => {
        if (err) {
            console.log('Error executing query:', err);
            throw err;
        }
    
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send('No users found');
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


  // Route pour obtenir un utilisateur spécifique en fonction du numéro de SIRET
  app.get('/api/users/:siret', authenticateToken, (req, res) => {
        const siret = req.params.siret;
        console.log('Requested SIRET:', siret); // Add this line
        const query = 'SELECT * FROM utilisateurs WHERE NumeroSiret = ?';
        connection.query(query, [siret], (err, results) => {
            if (err) {
                console.log('Error executing query:', err);
                throw err;
            }
        
            console.log('Query results:', results); // Add this line
            if (results.length > 0) {
                const user = results[0];
                res.json(user);
            } else {
                res.status(404).send('User not found');
            }
        });
    });
  
    app.post('/api/invoices', authenticateToken, async (req, res) => {
        try {
          // Validez les données ici si nécessaire
      
          let invoice = new Invoice({
            emetteur: req.body.emetteur,
            correspondant: req.body.correspondant,
            invoice: req.body.facture,
            status: 'En cours'
          });
      
          console.log('Before saving invoice:', invoice); // Ajoutez ce log
      
          invoice = await invoice.save();
      
          console.log('After saving invoice:', invoice); // Ajoutez ce log
      
          res.send(invoice);
        } catch (err) {
          // Gérez l'erreur ici, par exemple en envoyant une réponse d'erreur
          console.log('Error saving invoice:', err); // Ajoutez ce log
          res.status(500).send({ message: err.message });
        }
    });


    app.get('/api/invoices/:siret', authenticateToken, async (req, res) => {
        try {
            const siret = req.params.siret;
            const invoices = await Invoice.find({ 
                'correspondant.NumeroSiret': siret,
                'status': 'En cours'
            });
            res.send(invoices);
        } catch (err) {
            console.log('Error getting invoices:', err);
            res.status(500).send({ message: err.message });
        }
    });



    // Route pour télécharger la facture en format JSON
    app.get('/api/invoices/json/:invoiceId', authenticateToken, async (req, res) => {
        try {
            const invoiceId = req.params.invoiceId;
            const invoice = await Invoice.findById(invoiceId);
            res.json(invoice);
        } catch (err) {
            console.log('Error getting invoice:', err);
            res.status(500).send({ message: err.message });
        }
    });

    // Route pour télécharger la facture en format XML
    app.get('/api/invoices/xml/:invoiceId', authenticateToken, async (req, res) => {
        try {
            const invoiceId = req.params.invoiceId;
            const invoice = await Invoice.findById(invoiceId);
            if (!invoice) {
                return res.status(404).send({ message: 'Invoice not found' });
            }
    
            const xml = convert.js2xml(invoice.toJSON(), {compact: true, ignoreComment: true, spaces: 4});
            res.set('Content-Type', 'text/xml');
            res.send(xml);
        } catch (err) {
            console.log('Error downloading invoice:', err);
            res.status(500).send({ message: err.message });
        }
    });
    
    app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
        try {
          const id = req.params.id;
          const status = req.body.status;
          const invoice = await Invoice.findOneAndUpdate({ _id: id }, { status: statusMapping[status] }, { new: true });
          res.send(invoice);
        } catch (err) {
          console.log('Error updating invoice:', err);
          res.status(500).send({ message: err.message });
        }
    });
      
      


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
