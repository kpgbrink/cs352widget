/*
 * dots v2: draws a dots
 * For CS352, Calvin College Computer Science
 *
 * Kristofer Brink -- 2017
 */


var dots = {};

function randNum(min, max) {
  return Math.random() * (max - min) + min;
}

// http://stackoverflow.com/a/22237671
function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function getRndColorHex() {
    return Math.floor(Math.random()*16777215).toString(16);
}

$(document).ready(function () { dots.init(); });

dots.init = function () {
  dots.canvas  = $('#canvas1')[0];
  dots.cx = dots.canvas.getContext('2d');	// get the drawing canvas
  dots.cx.setTransform(1,0,0,1,360,270);
    
    
  dots.cx.fillStyle = 'rgba(250,0,0,0.7)';


  // By default (0,0) is the upper left and canvas.width, canvas.height 
  // is the lower right. We'll add a matrix multiplication to the state
  // to change the coordinate system so that the central part of the canvas

    
  // Slider speed
  dots.speed = 0;
  dots.freezeBool = false;
  dots.sliderSpeed = function() {
    dots.rotation = sliderSpeedObj.val();
    dots.speed = dots.rotation/25;
    $('#speed').text(dots.rotation);
    //console.log(dots.speed);
    const imgData = dots.cx.getImageData(0, 0, dots.canvas.width, dots.canvas.height);
        dots.cx.setTransform(1,0,0,1,360,270);
        dots.cx.rotate(dots.rotation*Math.PI/180);
    createImageBitmap(imgData).then((img) => {
        dots.erase();
        dots.cx.drawImage(img,-dots.canvas.width/2, -dots.canvas.height/2, dots.canvas.width, dots.canvas.height);
    });
  }
  const sliderSpeedObj = $('#sliderSpeed').bind('change input', dots.sliderSpeed);
  sliderSpeedObj.trigger('change');
  
  // ---------------------------------------------------------------------------
    
  // Cool Draw Check Box
  dots.eraseBool = true;
  dots.checkCoolDraw = function () {
      $('#messages').prepend("Toggle erase.. ");
      dots.eraseBool = !dots.eraseBool;
  }
  $('#checkBoxCoolDraw').bind('click', dots.checkCoolDraw);
  // ---------------------------------------------------------------------------
    
  // Phone rotation
  if (window.DeviceOrientationEvent) {
      // Listen for the deviceorientation event and handle the raw data
      window.addEventListener('deviceorientation', function(eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        dots.tiltLR = Math.abs(eventData.gamma);
        dots.rotation = dots.tiltLR;
        dots.speed = dots.tiltLR/50;
        $('#speed').text(Math.abs(dots.tiltLR));
        //console.log(dots.speed);
        const imgData = dots.cx.getImageData(0, 0, dots.canvas.width, dots.canvas.height);
        dots.cx.setTransform(1,0,0,1,360,270);
        dots.cx.rotate(dots.rotation*Math.PI/180);
        createImageBitmap(imgData).then((img) => {
            dots.erase();
            dots.cx.drawImage(img,-dots.canvas.width/2, -dots.canvas.height/2, dots.canvas.width, dots.canvas.height);
        });
    });
  }
  // ---------------------------------------------------------------------------
    
    

    
  dots.dot = new dot(true);
    
  // set draw interval
  setInterval(dots.draw, 20);
}

class dot {
    constructor(startDot=false) {
        this.parent = parent?parent:{x:0, y:0};
        this.angle = randNum(0, 2*Math.PI);
        this.distance = 0;
        this.lifeCounter = randNum(10, 30);
        this.radius = 4;
        this.color = getRndColor();
        this.moveAngle = 0;
        this.moveDistance = 0;
        this.makeDotTimer = randNum(20,60);
        this.dots = [];
        this.startDot = startDot;
    }
    
    // todo color gradually change
    changeColor() {
        //this.color = 
    }
    
    childDots() {
        // handle child timer
        if (this.dots.length < 10 && this.startDot) {
            this.makeDotTimer--;
            if (this.makeDotTimer <= 0) {
                this.makeDotTimer = randNum(10,20);
                this.dots.push(new dot());
            }
        }
        // handle drawing and deleting child dots.
        for (let i = this.dots.length - 1; i >= 0; i--) {
            let dot = this.dots[i];
            dot.update(this.getX(), this.getY());
            if (dot.lifeCounter == 0) {
                dots.dots.splice(i, 1);
            }
        }
    }
    
    changeRadius() {
        //console.log(randNum(-.01, .01));
        this.radius = Math.min(30, Math.max(1, this.radius + randNum(-1, 1) * dots.speed));
    }
    
    changeDistance() {
        let maxMin = this.startDot?.5:.4;
        this.moveDistance = Math.min(maxMin, Math.max(-maxMin, this.moveDistance + randNum(-.1, .1)));
        this.distance += this.moveDistance * dots.speed;
        if (Math.abs(this.distance) > 400 ) {
            this.distance = 0;
        }
    }
    
    changeAngle() {
        let maxMin = .01;
        this.moveAngle = Math.min(maxMin, Math.max(-maxMin, this.moveAngle + randNum(-.001, .001)));
        this.angle += this.moveAngle * dots.speed;
    }
    
    lifeCount() {
        if (this.lifeCounter > 0) {
            this.lifeCounter--;
        }
    }
    
    
    getX() {
        return this.distance * Math.cos(this.angle);
    }
    
    getY() {
        return this.distance * Math.sin(this.angle);
    }
    
    draw(px=0, py=0) {
        let x = this.getX() + px;
        let y = this.getY() + py;
        dots.circle(x, y, this.radius, this.color);
        // Check if too far out
    }
    
    spawnNewDotUpdate() {
        
    }
    
    update(x, y) {
        this.childDots();
        this.changeRadius();
        this.changeDistance();
        this.changeAngle();
        this.lifeCount();
        this.draw(x,y);
    }
}


// Draw loop
dots.draw = function(ev) {
    if (dots.eraseBool) {
        dots.erase();
    }
    // update time
    dots.time += dots.speed;
    $('#time').text(dots.time);
    
    if (dots.eraseBool) {
        dots.erase();
    }
    
    //dots.circle(0,0,10,'red');
    
    //dots.makeDotTimer--;
    dots.dot.update();

    
}

// erase canvas and message box
dots.erase = function(ev) {
    dots.cx.clearRect(-dots.canvas.width,-dots.canvas.height,dots.canvas.width*2, dots.canvas.height*2);
}


dots.circle = function(x, y, radius, color) {
    dots.cx.fillStyle = color;
    dots.cx.beginPath();
    dots.cx.arc(x, y, radius, 0, 2*Math.PI, false);
    dots.cx.fill();
    dots.cx.closePath();
}
