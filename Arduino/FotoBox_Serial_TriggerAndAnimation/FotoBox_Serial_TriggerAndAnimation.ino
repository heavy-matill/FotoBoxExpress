#include <CommandParser.h>

typedef CommandParser<> MyCommandParser;

MyCommandParser parser;

void cmd_test(MyCommandParser::Argument *args, char *response) {
  Serial.print("test string: "); Serial.println(args[0].asString);
}

void cmd_count(MyCommandParser::Argument *args, char *response) {
  Serial.print("countdown ms uint64: "); Serial.println((uint32)args[0].asUInt64);
}
void cmd_stdby(MyCommandParser::Argument *args, char *response) {  
  Serial.println("switched to standby");
}

void cmd_off(MyCommandParser::Argument *args, char *response) {
  Serial.println("switched off");
}


int inByte = 0;         // incoming serial byte
uint8_t tAnim = 0;

const byte ledPin = LED_BUILTIN;
const byte interruptPin = D2;
uint8_t state = 0;

void setup() {
  // start serial port at 9600 bps:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  // register commands
  parser.registerCommand("TEST", "s", &cmd_test);  
  parser.registerCommand("COUNTDOWN", "u", &cmd_count);  
  parser.registerCommand("STANDBY", "", &cmd_stdby);  
  parser.registerCommand("OFF", "", &cmd_off);
  
  pinMode(ledPin, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(interruptPin), triggerButton, CHANGE);
}

void loop() {
  proc_cmd();
  // output trigger state
  digitalWrite(ledPin, state);
}

void proc_cmd() {
  if (Serial.available()) {
    char line[128];
    size_t lineLength = Serial.readBytesUntil('\n', line, 127);
    line[lineLength] = '\0';

    char response[MyCommandParser::MAX_RESPONSE_SIZE];
    parser.processCommand(line, response);
    Serial.println(response);
  }
}


ICACHE_RAM_ATTR void triggerButton() {
  Serial.print("TRIGGER ");
  Serial.println(digitalRead(interruptPin));
}
