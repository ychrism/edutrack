/**
 * API Routes pour la gestion des notes
 * CRUD pour les notes et évaluations
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
      return getGrades(req, res);
    case 'POST':
      return createGrade(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getGrades(req, res) {
  const query = `
    SELECT g.*, 
      s.first_name || ' ' || s.last_name as student_name,
      c.name as class_name,
      sub.name as subject_name,
      t.first_name || ' ' || t.last_name as teacher_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses co ON g.course_id = co.id
    JOIN classes c ON co.class_id = c.id
    JOIN subjects sub ON co.subject_id = sub.id
    JOIN teachers t ON co.teacher_id = t.id
    ORDER BY g.date_recorded DESC
    LIMIT 50
  `;

  db.all(query, [], (err, grades) => {
    if (err) {
      console.error('Erreur lors de la récupération des notes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(grades);
  });
}

function createGrade(req, res) {
  const { student_id, course_id, grade_value, max_grade, grade_type, comment } = req.body;

  if (!student_id || !course_id || !grade_value || !grade_type) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const query = `
    INSERT INTO grades (student_id, course_id, grade_value, max_grade, grade_type, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [student_id, course_id, grade_value, max_grade || 20, grade_type, comment], function(err) {
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