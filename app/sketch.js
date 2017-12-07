var theCanvas;
var frames = 0;
var showCapture = true;
var screenWidth = 360;
var screenHeight = 270;

var totalParticles = 100;

var pixelsPerFrame1;
var oldX1 = 0;
var oldY1 = 0;

var sumPPF1 = 0;
var averagePPF1;

// video capture object
var capture;

// colors we want to track
var r1 = 0;
var g1 = 0;
var b1 = 0;

var xPos1;
var yPos1;

var frameCheck = 15;
var currentColor = 1;

// low numbers means more color sensitivity, high numbers mean less sensitivity (aka false positives)
var threshold = 20;

var bg1;
var bg2;
var bg3;
var bg4;
var particle4;

function preload() {
    bg1 = loadImage("../backgrounds/1.png")
    bg2 = loadImage("../backgrounds/2.png")
    bg3 = loadImage("../backgrounds/3.png")
    bg4 = loadImage("../backgrounds/4.png")
    particle4 = loadImage("../particles/4-02.png")
}

function setup() {
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

    // create particle system
    for (var i = 0; i < totalParticles; i++) {
        var tempWalker = new NoiseWalker( random(screenWidth), random(screenHeight) );
        walkerArray.push( tempWalker );
    }
    theCanvas = createCanvas(screenWidth, screenHeight);
    var canvasNode = document.getElementById("defaultCanvas0");
    var parent = canvasNode.parentNode;
    var wrapper = document.createElement('div');

    parent.replaceChild(wrapper, canvasNode);
    var theVideo = document.getElementsByTagName("video")[0];
    console.log(theVideo);
    wrapper.appendChild(canvasNode);
    wrapper.appendChild(theVideo);

    wrapper.id = "container"

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


  capture.loadPixels();
  mirrorVideo();


  if (capture.pixels.length > 0) {
    var bestLocations1 = [];

    for (var i = 0; i < capture.pixels.length; i += 16) {
      var match1 = dist(r1, g1, b1, capture.pixels[i], capture.pixels[i + 1], capture.pixels[i + 2]);
      if (match1 < threshold) {
        bestLocations1.push(i);
      }
    }

    // draw the video only if we still need it!
    if (showCapture){
        image(capture, 0, 0);
    } else {
        animateBackground();
    }

    // do we have a best match?  it's possible that no pixels met our threshold
    if (bestLocations1.length > 0) {
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

    pixelsPerFrame1 = dist(oldX1, oldY1, xPos1, yPos1);
    oldX1 = xPos1;
    oldY1 = yPos1;
    sumPPF1 += pixelsPerFrame1;

    if (frames % frameCheck == 0){
        averagePPF1 = sumPPF1 / 30;
        sumPPF1 = 0;
        console.log(averagePPF1);
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

  if (r1 != 0 && g1 != 0 && b1 != 0){
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
    // console.log("I'm animating!!")
    if (averagePPF1 < 3){
        animation1();
    } else if (averagePPF1 < 6){
        animation2();
    } else if (averagePPF1 < 9){
        animation3();
    } else {
        animation4();
    }
}

function animation1(){
    // background(0, 100);
    image(bg1, 0 , 0, width, height);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display1();
    }
    strokeWeight(5);
}

function animation2(){
    // background(0, 255, 0, 100);
    image(bg2, 0 , 0, width, height);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display2();
    }
    strokeWeight(5);
}

function animation3(){
    // background(0, 0, 255, 100);
    image(bg3, 0 , 0, width, height);
    fill(0,10);
    noStroke();
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move();
      walkerArray[i].display3();
    }
    strokeWeight(5);
}

function animation4(){
    // background(255, 0, 0, 100);
    image(bg4, 0 , 0, width, height);
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
      // image(particle1, this.x, this.y, 20, 20);
  }

  this.display2 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
      // image(particle2, this.x, this.y, 20, 20);
  }

  this.display3 = function() {
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.y, this.s, this.s);
      // image(particle3, this.x, this.y, 20, 20);
  }

  this.display4 = function() {
      fill(this.r, this.g, this.b);
      // ellipse(this.x, this.y, this.s, this.s);
      image(particle4, this.x, this.y, 30, 30);
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
    if (dist(this.x, this.y, xPos1, yPos1) < 25) {
      var speed = 1 + (averagePPF1/2);
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
