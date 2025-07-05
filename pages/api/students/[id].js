/**
 * API Routes pour la gestion d'un élève spécifique
 * Opérations GET, PUT, DELETE pour un élève
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
      return getStudent(req, res, id);
    case 'PUT':
      return updateStudent(req, res, id);
    case 'DELETE':
      return deleteStudent(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

function getStudent(req, res, id) {
  const query = `
    SELECT s.*, c.name as class_name, c.level as class_level
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.id = ?
  `;

  db.get(query, [id], (err, student) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'élève:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    res.status(200).json(student);
  });
}

function updateStudent(req, res, id) {
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

  const query = `
    UPDATE students SET
      first_name = ?, last_name = ?, email = ?, phone = ?, birth_date = ?,
      address = ?, parent_name = ?, parent_phone = ?, parent_email = ?,
      class_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    first_name, last_name, email, phone, birth_date,
    address, parent_name, parent_phone, parent_email,
    class_id, id
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'élève:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    res.status(200).json({ message: 'Élève mis à jour avec succès' });
  });
}

function deleteStudent(req, res, id) {
  // Soft delete - marquer comme inactif
  const query = 'UPDATE students SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

  db.run(query, ['inactive', id], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'élève:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    res.status(200).json({ message: 'Élève supprimé avec succès' });
  });
}