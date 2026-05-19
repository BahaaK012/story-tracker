const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

//  connecting to the SQLite database file
const dbPath = path.join(__dirname, 'storytracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error executing schema:', err.message);
    } else {
        console.log('Database schema loaded successfully.');
    }
});

module.exports = db;