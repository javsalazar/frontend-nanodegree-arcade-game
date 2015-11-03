/* TODO:
    jumping' sound lags if move player too fast, need to fix
    levels, get working
    decrement lives on fail attempt

current features:
    bugs move randomly from L->R or R->L
    random place player in starting position
    sound on move, reaching goal, and background 
    points based on how fast you reach goal
    display, SCORE and NO of LIVES
    LEVELS - add life on reach level


    ENEMIES:
            y = 66, 150, or 234
    PLAYER:
            y= 74, 158, or 242
*/

var levels = [
    {
        "points": 20,
        "bugs": 2,
        "speed": 50
    },
    {
        "points": 50,
        "bugs": 3,
        "speed": 100
    },
    {
        "points": 80,
        "bugs": 5,
        "speed": 200
    },
    {
        "points": 100,
        "bugs": 6,
        "speed": 300
    },
    {
        "points": 150,
        "bugs": 7,
        "speed": 400
    },
    {
        "points": 200,
        "bugs": 8,
        "speed": 500
    }
];

// Enemies our player must avoid
var Enemy = function(yStart) {
    // Variables applied to each of our instances go here

    this.speed = this.getSpeed();  // get speed

    console.log("bug "+ yStart + " speed: ", this.speed);

    this.fromDirection = this.getStartLocation();  // left or right
    
    if ( yStart > 2 ) {
        yStart = yStart % 3; //only have 3 rows, make sure to add them there
    } 
    this.y = yStart * 84 + 66;  // which row to place, 66 is offset from top
    this.x = Resources.getRandom(-90,495);

    // get correct facing image and place at proper edge
    if (this.fromDirection === 'left'){
        this.sprite = 'images/enemy-bug.png';
        // this.x = -90; //one position off to left
    }else{
        this.sprite = 'images/enemy-bug-r.png';
        // this.x = 495; //one position off to right
        this.speed *= -1;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Start from left or right?
Enemy.prototype.getStartLocation = function() {
    // get random number 1 or 2
    var start = Resources.getRandom(1,2);
    return ( start === 1 ) ? "left" : "right";
}

Enemy.prototype.getSpeed = function () {
    return Math.floor( ( Math.random() * levels[player.level].speed ) + 50 );
    // return Math.floor( ( Math.random() * 175 ) + 50 )
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // moving from left and reached right edge, restart from left edge
    if (this.x > 500 && this.fromDirection === 'left'){
        this.x = -101;

    //
    } else if (this.x < -101 && this.fromDirection === 'right'){
        this.x = 500;
    }
    this.x += ( this.speed * dt );
};

Enemy.prototype.reset = function (level) {
    var allEnemies = [],
        totalEnemies = level.bugs; //3,

    for( var count = 0; count < totalEnemies; count++ ){
        // count determines the row the bug appears on
        allEnemies.push( new Enemy(count));

        // play enemy/game sound after last enemy pushed into array
        if ( allEnemies[totalEnemies - 1]){
            // allEnemies[count].enemySound();  //JAV-UNCOMMENT FOR SOUND>>>
        }
    }
}

Enemy.prototype.enemySound = function(action) {

    var sound = document.getElementById("bug-sound");
    sound.pause();

    if ( action === "pause"){
        return;
    }
    sound.src = "../sound/groovy.m4a";
    sound.volume = 0.3;
    sound.play();
}

var Player = function( xStart, yStart ){
    // image chosen for the player
    this.sprite = 'images/char-boy.png';

    // player will start at the given location, center bottom row by default.
    this.x = xStart || 202;
    this.y = yStart || 410;
    this.startTime = Date.now();

    // define x and y deltas
    this.xDelta = 101;
    this.yDelta = 84;
    //define player boundaries
    this.yUpBound = -10;
    this.yDownBound = 410;
    this.xLeftBound = 0;
    this.xRightBound = 404;

    // current stats
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this.inState = "play";
    // return this;
};

Player.prototype.render = function() {
    
    if (this.inState == "over"){
        // canvas is 505 x 606
        this.drawText(ctx, "Game Over!", 505 * 0.5, 606 * 0.5 );  
        this.drawText(ctx, "(press 'r' to play again)", 505 * 0.5, 606 * 0.75 );  
    }

    if (this.inState == "levelUp"){
        // canvas is 505 x 606

        this.drawText(ctx, "New level: " + this.level, 505 * 0.5, 606 * 0.5 );  
    }

    this.drawScore();
    this.drawLives();
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    
};

Player.prototype.playSound = function (tune) {
    var sound = document.getElementById("player-sound");
    
    sound.pause();
    sound.src = tune || "../sound/jump.m4a";  
    sound.volume = 0.7;
    sound.play();
}

Player.prototype.drawScore = function () {
    var sc = "Score: " + this.score;
    ctx.font = "22pt Impact";
    ctx.fillStyle = "white";
    ctx.fillText(sc, 20, 90);
}

Player.prototype.drawLives = function () {
    ctx.save();
    ctx.scale(0.3, 0.3);

    for( var count = 0; count < this.lives; count++ ){
       //coord number affected by scale fnc above
       ctx.drawImage(Resources.get(this.sprite), 1560 - count*100, 150); 
    }

    ctx.restore();
}

Player.prototype.drawText = function (ctx, text, x, y) {
    ctx.save();
    ctx.font = "36pt Impact";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
    //outline
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    ctx.restore();
}

Player.prototype.handleInput = function (key) {
    
    if ( this.inState === "over"  && key === "r"){

        console.log("I want to play AGAING!!!");
        player = new Player();
        allEnemies = Resources.createEnemies();
    }

    if ( this.inState !== "crash" && this.inState !== "over" ){
        switch( key )
        {
            // not past leftBound AND not on top row
            case 'left':
                if (this.x > this.xLeftBound && this.y !== this.yUpBound){
                    this.x -= this.xDelta;
                    this.playSound();
                }
                break;

            case 'up':
                if (this.y == this.yUpBound + this.yDelta){
                    // moving up to top/scoring row ( on second row)
                    this.y -= this.yDelta;
                    this.levelReached();

                } else if (this.y > this.yUpBound + this.yDelta){
                    // all other rows below
                    this.y -= this.yDelta;
                    this.playSound();
                }
                break;

            // not past rigthBound AND not on top row
            case 'right': 
                if (this.x < this.xRightBound && this.y !== this.yUpBound){
                    this.x += this.xDelta;
                    this.playSound();
                }
                break;

            case 'down':
                if (this.y < this.yDownBound  &&  this.y !== this.yUpBound){
                    this.y += this.yDelta;
                    this.playSound();
                }
                break;

            default:
                break;
        }
    }
}

Player.prototype.levelReached = function () {

    this.totalTime = (Date.now() - this.startTime) / 1000.0;
    console.log("Time to reach goal: %s", this.totalTime);
    this.playSound('../sound/levelup.m4a');
    this.score += Math.round(50 / this.totalTime);
    console.log(" Score is : ", Math.round(50 / this.totalTime));

    if ( this.score > levels[this.level].points){
        console.log("NEW LEVEL REACHED");
        this.level += 1;  //move to next leveDzl
        this.lives += 1;  //add to lives total
        this.inState = "levelUp"; // gets reset on restart()
        console.log("new level is: %s", this.level);
        Resources.createEnemies(levels[this.level]);
        this.restart("levelUp");  
        return; 
    }

    this.restart();
    
}

Player.prototype.checkCollision = function  () {
    var currentEnemy,
        enemyLeftEdge,
        enemyRightEdge,
        playerLeftEdge,
        playerRightEdge;

    // check for enemies
    for(var i = 0,numEnemies = allEnemies.length; i < numEnemies; i++) {
        currentEnemy = allEnemies[i];
        enemyLeftEdge = currentEnemy.x,
        enemyRightEdge = currentEnemy.x + 98, //location plus enemy width
        playerLeftEdge = this.x + 17, // 17 is offset from x location, image 67 wide (101-67)/2
        playerRightEdge = this.x + 17 + 67; // add width for right edge

        if ( enemyRightEdge > playerLeftEdge && enemyLeftEdge < playerRightEdge && this.y < currentEnemy.y + 50 && this.y + 50 > currentEnemy.y) {
            console.log("crash!");
            
            this.playSound('../sound/die.m4a');
            this.lives -= 1;
            this.inState = "crash";
            this.restart();    
        }
    } 

    // check for hearts
    heartLeftEdge = heart.x;
    heartRightEdge = heart.x + 89;

    // chcek for rocks

    // check for gems  
}

Player.prototype.update = function () {
    this.checkCollision();
}

Player.prototype.restart = function (levelUp) {

    // need to pass reference to 'this' into function
    var that = this;

    // wait for sound to stop playing before starting again...
    // and only listen for it once, when we 'crash'
    onetime(document.getElementById("player-sound"), "ended", function() {
 
        allEnemies = Resources.createEnemies(levels[that.level]);
        // random num between 0 and 4
        var xVal = Resources.getRandom(0,4);
        that.x = xVal * 101;
        that.y = 410;
        that.playSound('../sound/jump.m4a');
        that.startTime = Date.now();
            
        if (that.lives > 0){
            that.inState = "play"; 
        } else {
            that.inState = "over";
            allEnemies[0].enemySound("pause"); // end music when game over         
        }
    });
    // create a one-time event
    // http://www.sitepoint.com/create-one-time-events-javascript/
    function onetime(node, type, callback) {

        // create event
        node.addEventListener(type, function(e) {
            // remove event
            e.target.removeEventListener(e.type, arguments.callee);
            // call handler
            return callback(e);
        });
    }
}


var Heart = function (xStart, yStart) {
    this.sprite = 'images/Heart.png';
    this.x = Resources.getRandom(0,4) * 101;
    this.y = Resources.getRandom(0,2) * 84 + 66;
}

Heart.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

var player = new Player(),
    allEnemies = Resources.createEnemies();

var heart = new Heart();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) { 
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        82: 'r'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// When document loaded
if (window.addEventListener){ // W3C standard
    window.addEventListener('load', Resources.showGame, false);
} else if (window.attachEvent){ // Microsoft
    window.attachEvent('onload', Resources.showGame); 
}

