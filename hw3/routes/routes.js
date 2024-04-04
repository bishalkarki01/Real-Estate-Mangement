const express = require('express');
const router = express.Router();
const userService = require('../services/authentication'); 
const session = require('express-session');
const FontService = require('../services/fontservices');
const LevelService = require('../services/levelservice');
const ColorService = require('../services/colorservice');
var users = require('../services/authentication');
const Colors = require('../model/Colors');
const User= require('../model/User');
const Game = require('../model/Game');
const fs = require('fs').promises;

//Endpoint for login
router.post('/api/v2/login', async (req, res, next) => {
  try {
    let user = await users.findByEmail(req.body.email);
    if (user && user.password === req.body.password) {
      req.session.regenerate((err) => {
        if (err) {
          next(err); 
        }
        const SessionData = {
          _id: user._id,
          email: user.email,
          metaDefault: user.metaDefault,
        };
        req.session.user = SessionData;
        const MetaDefault = {
          _id: user._id,
          email: user.email,
          defaults: user.metaDefault,
        };
        res.json(MetaDefault);
        console.log('dfdsafdsfadsf',MetaDefault);
      });
    } else {
      res.status(403).send('Error with username/password or status');
    }
  } catch (error) {
    next(error);
  }
});

// Endpoint to get meta fonts
router.get('/api/v2/meta/fonts', async (req, res) => {
   try {
     const fonts = await FontService.findAll();
     res.json(fonts);
   } catch (err) {
     console.error(err);
     res.status(500).send('Error fetching fonts from database');
   }
 });

//endpoint for logout
router.post( '/api/v2/logout', function( req, res, next ) {
  req.session.regenerate( function(err) { // create a new session id
     res.json( { msg : 'ok' } );
   } );
 });

//metadefaults values
router.put('/api/v2/defaults', async (req, res) => {
  try {
    const sessionData = req.session.user;
    const userId = sessionData._id;
    const metaDefault = req.body;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { metaDefault: metaDefault } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new object excluding the sensitive information
    const userResponse = {
      // Convert the Mongoose document to a plain JavaScript object
      ...user.toObject(),
      _id: undefined,
      email: undefined,
      password: undefined,
    };
    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//getting metadefault value 
router.get('/api/v2/meta', async (req, res) => {
  try {
    const sessionData = req.session.user;
    const userId = sessionData._id;
    let metaData = {};
    const [colors, levels] = await Promise.all([
      ColorService.findAll(),
      LevelService.findAll()
    ]);
    if (userId) {
      const user = await User.findById(userId).exec();
      if (user && user.metaDefault) {
        metaData = { ...user.metaDefault, levels };
        return res.json(metaData); 
      }
    }
    const defaultFont = "Arial";
    const defaultLevel = levels.find(level => level.name === "medium") || { name: "medium" };
    metaData = {
      levels:levels,
      default: {
        colors,
        level: defaultLevel.level.name,
        font: defaultFont, 
      }
    };
    console.log('dfdfa',levels);
    res.json(metaData); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching meta data from database');
  }
});

//creating game 
router.post('/api/v2/games', async (req, res) => {
  const level = req.query.level;
  const font = req.header('X-font');
  const { colors } = req.body;
  const sessionData = req.session.user;
  const userId = sessionData._id;
  if (!userId || !level || !font || !colors) {
    return res.status(400).json({ error: "Missing required game information or user not authenticated." });
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
    const newGame = new Game({
        userId,
        level,
        font,
        colors,
        target,
        remaining: levelName.rounds,
        status: "unfinished",
        guesses: '',
        timestamp: Date.now()
    });
    await newGame.save();
    const gameResponse = newGame.toObject();
    delete gameResponse.userId;
    res.status(201).json(gameResponse);
  } catch (error) {
    console.error('Error reading from words.txt or saving to MongoDB:', error);
    res.status(500).json({ error: "Failed to read words file or save game data" });
  }
});


//getting game with sepcific id
router.get('/api/v2/game/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    // Convert the Mongoose document to a plain JavaScript object
    const gameResponse = game.toObject();
    delete gameResponse.userId;
    res.json(gameResponse);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//endpoint to make gueess
router.post('/api/v2/games/:id/guesses', async (req, res) => {
  const { id } = req.params;
  const { guess } = req.query;
  const sessionData = req.session.user;
  const userId = sessionData._id;
  try {
    if (!userId) {
      return res.status(401).json({ msg: "User is not authenticated" });
    }
    const updatedGame = await makeGuess(userId, id, guess);
    
    if (updatedGame.error) {
      res.status(400).json({ msg: updatedGame.error });
    } else {
      // Assuming `updatedGame` includes `userId` and it needs to be removed from the response.
      const responseGame = { ...updatedGame }; 
      delete responseGame.userId; 
      res.json(responseGame);
    }
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function makeGuess(userId, id, guess) {
  if (!guess || guess.length !== 1 || !/[a-zA-Z]/.test(guess)) {
    return { error: "Invalid guess. Must be a single alphabetic letter." };
  }

  try {
    const game = await Game.findOne({ _id: id, userId: userId });
    if (!game) {
      return { error: "Game not found." };
    }
    if (game.status !== 'unfinished') {
      return { error: "Game already completed." };
    }
    // Ensure game.target is a string
    if (typeof game.target !== 'string' || !game.target) {
      console.error('game.target is not a string or is empty.');
      return { error: 'Game target is not properly set.' };
    }
    // Check if guesses are still available
    if (game.remaining <= 0) {
      return { error: "No remaining guesses. You cannot make a guess." };
    }
    // Modify game data based on the guess
    game.guesses += guess;
    game.view = game.target.split('').map(letter => game.guesses.includes(letter) ? letter : '_').join('');
    if (!game.target.includes(guess)) {
      game.remaining -= 1;
    }
    if (game.view === game.target) {
      game.status = 'victory';
      game.timeToComplete = Date.now() - game.timestamp;
    } else if (game.remaining <= 0) {
      game.status = 'loss';
    }
    await game.save();
    return {
      _id: game._id,
      userId: game.userId,
      target: game.target,
      guesses: game.guesses,
      remaining: game.remaining,
      view: game.view,
      status: game.status,
      timestamp: game.timestamp,
      timeToComplete: game.timeToComplete
    };
  } catch (error) {
    console.error('Error in makeGuess:', error);
    return { error: 'Internal server error during guess processing.' };
  }
}


//endpoint to get allt the games
router.get('/api/v2/games', async (req, res) => {
  try {
    // Access the session data
    const sessionData = req.session.user;
    const userId = sessionData._id;
    
    // Find all games for the user
    const games = await Game.find({ userId: userId });
    
    if (games.length > 0) {
      // Convert each Mongoose document to a JavaScript object and remove the userId
      const gamesResponse = games.map(game => {
        const gameObj = game.toObject();
        delete gameObj.userId; 
        return gameObj;
      });

      res.status(200).json(gamesResponse);
    } else {
      res.status(404).json({ msg: "No games found for this user." });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ msg: "Server error", error });
  }
});


module.exports = router;

