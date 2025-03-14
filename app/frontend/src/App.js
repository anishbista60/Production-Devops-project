import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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
    const response = await axios.get(`${API_URL}/todos`);
    setTodos(response.data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/todos`, {
      title,
      completed: false
    });
    setTitle('');
    fetchTodos();
  };

  const toggleTodo = async (id, completed) => {
    await axios.put(`${API_URL}/todos/${id}`, {
      completed: !completed
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/todos/${id}`);
    fetchTodos();
  };

  return (
    <div className="App">
      <h1>Todo App</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new todo"
          required
        />
        <button type="submit">Add</button>
      </form>
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
