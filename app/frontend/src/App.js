import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { tracer, meter, logger } from './telemetry';
import { context, trace } from '@opentelemetry/api';

// Metrics
const todoAddCounter = meter.createCounter('todo.added', {
  description: 'Number of todos added',
});
const todoToggleCounter = meter.createCounter('todo.toggled', {
  description: 'Number of todos toggled',
});
const todoDeleteCounter = meter.createCounter('todo.deleted', {
  description: 'Number of todos deleted',
});

function App() {

  const API_URL = window._env_ && window._env_.REACT_APP_API_URL 
  ? window._env_.REACT_APP_API_URL 
  : 'http://localhost:8080';

  console.log("Using API URL:", API_URL);
  
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const span = tracer.startSpan('fetchTodos');
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      logger.emit({
        severityText: 'INFO',
        body: 'Successfully fetched todos',
        attributes: { 'todo.count': response.data.length },
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      logger.emit({
        severityText: 'ERROR',
        body: 'Failed to fetch todos',
        attributes: { error: error.message },
      });
    } finally {
      span.end();
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    const span = tracer.startSpan('addTodo');
    try {
      await axios.post(`${API_URL}/todos`, {
        title,
        completed: false,
      });
      setTitle('');
      fetchTodos();
      todoAddCounter.add(1);
      logger.emit({
        severityText: 'INFO',
        body: 'Todo added',
        attributes: { 'todo.title': title },
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      logger.emit({
        severityText: 'ERROR',
        body: 'Failed to add todo',
        attributes: { error: error.message, 'todo.title': title },
      });
    } finally {
      span.end();
    }
  };

  const toggleTodo = async (id, completed) => {
    const span = tracer.startSpan('toggleTodo');
    try {
      await axios.put(`${API_URL}/todos/${id}`, {
        completed: !completed,
      });
      fetchTodos();
      todoToggleCounter.add(1);
      logger.emit({
        severityText: 'INFO',
        body: 'Todo toggled',
        attributes: { 'todo.id': id, 'todo.completed': !completed },
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      logger.emit({
        severityText: 'ERROR',
        body: 'Failed to toggle todo',
        attributes: { error: error.message, 'todo.id': id },
      });
    } finally {
      span.end();
    }
  };

  const deleteTodo = async (id) => {
    const span = tracer.startSpan('deleteTodo');
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
      todoDeleteCounter.add(1);
      logger.emit({
        severityText: 'INFO',
        body: 'Todo deleted',
        attributes: { 'todo.id': id },
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      logger.emit({
        severityText: 'ERROR',
        body: 'Failed to delete todo',
        attributes: { error: error.message, 'todo.id': id },
      });
    } finally {
      span.end();
    }
  };

  return (
    <div className="App">
      <h1>Todo App</h1>
      <div onSubmit={addTodo}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new todo"
          required
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span 
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
