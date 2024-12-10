from flask import Flask, request, session, jsonify, send_from_directory
import os
import json
from uuid import uuid4

app = Flask(__name__, static_folder='public', static_url_path='/public')
app.secret_key = 'a_very_secret_key_here'

TODOS_FILE = 'todos.json'

def load_todos():
    if not os.path.exists(TODOS_FILE):
        return {"todos": []}
    with open(TODOS_FILE, 'r') as f:
        return json.load(f)

def save_todos(data):
    with open(TODOS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/setname', methods=['POST'])
def setname():
    data = request.json
    username = data.get('username', '').strip()
    if not username:
        return jsonify({"error": "Name cannot be empty"}), 400
    session['username'] = username
    return jsonify({"message": "Name set"}), 200

@app.route('/whoami', methods=['GET'])
def whoami():
    if 'username' in session:
        return jsonify({"username": session['username']}), 200
    else:
        return jsonify({"username": None}), 200

@app.route('/signout', methods=['POST'])
def signout():
    session.pop('username', None)
    return jsonify({"message": "Signed out"}), 200

@app.route('/todos', methods=['GET'])
def get_todos():
    todos_data = load_todos()
    return jsonify({"todos": todos_data['todos']}), 200

@app.route('/todos', methods=['POST'])
def add_todo():
    if 'username' not in session:
        return jsonify({"error": "You must set your name first"}), 401

    data = request.json
    text = data.get('text', '').strip()
    if not text:
        return jsonify({"error": "Todo text is required"}), 400

    todos_data = load_todos()
    todo_id = str(uuid4())
    new_todo = {
        "id": todo_id,
        "text": text,
        "completed": False,
        "user": session['username']
    }
    todos_data['todos'].append(new_todo)
    save_todos(todos_data)

    return jsonify({"message": "Todo added"}), 200

@app.route('/todos/toggle', methods=['POST'])
def toggle_todo():
    data = request.json
    todo_id = data.get('id')

    if not todo_id:
        return jsonify({"error": "Todo ID required"}), 400

    todos_data = load_todos()
    for todo in todos_data['todos']:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            save_todos(todos_data)
            return jsonify({"message": "Todo toggled"}), 200

    return jsonify({"error": "Todo not found"}), 404

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
