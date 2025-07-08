/**
 * API Routes pour la gestion des enseignants
 * CRUD complet pour les enseignants
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
      return getTeachers(req, res);
    case 'POST':
      return createTeacher(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer tous les enseignants
function getTeachers(req, res) {
  const query = `
    SELECT *
    FROM teachers
    WHERE status = 'active'
    ORDER BY last_name, first_name
  `;

  db.all(query, [], (err, teachers) => {
    if (err) {
      console.error('Erreur lors de la récupération des enseignants:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(teachers);
  });
}

// Créer un nouvel enseignant
function createTeacher(req, res) {
  const {
    first_name,
    last_name,
    email,
    phone,
    subject_specialty,
    hire_date,
    status
  } = req.body;

  // Validation des données requises
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Prénom, nom et email sont requis' });
  }

  const query = `
    INSERT INTO teachers (
      first_name, last_name, email, phone, speciality, hire_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    first_name,
    last_name,
    email,
    phone,
    subject_specialty,
    hire_date || new Date().toISOString().split('T')[0],
    status || 'active'
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création de l\'enseignant:', err);
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Un enseignant avec cet email existe déjà' });
      }
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({ 
      message: 'Enseignant créé avec succès',
      teacherId: this.lastID
    });
  });
}