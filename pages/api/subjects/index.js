/**
 * API Route pour la gestion des matières
 * GET pour récupérer la liste des matières
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
      return getSubjects(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer toutes les matières
function getSubjects(req, res) {
  const query = `
    SELECT id, name, code, description
    FROM subjects
    ORDER BY name
  `;

  db.all(query, [], (err, subjects) => {
    if (err) {
      console.error('Erreur lors de la récupération des matières:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(subjects);
  });
}
