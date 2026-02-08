const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database instance
const db = new sqlite3.Database(path.resolve(__dirname, '../../database/skillswap.db'), (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Export the database instance for use in other modules
module.exports = db;