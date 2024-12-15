let isLoggedIn = false; // Track login state

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

showLoginFormBtn.addEventListener('click', () => {
    loginForm.style.display = (loginForm.style.display === 'none') ? 'block' : 'none';
});

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
    newTodoInput.placeholder = "Only HAL's closest friends can add TODOs";
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

logoutBtn.addEventListener('click', async () => {
    const res = await fetch('/auth/logout', {method: 'POST'});
    if (res.ok) {
        checkAuth();
    }
});

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
        loadTodos();
    } else {
        const data = await res.json();
        alert(data.error);
    }
}

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
        loadTodos();
    } else {
        const data = await res.json();
        alert(data.error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
