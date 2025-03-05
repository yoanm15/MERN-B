const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();


var cardList =
    [
        'Roy Campanella',
        'Paul Molitor',
        'Tony Gwynn',
        'Dennis Eckersley',
        'Reggie Jackson',
        'Gaylord Perry',
        'Buck Leonard',
        'Rollie Fingers',
        'Charlie Gehringer',
        'Wade Boggs',
        'Carl Hubbell',
        'Dave Winfield',
        'Jackie Robinson',
        'Ken Griffey, Jr.',
        'Al Simmons',
        'Chuck Klein',
        'Mel Ott',
        'Mark McGwire',
        'Nolan Ryan',
        'Ralph Kiner',
        'Yogi Berra',
        'Goose Goslin',
        'Greg Maddux',
        'Frankie Frisch',
        'Ernie Banks',
        'Ozzie Smith',
        'Hank Greenberg',
        'Kirby Puckett',
        'Bob Feller',
        'Dizzy Dean',
        'Joe Jackson',
        'Sam Crawford',
        'Barry Bonds',
        'Duke Snider',
        'George Sisler',
        'Ed Walsh',
        'Tom Seaver',
        'Willie Stargell',
        'Bob Gibson',
        'Brooks Robinson',
        'Steve Carlton',
        'Joe Medwick',
        'Nap Lajoie',
        'Cal Ripken, Jr.',
        'Mike Schmidt',
        'Eddie Murray',
        'Tris Speaker',
        'Al Kaline',
        'Sandy Koufax',
        'Willie Keeler',
        'Pete Rose',
        'Robin Roberts',
        'Eddie Collins',
        'Lefty Gomez',
        'Lefty Grove',
        'Carl Yastrzemski',
        'Frank Robinson',
        'Juan Marichal',
        'Warren Spahn',
        'Pie Traynor',
        'Roberto Clemente',
        'Harmon Killebrew',
        'Satchel Paige',
        'Eddie Plank',
        'Josh Gibson',
        'Oscar Charleston',
        'Mickey Mantle',
        'Cool Papa Bell',
        'Johnny Bench',
        'Mickey Cochrane',
        'Jimmie Foxx',
        'Jim Palmer',
        'Cy Young',
        'Eddie Mathews',
        'Honus Wagner',
        'Paul Waner',
        'Grover Alexander',
        'Rod Carew',
        'Joe DiMaggio',
        'Joe Morgan',
        'Stan Musial',
        'Bill Terry',
        'Rogers Hornsby',
        'Lou Brock',
        'Ted Williams',
        'Bill Dickey',
        'Christy Mathewson',
        'Willie McCovey',
        'Lou Gehrig',
        'George Brett',
        'Hank Aaron',
        'Harry Heilmann',
        'Walter Johnson',
        'Roger Clemens',
        'Ty Cobb',
        'Whitey Ford',
        'Willie Mays',
        'Rickey Henderson',
        'Babe Ruth'
    ];

app.post('/api/register', async (req, res, next) => {
    // incoming: firstName, lastName, login, password
    // outgoing: message, error

    let error = '';
    const { firstName, lastName, login, password } = req.body;

    try {
        const db = client.db('COP4331Cards');

        // Check if a user with the same login already exists
        const existingUser = await db.collection('Users').findOne({ Login: login });
        if (existingUser) {
            error = 'User already exists';
        } else {
            // Retrieve the current maximum UserId in the Users collection.
            // If no users exist, newUserId will default to 1.
            const maxUser = await db.collection('Users')
                .find()
                .sort({ UserId: -1 })
                .limit(1)
                .toArray();

            const newUserId = maxUser.length > 0 ? maxUser[0].UserId + 1 : 1;

            // Create a new user record with the auto-incremented id
            const newUser = {
                UserId: newUserId,
                FirstName: firstName,
                LastName: lastName,
                Login: login,
                Password: password
            };

            await db.collection('Users').insertOne(newUser);
        }
    } catch (e) {
        error = e.toString();
    }

    const message = error === '' ? 'Successfully registered' : '';
    res.status(200).json({ message, error });
});


app.post('/api/addCard', async (req, res, next) => {
    // incoming: userId, color
    // outgoing: error

    const { userId, card } = req.body;

    const newCard = { Card: card, UserId: userId };
    var error = '';

    try {
        const db = client.db('COP4331Cards');
        const result = db.collection('Cards').insertOne(newCard);
    }
    catch (e) {
        error = e.toString();
    }

    cardList.push(card);

    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error

    var error = '';

    const { login, password } = req.body;

    const db = client.db('COP4331Cards');
    const results = await db.collection('Users').find({ Login: login, Password: password }).toArray();

    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0) {
        id = results[0].UserId;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }

    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
});


app.post('/api/searchCards', async (req, res, next) => {
    // incoming: userId, search
    // outgoing: results[], error

    var error = '';

    const { userId, search } = req.body;

    var _search = search.trim();

    const db = client.db('COP4331Cards');
    const results = await db.collection('Cards').find({ "Card": { $regex: _search + '.*', $options: 'i' } }).toArray();

    var _ret = [];
    for (var i = 0; i < results.length; i++) {
        _ret.push(results[i].Card);
    }

    var ret = { results: _ret, error: error };
    res.status(200).json(ret);
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); // start Node + Express server on port 5000
