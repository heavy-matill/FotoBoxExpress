#include <CommandParser.h> //https://github.com/Uberi/Arduino-CommandParser
#define FASTLED_ESP8266_RAW_PIN_ORDER
#include <FastLED.h>

#define pinLDR A0 //ADC
#define pinAF 5
#define pinRGB D5 //GPIO14
#define pinTrg D2

#define NUM_LEDS 45 //24 for smaller circle
#define DATA_PIN pinRGB
#define LED_TYPE SK6812
#define COLOR_ORDER GRB
#define FRAMES_PER_SECOND 60 //NUM_LEDS*4

typedef CommandParser<> MyCommandParser;

MyCommandParser parser;

#define pinR D8 //GPIO15
#define pinG D6 //GPIO12
#define pinB D7 //GPIO13

int inByte = 0; // incoming serial byte
int32_t tAnim = 0;
int32_t tProg = 0;
int32_t tAnimStart = 0;

const byte ledPin = LED_BUILTIN;
const byte interruptPin = pinTrg;
uint8_t state = 1;
bool bTrigger= 0;

uint8_t pinsRGB[3] = {pinR, pinG, pinB};
CRGB colShutter[3] = {CRGB::Red, CRGB::Yellow, CRGB::Green};

CRGB leds[NUM_LEDS];
uint8_t gCurrentPatternNumber = 0; // Index number of which pattern is current
uint8_t gHue = 0;                  // rotating "base color" used by many of the patterns

void rainbow()
{
  // FastLED's built-in rainbow generator
  fill_rainbow(leds, NUM_LEDS, gHue, 256 / NUM_LEDS);
}

void rainbowWithGlitter()
{
  // built-in FastLED rainbow, plus some random sparkly glitter
  rainbow();
  addGlitter(80);
}

void addGlitter(fract8 chanceOfGlitter)
{
  if (random8() < chanceOfGlitter)
  {
    leds[random16(NUM_LEDS)] += CRGB::White;
  }
}

void confetti()
{
  // random colored speckles that blink in and fade smoothly
  fadeToBlackBy(leds, NUM_LEDS, 10);
  int pos = random16(NUM_LEDS);
  leds[pos] += CHSV(gHue + random8(64), 200, 255);
}

/*void sinelon()
{
  // a colored dot sweeping back and forth, with fading trails
  fadeToBlackBy( leds, NUM_LEDS, 20);
  int pos = beatsin16( 13, 0, NUM_LEDS-1 );
  leds[pos] += CHSV( gHue, 255, 192);
}*/

void bpm()
{
  // colored stripes pulsing at a defined Beats-Per-Minute (BPM)
  uint8_t BeatsPerMinute = 62;
  CRGBPalette16 palette = PartyColors_p;
  uint8_t beat = beatsin8(BeatsPerMinute, 64, 255);
  for (int i = 0; i < NUM_LEDS; i++)
  { //9948
    leds[i] = ColorFromPalette(palette, gHue + (i * 2), beat - gHue + (i * 10));
  }
}

void juggle()
{
  // eight colored dots, weaving in and out of sync with each other
  fadeToBlackBy(leds, NUM_LEDS, 20);
  byte dothue = 0;
  for (int i = 0; i < 8; i++)
  {
    leds[beatsin16(i + 7, 0, NUM_LEDS - 1)] |= CHSV(dothue, 200, 255);
    dothue += 32;
  }
}
// List of patterns to cycle through.  Each is defined as a separate function below.
typedef void (*SimplePatternList[])();
SimplePatternList gPatterns = {rainbow, rainbowWithGlitter, confetti, juggle, bpm}; //, sinelon

#define ARRAY_SIZE(A) (sizeof(A) / sizeof((A)[0]))
void nextPattern()
{
  // add one to the current pattern number, and wrap around at the end
  gCurrentPatternNumber = (gCurrentPatternNumber + 1) % ARRAY_SIZE(gPatterns);
}

void cmd_test(MyCommandParser::Argument *args, char *response)
{
  Serial.print("tested ");
  Serial.println(args[0].asString);
}

void cmd_count(MyCommandParser::Argument *args, char *response)
{
  tAnim = (uint32)args[0].asUInt64;
  tAnimStart = millis();
  tProg = 0;
  state = 2;
  Serial.print("counting ");
  Serial.println(tAnim);
}
void cmd_stdby(MyCommandParser::Argument *args, char *response)
{
  state = 1;
  Serial.println("standby");
}

void cmd_off(MyCommandParser::Argument *args, char *response)
{
  state = 0;
  Serial.println("off");
}

void paintLed(CRGB col)
{
  for (int i = 0; i < 3; i++)
  {
    analogWrite(pinsRGB[i], col.raw[i]);
  }
}

void setup()
{
  // start serial port at 9600 bps:
  Serial.begin(9600);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  // register commands
  parser.registerCommand("TEST", "s", &cmd_test);
  parser.registerCommand("COUNTDOWN", "u", &cmd_count);
  parser.registerCommand("STANDBY", "", &cmd_stdby);
  parser.registerCommand("OFF", "", &cmd_off);

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  for (int i = 0; i < 3; i++)
  {
    pinMode(pinsRGB[i], OUTPUT);
  }
  pinMode(ledPin, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(interruptPin), triggerButton, CHANGE);
}

void loop()
{
  proc_cmd();
  proc_trg();
  proc_anim();
  // insert a delay to keep the framerate modest
  FastLED.delay(1000 / FRAMES_PER_SECOND);
  FastLED.show();
}

void proc_cmd()
{
  if (Serial.available())
  {
    char line[128];
    size_t lineLength = Serial.readBytesUntil('\n', line, 127);
    line[lineLength] = '\0';

    char response[MyCommandParser::MAX_RESPONSE_SIZE];
    parser.processCommand(line, response);
    //Serial.println(response);
  }
}

void proc_trg()
{
  if (bTrigger)
  {    
    Serial.println("trigger 1");
    bTrigger = 0;
  }
}

void proc_anim()
{
  switch (state)
  {
  case 0:
    digitalWrite(ledPin, 1);
    paintLed(CRGB::Black);
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    break;
  case 1:
    digitalWrite(ledPin, 0);
    // do some periodic updates
    EVERY_N_MILLISECONDS(20) { gHue++; }   // slowly cycle the "base color" through the rainbow
    EVERY_N_SECONDS(10) { nextPattern(); } // change patterns periodically
    // Call the current pattern function once, updating the 'leds' array
    gPatterns[gCurrentPatternNumber]();
    // send the 'leds' array out to the actual LED strip
    break;
  case 2:
    proc_count();
    break;
  default:
    paintLed(CRGB::Black);
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    break;
  }
}

void proc_count()
{
  tProg = millis() - tAnimStart;

  if (tProg >= tAnim)
  {
    paintLed(CRGB::Black);
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    state = 1;
    return;
  }
  uint8_t numCol = tProg * 3 / tAnim;
  paintLed(colShutter[numCol]);
  uint32_t tThisColor = tProg - numCol * tAnim / 3;
  uint32_t numLedMax = tThisColor * NUM_LEDS * 3 / tAnim;
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  for (int dot = 0; dot <= numLedMax; dot++)
  {
    leds[dot] = colShutter[numCol];
  }
}

ICACHE_RAM_ATTR void triggerButton()
{
  bTrigger = true;
}