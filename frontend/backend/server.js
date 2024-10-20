const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'data/users.json');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', async (req, res) => {
    try {
        const users = await readJsonFile(USERS_FILE);
        res.json({ success: true, message: 'Users fetched successfully', users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const users = await readJsonFile(USERS_FILE);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.json({ success: true, redirect: 'dashboard.html' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const users = await readJsonFile(USERS_FILE);

        if (users.some(u => u.username === username)) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        users.push({ username, password });
        await writeJsonFile(USERS_FILE, users);

        res.json({ success: true, message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

async function readJsonFile(filePath) {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});