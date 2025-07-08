/**
 * API Route pour gérer les informations de l'école
 * GET, POST pour les informations de l'école
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
      return getSchoolInfo(req, res);
    case 'POST':
      return updateSchoolInfo(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer les informations de l'école
async function getSchoolInfo(req, res) {
  const query = `
    SELECT key, value FROM settings
    WHERE key IN ('school_name', 'address', 'phone', 'email')
  `;

  db.all(query, [], (err, settings) => {
    if (err) {
      console.error('Erreur lors de la récupération des informations de l\'école:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Convertir la liste en objet
    const schoolInfo = settings.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {});

    res.status(200).json(schoolInfo);
  });
}

// Mettre à jour les informations de l'école
async function updateSchoolInfo(req, res) {
  const { school_name, address, phone, email } = req.body;

  // Validation des données
  if (!school_name) {
    return res.status(400).json({ error: 'Le nom de l\'école est requis' });
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

    db.run(updateQuery, ['school_name', school_name], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du nom de l\'école:', err);
        hasError = true;
      }
    });

    db.run(updateQuery, ['address', address || ''], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'adresse:', err);
        hasError = true;
      }
    });

    db.run(updateQuery, ['phone', phone || ''], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du téléphone:', err);
        hasError = true;
      }
    });

    db.run(updateQuery, ['email', email || ''], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'email:', err);
        hasError = true;
      }
    });

    if (hasError) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Erreur lors de la mise à jour des informations' });
    }

    db.run('COMMIT', function(err) {
      if (err) {
        console.error('Erreur lors de la validation de la transaction:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.status(200).json({ message: 'Informations de l\'école mises à jour avec succès' });
    });
  });
}
