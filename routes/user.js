require('dotenv').config();

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

router.use(express.json());
router.use(logger);

const users = [
  { id: 1, name: 'John Doe', email: 'john@doe.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@doe.com' },
];

router.get('/', (req, res) => {
  res.send('user list');
});

router.get('/new-user', (req, res) => {
  res.send('new user');
});

router.post('/', (req, res) => {
  res.send('create user');
});

router
  .route('/:userName')
  .all(verifyToken)
  .get((req, res) => {
    console.log('get user by name', req.user);
    const userName = req.user.userName;
    console.log('Looking for user with name:', userName);
    const user = users.find((user) => user.name === userName);
    if (!user) {
      return res.status(404).json({ message: 'User not found', searchedName: userName });
    }
    res.json(user);
  })
  .put((req, res) => {
    res.send(`update user by id: ${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`delete user by id: ${req.params.id}`);
  });

router.post('/login', (req, res) => {
  console.log(req.body);
  const userName = req.body.userName;
  const password = req.body.password;

  const token = jwt.sign({ userName, password }, process.env.JWT_SECRET);
  res.json({ token: token });
});

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

//   console.log(token);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('jwt decode', decoded);
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = router;
