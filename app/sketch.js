var theCanvas;
var frames = 0;
var showCapture = true;
var screenWidth = 360;
var screenHeight = 270;

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

var xPos1;
var yPos1;

var frameCheck = 15;

// keep track of which color we are currently going to set (the user will click to
// set color #1 and then click again to set color #2)
var currentColor = 1;

// what is our current threshold?  This is how sensitve our color detection algorithm should be
// low numbers means more sensitivity, high numbers mean less sensitivity (aka false positives)
var threshold = 20;

function setup() {
    theCanvas = createCanvas(screenWidth, screenHeight);
    var canvasNode = document.getElementById("defaultCanvas0");
    var parent = canvasNode.parentNode;
    var wrapper = document.createElement('div');

    parent.replaceChild(wrapper, canvasNode);
    wrapper.appendChild(canvasNode);
      // var theVideo = document.getElementsByTagName("video")[0];
      // console.log(theVideo);
      // container.appendChild(canvasNode);
      // container.appendChild(theVideo);

      // container.style('width', '100%');
      // container.style('height', '100%');

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

  // request a detailed noise landscape
  noiseDetail(24);

  // create our walker array
  walkerArray = [];

  // fill the walker array with 500 walkers!

  for (var i = 0; i < 300; i++) {

    // create a NoiseWalker
    var tempWalker = new NoiseWalker( random(screenWidth), random(screenHeight) );

    // put the walker into the array
    walkerArray.push( tempWalker );
}

  var videoNode = document.getElementsByTagName("video")[0];
  wrapper.appendChild(videoNode);

  // canvasNode.style.width = "100%";
  // canvasNode.style.height = "100%";
  //
  // videoNode.style.width = "100%";
  // videoNode.style.height = "100%";
  //
  // wrapper.style.width = "100%";
  // wrapper.style.height = "100%";
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

    for (var i = 0; i < capture.pixels.length; i += 8) {
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
    } else {
        animateBackground();
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
      xPos1 = xSum / bestLocations1.length;
      yPos1 = ySum / bestLocations1.length;

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

    if (frames % frameCheck == 0){
        averagePPF1 = sumPPF1 / 30;
        averagePPF2 = sumPPF2 / 30;
        sumPPF1 = 0;
        sumPPF2 = 0;
        console.log(averagePPF1, averagePPF2);
    }
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

function animateBackground(){
    console.log("I'm animating!!")
    if (averagePPF1 < 3){
        animation1();
    } else if (averagePPF1 < 9){
        animation2();
    } else if (averagePPF1 < 15){
        animation3();
    } else {
        animation4();
    }
}

function animation1(){
    background(0);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display1();
    }
    strokeWeight(5);
}

function animation2(){
    background(0, 255, 0);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display2();
    }
    strokeWeight(5);
}

function animation3(){
    background(0, 0, 255);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display3();
    }
    strokeWeight(5);
}

function animation4(){
    background(255, 0, 0);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display4();
    }
    strokeWeight(5);
}

// our NoiseWalker class
function NoiseWalker(x, y) {
  // store our position
  this.x = x;
  this.y = y;

  // store our color
  this.r = random(100,255);
  this.g = this.r;
  this.b = this.r;

  // store our size
  this.s = 5;

  // create a "noise offset" to keep track of our position in Perlin Noise space
  this.xNoiseOffset = random(0,1000);
  this.yNoiseOffset = random(1000,2000);

  // display mechanics
  this.display1 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
  }

  this.display2 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
  }

  this.display3 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
  }

  this.display4 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
  }

  // movement mechanics
  this.move = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement;
    this.y += yMovement;

    // are we close to the mouse?  if so, run away!
    if (dist(this.x, this.y, xPos1, yPos1) < 50) {
      var speed = 1 + (averagePPF1/8);
      if (xPos1 < this.x) {
        this.x += speed;
      }
      else {
        this.x -= speed;
      }
      if (yPos1 < this.y) {
        this.y += speed;
      }
      else {
        this.y -= speed;
      }
    }

    // handle wrap-around
    if (this.x > width) {
      this.x = 0;
    }
    else if (this.x < 0) {
      this.x = width;
    }
    if (this.y > height) {
      this.y = 0;
    }
    else if (this.y < 0) {
      this.y = height;
    }

    this.xNoiseOffset += 0.01;
    this.yNoiseOffset += 0.01;
  }
}
