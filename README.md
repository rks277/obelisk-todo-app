# obelisk-todo-app
# **Monolith Candy Dispenser**

## **Overview**

The **Monolith Candy Dispenser** is an interactive installation paired with a dynamic to-do list web application. Inspired by the monolith from *2001: A Space Odyssey*, this project transforms mundane productivity tasks into a ritualistic experience, rewarding users with candy for completing to-do list items.

By blending hardware, software, and storytelling, the project highlights the contrast between humanity's profound capabilities and the banality of modern routines.

---

## **How It Works**

The system has two main components:

1. **Web-based To-Do List Application**  
2. **Physical Monolith with Hardware**

### **1. Web-based To-Do List Application**

- A dynamic **Flask-powered web app** allows users to:
  - Add, view, and complete to-do items.
  - Experience a dynamic spaceship/alien-themed **generative art** background using P5.js for a futuristic aesthetic.
- The app is built with:
  - **Frontend**: HTML, CSS, JavaScript, P5.js.
  - **Backend**: Flask (Python) with local JSON storage for tasks and users.

### **2. Physical Monolith and Hardware**

The physical monolith houses an **ESP32 microcontroller** and the following components:

- **Ultrasonic Distance Sensors**: Detect user presence and ensure the kneeling action is performed.
- **Stepper Motor**: Dispenses candy upon task completion.
- **Raspberry Pi**:  
  - Hosts the Flask web app.  
  - Communicates with the ESP32 over **USB serial connection**.

---

## **Workflow**

1. **Users interact with the web app** to manage their to-do list.
2. When a task is marked as complete, the Flask backend triggers the ESP32 via serial communication.
3. The ESP32 verifies that the user kneels before the monolith (using the lower distance sensor).
4. If the condition is met, the **stepper motor activates** to dispense candy.

---

## **Project Structure**

```plaintext
obelisk-todo-app/
├── hardware_code/           # ESP32 Arduino code
├── public/                  # Web app frontend files
│   ├── app.js               # Handles API calls
│   ├── index.html           # Main interface
│   ├── sketch.js            # P5.js generative art background
│   └── styles.css           # Visual styling
├── README.md                # Project documentation
├── app.py                   # Flask backend and API logic
├── todos.json               # To-do items storage
└── users.json               # User data storage
