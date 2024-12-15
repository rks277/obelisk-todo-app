#include <Stepper.h>

int count = 0;

const int TRIG_PIN_1 = 5;
const int ECHO_PIN_1 = 18;

const int TRIG_PIN_2 = 19;
const int ECHO_PIN_2 = 21;

const int IN1 = 13;
const int IN2 = 12;
const int IN3 = 14;
const int IN4 = 27;

const float SOUND_SPEED = 0.034;  
const float TIMEOUT = 25000;      
const float DETECTION_THRESHOLD = 7.0;

const int STEPS_PER_REVOLUTION = 2048;
const int STEPS_FOR_90_DEGREES = STEPS_PER_REVOLUTION / 4;

Stepper stepper(STEPS_PER_REVOLUTION, IN1, IN3, IN2, IN4);

bool needsRotation = false;
bool isRotating = false;

void setup() {
    Serial.begin(115200);

    Serial.begin(115200);
    while (!Serial) {
        ;
    }
    Serial.println("ESP32 is ready to communicate.");

    pinMode(TRIG_PIN_1, OUTPUT);
    pinMode(ECHO_PIN_1, INPUT);
    pinMode(TRIG_PIN_2, OUTPUT);
    pinMode(ECHO_PIN_2, INPUT);

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
    stepper.step(STEPS_PER_REVOLUTION);

    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
}

void loop() {

    if (Serial.available()) {
        String data = Serial.readStringUntil('\n');
        data.trim();

        if (data == "1") {
            count++;
        } 
        Serial.print("Count: ");
        Serial.println(count);
    }

    float distance1 = readDistance(TRIG_PIN_1, ECHO_PIN_1);
    float distance2 = readDistance(TRIG_PIN_2, ECHO_PIN_2);

    bool sensor1Clear = (distance1 >= 0 && distance1 > 3 * DETECTION_THRESHOLD);
    bool sensor2Triggered = (distance2 >= 0 && distance2 < DETECTION_THRESHOLD);

    if (sensor2Triggered && sensor1Clear && !isRotating) {
        needsRotation = true;
        isRotating = true;
    }

    if (needsRotation && count > 0) {
        count--;
        rotateMotor();
        needsRotation = false;
        delay(1000);
        isRotating = false;
    }

    delay(500);
}