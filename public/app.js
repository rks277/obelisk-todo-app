const nameInput = document.getElementById('nameInput');
const setNameBtn = document.getElementById('setNameBtn');
const nameSection = document.getElementById('name-section');
const todoSection = document.getElementById('todo-section');
const todoHeader = document.getElementById('todoHeader');
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const signOutBtn = document.getElementById('signOutBtn');

async function checkName() {
  const res = await fetch('/whoami');
  const data = await res.json();
  if (data.username) {
    showTodos(data.username);
  } else {
    showNameEntry();
  }
}

function showNameEntry() {
  nameSection.style.display = 'block';
  todoSection.style.display = 'none';
}

function showTodos(username) {
  nameSection.style.display = 'none';
  todoSection.style.display = 'block';
  todoHeader.textContent = `Welcome, ${username}! Add a todo below.`;
  loadTodos();
}

setNameBtn.addEventListener('click', async () => {
  const username = nameInput.value.trim();
  if (!username) {
    alert('Please enter a name.');
    return;
  }

  const res = await fetch('/setname', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  const data = await res.json();
  if (res.ok) {
    showTodos(username);
  } else {
    alert(data.error);
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

signOutBtn.addEventListener('click', async () => {
  const res = await fetch('/signout', {method: 'POST'});
  if (res.ok) {
    window.location.reload();
  }
});

checkName();
