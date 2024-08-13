const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./keyboard_crusaders.db');

const runAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const initializeDb = async () => {
  try {
    console.log('Initializing database schema...');

    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        level_number INTEGER NOT NULL, 
        title TEXT NOT NULL, 
        description TEXT NOT NULL
      )
    `);

    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER NOT NULL, 
        attempt_type TEXT NOT NULL, 
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        end_time TIMESTAMP, 
        success BOOLEAN, 
        score INTEGER, 
        level_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (level_id) REFERENCES levels(id)
      )
    `);
    
    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        attempt_id INTEGER NOT NULL, 
        action_type TEXT NOT NULL, 
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        details TEXT,
        FOREIGN KEY (attempt_id) REFERENCES attempts(id)
      )
    `);

    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_id INTEGER NOT NULL,
        task TEXT NOT NULL,
        hint TEXT,
        code TEXT NOT NULL,
        key TEXT,
        ctrl BOOLEAN,
        shift BOOLEAN,
        alt BOOLEAN,
        FOREIGN KEY (level_id) REFERENCES levels(id)
      )
    `);
    
    console.log('Database schema initialized.');
  } catch (err) {
    console.error(err.message);
  } finally {
    db.close();
  }
};

initializeDb();
