require('dotenv').config();

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/todos', (req, res) => {
  try {
    const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
    const todos = JSON.parse(todosData);
    res.json(todos);
  } catch (error) {
    console.error('Error reading todos:', error);
    res.status(500).json({ message: 'Error retrieving todos' });
  }
});

router.get('/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
    const todos = JSON.parse(todosData);
    
    const todo = todos.find(todo => todo.id === id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Error reading todo:', error);
    res.status(500).json({ message: 'Error retrieving todo' });
  }
});

router.post('/todos', (req, res) => {
  try {
    const newTodo = req.body;
    const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
    const todos = JSON.parse(todosData);
    
    // Find the highest existing ID
    const maxId = todos.reduce((max, todo) => (todo.id > max ? todo.id : max), 0);
    
    // Assign a new unique ID
    newTodo.id = maxId + 1;
    
    // Ensure timestamp exists
    if (!newTodo.timestamp) {
      newTodo.timestamp = new Date().toISOString();
    }
    
    todos.push(newTodo);
    fs.writeFileSync(path.join(__dirname, '../MockData/todos.json'), JSON.stringify(todos, null, 2));
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
});

router.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedTodo = req.body;
  const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
  const todos = JSON.parse(todosData);
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    fs.writeFileSync(path.join(__dirname, '../MockData/todos.json'), JSON.stringify(todos, null, 2));
    res.json(updatedTodo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

router.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
  const todos = JSON.parse(todosData);
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    fs.writeFileSync(path.join(__dirname, '../MockData/todos.json'), JSON.stringify(todos, null, 2));
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

module.exports = router;