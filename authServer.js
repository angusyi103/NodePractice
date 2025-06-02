require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const users = [
  { id: 1, name: 'John Doe', email: 'john@doe.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@doe.com' },
];

let refreshTokens = [];

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.use(logger);

app.post('/refresh-token', (req, res) => {
  console.log(req.body);
  const refreshToken = req.body.token;
  console.log('refreshTokens', refreshTokens);
  if (refreshToken === null || !refreshTokens.includes(refreshToken)) {
    return res.status(401).json({ message: 'refresh-token: Unauthorized' });
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'refresh-token: Unauthorized' });
    }
    const token = generateToken({ name: users.name });
    res.json({ token: token });
  });
});

app.get('/userName', verifyToken, (req, res) => {
  const userName = req.body.userName;
  const user = users.find((user) => user.name === userName);
  res.json(user);
});

app.post('/login', (req, res) => {
  const userName = req.body.userName;
  const user = { name: userName };

  const token = generateToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_JWT_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ token: token, refreshToken: refreshToken });
});

app.delete('/logout', (req, res) => {
  const refreshToken = req.body.refreshToken;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.sendStatus(204);
});

function generateToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15s' });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('jwt decode', decoded);
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
}

app.listen(4000, () => {
  console.log('Auth server is running on port 4000');
});
