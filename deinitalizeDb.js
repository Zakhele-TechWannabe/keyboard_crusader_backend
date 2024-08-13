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

const deinitializeDb = async () => {
  try {
    // Delete leaderboard table
    await runAsync(db, "DROP TABLE IF EXISTS leaderboard");
    console.log('Leaderboard table deleted.');

    // Delete shortcuts table
    await runAsync(db, "DROP TABLE IF EXISTS shortcuts");
    console.log('Shortcuts table deleted.');

    // Delete storyline table
    await runAsync(db, "DROP TABLE IF EXISTS storyline");
    console.log('Storyline table deleted.');

    // Delete schema_version table
    await runAsync(db, "DROP TABLE IF EXISTS schema_version");
    console.log('Schema version table deleted.');

    console.log('Database tables deinitialized.');
  } catch (err) {
    console.error(err.message);
  } finally {
    db.close();
  }
};

deinitializeDb();