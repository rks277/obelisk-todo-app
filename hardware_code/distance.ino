// pins for the first sensor
const int TRIG_PIN_1 = 5;  // GPIO5
const int ECHO_PIN_1 = 18; // GPIO18

// pins for the second sensor
const int TRIG_PIN_2 = 19; // GPIO19
const int ECHO_PIN_2 = 21; // GPIO21

// LED pins
const int RED_LED_PIN = 12;   // GPIO12
const int GREEN_LED_PIN = 14; // GPIO14

const float SOUND_SPEED = 0.034;  
const float TIMEOUT = 25000;      
const float DETECTION_THRESHOLD = 7.0; 

bool personInFront = false;
bool personBowing = false;
bool previousBowingState = false;

void setup() {
  Serial.begin(115200);
  
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);
  
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  
  randomSeed(analogRead(A0));
  
  delay(1000);
}

void turnOffLEDs() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}

void handleBowingDetected() {
  int randomChoice = random(2);
  
  // Turn off both LEDs first
  turnOffLEDs();
  
  // Light up selected LED
  if (randomChoice == 0) {
    digitalWrite(RED_LED_PIN, HIGH);
    Serial.println("Red LED activated!");
  } else {
    digitalWrite(GREEN_LED_PIN, HIGH);
    Serial.println("Green LED activated!");
  }
}

float readDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Set trigger pin HIGH for 10 microseconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH, TIMEOUT);
  
  float distance = duration * SOUND_SPEED / 2;
  
  if (duration == 0 || distance > 400) {
    return -1; // Return -1 for invalid readings
  }
  
  return distance;
}

void updatePersonDetection(float distance1, float distance2) {
  bool sensor1Detected = (distance1 >= 0 && distance1 < DETECTION_THRESHOLD);
  bool sensor2Detected = (distance2 >= 0 && distance2 < DETECTION_THRESHOLD);
  
  previousBowingState = personBowing;
  
  personInFront = (sensor1Detected && sensor2Detected);
  personBowing = (sensor1Detected != sensor2Detected); // XOR - only one sensor detecting
  
  // If person just started bowing (transition from not bowing to bowing)
  if (!previousBowingState && personBowing) {
    handleBowingDetected();
  } else if (!personBowing) {
    // Turn off LEDs if no one is bowing
    turnOffLEDs();
  }
  
  Serial.print("Person in front: ");
  Serial.println(personInFront ? "Yes" : "No");
  Serial.print("Person bowing: ");
  Serial.println(personBowing ? "Yes" : "No");
}

void loop() {
  float distance1 = readDistance(TRIG_PIN_1, ECHO_PIN_1);
  
  delay(50);
  
  float distance2 = readDistance(TRIG_PIN_2, ECHO_PIN_2);
  
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
  
  updatePersonDetection(distance1, distance2);
  
  Serial.println();
  
  delay(500);
}