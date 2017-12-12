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

var runRadius = 30;

var frameCheck = 40;
var currentColor = 1;

// low numbers means more color sensitivity, high numbers mean less sensitivity (aka false positives)
var threshold = 20;

var marker;
var hand;
var bg1;
var bg2;
var bg3;
var bg4;
var particle1;
var particle2;
var particle3;
var particle4;
var transitionSound;
var aura1Sound;
var aura2Sound;
var aura3Sound;
var aura4Sound;

var oldAura = 0;
var currentAura = 0;
var auraChanged = false;

function preload() {
    transitionSound = loadSound("../sounds/transition.mp3");
    aura1Sound = loadSound("../sounds/aura1.mp3");
    aura2Sound = loadSound("../sounds/aura2.m4a");
    aura3Sound = loadSound("../sounds/aura3.m4a");
    aura4Sound = loadSound("../sounds/aura4.m4a");
    marker = loadImage("../img/marker.png");
    bg1 = loadImage("../backgrounds/1-01.png");
    bg2 = loadImage("../backgrounds/2-02.png");
    bg3 = loadImage("../backgrounds/3-03.png");
    bg4 = loadImage("../backgrounds/4-04.png");
    particle1 = loadImage("../particles/1.png");
    particle2 = loadImage("../particles/2.png");
    particle3 = loadImage("../particles/3.png");
    particle4 = loadImage("../particles/4-02.png");
    hand = loadImage("../particles/hand.png");
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

    noStroke();
    noFill();
    rectMode(CENTER);
    imageMode(CENTER);

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

    for (var i = 0; i < capture.pixels.length; i += 8) {
      var match1 = dist(r1, g1, b1, capture.pixels[i], capture.pixels[i + 1], capture.pixels[i + 2]);
      if (match1 < threshold) {
        bestLocations1.push(i);
      }
    }

    // draw the video only if we still need it!
    if (showCapture){
        image(capture, screenWidth/2, screenHeight/2);
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
      // stroke(0,255,0);
      // rect(xPos1, yPos1, 25, 25);
      image(hand, xPos1, yPos1, 40, 40);
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
    if (averagePPF1 < 2){
        oldAura = currentAura;
        currentAura = 1;
        if (oldAura != currentAura){
            auraChanged = true;
        }
        runRadius = 30;
        animation1();
    } else if (averagePPF1 < 6){
        oldAura = currentAura;
        currentAura = 2;
        if (oldAura != currentAura){
            auraChanged = true;
        }
        runRadius = 80;
        animation2();
    } else if (averagePPF1 < 10){
        oldAura = currentAura;
        currentAura = 3;
        if (oldAura != currentAura){
            auraChanged = true;
        }
        runRadius = 55;
        animation3();
    } else {
        oldAura = currentAura;
        currentAura = 4;
        if (oldAura != currentAura){
            auraChanged = true;
        }
        runRadius = 65;
        animation4();
    }
    if (auraChanged){
        transitionSound.play();
        if (currentAura == 1){
            aura1Sound.play();
            aura2Sound.stop();
            aura3Sound.stop();
            aura4Sound.stop();
        } else if (currentAura == 2){
            aura1Sound.stop();
            aura2Sound.play();
            aura3Sound.stop();
            aura4Sound.stop();
        } else if (currentAura == 3){
            aura1Sound.stop();
            aura2Sound.stop();
            aura3Sound.play();
            aura4Sound.stop();
        } else if (currentAura == 4){
            aura1Sound.stop();
            aura2Sound.stop();
            aura3Sound.stop();
            aura4Sound.play();
        }
        auraChanged = false;
    }
}

function animation1(){
    image(bg1, screenWidth/2 , screenHeight/2, width, height);
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move1();
      walkerArray[i].display1();
    }
}

function animation2(){
    image(bg2, screenWidth/2 , screenHeight/2, width, height);
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move2();
      walkerArray[i].display2();
    }
}

function animation3(){
    image(bg3, screenWidth/2 , screenHeight/2, width, height);
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move3();
      walkerArray[i].display3();
    }
}

function animation4(){
    image(bg4, screenWidth/2 , screenHeight/2, width, height);
    for (var i = 0; i < walkerArray.length; i++) {
      walkerArray[i].move4();
      walkerArray[i].display4();
    }
}

// our NoiseWalker class
function NoiseWalker(x, y) {
  // store our position
  this.x = x;
  this.y = y;

  this.scale = random(.5, 1.5);

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
      image(particle1, this.x, this.y, 80*map(this.scale, .3, 1.5, .2, 2), 80*map(this.scale, .5, 1.5, .2, 1.5));
  }

  this.display2 = function() {
      image(particle2, this.x, this.y, 70*this.scale, 70*this.scale);
  }

  this.display3 = function() {
      image(particle3, this.x, this.y, 50*this.scale, 50*this.scale);
  }

  this.display4 = function() {
      image(particle4, this.x, this.y, 30, 30);
  }

  // movement mechanics
  this.move1 = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement*1;
    this.y += yMovement*1;

    // are we close to the mouse?  if so, run away!
    if (dist(this.x, this.y, xPos1, yPos1) < 25) {
      var speed = 1;
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

   this.move2 = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement*2;
    this.y += yMovement*2;

    // are we close to the mouse?  if so, run away!
    if (dist(this.x, this.y, xPos1, yPos1) < 25) {
      var speed = 2;
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

    this.move3 = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement*3;
    this.y += yMovement*3;

    // are we close to the mouse?  if so, run away!
    if (dist(this.x, this.y, xPos1, yPos1) < runRadius) {
      var speed = 3;
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

     this.move4 = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement*8;
    this.y += yMovement*8;

    // are we close to the mouse?  if so, run away!
    if (dist(this.x, this.y, xPos1, yPos1) < runRadius) {
      var speed = 8;
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
