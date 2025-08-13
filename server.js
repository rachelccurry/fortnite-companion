// Rachel Curry
// July 15th, 2025
// Fortnite Companion App

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/stats/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const response = await axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${username}`, {
        headers: { Authorization: process.env.FORTNITE_API_KEY }
        });
        res.json(response.data);
    } 
    catch (err) {
        res.status(500).json({ error: 'Could not fetch stats' });
    }
});

const { exec } = require('child_process');
let keyboardProcess = null;

app.post('/keyboard/open', (req, res) => {
    if (!keyboardProcess) {
        keyboardProcess = exec('matchbox-keyboard', (error) => {
        if (error) {
            console.error('Keyboard process error:', error);
        }
        keyboardProcess = null;
        });
    }
    res.sendStatus(200);
});

app.post('/keyboard/close', (req, res) => {
    if (keyboardProcess) {
        exec('pkill matchbox-keyboard');
        keyboardProcess = null;
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});