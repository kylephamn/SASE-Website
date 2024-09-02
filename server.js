const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files (CSS, JS, HTML)
app.use(express.static(path.join(__dirname)));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'pictures/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Login endpoint
app.post('/login', (req, res) => {
    if (req.body.username === 'SASE' && req.body.password === 'RAMS24') {
        req.session.loggedIn = true;
        res.redirect('/gallery2.html');
    } else {
        res.send('Incorrect username or password');
    }
});

// Protect the Gallery route
app.get('/Gallery.html', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'Gallery.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Handle photo uploads
app.post('/pictures', upload.single('photo'), (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/upload-success.html');
    } else {
        res.redirect('/login.html');
    }
});

// Upload Success Page
app.get('/upload-success.html', (req, res) => {
    if (req.session.loggedIn) {
        res.send(`
            <h2>Upload Successful</h2>
            <a href="/gallery2.html">Upload Another Image</a>
        `);
    } else {
        res.redirect('/login.html');
    }
});

// Serve the Gallery Page with Images
app.get('/pictures-list', (req, res) => {
    fs.readdir(path.join(__dirname, 'pictures'), (err, files) => {
        if (err) {
            return res.status(500).send('Unable to load images');
        }
        const images = files.filter(file => file !== '.DS_Store');
        res.json(images);
    });
});

// Start the server on port 3000 (or whichever port you prefer)
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
