int count = 0;

void setup() {
    Serial.begin(115200);
    while (!Serial) {
        ;
    }
    Serial.println("ESP32 is ready to communicate.");
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
}
