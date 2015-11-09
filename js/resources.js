/**
 * Resources.js
 * This is simple an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times, along with some other utility functions
 * such as function to get random number, create enemies, start game, and get 
 * character for player
 */
 
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /**
     * This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     * @param {string|array} urlOrArray - a string or array pointing to image file(s)
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /**
             * If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /**
             * The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /**
     * This is our private image loader function, it is
     * called by the public image loader function.
     * @param {string} url - url to image
     */
    function _load(url) {
        if(resourceCache[url]) {
            /**
             * If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /**
             * This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /**
                 * Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /**
                 * Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /**
             * Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the images src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /**
     * This is used by developer's to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     * @param {string} url - path to image
     * @returns {element} return cached image
     */
    function get(url) {
        return resourceCache[url];
    }

    /**
     * This function determines if all of the images that have been requested
     * for loading have in fact been completed loaded.
     * @returns {boolean}
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /**
     * This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     * @param {function} func
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /**
     * This function creates a random number in an inclusive range.
     * @param {number} min - The lower limit number to use in range 
     * @param {number} max - The upper limit number to use in range 
     * @returns {number} a radom number in range
     */
    function getRandom(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    /**
     * This function creates the enemies.
     * @param {number} level - Pass in the current level to determine the number of enemies to build
     * @returns {array} Array of enemy objects
     */
    function createEnemies (level) {
    var allEnemies = [],
        totalEnemies = levels[player.level].bugs;

        if( level && level.bugs){
            totalEnemies = level.bugs;
        }

        for( var count = 0; count < totalEnemies; count++ ){
            // count determines the row the bug appears on
            allEnemies.push( new Enemy(count));
        }

        return allEnemies;
    }

    /**
     * This functions displays the game on initial startup
     * by adding classes to canvas element
     * and will also start playing the background music
     */
    function showGame () {
        var canvas = document.querySelector('canvas');
        canvas.className = 'animated fadeInDownBig';
        Resources.bgSound(true);
    }

    /**
     * function to assing or cycle a character to player
     * @param {number} index - the index of image to get from array
     * @param {boolean} init - if set to true will return character instead of cycle
     * @returns {string} url to image if init param set to true
     */
    function cycleCharacter (index, init) {
        var current = index || 0,
            charArray = [
                'images/char-boy.png',
                'images/char-cat-girl.png', 
                'images/char-horn-girl.png',
                'images/char-pink-girl.png',
                'images/char-princess-girl.png'
            ];

        if ( init){
            return charArray[index];
        }

        player.sprite = charArray[current];
        player.character = index;
    }

    /**
     * play background music
     * @param {boolean} play - If parameter is true play music otherwise pause
     */
    function bgSound(play) {

        var sound = document.getElementById('bug-sound');
        
        sound.pause();

        if ( !play ){
            player.music = false;
            return;
        }

        sound.src = '../sound/groovy.m4a';
        sound.volume = 0.3;
        sound.play();
        player.music = true;
    }

    /**
     * This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady,
        getRandom: getRandom,
        createEnemies: createEnemies,
        showGame: showGame,
        cycleCharacter: cycleCharacter,
        bgSound: bgSound
    };
})();
