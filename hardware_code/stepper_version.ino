#include <Stepper.h>

// Pins for the first sensor
const int TRIG_PIN_1 = 5;  // GPIO5
const int ECHO_PIN_1 = 18; // GPIO18

// Pins for the second sensor
const int TRIG_PIN_2 = 19; // GPIO19
const int ECHO_PIN_2 = 21; // GPIO21

// Stepper motor pins (ULN2003)
const int IN1 = 13;
const int IN2 = 12;
const int IN3 = 14;
const int IN4 = 27;

// Constants for distance sensing
const float SOUND_SPEED = 0.034;  
const float TIMEOUT = 25000;      
const float DETECTION_THRESHOLD = 7.0; // Adjust this value based on your needs

// Stepper motor configuration
const int STEPS_PER_REVOLUTION = 2048;  // for 28BYJ-48 stepper motor
const int STEPS_FOR_90_DEGREES = STEPS_PER_REVOLUTION / 4;

// Initialize stepper motor
Stepper stepper(STEPS_PER_REVOLUTION, IN1, IN3, IN2, IN4);

// Variable to track if rotation is needed
bool needsRotation = false;
bool isRotating = false;

void setup() {
  Serial.begin(115200);
  
  // Setup sensor pins
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  
  // Set stepper motor speed (RPM)
  stepper.setSpeed(10);
  
  delay(1000);
}

float readDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH, TIMEOUT);
  float distance = duration * SOUND_SPEED / 2;
  
  if (duration == 0 || distance > 400) {
    return -1;
  }
  
  return distance;
}

void rotateMotor() {
  Serial.println("Rotating 360 degrees...");
  stepper.step(STEPS_PER_REVOLUTION);
  
  // Turn off motor coils after rotation
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  
  Serial.println("Rotation complete");
}

void loop() {
  // Read from both sensors
  float distance1 = readDistance(TRIG_PIN_1, ECHO_PIN_1);
  delay(50);
  float distance2 = readDistance(TRIG_PIN_2, ECHO_PIN_2);
  
  // Display readings
  Serial.print("Sensor 1: ");
  if (distance1 >= 0) {
    Serial.print(distance1);
    Serial.println(" cm");
  } else {
    Serial.println("Out of range");
  }
  
  Serial.print("Sensor 2: ");
  if (distance2 >= 0) {
    Serial.print(distance2);
    Serial.println(" cm");
  } else {
    Serial.println("Out of range");
  }
  
  // Check if only sensor 1 is triggered
  bool sensor1Triggered = (distance1 >= 0 && distance1 < DETECTION_THRESHOLD);
  bool sensor2Triggered = (distance2 >= 0 && distance2 < DETECTION_THRESHOLD);
  
  if (sensor1Triggered && !sensor2Triggered && !isRotating) {
    needsRotation = true;
    isRotating = true;
  }
  
  // Perform rotation if needed
  if (needsRotation) {
    rotateMotor();
    needsRotation = false;
    delay(1000); // Wait before allowing another rotation
    isRotating = false;
  }
  
  Serial.println();
  delay(500);
}