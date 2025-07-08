/**
 * API Routes pour la gestion des cours
 * CRUD complet pour les cours
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
      return getCourses(req, res);
    case 'POST':
      return createCourse(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer tous les cours
function getCourses(req, res) {
  const query = `
    SELECT c.*, s.name as subject_name, t.first_name || ' ' || t.last_name as teacher_name, cl.name as class_name
    FROM courses c
    JOIN subjects s ON c.subject_id = s.id
    JOIN teachers t ON c.teacher_id = t.id
    JOIN classes cl ON c.class_id = cl.id
    ORDER BY year DESC, semester, class_name, subject_name
  `;

  db.all(query, [], (err, courses) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(courses);
  });
}

// Créer un nouveau cours
function createCourse(req, res) {
  const {
    subject_id,
    teacher_id,
    class_id,
    semester,
    year
  } = req.body;

  // Validation des données requises
  if (!subject_id || !teacher_id || !class_id || !semester || !year) {
    return res.status(400).json({ error: 'Matière, enseignant, classe, semestre et année sont requis' });
  }

  const query = `
    INSERT INTO courses (
      subject_id, teacher_id, class_id, semester, year
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    subject_id,
    teacher_id,
    class_id,
    semester,
    year
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création du cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({ 
      message: 'Cours créé avec succès',
      courseId: this.lastID
    });
  });
}
