/**
 * API Routes pour la gestion d'une note spécifique
 * Opérations GET, PUT, DELETE pour une note
 */
import db from '../../../lib/database.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getGrade(req, res, id);
    case 'PUT':
      return updateGrade(req, res, id);
    case 'DELETE':
      return deleteGrade(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getGrade(req, res, id) {
  const query = `
    SELECT g.*, 
           s.first_name || ' ' || s.last_name as student_name, 
           s.email as student_email,
           c.id as course_id,
           subj.name as subject_name, 
           cl.name as class_name,
           t.first_name || ' ' || t.last_name as teacher_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses c ON g.course_id = c.id
    JOIN subjects subj ON c.subject_id = subj.id
    JOIN classes cl ON c.class_id = cl.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE g.id = ?
  `;

  db.get(query, [id], (err, grade) => {
    if (err) {
      console.error('Erreur lors de la récupération de la note:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!grade) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(200).json(grade);
  });
}

function updateGrade(req, res, id) {
  const {
    student_id,
    course_id,
    grade_value,
    max_grade,
    grade_type,
    comment
  } = req.body;

  const query = `
    UPDATE grades SET
      student_id = ?, course_id = ?, grade_value = ?, max_grade = ?, 
      grade_type = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    student_id, course_id, grade_value, max_grade || 20, grade_type, comment || '', id
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de la note:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(200).json({ message: 'Note mise à jour avec succès' });
  });
}

function deleteGrade(req, res, id) {
  const query = 'DELETE FROM grades WHERE id = ?';

  db.run(query, id, function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de la note:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.status(200).json({ message: 'Note supprimée avec succès' });
  });
}
