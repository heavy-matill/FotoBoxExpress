#include <CommandParser.h>
#include <FastLED.h>

typedef CommandParser<> MyCommandParser;

MyCommandParser parser;

#define pinR D8
#define pinG D6
#define pinB D7

int inByte = 0;         // incoming serial byte
int32_t tAnim = 0;
int32_t tLeft = 0;
int32_t tAnimStart = 0;

const byte ledPin = LED_BUILTIN;
const byte interruptPin = D2;
uint8_t state = 0;

uint8_t pinsRGB[3] = {pinR, pinG, pinB};
CRGB colShutter[3] = {CRGB::Red, CRGB::Yellow, CRGB::Green};

void cmd_test(MyCommandParser::Argument *args, char *response) {
  Serial.print("tested "); Serial.println(args[0].asString);
}

void cmd_count(MyCommandParser::Argument *args, char *response) {
  tAnim = (uint32) args[0].asUInt64;
  tAnimStart = millis();
  state = 2;
  Serial.print("counting "); Serial.println(tAnim);
}
void cmd_stdby(MyCommandParser::Argument *args, char *response) { 
  state = 1; 
  Serial.println("standby");
}

void cmd_off(MyCommandParser::Argument *args, char *response) {
  state = 0;
  Serial.println("off");
}

void paintLed(CRGB col) {
  for( int i = 0; i<3; i++) {
    analogWrite(pinsRGB[i], col.raw[i]);
  }   
}

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

  for( int i = 0; i<3; i++) {    
    pinMode(pinsRGB[i], OUTPUT);
  }
  pinMode(ledPin, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(interruptPin), triggerButton, CHANGE);
}

void loop() {
  proc_cmd();
  proc_anim();
}

void proc_cmd() {
  if (Serial.available()) {
    char line[128];
    size_t lineLength = Serial.readBytesUntil('\n', line, 127);
    line[lineLength] = '\0';

    char response[MyCommandParser::MAX_RESPONSE_SIZE];
    parser.processCommand(line, response);
    //Serial.println(response);
  }
}

void proc_anim() {
  switch(state) {
    case 0:    
      digitalWrite(ledPin, 1);
      paintLed(CRGB::Black); 
      break;
    case 1:
      digitalWrite(ledPin, 0);
      paintLed(CRGB::Black); 
      break;
    case 2:
      proc_count();
      break;
    default:
      break;
  }
}


void proc_count() {
  tLeft =  tAnimStart +tAnim - millis();
   
  if (tLeft<=0) {
    state = 1;
    return;
  }
  //uint8_t numLed = map(tLeft, 0, tAnim, 0, 2);
  uint8_t numLed = 2-tLeft*3/tAnim;
  paintLed(colShutter[numLed]);
  uint32_t progressAnim = (tLeft*3%tAnim)*255/tAnim;
  //Serial.print(tLeft); Serial.print(" "); Serial.println(numLed);
  /*for(int col = 0; col < (sizeof(colShutter)/sizeof(colShutter[0])); col++) { 
    fill_solid(leds, NUM_LEDS, CRGB::Black);   
    for(int dot = 0; dot < NUM_LEDS; dot++) { 
      leds[dot] = colShutter[col];
      FastLED.show();
      // clear this led for the next time around the loop
      delay(tiDelay/(NUM_LEDS*3));
      animateAF();
    }  
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    
  }*/
}

ICACHE_RAM_ATTR void triggerButton() {
  Serial.print("trigger ");
  Serial.println(digitalRead(interruptPin));
}
