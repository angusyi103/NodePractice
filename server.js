const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(500).json({ message: 'Error' });
});

const userRouter = require('./routes/user');
app.use('/user', userRouter);

const todosRouter = require('./routes/todos');
app.use('/todos', todosRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
