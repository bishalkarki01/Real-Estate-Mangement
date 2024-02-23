var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var app = express();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', indexRouter);

let gamesDatabase = [];

app.get('/', (req, res) => {
    res.sendFile('./public/index.html');
});

// Endpoints to get SID
app.get('/api/v1/sid', (req, res) => {
    const sid = uuidv4();
    res.setHeader('X-sid', sid);
    res.status(200).send({ message: "SID generated", sid: sid });
});

// Endpoints to get default value
app.get('/api/v1/meta', (req, res) => {
    const levels = [
        { name: "easy", minLength: 3, maxLength: 5, rounds: 8 },
        { name: "medium", minLength: 4, maxLength: 10, rounds: 7 },
        { name: "hard", minLength: 9, maxLength: 300, rounds: 6 }
    ];
    const colors = [
        { wordBackground: "#008000" },
        { textBackground: "#FFFFFF" },
        { guessBackground: "#FF0000" }
    ];
    const defaultLevel = levels.find(level => level.name === "medium");

    const metaData = {
        levels: levels,
        defaults: {
            colors: colors,
            level: defaultLevel,
            font: "Arial"
        }
    };

    res.json(metaData);
});

// Endpoint to get meta fonts
app.get('/api/v1/meta/fonts', (req, res) => {
    const fonts = ["Arial", "Verdana", "Helvetica", "Times New Roman"];
    res.json(fonts);
});

// Endpoint to get details of games 
app.get('/api/v1/:sid/games', (req, res) => {
    const { sid } = req.params;
    const games = gamesDatabase[sid];

    if (games) {
        res.status(200).json(games);
    } else {
        res.status(404).json({ msg: "No games found for this SID." });
    }
});

// Endpoint to deliver a game with specific id
app.post('/api/v1/:sid/games', async (req, res) => {
    const { sid } = req.params;
    const level = req.query.level;
    const font = req.header('X-font');
    const { colors } = req.body;

    if (!level || !font || !colors) {
        return res.status(400).json({ error: "Missing required game information." });
    }

    try {
        const data = await fs.readFile('words.txt', 'utf8');
        const words = data.split('\n').filter(line => line.trim() !== '');
        const levels = [
            { name: "easy", minLength: 3, maxLength: 5, rounds: 8 },
            { name: "medium", minLength: 4, maxLength: 10, rounds: 7 },
            { name: "hard", minLength: 9, maxLength: 300, rounds: 6 }
        ];
        const levelName = levels.find(l => l.name === level);
        const filteredWords = words.filter(word => word.length >= levelName.minLength && word.length <= levelName.maxLength);
        const target = filteredWords[Math.floor(Math.random() * filteredWords.length)];

        const id = `game-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        const newGame = { id, level, font, colors, target, remaining: levelName.rounds, status: "unfinished", guesses: '', timestamp };

        gamesDatabase[sid] ? gamesDatabase[sid].push(newGame) : gamesDatabase[sid] = [newGame];

        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error reading from words.txt:', error);
        res.status(500).json({ error: "Failed to read words file" });
    }
});

// Endpoint for game play
app.post('/api/v1/:sid/games/:id/guesses', (req, res) => {
    const { sid, id } = req.params;
    const { guess } = req.query;
    const updatedGame = makeGuess(sid, id, guess);
    updatedGame.error ? res.status(400).json({ msg: updatedGame.error }) : res.json(updatedGame);
});

// Function for post guess
function makeGuess(sid, id, guess) {
    if (!guess || guess.length !== 1 || !/[a-zA-Z]/.test(guess)) {
        return { error: "Invalid guess. Must be a single alphabetic letter." };
    }

    const games = gamesDatabase[sid];
    if (!games) {
        return { error: "No games found for this SID." };
    }

    const game = games.find(game => game.id === id);
    if (!game || game.status !== 'unfinished') {
        return { error: "Game not found or already completed." };
    }

    game.guesses += guess;
    game.view = game.target.split('').map(letter => game.guesses.includes(letter) ? letter : '_').join('');
    if (!game.target.includes(guess)) game.remaining -= 1;

    if (game.view === game.target) {
        game.status = 'victory';
        game.timeToComplete = Date.now() - game.timestamp;
    } else if (game.remaining <= 0) {
        game.status = 'loss';
    }

    return game;
}

// Endpoint to return game 
app.get('/api/v1/:sid/games/:id', (req, res) => {
    const { sid, id } = req.params;
    const games = gamesDatabase[sid];
    if (!games) {
        return res.status(404).json({ msg: "No games found for this SID." });
    }
    const game = games.find(game => game.id === id);
    if (!game) {
        return res.status(404).json({ msg: "Game not found with the given ID." });
    }
    res.status(200).json(game);
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).json('error');
});

module.exports = app;
