/**
 * Script de vérification de la base de données
 * Vérifie si la table users existe et si l'utilisateur admin est présent
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier de base de données (même que dans database.js)
const dbPath = path.join(process.cwd(), 'edutrack.db');
console.log(`Vérification de la base de données: ${dbPath}`);

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Erreur de connexion à la base de données: ${err.message}`);
    process.exit(1);
  }
  console.log('Connexion à la base de données SQLite établie');
});

// Vérifie si la table users existe
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error(`Erreur lors de la vérification de la table users: ${err.message}`);
    closeDatabase();
    return;
  }
  
  if (!row) {
    console.error('❌ La table users n\'existe pas dans la base de données!');
    console.log('La fonction initDatabase() n\'a probablement pas été exécutée.');
    closeDatabase();
    return;
  }
  
  console.log('✅ La table users existe');
  
  // Vérifie si l'utilisateur admin existe
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, user) => {
    if (err) {
      console.error(`Erreur lors de la vérification de l'utilisateur admin: ${err.message}`);
      closeDatabase();
      return;
    }
    
    if (!user) {
      console.error('❌ L\'utilisateur admin n\'existe pas dans la base de données!');
      closeDatabase();
      return;
    }
    
    console.log('✅ L\'utilisateur admin existe:');
    console.log('   - ID:', user.id);
    console.log('   - Username:', user.username);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - Mot de passe (haché):', user.password);
    
    // Vérifie si le format du mot de passe haché est correct
    if (user.password && user.password.startsWith('$2')) {
      console.log('✅ Format du mot de passe haché semble valide (bcrypt)');
    } else {
      console.error('❌ Format du mot de passe haché semble INVALIDE');
    }
    
    closeDatabase();
  });
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
