/**
 * API Routes pour la gestion des classes
 * CRUD pour les classes/niveaux
 */
import db from '../../../lib/database.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  switch (req.method) {
    case 'GET':
      return getClasses(req, res);
    case 'POST':
      return createClass(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getClasses(req, res) {
  const query = `
    SELECT c.*, 
      COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
    GROUP BY c.id
    ORDER BY c.level, c.name
  `;

  db.all(query, [], (err, classes) => {
    if (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(classes);
  });
}

function createClass(req, res) {
  const { name, level, description } = req.body;

  if (!name || !level) {
    return res.status(400).json({ error: 'Nom et niveau sont requis' });
  }

  const query = 'INSERT INTO classes (name, level, description) VALUES (?, ?, ?)';

  db.run(query, [name, level, description], function(err) {
    if (err) {
      console.error('Erreur lors de la création de la classe:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({
      message: 'Classe créée avec succès',
      classId: this.lastID
    });
  });
}