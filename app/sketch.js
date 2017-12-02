var theCanvas;
var frames = 0;
var showCapture = true;
var screenWidth = 400;
var screenHeight = 300;

var pixelsPerFrame1;
var oldX1 = 0;
var oldY1 = 0;

var sumPPF1 = 0;
var averagePPF1;

var pixelsPerFrame2;
var oldX2 = 0;
var oldY2 = 0;

var sumPPF2 = 0;
var averagePPF2;

// video capture object
var capture;

// colors we want to track
var r1 = 0;
var g1 = 0;
var b1 = 0;

var r2 = 0;
var g2 = 0;
var b2 = 0;

// keep track of which color we are currently going to set (the user will click to
// set color #1 and then click again to set color #2)
var currentColor = 1;

// what is our current threshold?  This is how sensitve our color detection algorithm should be
// low numbers means more sensitivity, high numbers mean less sensitivity (aka false positives)
var threshold = 20;

function setup() {
  theCanvas = createCanvas(screenWidth, screenHeight);
  // theCanvas.style('width', 'auto');
  // theCanvas.style('height', '100%');

  // start up our web cam
  capture = createCapture({
    video: {
      mandatory: {
        minWidth: screenWidth,
        minHeight: screenHeight,
        maxWidth: screenWidth,
        maxHeight: screenHeight
      }
    }
  });
  capture.hide();

  stroke(0, 255, 0);
  noFill();
  rectMode(CENTER);
}

function draw() {

  // expose the pixels in the incoming video stream
  capture.loadPixels();
  mirrorVideo();

  // if we have some pixels to work wtih them we should proceed
  if (capture.pixels.length > 0) {

    // set up variables to test for the best pixel
    var bestLocations1 = [];
    var bestLocations2 = [];

    for (var i = 0; i < capture.pixels.length; i += 4) {
      // determine how close of a match this color is to our desired colors
      var match1 = dist(r1, g1, b1, capture.pixels[i], capture.pixels[i + 1], capture.pixels[i + 2]);
      if (match1 < threshold) {
        // this pixel qualifies!  store its location into our array
        bestLocations1.push(i);
      }
      var match2 = dist(r2, g2, b2, capture.pixels[i], capture.pixels[i + 1], capture.pixels[i + 2]);
      if (match2 < threshold) {
        // this pixel qualifies!  store its location into our array
        bestLocations2.push(i);
      }
    }

    // draw the video
    if (showCapture){
        image(capture, 0, 0);
    } else{
        background(0);
    }

    // do we have a best match?  it's possible that no pixels met our threshold
    if (bestLocations1.length > 0) {
      // average up all of our locations
      var xSum = 0;
      var ySum = 0;
      for (var i = 0; i < bestLocations1.length; i++) {
        xSum += (bestLocations1[i] / 4) % screenWidth;
        ySum += (bestLocations1[i] / 4) / screenWidth;
      }

      // average our sums to get our 'centroid' point
      var xPos1 = xSum / bestLocations1.length;
      var yPos1 = ySum / bestLocations1.length;

      // now we know the best match!  draw a box around it
      stroke(0,255,0);
      rect(xPos1, yPos1, 25, 25);
    }

    if (bestLocations2.length > 0) {
      // average up all of our locations
      var xSum = 0;
      var ySum = 0;
      for (var i = 0; i < bestLocations2.length; i++) {
        xSum += (bestLocations2[i] / 4) % screenWidth;
        ySum += (bestLocations2[i] / 4) / screenWidth;
      }

      // average our sums to get our 'centroid' point
      var xPos2 = xSum / bestLocations2.length;
      var yPos2 = ySum / bestLocations2.length;

      // now we know the best match!  draw a box around it
      stroke(255,0,0);
      rect(xPos2, yPos2, 25, 25);
    }
    pixelsPerFrame1 = dist(oldX1, oldY1, xPos1, yPos1);
    oldX1 = xPos1;
    oldY1 = yPos1;
    sumPPF1 += pixelsPerFrame1;

    pixelsPerFrame2 = dist(oldX2, oldY2, xPos2, yPos2);
    oldX2 = xPos2;
    oldY2 = yPos2;
    sumPPF2 += pixelsPerFrame2;

    if (frames % 30 == 0){
        averagePPF1 = sumPPF1 / 30;
        averagePPF2 = sumPPF2 / 30;
        sumPPF1 = 0;
        sumPPF2 = 0;
        console.log(averagePPF1, averagePPF2);
    }


    // *********************************************
    // working with averagePPF1 ans averagePPF2

    /* average PPF: under 3 --> slow
                    3-9 --> med1
                    9-15 --> med2
                    over 15 --> fast
    */

    // conditional to swtch on and off the image capture pixels




    // *********************************************
    frames++;
  }
}

function mousePressed() {
  // memorize the color the user is clicking on
  var loc = int( (mouseX + mouseY * capture.width) * 4);

  if (currentColor == 1) {
    r1 = capture.pixels[loc];
    g1 = capture.pixels[loc + 1];
    b1 = capture.pixels[loc + 2];

    console.log("Color 1 - Looking for: R=" + r1 + "; G=" + g1 + "; B=" + b1);
    currentColor = 2;
  }
  else if (currentColor == 2) {
    r2 = capture.pixels[loc];
    g2 = capture.pixels[loc + 1];
    b2 = capture.pixels[loc + 2];

    console.log("Color 2 - Looking for: R=" + r2 + "; G=" + g2 + "; B=" + b2);
    currentColor = 1;
  }

  if (r1 != 0 && g1 != 0 && b1 != 0 && r2 != 0 && g2 != 0 && b2 != 0){
      showCapture = false;
  }
}

function keyPressed() {
  if (key == 'A') {
    threshold--;
    console.log("Threshold is now: " + threshold);
  }
  if (key == 'D') {
    threshold++;
    console.log("Threshold is now: " + threshold);
  }
}

// mirror our video
function mirrorVideo() {
  // iterate over 1/2 of the width of the image & the full height of the image
  for (var x = 0; x < capture.width/2; x++) {
    for (var y = 0; y < capture.height; y++) {
      // compute location here
      var loc1 = (x + y*capture.width) * 4;
      var loc2 = (capture.width-x + y*capture.width) * 4;

      // swap pixels from left to right
      var tR = capture.pixels[loc1];
      var tG = capture.pixels[loc1+1];
      var tB = capture.pixels[loc1+2];

      capture.pixels[loc1]   = capture.pixels[loc2];
      capture.pixels[loc1+1] = capture.pixels[loc2+1];
      capture.pixels[loc1+2] = capture.pixels[loc2+2];

      capture.pixels[loc2] = tR;
      capture.pixels[loc2+1] = tG;
      capture.pixels[loc2+2] = tB;
    }
  }
  capture.updatePixels();
}
