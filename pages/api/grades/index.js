/**
 * API Routes pour la gestion des notes
 * CRUD complet pour les notes des étudiants
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
      return getGrades(req, res);
    case 'POST':
      return createGrade(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer toutes les notes
function getGrades(req, res) {
  const query = `
    SELECT g.*, 
           s.first_name || ' ' || s.last_name as student_name, 
           s.email as student_email,
           c.id as course_id,
           subj.name as subject_name, 
           subj.code as subject_code,
           cl.name as class_name,
           t.first_name || ' ' || t.last_name as teacher_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses c ON g.course_id = c.id
    JOIN subjects subj ON c.subject_id = subj.id
    JOIN classes cl ON c.class_id = cl.id
    JOIN teachers t ON c.teacher_id = t.id
    ORDER BY g.date_recorded DESC, student_name, subject_name
  `;

  db.all(query, [], (err, grades) => {
    if (err) {
      console.error('Erreur lors de la récupération des notes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(grades);
  });
}

// Créer une nouvelle note
function createGrade(req, res) {
  const {
    student_id,
    course_id,
    grade_value,
    max_grade,
    grade_type,
    comment
  } = req.body;

  // Validation des données requises
  if (!student_id || !course_id || grade_value === undefined || !grade_type) {
    return res.status(400).json({ error: 'Étudiant, cours, note et type d\'évaluation sont requis' });
  }

  const query = `
    INSERT INTO grades (
      student_id, course_id, grade_value, max_grade, grade_type, comment
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    student_id,
    course_id,
    grade_value,
    max_grade || 20,
    grade_type,
    comment || ''
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la création de la note:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({ 
      message: 'Note ajoutée avec succès',
      gradeId: this.lastID
    });
  });
}
