/**
 * API Routes pour la gestion des élèves
 * CRUD complet pour les élèves
 */
import db from '../../../lib/database.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';

export default async function handler(req, res) {
  // Vérification de l'authentification
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  switch (req.method) {
    case 'GET':
      return getStudents(req, res);
    case 'POST':
      return createStudent(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer tous les élèves
function getStudents(req, res) {
  const query = `
    SELECT s.*, c.name as class_name, c.level as class_level
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.status = 'active'
    ORDER BY s.last_name, s.first_name
  `;

  db.all(query, [], (err, students) => {
    if (err) {
      console.error('Erreur lors de la récupération des élèves:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(students);
  });
}

// Créer un nouvel élève
function createStudent(req, res) {
  const {
    first_name,
    last_name,
    email,
    phone,
    birth_date,
    address,
    parent_name,
    parent_phone,
    parent_email,
    class_id
  } = req.body;

  // Validation des données requises
  if (!first_name || !last_name || !class_id) {
    return res.status(400).json({ error: 'Prénom, nom et classe sont requis' });
  }

  const query = `
    INSERT INTO students (
      first_name, last_name, email, phone, birth_date, address,
      parent_name, parent_phone, parent_email, class_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    first_name,
    last_name,
    email,
    phone,
    birth_date,
    address,
    parent_name,
    parent_phone,
    parent_email,
    class_id
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création de l\'élève:', err);
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Un élève avec cet email existe déjà' });
      }
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({ 
      message: 'Élève créé avec succès',
      studentId: this.lastID
    });
  });
}