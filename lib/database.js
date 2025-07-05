/**
 * Configuration et initialisation de la base de données SQLite
 * Gère la création des tables et les connexions
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier de base de données
const dbPath = path.join(process.cwd(), 'edutrack.db');

// Initialisation de la base de données
const db = new sqlite3.Database(dbPath);

// Création des tables si elles n'existent pas
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
          profile_picture TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, function(err) {
        if (err) return reject(err);

        db.run(`
          CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, function(err) {
          if (err) return reject(err);

          db.run(`
            CREATE TABLE IF NOT EXISTS subjects (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              code TEXT UNIQUE NOT NULL,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, function(err) {
            if (err) return reject(err);

            db.run(`
              CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE,
                phone TEXT,
                birth_date DATE,
                address TEXT,
                parent_name TEXT,
                parent_phone TEXT,
                parent_email TEXT,
                class_id INTEGER,
                profile_picture TEXT,
                enrollment_date DATE DEFAULT (date('now')),
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id)
              )
            `, function(err) {
              if (err) return reject(err);

              db.run(`
                CREATE TABLE IF NOT EXISTS teachers (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  first_name TEXT NOT NULL,
                  last_name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  phone TEXT,
                  speciality TEXT,
                  hire_date DATE DEFAULT (date('now')),
                  salary DECIMAL(10,2),
                  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users(id)
                )
              `, function(err) {
                if (err) return reject(err);

                db.run(`
                  CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject_id INTEGER NOT NULL,
                    teacher_id INTEGER NOT NULL,
                    class_id INTEGER NOT NULL,
                    semester TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id),
                    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
                    FOREIGN KEY (class_id) REFERENCES classes(id)
                  )
                `, function(err) {
                  if (err) return reject(err);

                  db.run(`
                    CREATE TABLE IF NOT EXISTS grades (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      student_id INTEGER NOT NULL,
                      course_id INTEGER NOT NULL,
                      grade_value DECIMAL(4,2) NOT NULL,
                      max_grade DECIMAL(4,2) DEFAULT 20,
                      grade_type TEXT NOT NULL CHECK (grade_type IN ('homework', 'quiz', 'exam', 'project')),
                      comment TEXT,
                      date_recorded DATE DEFAULT (date('now')),
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (student_id) REFERENCES students(id),
                      FOREIGN KEY (course_id) REFERENCES courses(id)
                    )
                  `, function(err) {
                    if (err) return reject(err);

                    // Insertion des données de test
                    db.run(`
                      INSERT OR IGNORE INTO users (username, email, password, full_name, role) 
                      VALUES ('admin', 'admin@edutrack.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGvQvlMjMAS', 'Administrateur', 'admin')
                    `, function(err) {
                      if (err) return reject(err);

                      db.run(`
                        INSERT OR IGNORE INTO classes (name, level, description) VALUES 
                        ('6ème A', 'Collège', 'Classe de sixième première section'),
                        ('5ème B', 'Collège', 'Classe de cinquième deuxième section'),
                        ('4ème A', 'Collège', 'Classe de quatrième première section'),
                        ('3ème C', 'Collège', 'Classe de troisième troisième section'),
                        ('2nde S', 'Lycée', 'Classe de seconde scientifique'),
                        ('1ère S', 'Lycée', 'Classe de première scientifique'),
                        ('Terminale S', 'Lycée', 'Classe de terminale scientifique')
                      `, function(err) {
                        if (err) return reject(err);

                        db.run(`
                          INSERT OR IGNORE INTO subjects (name, code, description) VALUES 
                          ('Mathématiques', 'MATH', 'Mathématiques générales'),
                          ('Français', 'FR', 'Français et littérature'),
                          ('Physique-Chimie', 'PC', 'Sciences physiques et chimiques'),
                          ('Histoire-Géographie', 'HG', 'Histoire et géographie'),
                          ('Anglais', 'ANG', 'Langue anglaise'),
                          ('Sciences de la Vie et de la Terre', 'SVT', 'Biologie et sciences naturelles'),
                          ('Éducation Physique et Sportive', 'EPS', 'Sport et éducation physique')
                        `, function(err) {
                          if (err) return reject(err);

                          // Quand tout est fini :
                          resolve();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

export default db;