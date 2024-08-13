const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./keyboard_crusaders.db');

db.serialize(() => {
  const levelsDir = path.join(__dirname, 'level_data');
  const levelFiles = fs.readdirSync(levelsDir);

  const stmt = db.prepare("INSERT INTO tasks (level_id, task, hint, code, key, ctrl, shift, alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

  levelFiles.forEach((file) => {
    const levelData = JSON.parse(fs.readFileSync(path.join(levelsDir, file), 'utf8'));

    levelData.tasks.forEach((task) => {
      stmt.run(
        [levelData.level_id, task.task, task.hint, task.code, task.key, task.ctrl, task.shift, task.alt],
        (err) => {
          if (err) {
            console.error(`Error inserting task: ${task.task}`, err.message);
          }
        }
      );
    });
  });

  stmt.finalize();
  db.close(() => {
    console.log("Tasks from all levels inserted successfully and database connection closed.");
  });
});
