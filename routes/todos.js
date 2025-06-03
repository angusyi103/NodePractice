require('dotenv').config();

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Routes for /todos
router.route('/')
  .get((req, res) => {
    try {
      const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
      const todos = JSON.parse(todosData);
      res.json(todos);
    } catch (error) {
      console.error('Error reading todos:', error);
      res.status(500).json({ message: 'Error retrieving todos' });
    }
  })
  .post((req, res) => {
    try {
      const newTodo = req.body;
      const todosData = fs.readFileSync(path.join(__dirname, '../MockData/todos.json'));
      const todos = JSON.parse(todosData);
      
      const maxId = todos.reduce((max, todo) => (todo.id > max ? todo.id : max), 0);
      newTodo.id = maxId + 1;
      
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

// Routes for /todos/:id
router.route('/:id')
  .get((req, res) => {
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
  })
  .put((req, res) => {
    try {
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
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ message: 'Error updating todo' });
    }
  })
  .delete((req, res) => {
    try {
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
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ message: 'Error deleting todo' });
    }
  });

module.exports = router;