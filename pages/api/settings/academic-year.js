/**
 * API Route pour gérer les paramètres de l'année académique
 * GET, POST pour les dates de début et fin d'année
 */
import db from '../../../lib/database.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';

// Assurez-vous que la table settings existe
const ensureSettingsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export default async function handler(req, res) {
  // Vérification de l'authentification
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    await ensureSettingsTable();
  } catch (error) {
    console.error('Erreur lors de la création de la table settings:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

  switch (req.method) {
    case 'GET':
      return getAcademicYear(req, res);
    case 'POST':
      return updateAcademicYear(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer les paramètres de l'année académique
async function getAcademicYear(req, res) {
  const query = `
    SELECT key, value FROM settings
    WHERE key IN ('academic_year_start', 'academic_year_end')
  `;

  db.all(query, [], (err, settings) => {
    if (err) {
      console.error('Erreur lors de la récupération des paramètres de l\'année académique:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Convertir la liste en objet
    const academicYear = settings.reduce((obj, item) => {
      obj[item.key === 'academic_year_start' ? 'start_date' : 'end_date'] = item.value;
      return obj;
    }, { start_date: '', end_date: '' });

    res.status(200).json(academicYear);
  });
}

// Mettre à jour les paramètres de l'année académique
async function updateAcademicYear(req, res) {
  const { start_date, end_date } = req.body;

  // Validation des données
  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Les dates de début et de fin sont requises' });
  }

  // Vérifier que la date de fin est après la date de début
  if (new Date(end_date) <= new Date(start_date)) {
    return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début' });
  }

  // Utiliser une transaction pour garantir l'atomicité
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Mise à jour ou insertion pour chaque paramètre
    const updateQuery = `
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `;

    let hasError = false;

    db.run(updateQuery, ['academic_year_start', start_date], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de la date de début:', err);
        hasError = true;
      }
    });

    db.run(updateQuery, ['academic_year_end', end_date], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de la date de fin:', err);
        hasError = true;
      }
    });

    if (hasError) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
    }

    db.run('COMMIT', function(err) {
      if (err) {
        console.error('Erreur lors de la validation de la transaction:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.status(200).json({ message: 'Année académique mise à jour avec succès' });
    });
  });
}