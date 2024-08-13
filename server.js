const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./keyboard_crusaders.db');

app.use(cors());
app.use(bodyParser.json());

app.post('/api/addUser', (req, res) => {
  let { username } = req.body;

  username = username.trim();

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      res.json({ message: 'Welcome back to something something Corp', id: row.id });
    } else {
      db.run("INSERT INTO users (username) VALUES (?)", [username], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Welcome to something something Corp', id: this.lastID });
      });
    }
  });
});

app.post('/api/addAttempt', (req, res) => {
    const { user_id, attempt_type, start_time, end_time, success, score, level_id } = req.body;
    if (!user_id || !attempt_type || !start_time) {
      res.status(400).json({ error: 'User ID, attempt type, and start time are required' });
      return;
    }
    db.run("INSERT INTO attempts (user_id, attempt_type, start_time, end_time, success, score, level_id) VALUES (?, ?, ?, ?, ?, ?, ?)", 
      [user_id, attempt_type, start_time, end_time, success, score, level_id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Attempt added successfully', id: this.lastID });
    });
  });

app.post('/api/addAction', (req, res) => {
    const { attempt_id, action_type, timestamp, details } = req.body;
    if (!attempt_id || !action_type) {
      res.status(400).json({ error: 'Attempt ID and action type are required' });
      return;
    }
    db.run("INSERT INTO actions (attempt_id, action_type, timestamp, details) VALUES (?, ?, ?, ?)", 
      [attempt_id, action_type, timestamp, details], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Action added successfully', id: this.lastID });
    });
  });

app.get('/api/getUsers', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ users: rows });
    });
  });

app.get('/api/getAttempts', (req, res) => {
  db.all("SELECT * FROM attempts", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ attempts: rows });
  });
});

app.get('/api/getActions', (req, res) => {
  db.all("SELECT * FROM actions", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ actions: rows });
  });
});

app.get('/api/getTasksByLevel', (req, res) => {
  const { level_id } = req.query;

  if (!level_id) {
    return res.status(400).json({ error: 'Level ID is required' });
  }

  db.all("SELECT * FROM tasks WHERE level_id = ?", [level_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tasks: rows });
  });
});

app.get('/api/getAllTasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tasks: rows });
  });
});

app.post('/api/deleteAllTasks', (req, res) => {
  db.run("DELETE FROM tasks", [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "All tasks deleted successfully" });
  });
});

app.get('/api/getAllLevels', (req, res) => {
  db.all("SELECT * FROM levels", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ levels: rows });
  });
});

app.post('/api/deleteAllUsers', (req, res) => {
  db.run("DELETE FROM users", [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "All users deleted successfully" });
  });
});

app.post('/api/deleteAllAttempts', (req, res) => {
  db.run("DELETE FROM attempts", [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "All attempts deleted successfully" });
  });
});

app.get('/api/getLeaderboard', (req, res) => {
  const query = `
      SELECT 
          u.id as user_id, 
          u.username, 
          l.level_number, 
          SUM(a.score) as total_score, 
          COUNT(a.id) as attempts_count 
      FROM 
          users u
      JOIN 
          attempts a ON u.id = a.user_id
      JOIN 
          levels l ON a.level_id = l.id
      GROUP BY 
          u.id, l.level_number
      ORDER BY 
          l.level_number DESC, total_score DESC;
  `;

  db.all(query, [], (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
