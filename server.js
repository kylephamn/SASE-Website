const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Ensure the pictures directory exists
const picturesDir = path.join(__dirname, 'pictures');
if (!fs.existsSync(picturesDir)) {
    fs.mkdirSync(picturesDir);
}

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname)));

// Simple username and password
const username = 'SASE';
const password = 'RAMS24';

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
    if (req.body.username === username && req.body.password === password) {
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
        res.send(`
            <p>Photo uploaded successfully</p>
            <p><a href="/gallery2.html">Upload another photo</a></p>
            <p><a href="/Gallery.html">Go to front-end gallery</a></p>
        `);
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
    fs.readdir(picturesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to load images');
        }
        const images = files.filter(file => file !== '.DS_Store');
        res.json(images);
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
