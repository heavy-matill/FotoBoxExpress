int inByte = 0;         // incoming serial byte
uint8_t tAnim = 0;

const byte ledPin = LED_BUILTIN;
const byte interruptPin = D2;
volatile byte state = LOW;

void setup() {
  // start serial port at 9600 bps:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  pinMode(ledPin, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(interruptPin), triggerButton, CHANGE);
}

void loop() {
  // if we get a valid byte, read analog ins:
  if (Serial.available() > 1) {
    // get incoming byte:
    inByte = Serial.read();
    switch(inByte) {
      case 't': {        
        Serial.print('t');        
        Serial.write(Serial.read());
        Serial.println();
        break;
      }
      case 'a': {        
        tAnim = Serial.read();
        // animate for tAnim
        break;
      }
      default: {
        while(Serial.available())
          Serial.read();
      }
    }
  }  

  // output trigger state
  digitalWrite(ledPin, state);
}

ICACHE_RAM_ATTR void triggerButton() {
  state = !state;
  Serial.print("s");
  Serial.println(digitalRead(interruptPin));
}
