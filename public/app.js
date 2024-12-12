let isLoggedIn = false; // track login state

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('loggedInView');
const welcomeMessage = document.getElementById('welcomeMessage');

const showLoginFormBtn = document.getElementById('showLoginFormBtn');
const loginForm = document.getElementById('loginForm');

// Show/Hide login form
showLoginFormBtn.addEventListener('click', () => {
    loginForm.style.display = (loginForm.style.display === 'none') ? 'block' : 'none';
});

// Check if user is logged in
async function checkAuth() {
  const res = await fetch('/whoami');
  const data = await res.json();
  if (data.username) {
    showLoggedInView(data.username);
  } else {
    showLoggedOutView();
  }
  loadTodos();
}

function showLoggedOutView() {
  isLoggedIn = false;
  loggedOutView.style.display = 'block';
  loggedInView.style.display = 'none';
  
  newTodoInput.disabled = true;
  addTodoBtn.disabled = true;
  newTodoInput.placeholder = "Log in to add new todo";
}

function showLoggedInView(username) {
  isLoggedIn = true;
  loggedOutView.style.display = 'none';
  loggedInView.style.display = 'block';
  welcomeMessage.textContent = `Logged in as ${username}`;
  
  newTodoInput.disabled = false;
  addTodoBtn.disabled = false;
  newTodoInput.placeholder = "New Todo...";
}

// Login
loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if (res.ok) {
    usernameInput.value = '';
    passwordInput.value = '';
    loginForm.style.display = 'none';
    checkAuth();
  } else {
    alert(data.error);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  const res = await fetch('/auth/logout', {method: 'POST'});
  if (res.ok) {
    checkAuth();
  }
});

// Load Todos
async function loadTodos() {
  const res = await fetch('/todos');
  const data = await res.json();
  if (res.ok) {
    renderTodos(data.todos);
  } else {
    alert(data.error);
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.className = 'todo-checkbox';
    // Everyone can toggle
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const spanText = document.createElement('span');
    spanText.textContent = todo.text;
    spanText.style.textDecoration = todo.completed ? 'line-through' : 'none';
    spanText.style.marginLeft = '8px';

    const spanUser = document.createElement('span');
    spanUser.textContent = ` (added by ${todo.user})`;
    spanUser.style.fontSize = '0.9em';
    spanUser.style.color = '#555';
    spanUser.style.marginLeft = '8px';

    li.appendChild(checkbox);
    li.appendChild(spanText);
    li.appendChild(spanUser);
    todoList.appendChild(li);
  });
}

async function toggleTodo(id) {
  const res = await fetch('/todos/toggle', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id})
  });
  if (res.ok) {
    window.location.reload();
  } else {
    const data = await res.json();
    alert(data.error);
    loadTodos();
  }
}

// Add Todo
addTodoBtn.addEventListener('click', async () => {
  const text = newTodoInput.value.trim();
  if (!text) return;

  const res = await fetch('/todos', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text})
  });
  if (res.ok) {
    newTodoInput.value = '';
    window.location.reload();
  } else {
    const data = await res.json();
    alert(data.error);
  }
});

// Hieroglyph generation for background
function getRandomHieroglyph() {
  // Egyptian Hieroglyphs range: U+13000–U+1342F
  // We'll use a subset for reliability
  const start = 0x13000;
  const end = 0x130FF; 
  const codePoint = start + Math.floor(Math.random() * (end - start));
  return String.fromCodePoint(codePoint);
}

function generateHieroglyphsGrid(rows = 30, cols = 50) {
  // Generate a large block of hieroglyphs (rows x cols)
  let result = '';
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      line += getRandomHieroglyph();
    }
    result += line + '\n';
  }
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
  const background = document.getElementById('hieroglyphs-background');
  background.textContent = generateHieroglyphsGrid();
  checkAuth();
});
