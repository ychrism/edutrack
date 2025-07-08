# EduTrack - Next.js School Management Project

## Prérequis

- **Node.js** v18 ou supérieur (v22 recommandé)
- **npm** (fourni avec Node.js)
- (Optionnel) [SQLite Browser](https://sqlitebrowser.org/) pour visualiser la base de données

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd project
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Initialiser la base de données**
   ```bash
   npm run init-db
   ```
   Cela crée le fichier `edutrack.db` à la racine avec toutes les tables et des données de base (admin/admin@edutrack.com).

4. **Configurer les variables d'environnement**

   Crée un fichier `.env.local` à la racine du projet et ajoute :
   ```
   NEXTAUTH_SECRET=une_chaine_secrete
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Compte administrateur par défaut

- **Email** : admin@edutrack.com
- **Mot de passe** : admin (ou voir le hash dans la base)

## Scripts utiles

- `npm run dev` : démarre le serveur Next.js en mode développement
- `npm run build` : build l’application pour la production
- `npm run start` : démarre le serveur en mode production
- `npm run init-db` : initialise la base de données SQLite

## Notes

- Si tu modifies la structure de la base, relance `npm run init-db` (attention, cela n'efface pas les anciennes données).
- Si tu rencontres des erreurs liées à la configuration des modules (`type: module`), assure-toi que :
  - Les scripts Node.js utilisent la bonne syntaxe (`require`/`module.exports` ou `import`/`export` selon la config).
  - Le fichier de config Next.js s’appelle bien `next.config.cjs` si `"type": "module"` est présent dans `package.json`.

---

**Pour toute question, consulte le code source ou contacte l’auteur du projet.**