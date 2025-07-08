/**
 * API Routes pour la gestion d'un enseignant spécifique
 * Opérations GET, PUT, DELETE pour un enseignant
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
      return getTeacher(req, res, id);
    case 'PUT':
      return updateTeacher(req, res, id);
    case 'DELETE':
      return deleteTeacher(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getTeacher(req, res, id) {
  const query = `
    SELECT *
    FROM teachers
    WHERE id = ?
  `;

  db.get(query, [id], (err, teacher) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.status(200).json(teacher);
  });
}

function updateTeacher(req, res, id) {
  const {
    first_name,
    last_name,
    email,
    phone,
    subject_specialty,
    hire_date,
    status
  } = req.body;

  const query = `
    UPDATE teachers SET
      first_name = ?, last_name = ?, email = ?, phone = ?, 
      speciality = ?, hire_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    first_name, last_name, email, phone,
    subject_specialty, hire_date, status || 'active', id
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.status(200).json({ message: 'Enseignant mis à jour avec succès' });
  });
}

function deleteTeacher(req, res, id) {
  // Soft delete - marquer comme inactif
  const query = 'UPDATE teachers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

  db.run(query, ['inactive', id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.status(200).json({ message: 'Enseignant supprimé avec succès' });
  });
}