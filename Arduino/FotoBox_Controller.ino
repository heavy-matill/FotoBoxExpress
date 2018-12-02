#include <multiCameraIrControl.h>    
#include <FastLED.h>


#define NUM_LEDS 24
#define DATA_PIN pinRGB
#define LED_TYPE WS2811
#define COLOR_ORDER GRB
#define FRAMES_PER_SECOND 30

//#define encoder0Push 2
//#define encoder0PinA 3
//#define encoder0PinB 4
#define pinSwitch 6
#define pinIR 11
#define pinLED 13
#define pinRPi 10
#define pinRGB 9

 CRGB leds[NUM_LEDS];


volatile unsigned int encoder0Pos = 0;
boolean footOn = false;
boolean triggerNow = false;
unsigned long shutterTime;
unsigned long settingTime;


Pentax K7(pinIR);

void setup() { 
  // RPi Output
  pinMode(pinRPi, OUTPUT); 
  digitalWrite(pinRPi, 0); 
  //Foot switch
  pinMode(pinSwitch, INPUT_PULLUP);  
  
  footOn = digitalRead(pinSwitch);

  
   
  
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  
  //Digital pins usable for interrupts in atmega328: 2, 3
  //attachInterrupt(digitalPinToInterrupt(encoder0PinA), turnedEncoder0, CHANGE);  // encoder pin on interrupt 0 - pin 2
  //attachInterrupt(digitalPinToInterrupt(encoder0Push), pushedEncoder0, FALLING);  // encoder pin on interrupt 0 - pin 2
  //attachInterrupt(digitalPinToInterrupt(footSwitch), triggerCamera, CHANGE);  // encoder pin on interrupt 0 - pin 2
  //Serial.begin (9600);
  //Serial.println("start");  

    digitalWrite(pinLED,0);
  delay(100);
  digitalWrite(pinLED,1);

  //IR setup  
  triggerCamera();
  

} 

// List of patterns to cycle through.  Each is defined as a separate function below.
typedef void (*SimplePatternList[])();
SimplePatternList gPatterns = { rainbow, rainbowWithGlitter, confetti, juggle, bpm }; //, sinelon

uint8_t gCurrentPatternNumber = 0; // Index number of which pattern is current
uint8_t gHue = 0; // rotating "base color" used by many of the patterns

void loop()
{
  // Call the current pattern function once, updating the 'leds' array
  gPatterns[gCurrentPatternNumber]();

  // send the 'leds' array out to the actual LED strip
  FastLED.show();  
  // insert a delay to keep the framerate modest
  FastLED.delay(1000/FRAMES_PER_SECOND); 
  
  if (footOn != digitalRead(pinSwitch)){
    triggerCamera();
    footOn = digitalRead(pinSwitch);
  }
  

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


/*void turnedEncoder0() {*/
  /* If pinA and pinB are both high or both low, it is spinning
   * forward. If they're different, it's going backward.
   *
   * For more information on speeding up this process, see
   * [Reference/PortManipulation], specifically the PIND register.
   */
/*  if (digitalRead(encoder0PinA) == digitalRead(encoder0PinB)) {
    encoder0Pos++;
  } else {
    encoder0Pos--;
  }
  if(encoder0Pos>30)
    encoder0Pos=0;

  Serial.println(encoder0Pos, DEC);
  settingTime = millis()+500;
}

void pushedEncoder0()
{  
  //Serial.println(digitalRead(encoder0Push), DEC);  
  Serial.println("pushed");
    //triggerCamera();
    triggerNow = true;
    
}*/

void triggerCamera()
{
  digitalWrite(pinLED,1);
  digitalWrite(pinRPi, 1); 
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  Serial.println("trigger"); 
  for(int dot = 0; dot < NUM_LEDS; dot++) { 
    leds[dot] = CRGB::Red;
    FastLED.show();
    // clear this led for the next time around the loop
    delay(42);
  }  
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  K7.toggleFocus();
  for(int dot = 0; dot < NUM_LEDS; dot++) {
    leds[dot] = CRGB::Yellow;
    FastLED.show();
    // clear this led for the next time around the loop
    delay(42);
  }  
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  K7.toggleFocus();  
  for(int dot = 0; dot < NUM_LEDS; dot++) { 
    leds[dot] = CRGB::Green;
    FastLED.show();
    // clear this led for the next time around the loop
    delay(42);
  }  
  fill_solid(leds, NUM_LEDS, CRGB::White);
  FastLED.show();
  K7.shutterNow();
  delay(500);
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();
  delay(500);
  digitalWrite(pinLED,0);
  digitalWrite(pinRPi, 0); 
}
/*
void showSettings()
{
  if(settingTime>millis())
  {
    //display 15-encoder0Pos/2 off
    //display encoder0Pos/2 on
  }
  else
  {
    //display off
  }
}*/

