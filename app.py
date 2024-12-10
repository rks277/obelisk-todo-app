from flask import Flask, request, session, jsonify, send_from_directory
import os
import json
from uuid import uuid4

app = Flask(__name__, static_folder='public', static_url_path='/public')
app.secret_key = 'a_very_secret_key_here'  # Replace with your own secret key

USERS_FILE = 'users.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

# Authentication Endpoints
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    users = load_users()
    if username in users:
        return jsonify({"error": "Username already taken"}), 400

    users[username] = {
        "password": password,
        "todos": []
    }
    save_users(users)

    return jsonify({"message": "Signed up successfully. Please sign in."}), 200

@app.route('/auth/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    users = load_users()
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid username or password"}), 401

    session['username'] = username
    return jsonify({"message": "Signed in"}), 200

@app.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/auth/me', methods=['GET'])
def me():
    if 'username' in session:
        return jsonify({"username": session['username']}), 200
    else:
        return jsonify({"error": "Not signed in"}), 401

# Todos Endpoints
@app.route('/todos', methods=['GET'])
def get_todos():
    if 'username' not in session:
        return jsonify({"error": "Not signed in"}), 401

    users = load_users()
    user = users.get(session['username'], {})
    return jsonify({"todos": user.get("todos", [])}), 200

@app.route('/todos', methods=['POST'])
def add_todo():
    if 'username' not in session:
        return jsonify({"error": "Not signed in"}), 401

    data = request.json
    text = data.get('text', '').strip()
    if not text:
        return jsonify({"error": "Todo text is required"}), 400

    users = load_users()
    user = users.get(session['username'])

    # Generate a simple unique ID using uuid
    todo_id = str(uuid4())
    new_todo = {
        "id": todo_id,
        "text": text,
        "completed": False
    }
    user['todos'].append(new_todo)
    save_users(users)

    return jsonify({"message": "Todo added"}), 200

@app.route('/todos/toggle', methods=['POST'])
def toggle_todo():
    if 'username' not in session:
        return jsonify({"error": "Not signed in"}), 401

    data = request.json
    todo_id = data.get('id')

    if not todo_id:
        return jsonify({"error": "Todo ID required"}), 400

    users = load_users()
    user = users.get(session['username'])
    todos = user['todos']

    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            break
    else:
        return jsonify({"error": "Todo not found"}), 404

    save_users(users)
    return jsonify({"message": "Todo toggled"}), 200

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
