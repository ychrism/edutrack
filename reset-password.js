/**
 * Script pour réinitialiser le mot de passe administrateur
 * Connecte à la base de données, hache le mot de passe 'password'
 * et met à jour l'utilisateur admin
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(process.cwd(), 'edutrack.db');
console.log(`Mise à jour de la base de données : ${dbPath}`);

const newPassword = 'password';
const saltRounds = 12;

// Hashage du mot de passe
bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error(`Erreur lors du hashage du mot de passe: ${err.message}`);
    process.exit(1);
  }

  // Connexion à la base de données
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(`Erreur de connexion à la base de données: ${err.message}`);
      process.exit(1);
    }
    console.log('Connexion à la base de données SQLite établie');
  });

  // Mise à jour du mot de passe admin
  db.run(`UPDATE users SET password = ? WHERE username = 'admin'`, [hashedPassword], function(err) {
    if (err) {
      console.error(`Erreur lors de la mise à jour du mot de passe: ${err.message}`);
    } else {
      console.log('✅ Mot de passe administrateur mis à jour avec succès');
    }
    closeDatabase();
  });

  function closeDatabase() {
    db.close((err) => {
      if (err) {
        console.error(`Erreur lors de la fermeture de la base de données: ${err.message}`);
      } else {
        console.log('Connexion à la base de données fermée');
      }
    });
  }
});
