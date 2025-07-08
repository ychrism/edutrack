/**
 * API Routes pour la gestion d'un cours spécifique
 * Opérations GET, PUT, DELETE pour un cours
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
      return getCourse(req, res, id);
    case 'PUT':
      return updateCourse(req, res, id);
    case 'DELETE':
      return deleteCourse(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getCourse(req, res, id) {
  const query = `
    SELECT c.*, s.name as subject_name, t.first_name || ' ' || t.last_name as teacher_name, cl.name as class_name
    FROM courses c
    JOIN subjects s ON c.subject_id = s.id
    JOIN teachers t ON c.teacher_id = t.id
    JOIN classes cl ON c.class_id = cl.id
    WHERE c.id = ?
  `;

  db.get(query, [id], (err, course) => {
    if (err) {
      console.error('Erreur lors de la récupération du cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }
    res.status(200).json(course);
  });
}

function updateCourse(req, res, id) {
  const {
    subject_id,
    teacher_id,
    class_id,
    semester,
    year
  } = req.body;

  const query = `
    UPDATE courses SET
      subject_id = ?, teacher_id = ?, class_id = ?, semester = ?, year = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    subject_id, teacher_id, class_id, semester, year, id
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour du cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }
    res.status(200).json({ message: 'Cours mis à jour avec succès' });
  });
}

function deleteCourse(req, res, id) {
  const query = 'DELETE FROM courses WHERE id = ?';

  db.run(query, id, function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }
    res.status(200).json({ message: 'Cours supprimé avec succès' });
  });
}
