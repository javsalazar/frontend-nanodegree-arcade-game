 // as level index increase, difficulty increase
var levels = [
        {
            points: 50,  // point required to get to this level
            bugs: 1,
            speed: 50
        },
        { // level 1
            points: 100,
            bugs: 3,
            speed: 100
        },
        {
            points: 200,
            bugs: 4,
            speed: 150
        },
        {
            points: 300,
            bugs: 5,
            speed: 220
        },
        {
            points: 450,
            bugs: 6,
            speed: 300
        },
        {
            points: 600,
            bugs: 7,
            speed: 420
        },
        {
            points: 700,
            bugs: 8,
            speed: 500
        },
        {
            points: 800,
            bugs: 9,
            speed: 600
        },
        {
            points: 10000,
            bugs: 10,
            speed: 700
        }
    ],
    goodies = [ // determine 'reward' for each goodie.
        {
            url: "images/Heart.png",
            life: 1,
            points: 0
        },
        {
            url: "images/gem-blue.png",
            life: 0,
            points: 20
        },
        {
            url: "images/gem-orange.png",
            life: 0,
            points: 50
        },
        {
            url: "images/gem-green.png",
            life: 1,
            points: 75
        }
    ];

/****** ENEMY RELATED *****/

var Enemy = function(yStart) {
    // Variables applied to each of our instances go here
    this.speed = this.getSpeed(); 
    this.fromDirection = this.getStartLocation();  // left or right
    
    if ( yStart > 2 ) {
        yStart = yStart % 3; //only have 3 rows, make sure to add them there
    } 
    this.x = Resources.getRandom(-90,495); // random place within canvas (or edge)
    this.y = yStart * 83 + 66;  // which row to place, 66 is offset from top

    // get correct facing image
    if (this.fromDirection === 'left'){
        this.sprite = 'images/enemy-bug.png';
    }else{
        this.sprite = 'images/enemy-bug-r.png';
        this.speed *= -1; //moving left
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Start from left or right?
Enemy.prototype.getStartLocation = function() {
    var start = Resources.getRandom(1,2);
    return ( start === 1 ) ? 'left' : 'right';
};

Enemy.prototype.getSpeed = function () {
    return Math.floor( ( Math.random() * levels[player.level].speed ) + 50 );
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // moving from left and reached right edge, restart from left edge
    if (this.x > 500 && this.fromDirection === 'left'){
        this.x = -101;
    } else if (this.x < -101 && this.fromDirection === 'right'){
        this.x = 500;
    }

    this.x += ( this.speed * dt );
};

/****** PLAYER RELATED *****/

var Player = function( xStart, yStart ){
    this.character = Resources.getRandom(0,4); // index of character (default)
    this.sprite = Resources.cycleCharacter(this.character, true);
    // player will start at the given location, center bottom row by default.
    this.x = xStart || 202;
    this.y = yStart || 413;
    this.startTime = Date.now();

    // define x and y deltas, used to determined how 'far' player moves on each move.
    this.xDelta = 101;
    this.yDelta = 83;
    //define player boundaries
    this.yUpBound = -2;
    this.yDownBound = 413;
    this.xLeftBound = 0;
    this.xRightBound = 404;

    // current stats
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this.inState = 'play';
    this.music = '';
};

Player.prototype.render = function() {
    
    if (this.inState == 'over'){
        // canvas is 505 x 606  -- center text
        this.drawText(ctx, "Game Over!", 505 * 0.5, 606 * 0.5 );  
        this.drawText(ctx, "(press 'r' to play again)", 505 * 0.5, 606 * 0.75 );  
    }

    if (this.inState == 'levelUp'){
        // canvas is 505 x 606 -- center text
        this.drawText(ctx, "New level: " + this.level, 505 * 0.5, 606 * 0.5 );  
    }

    this.drawScore();
    this.drawLives();
    this.drawHelp();

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.playSound = function (tune) {
    var sound = document.getElementById('player-sound');
    
    sound.pause();
    sound.src = tune || '../sound/jump.m4a';  
    sound.volume = 0.7;
    sound.play();
};

Player.prototype.drawScore = function () {
    var sc = 'Score: ' + this.score;
    ctx.font = '22pt Impact';
    ctx.fillStyle = 'white';
    ctx.fillText(sc, 20, 90);
};

Player.prototype.drawHelp = function () {
    var sc = '\'h\' for help';
    ctx.save();
    ctx.font = '10pt Impact ';
    ctx.fillStyle = 'black';
    ctx.fillText(sc, 20, 570);
    ctx.restore();
};

Player.prototype.drawLives = function () {
    ctx.save();
    ctx.scale(0.3, 0.3);

    for( var count = 0; count < this.lives; count++ ){
       //coord number affected by scale fnc above
       ctx.drawImage(Resources.get(this.sprite), 1560 - count*100, 150); 
    }

    ctx.restore();
};

Player.prototype.drawText = function (ctx, text, x, y) {
    ctx.save();
    ctx.font = '36pt Impact';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
    //outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    ctx.restore();
};

Player.prototype.handleInput = function (key) {
    
    if ( key === 'c'){
        var char = this.character !== 4 ? this.character + 1 : 0;
        Resources.cycleCharacter(char);
    }

    if ( key === 'h'){
        this.inState = this.inState === 'play' ? 'pause' : 'play';
        document.querySelector('.flip-container').classList.toggle('hover');
    }

    if ( key === 'm'){
        
        var state = this.music;

        this.music = ( state ) ?  false :  true;

        Resources.bgSound(this.music);
    }

    
    // start new game if game is over and click on 'r'
    if ( (this.inState === 'over'  || this.inState === 'pause')  && key === 'r'){

        console.log('I want to play AGAING!!!');
        player = new Player();
        allEnemies = Resources.createEnemies();
    }

    // move player if didn't hit enemy and game is not over or paused
    if ( this.inState !== 'crash' && this.inState !== 'over' && this.inState !== 'pause' ){
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
};

Player.prototype.levelReached = function () {

    this.totalTime = (Date.now() - this.startTime) / 1000.0;
    console.log('Time to reach goal: %s', this.totalTime);
    this.playSound('../sound/levelup.m4a');
    this.score += Math.round(50 / this.totalTime);  // use 50 as a random number of points to give
    console.log(' Score is : ', Math.round(50 / this.totalTime));

    // check to see if enough points to move to next level BUT not beyond level 10 (last one)
    if ( this.score > levels[this.level].points  && this.level !== 10){
        console.log('NEW LEVEL REACHED');
        this.level += 1;  //move to next level
        this.lives += 1;  //add to lives total
        this.inState = 'levelUp'; // to show message, gets reset on restart()
        console.log('new level is: %s', this.level);
        Resources.createEnemies(levels[this.level]);
    }

    this.restart();
};

Player.prototype.checkCollision = function  () {
    var currentEnemy,
        enemyLeftEdge,
        enemyRightEdge,
        playerLeftEdge = this.x + 17, //17 is offset from x location, image 67 wide (101-67)/2
        playerRightEdge = playerLeftEdge + 67; // add width for right edge

    // check for enemies
    for(var i = 0,numEnemies = allEnemies.length; i < numEnemies; i++) {
        currentEnemy = allEnemies[i];
        enemyLeftEdge = currentEnemy.x,
        enemyRightEdge = enemyLeftEdge + 98, //location plus enemy width
        enemyTopEdge = currentEnemy.y,
        enemyBottomEdge = enemyTopEdge + 50;

        if (  this.checkEdges(enemyLeftEdge, enemyRightEdge, enemyTopEdge, enemyBottomEdge) ) {
            console.log('crash!');
            this.playSound('../sound/die.m4a');
            this.lives -= 1;
            this.inState = 'crash';
            this.restart();    
        }
    } 

    // check for goodies
    var goodieLeftEdge = goodie.x,
        goodieRightEdge = goodieLeftEdge + 89;
        goodieTopEdge = goodie.y,
        goodieBottomEdge = goodieTopEdge + 50;

    if ( this.checkEdges(goodieLeftEdge, goodieRightEdge, goodieTopEdge, goodieBottomEdge) ) {
        
        console.log('goodie me!');
        goodie.x = -200;
        goodie.y= -200;
        this.playSound('../sound/goodie.m4a');
        this.lives += goodie.life;
        this.score += goodie.points;
    }
};

Player.prototype.checkEdges = function (oLeft, oRight, oTop, oBottom) {
    playerLeftEdge = this.x + 14.5, //17 is offset from x location, image ~72 (avg. width for all characters) wide (101-72)/2
    playerRightEdge = playerLeftEdge + 72, // add width for right edge ~72
    playerTopEdge = this.y,
    playerBotomEdge = playerTopEdge + 50;

    return oRight > playerLeftEdge && oLeft < playerRightEdge && playerTopEdge < oBottom && playerBotomEdge > oTop; 
};

Player.prototype.update = function () {
    this.checkCollision();
};

Player.prototype.restart = function () {

    // need to pass reference to 'this' into function
    var that = this;

    // wait for sound to stop playing before starting again...
    // and only listen for it once, when we 'crash'
    onetime(document.getElementById('player-sound'), 'ended', function() {
 
        allEnemies = Resources.createEnemies(levels[that.level]);
        // random num between 0 and 4
        var xVal = Resources.getRandom(0,4);
        that.x = xVal * 101;
        that.y = 413;
        that.playSound('../sound/jump.m4a');
        that.startTime = Date.now();
            
        if (that.lives > 0){
            that.inState = 'play';
            goodie = new Goodie();
            Resources.bgSound(that.music);
        } else {
            that.inState = 'over';
            Resources.bgSound(false);   // end music when game over      
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
};

/****** GOODIES RELATED *****/

var Goodie = function (xStart, yStart) {

    var index = Resources.getRandom(0, goodies.length - 1); //get random 'goodie'
    this.sprite = 'images/Heart.png';
    this.sprite = goodies[index].url;
    this.life = goodies[index].life;
    this.points = goodies[index].points;
    this.x = Resources.getRandom(0,4) * 101;
    this.y = Resources.getRandom(0,2) * 83 + 76;
};

Goodie.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x , this.y);
};


var player = new Player(),
    allEnemies = Resources.createEnemies(),
    goodie = new Goodie();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) { 
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        67: 'c', // 'c'hange character
        72: 'h', // 'h'elp menu
        77: 'm', // 'm'usic  on/off
        82: 'r'  // 'r'estart new game
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

window.addEventListener('load', Resources.showGame, false);