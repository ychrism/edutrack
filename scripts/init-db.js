import { initDatabase } from '../lib/database.js';

(async () => {
  try {
    await initDatabase();
    console.log('Base de données initialisée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
})();