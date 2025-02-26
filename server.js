// server.js
const express = require('express');
const mariadb = require('mariadb');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 80;

// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: '127.0.0.1', // Use IP address to force TCP connection
    port: 3306, // Ensure this is the correct port 
    user: 'anhd',
    password: 'anhd', // Replace with your MariaDB password
    database: 'bankdb', // Our database name created above
    connectionLimit: 5
});

// Set EJS as the view engine and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use body-parser middleware to parse form data (if you prefer explicit usage)
app.use(bodyParser.urlencoded({ extended: true }));

// Route: Display form and customer table
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Get all customers from the table
        const customers = await conn.query('SELECT * FROM customers');
        res.render('index', { customers });
    } catch (err) {
        res.status(500).send(`Error retrieving customers: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

// Route: Add a new customer
app.post('/add', async (req, res) => {
    const name = req.body.name;
    // Generate a random balance between 100 and 10,000 (two decimal places)
    const balance = (Math.random() * (10000 - 100) + 100).toFixed(2);
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO customers(name, balance) VALUES (?, ?)', [name, balance]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error adding customer: ${err}`);    
    } finally {
        if (conn) conn.release();
}
});

// Route: Add a new customer
app.get('/greeting', async (req, res) => {
    let conn;
    try {
        res.render('greeting');
    } catch (err) {
        res.status(500).send(`Error`);
    }
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    // Generate a random balance between 100 and 10,000 (two decimal places)
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username, name) VALUES (?, ?)', [username, username]);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error adding user: ${err}`);    
    } finally {
        if (conn) conn.release();
    }
});

app.get('/list', async (req, res) => {
    const users = req.body.users;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT username FROM Users");
        res.json({ users: rows.map(row => row.username) });
    } catch (err) {
        res.status(500).send(`Error`);
    } finally {
        if (conn) conn.release();
    }
});

app.post('/clear', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM Users');
        res.redirect('/');
    } catch (err) {
        res.status(500).send(`Error deleting: ${err}`);    
    } finally {
        if (conn) conn.release();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://35.221.29.66:${port}`);
});
