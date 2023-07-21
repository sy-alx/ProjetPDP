const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const xml = require('xml');
const convert = require('xml-js');

const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require ('swagger-ui-express')

const app = express(); // Initialize the express app first

const options ={
    definition:{
        openapi : '3.0.0',
        info : {
            title : 'api nodejs',
            version : '1.0.0'
        },
        servers:[
            {
            url:'http://localhost:3000'
            }
        ]
    },
    apis:['./server.js']
}

const swaggerSpec = swaggerJSDoc(options)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));



app.use(express.json()); // pour le parsing du JSON

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'utilisateurspdp'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

mongoose.connect('mongodb://127.0.0.1:27017/ProjetPDP', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

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

// ajout de la fonction authenticateToken ici
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connection à l'application
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             Email:
 *               type: string
 *             MotDePasse:
 *               type: string
 *     responses:
 *       200:
 *         description: Return le token
 *       401:
 *         description: Mauvais Email ou mot de passe 
 */
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

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Aller au Tableau de bord (dashboard)
 *     responses:
 *       200:
 *         description: Retour au dashboard
 *       401:
 *         description: Accès refusé
 */
app.get('/dashboard', authenticateToken, (req, res) => {
    res.send('Bienvenue sur le tableau de bord !');
});

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Détails de l'utilisateur 
 *     responses:
 *       200:
 *         description: Renvoie des informations
 *       401:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateurs pas trouvé
 */
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

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Mise a jour des détails de l'utilisateur
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             Email:
 *               type: string
 *             NumeroTelephone:
 *               type: string
 *     responses:
 *       200:
 *         description: Mise a jour utuilsateur réussi 
 *       500:
 *         description: Erreur dans la mise a jour
 */
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

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tout les utilisateurs
 *     responses:
 *       200:
 *         description: Renvoyer tout les utilisateurs 
 *       404:
 *         description: Aucuns utilisateurs trouvées
 */
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

/**
 * @swagger
 * /api/verifyPassword:
 *   post:
 *     summary: Vérification mot de passe
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             oldPassword:
 *               type: string
 *     responses:
 *       200:
 *         description: Indique si le mot de passe est valide
 *       404:
 *         description: Utilisateur introuvé 
 */
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

/**
 * @swagger
 * /api/updatePassword:
 *   put:
 *     summary: Mise à jour du mot de passe de l'utilisateur
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             newPassword:
 *               type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis a jour avec succès
 *       500:
 *         description: Erruer dans la mise a jour du mot de passe
 */
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

/**
 * @swagger
 * /api/users/{siret}:
 *   get:
 *     summary: Sélectionner un utilisateur en fonction de sont siret
 *     parameters:
 *       - in: path
 *         name: siret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Renvoyer les infos de l'utilisateur
 *       404:
 *         description: Utilisateur introuvé  
 */
app.get('/api/users/:siret', authenticateToken, (req, res) => {
    const siret = req.params.siret;
    console.log('Requested SIRET:', siret); 
    const query = 'SELECT * FROM utilisateurs WHERE NumeroSiret = ?';
    connection.query(query, [siret], (err, results) => {
        if (err) {
            console.log('Error executing query:', err);
            throw err;
        }
    
        console.log('Query results:', results); 
        if (results.length > 0) {
            const user = results[0];
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    });
});

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Création d'une nouvelle facture
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             emetteur:
 *               type: object
 *               properties:
 *                 NomEntreprise:
 *                   type: string
 *                 NumeroSiret:
 *                   type: string
 *                 NumeroTVA:
 *                   type: string
 *                 CodePays:
 *                   type: string
 *             correspondant:
 *               type: object
 *               properties:
 *                 NomEntreprise:
 *                   type: string
 *                 NumeroSiret:
 *                   type: string
 *                 NumeroTVA:
 *                   type: string
 *                 CodePays:
 *                   type: string
 *             facture:
 *               type: object
 *               properties:
 *                 CodeDevise:
 *                   type: string
 *                 NumeroFacture:
 *                   type: string
 *                 TotalHT:
 *                   type: string
 *                 TotalTVA:
 *                   type: string
 *                 TotalTTC:
 *                   type: string
 *                 RestantAPayer:
 *                   type: string
 *     responses:
 *       200:
 *         description: Retourne la facture créée
 *       500:
 *         description: Erreur lors de la création de la facture
 */
app.post('/api/invoices', authenticateToken, async (req, res) => {
    try {
      
  
      let invoice = new Invoice({
        emetteur: req.body.emetteur,
        correspondant: req.body.correspondant,
        invoice: req.body.facture,
        status: 'En cours'
      });
  
      console.log('Before saving invoice:', invoice);
  
      invoice = await invoice.save();
  
      console.log('After saving invoice:', invoice); 
  
      res.send(invoice);
    } catch (err) {
      
      console.log('Error saving invoice:', err); 
      res.status(500).send({ message: err.message });
    }
});

/**
 * @swagger
 * /api/invoices/{siret}:
 *   get:
 *     summary: Get invoices by SIRET number
 *     parameters:
 *       - in: path
 *         name: siret
 *         required: true
 *         schema:
 *           type: string
 *         description: The SIRET number of the company
 *     responses:
 *       200:
 *         description: Returns the invoices
 *       404:
 *         description: No invoices found
 *       500:
 *         description: Error getting invoices
 */

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

/**
 * @swagger
 * /api/invoices/closed/{siret}:
 *   get:
 *     summary: Obtenir toutes les factures clôturées pour un numéro de SIRET spécifique
 *     parameters:
 *       - in: path
 *         name: siret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description:  Retourne toutes les factures clôturées
 *       500:
 *         description: Erreur dans l'obtention des factures
 */
app.get('/api/invoices/closed/:siret', authenticateToken, async (req, res) => {
    try {
        const siret = req.params.siret;
        const invoices = await Invoice.find({ 
            $or: [
                { 'emetteur.NumeroSiret': siret },
                { 'correspondant.NumeroSiret': siret }
            ],
            'status': { $in: ['Accepté', 'Refusé'] }
        });
        res.send(invoices);
    } catch (err) {
        console.log('Error getting invoices:', err);
        res.status(500).send({ message: err.message });
    }
});

/**
 * @swagger
 * /api/invoices/json/{invoiceId}:
 *   get:
 *     summary: Télécharger la facture au format JSON
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Renvoie la facture au format JSON
 *       500:
 *         description: Erreur dans l'obtention de la facture
 */
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

/**
 * @swagger
 * /api/invoices/xml/{invoiceId}:
 *   get:
 *     summary: Télécharger la facture au format XML
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Renvoie la facture au format XML
 *       500:
 *         description: Erreur de téléchargement de la facture
 */
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

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Mise à jour du statut de la facture
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *     responses:
 *       200:
 *         description: Renvoie la facture mise à jour
 *       500:
 *         description: Erreur de mise à jour de la facture
 */
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
