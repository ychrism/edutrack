/**
 * API Route pour gérer les paramètres du système de notation
 * GET, POST pour les seuils de notation, etc.
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
      return getGradingSystem(req, res);
    case 'POST':
      return updateGradingSystem(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

// Récupérer les paramètres du système de notation
async function getGradingSystem(req, res) {
  const query = `
    SELECT key, value FROM settings
    WHERE key IN ('passing_grade', 'max_grade', 'grade_scale')
  `;

  db.all(query, [], (err, settings) => {
    if (err) {
      console.error('Erreur lors de la récupération des paramètres de notation:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Convertir la liste en objet avec des valeurs par défaut
    const gradingSystem = settings.reduce((obj, item) => {
      // Convertir en nombre si nécessaire
      if (item.key === 'passing_grade' || item.key === 'max_grade') {
        obj[item.key] = parseFloat(item.value);
      } else {
        obj[item.key] = item.value;
      }
      return obj;
    }, { passing_grade: 10, max_grade: 20, grade_scale: 'standard' });

    res.status(200).json(gradingSystem);
  });
}

// Mettre à jour les paramètres du système de notation
async function updateGradingSystem(req, res) {
  const { passing_grade, max_grade, grade_scale } = req.body;

  // Validation des données
  if (passing_grade === undefined) {
    return res.status(400).json({ error: 'La note de passage est requise' });
  }

  // Validation du type et de la plage
  const passingGradeNum = parseFloat(passing_grade);
  if (isNaN(passingGradeNum) || passingGradeNum < 0 || passingGradeNum > 20) {
    return res.status(400).json({ error: 'La note de passage doit être un nombre entre 0 et 20' });
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

    db.run(updateQuery, ['passing_grade', passingGradeNum.toString()], function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour de la note de passage:', err);
        hasError = true;
      }
    });

    if (max_grade !== undefined) {
      const maxGradeNum = parseFloat(max_grade);
      if (!isNaN(maxGradeNum) && maxGradeNum >= passingGradeNum) {
        db.run(updateQuery, ['max_grade', maxGradeNum.toString()], function(err) {
          if (err) {
            console.error('Erreur lors de la mise à jour de la note maximale:', err);
            hasError = true;
          }
        });
      }
    }

    if (grade_scale) {
      db.run(updateQuery, ['grade_scale', grade_scale], function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour de l\'échelle de notation:', err);
          hasError = true;
        }
      });
    }

    if (hasError) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
    }

    db.run('COMMIT', function(err) {
      if (err) {
        console.error('Erreur lors de la validation de la transaction:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.status(200).json({ message: 'Système de notation mis à jour avec succès' });
    });
  });
}