#include <FastLED.h>
                           
#define pinLDR A0
#define pinAF 5
#define pinRGB 12


#define NUM_LEDS 45
#define DATA_PIN pinRGB
#define LED_TYPE SK6812
#define COLOR_ORDER GRB
#define FRAMES_PER_SECOND 30

// List of patterns to cycle through.  Each is defined as a separate function below.
typedef void (*SimplePatternList[])();
SimplePatternList gPatterns = { rainbow, rainbowWithGlitter, confetti, juggle, bpm }; //, sinelon

uint8_t gCurrentPatternNumber = 0; // Index number of which pattern is current
uint8_t gHue = 0; // rotating "base color" used by many of the patterns


uint16_t tiShutterDelay = 0;
uint8_t bytIn = 0;
unsigned long tiAFStart = 0;
unsigned long tiAF = 0;
bool bAF = false;
#define AF_THRESHOLD 512
CRGB colShutter[3] = {CRGB::Red, CRGB::Yellow, CRGB::Green};

CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);   // initialize serial communication at 9600 BPS
  pinMode(pinAF, OUTPUT); // AF Helplight
  
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
}

void loop()
{
  while(Serial.available())    //Checks is there any data in buffer 
  {
    bytIn = Serial.read();
    if (bytIn >= 48 && bytIn <=57) {
      tiShutterDelay = tiShutterDelay*10 + bytIn-48;
    } else {
      animateReleaseShutter(tiShutterDelay);
      tiShutterDelay = 0;
    }
  }
  // Call the current pattern function once, updating the 'leds' array
  gPatterns[gCurrentPatternNumber]();

  // send the 'leds' array out to the actual LED strip
  FastLED.show();  
  // insert a delay to keep the framerate modest
  FastLED.delay(1000/FRAMES_PER_SECOND); 
  
  

  animateAF();
  

  // do some periodic updates
  EVERY_N_MILLISECONDS( 20 ) { gHue++; } // slowly cycle the "base color" through the rainbow
  EVERY_N_SECONDS( 10 ) { nextPattern(); } // change patterns periodically
}

#define ARRAY_SIZE(A) (sizeof(A) / sizeof((A)[0]))

void nextPattern()
{
  // add one to the current pattern number, and wrap around at the end
  gCurrentPatternNumber = (gCurrentPatternNumber + 1) % ARRAY_SIZE( gPatterns);
}

void rainbow() 
{
  // FastLED's built-in rainbow generator
  fill_rainbow( leds, NUM_LEDS, gHue, 256/NUM_LEDS);
}

void rainbowWithGlitter() 
{
  // built-in FastLED rainbow, plus some random sparkly glitter
  rainbow();
  addGlitter(80);
}

void addGlitter( fract8 chanceOfGlitter) 
{
  if( random8() < chanceOfGlitter) {
    leds[ random16(NUM_LEDS) ] += CRGB::White;
  }
}

void confetti() 
{
  // random colored speckles that blink in and fade smoothly
  fadeToBlackBy( leds, NUM_LEDS, 10);
  int pos = random16(NUM_LEDS);
  leds[pos] += CHSV( gHue + random8(64), 200, 255);
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
  uint8_t beat = beatsin8( BeatsPerMinute, 64, 255);
  for( int i = 0; i < NUM_LEDS; i++) { //9948
    leds[i] = ColorFromPalette(palette, gHue+(i*2), beat-gHue+(i*10));
  }
}

void juggle() {
  // eight colored dots, weaving in and out of sync with each other
  fadeToBlackBy( leds, NUM_LEDS, 20);
  byte dothue = 0;
  for( int i = 0; i < 8; i++) {
    leds[beatsin16( i+7, 0, NUM_LEDS-1 )] |= CHSV(dothue, 200, 255);
    dothue += 32;
  }
}

void animateAF() {
    //int sensorValue = analogRead(pinLDR);   // read the input on analog pin 0
  if (analogRead(pinLDR)>AF_THRESHOLD) {
    if(!bAF) {
      //StartTime = millis();
      digitalWrite(pinAF, 1);
      bAF = true;
    }
  } else {
    if(bAF) {
      digitalWrite(pinAF, 0);
      bAF = false;
      //tiAF = millis() - tiAFStart;
    }
  }
}

void animateReleaseShutter(uint16_t tiDelay) {  
  for(int col = 0; col < (sizeof(colShutter)/sizeof(colShutter[0])); col++) { 
    fill_solid(leds, NUM_LEDS, CRGB::Black);   
    for(int dot = 0; dot < NUM_LEDS; dot++) { 
      leds[dot] = colShutter[col];
      FastLED.show();
      // clear this led for the next time around the loop
      delay(tiDelay/(NUM_LEDS*3));
      animateAF();
    }  
    fill_solid(leds, NUM_LEDS, CRGB::Black);
  }
  FastLED.show();
  Serial.println(tiDelay);
  uint8_t numAFWait = 10;
  while(analogRead(pinLDR)>AF_THRESHOLD && numAFWait) {
    delay(100);
    numAFWait--;
  }
  animateAF();
  delay(500);
}