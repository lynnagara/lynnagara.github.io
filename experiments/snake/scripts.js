(function() {
	var snakeApp = new Object();

	// Game variables
	snakeApp.properties = {
		tilesAcross: 30,
		tilesDown: 30,
		tileSize: 16,
		speed:140 // timeout
	}

	snakeApp.initialize = function() {

		// The snake object
		snakeApp.snake = [], // array of segments that make up the snake

		// Direction object
		snakeApp.direction = [0,0];

		// Play/pause
		snakeApp.playing = null;

		// Game state
		snakeApp.gameState = 'new';

		// Keep track of score
		snakeApp.updateScore(0);

		// Create element
		this.canvas = document.getElementById('canvas');

		// Check if <canvas> is supported in the browser
		if (!this.canvas.getContext) {
			document.body.innerHTML = '<p>Canvas is not supported in your browser</p>';
			return;
		}

		// Set starting message
		snakeApp.setMessage('Use the arrow keys to move', 1);

		// Draw the board
		this.canvas.width = this.properties.tilesAcross * this.properties.tileSize;
		this.canvas.height = this.properties.tilesDown * this.properties.tileSize;
		document.getElementById('overlay').style.height = this.canvas.height.toString() + 'px';
		// Create the snake
		this.snake.push(this.getRandomTile());

		// Set target
		this.setTarget();

		// Render the snake and target
		this.drawGame();

		// Make the togglePlay button inactive
		document.getElementById('togglePlay').className = 'button inactive';
		// Make the reset button active
		document.getElementById('reset').className = 'button';
		// Show the game over  message
		document.getElementById('gameover').className = 'hide';

		// Add event listeners
		window.addEventListener('keydown', snakeApp.events.onKeyDown);
		document.getElementById('togglePlay').addEventListener('click', snakeApp.events.togglePlay, false);
		document.getElementById('reset').addEventListener('click', snakeApp.events.clickReset, false);

	}

	// Events
	snakeApp.events = new Object();
	snakeApp.events.onKeyDown = function(evt) {
		if ([37,38,39,40].indexOf(evt.keyCode) > -1  && snakeApp.gameState !== 'ended') {
			evt.preventDefault();
			if (snakeApp.playing !== false) {
				switch(evt.keyCode) {
					case 37: // Left
						snakeApp.direction = [-1,0];
						break;
					case 38: // Up
						snakeApp.direction = [0,-1];
						break;
					case 39: // Right
						snakeApp.direction = [1,0];
						break;
					case 40: // Down
						snakeApp.direction = [0,1];
						break;
					default:
						snakeApp.direction = [0,0];
				}
			}
			// Start loop if game is paused / new game
			if (snakeApp.playing === null) {
				snakeApp.startLoop();
				// Make the togglePlay button active
				document.getElementById('togglePlay').className = 'button';
				snakeApp.setMessage('Go eat the food!', 0);
			}
		}
		// P
		if (evt.keyCode === 80 && snakeApp.playing !== null) {
			snakeApp.events.togglePlay(evt);
		} 
		// R
		if (evt.keyCode === 82) {
			snakeApp.events.clickReset(evt);
		}
		// N
		if (evt.keyCode === 78 && snakeApp.gameState === 'ended') {
			snakeApp.events.clickReplay(evt);
		}
	}

	// Play/pause
	snakeApp.events.togglePlay = function(evt) {
		evt.preventDefault();
		if (snakeApp.playing === null) return;
		if (snakeApp.playing) {
			snakeApp.stopLoop();
			snakeApp.playing = false;
			snakeApp.setMessage('Game Paused. Press [P] to continue.', 1);
		} else {
			snakeApp.startLoop();
			snakeApp.setMessage('Go eat the food!', 0);
		}
	}
	// Reset game
	snakeApp.events.clickReset = function(evt) {
		evt.preventDefault();
		snakeApp.resetGame();
		return false;
	}
	// Replay game
	snakeApp.events.clickReplay = function(evt) {
		evt.preventDefault();
 		snakeApp.stopLoop();
		// Unbind listeners
		window.removeEventListener('keydown', snakeApp.events.onKeyDown);
		document.getElementById('reset').removeEventListener('click');
		snakeApp.initialize();
		return false;
	}

	snakeApp.setMessage = function(msg, priority) {
		// A message with a priority of 0 will only display in the side menu
		// A message with a priority of 1 will also flash in red on the screen
		// If not provided, the default priority will be 0
		if (!priority) var priority = 0;
		if (priority === 1) {
			document.getElementById('message-overlay').innerHTML = msg;
			document.getElementById('canvas').className = 'blurred';
		} else {
			document.getElementById('canvas').className = '';
			document.getElementById('message-overlay').innerHTML = '';
		}
		document.getElementById('message').innerHTML = msg;
	}

	snakeApp.resetGame = function() {
		if (window.confirm('Are you sure you want to reset this game?') === true) {
			snakeApp.stopLoop();
			// Unbind listeners
			window.removeEventListener('keydown', snakeApp.events.onKeyDown);
			document.getElementById('reset').removeEventListener('click');
			snakeApp.initialize();
		}
	}

	// Returns a random tile, e.g. [x,y]
	// Where x and y are between 0 and max tiles - 1
	snakeApp.getRandomTile = function() {
		var x = Math.floor(Math.random() * this.properties.tilesAcross);
		var y = Math.floor(Math.random() * this.properties.tilesDown);
		return [x,y];
	}

	snakeApp.drawGame = function() {
		// Clear previously rendered segments
		snakeApp.canvas.width = snakeApp.canvas.width;
		// Render each segment of the snake
		for (var i=0; i< this.snake.length; i++) {
			var x = this.snake[i][0] * this.properties.tileSize;
			var y = this.snake[i][1] * this.properties.tileSize;
			var ctx = this.canvas.getContext('2d');
			ctx.fillStyle = '#14adc4';
			ctx.fillRect(x, y, this.properties.tileSize, this.properties.tileSize);		
		}
		// Render target
		var x = this.target[0] * this.properties.tileSize;
		var y = this.target[1] * this.properties.tileSize;			
		var ctx = this.canvas.getContext('2d');
		ctx.fillStyle = '#fce75b';
		ctx.fillRect(x, y, this.properties.tileSize, this.properties.tileSize);		


	}

	snakeApp.setTarget = function() {
		if (this.snake.length < this.properties.tilesAcross * this.properties.tilesDown) {
			// Set a target, making sure it is not already in use
			this.target = this.getRandomTile();
			if (this.snake.toString().indexOf(this.target.toString()) > -1) {
				this.setTarget();
			}
		}
	}

	snakeApp.updateScore = function(score) {
		if (score >= 0) {
			this.score = score;
		} else {
			this.score = this.score + 1
		}
		document.getElementById('scoreCount').innerHTML = snakeApp.score;		
	}

	snakeApp.startLoop = function() {
		function draw() {
			snakeApp.playing = setTimeout(function() {
				// Update snake with the new position
				snakeApp.snake.splice(0, 0, [snakeApp.snake[0][0]+snakeApp.direction[0],snakeApp.snake[0][1]+snakeApp.direction[1]])
				snakeApp.snake.pop();

				// Re-render snake and loop if the new position is valid
				var x_pos = snakeApp.snake[0][0];
				var y_pos = snakeApp.snake[0][1];
				// Outside of box
				if(x_pos < 0 || x_pos > snakeApp.properties.tilesAcross-1 || y_pos < 0 || y_pos > snakeApp.properties.tilesDown-1) {
					snakeApp.endGame(0); // Lose game
				} 
				// Snake hits the target
				else if (x_pos === snakeApp.target[0] && y_pos === snakeApp.target[1]) {
					snakeApp.snake.push([snakeApp.target[0]-snakeApp.direction[0],snakeApp.target[1]-snakeApp.direction[1] ]);
					snakeApp.setTarget();
					snakeApp.drawGame();
					snakeApp.updateScore();
					// Check if there are no more tiles
					if (snakeApp.snake.length < snakeApp.properties.tilesAcross * snakeApp.properties.tilesDown) {
						requestAnimationFrame(draw);
					} else {
						snakeApp.endGame(1);
					}
				}
				else {
					// Is the snake crashing into itself?
					var filteredArr = snakeApp.snake.filter(function(segment) {
						if (x_pos === segment[0] && y_pos === segment[1]) return true;
					});
					if (filteredArr.length > 1) {
						snakeApp.endGame(0); // Lose game
					} else {
						// Move along
						snakeApp.drawGame();
						requestAnimationFrame(draw);
					}

				}
			}, snakeApp.properties.speed);
		}
		draw();
	}

	snakeApp.endGame = function(status) {
		// status => 0 to lose, 1 to win
		snakeApp.stopLoop();
		snakeApp.playing = null;
		document.getElementById('gameover').className = 'show';
		document.getElementById('replay').addEventListener('click', snakeApp.events.clickReplay, false);
		// Set score message
		snakeApp.setMessage('Game Over! <br />You scored ' + snakeApp.score + '<br /> Press [N] to replay', 1);

		// Game state
		snakeApp.gameState = 'ended';

		// Unbind listeners
		document.getElementById('togglePlay').className = 'button inactive';

	}

	snakeApp.stopLoop = function() {
		clearTimeout(snakeApp.playing);
	}

	// Initialize the game!
	snakeApp.initialize();

})();