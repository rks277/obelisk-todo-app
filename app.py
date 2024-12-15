from flask import Flask, request, session, jsonify, send_from_directory
import os
import json
from uuid import uuid4
import serial

app = Flask(__name__, static_folder='public', static_url_path='/public')
app.secret_key = 'a_very_secret_key_here'  # Replace with a secure key

USERS_FILE = 'users.json'
TODOS_FILE = 'todos.json'

# Configure the serial connection
SERIAL_PORT = "/dev/cu.usbserial-10"  # Replace with your ESP32 serial port
BAUD_RATE = 115200

def send_to_esp32_via_serial(data):
    """Send data to ESP32 via the serial port and read its response."""
    try:
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2) as ser:
            # Send the data
            ser.write(f"{data}\n".encode())  # Send the data with a newline character
            print(f"Sent to ESP32: {data}")

            # Wait for the ESP32's response
            response = ser.readline().decode().strip()  # Read a single line
            print(f"Received from ESP32: {response}")
            return response
    except Exception as e:
        print(f"Failed to communicate with ESP32 via serial: {e}")
        return None

def load_users():
    if not os.path.exists(USERS_FILE):
        return {"users": {}}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

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

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    users_data = load_users()
    user_info = users_data["users"].get(username)

    if user_info and user_info["password"] == password:
        session['username'] = username
        return jsonify({"message": "Logged in"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/whoami', methods=['GET'])
def whoami():
    if 'username' in session:
        return jsonify({"username": session['username']}), 200
    else:
        return jsonify({"username": None}), 200

@app.route('/todos', methods=['GET'])
def get_todos():
    todos_data = load_todos()
    return jsonify({"todos": todos_data['todos']}), 200

@app.route('/todos', methods=['POST'])
def add_todo():
    if 'username' not in session:
        return jsonify({"error": "You must be logged in to add todos"}), 401

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

import socket

# ESP32 configuration
ESP32_IP = "192.168.x.x"  # Replace with your ESP32's IP address
ESP32_PORT = 80  # Replace with your ESP32's port

def send_to_esp32(data):
    """Send data to ESP32 via TCP."""
    try:
        # Create a socket and connect to ESP32
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((ESP32_IP, ESP32_PORT))

        # Send the data as a string
        client_socket.sendall(str(data).encode())
        client_socket.close()
        return True
    except Exception as e:
        print(f"Failed to send data to ESP32: {e}")
        return False

@app.route('/todos/toggle', methods=['POST'])
def toggle_todo():
    data = request.json
    todo_id = data.get('id')

    if not todo_id:
        return jsonify({"error": "Todo ID required"}), 400

    todos_data = load_todos()
    for todo in todos_data['todos']:
        if todo['id'] == todo_id:
            # Toggle the completion status
            todo['completed'] = not todo['completed']
            save_todos(todos_data)

            # Send data to ESP32 and get the response
            if todo['completed']:
                response = send_to_esp32_via_serial(1)
            else:
                response = send_to_esp32_via_serial(0)
            if response:
                return jsonify({"message": f"Todo toggled. ESP32 count: {response}"}), 200
            else:
                return jsonify({"error": "Todo toggled but failed to communicate with ESP32"}), 500

    return jsonify({"error": "Todo not found"}), 404

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
