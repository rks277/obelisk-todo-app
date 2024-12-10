const signUpBtn = document.getElementById('signUpBtn');
const signInBtn = document.getElementById('signInBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const addTodoBtn = document.getElementById('addTodoBtn');
const newTodoInput = document.getElementById('newTodoInput');
const todoList = document.getElementById('todoList');
const usernameDisplay = document.getElementById('usernameDisplay');

// Helper function to check auth state
async function checkAuth() {
  const res = await fetch('/auth/me');
  if (res.ok) {
    const data = await res.json();
    showTodos(data.username);
  } else {
    showAuth();
  }
}

function showAuth() {
  authSection.style.display = 'block';
  todoSection.style.display = 'none';
  logoutBtn.style.display = 'none';
  todoList.innerHTML = '';
  usernameDisplay.textContent = '';
}

function showTodos(username) {
  authSection.style.display = 'none';
  todoSection.style.display = 'block';
  logoutBtn.style.display = 'block';
  usernameDisplay.textContent = `${username}'s Todo List`;
  loadTodos();
}

// Sign Up
signUpBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await fetch('/auth/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if (res.ok) {
    alert(data.message);
  } else {
    alert(data.error);
  }
});

// Sign In
signInBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await fetch('/auth/signin', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if (res.ok) {
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
    checkbox.addEventListener('click', async () => {
      const res = await fetch('/todos/toggle', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: todo.id})
      });
      if (res.ok) {
        window.location.reload();
      }
    });

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.style.textDecoration = todo.completed ? 'line-through' : 'none';
    span.style.marginLeft = '8px';

    li.appendChild(checkbox);
    li.appendChild(span);
    todoList.appendChild(li);
  });
}

// Add new todo
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

// Initial auth check
checkAuth();
