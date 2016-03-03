+function($) {

  var keys = {
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    72: 'left',
    74: 'down',
    75: 'up',
    76: 'right'
  };

  function Game() {
    this._isRunning   = false;
    this._page        = $('body')[0];
  }

  Game.prototype.init = function() {
    this._width       = $(window).width();
    this._height      = $(window).height();
    this.spaceship    = new Spaceship(this);
  }

  Game.prototype.resize = function() {
    if (this.spaceship) {
      this.spaceship.element.remove();
      this.spaceship = undefined;
    }
    this.init();
  }

  Game.prototype.stop = function() {
    this._isRunning = false;
    this.spaceship.element.remove();
    this.spaceship = undefined;
  }

  Game.prototype.isRunning = function() {
    return !!this._isRunning;
  }

  // Spaceship
  function Spaceship(game) {
    this._height = 24;
    this._width = 16;
    this.game = game;
    this.element = createElement('div', {className: 'spaceship'});
    var top = $('#twitter').position().top + 6;
    var left = $('#twitter').position().left - 30;
    this.position = {
      x: left,
      y: top
    }
    this.velocity = 0;
    this.angle = Math.PI / 2; // in radians
    this.startUpdateLoop();
    this.draw();
  }

  Spaceship.prototype.startUpdateLoop = function() {
    this.interval = setInterval(this.update.bind(this), 30);
  }

  Spaceship.prototype.update = function() {
    // Update position
    this.position.x = this.position.x + (Math.sin(this.angle) * this.velocity);
    this.position.y = this.position.y - (Math.cos(this.angle) * this.velocity);

    // Add a tiny amount of drag
    this.velocity = 0.99 * this.velocity;
  }

  Spaceship.prototype.draw = function() {
    requestAnimationFrame(this.draw.bind(this));

    var xOffset = (((this.position.x % this.game._width) + this.game._width)
      % this.game._width);
    var yOffset = (((this.position.y % this.game._height) + this.game._height)
      % this.game._height);

    this.element.style.left = xOffset + 'px';
    this.element.style.top = yOffset + 'px';

    // Rotate spaceship
    this.element.style.transform = 'rotate(' + this.angle +'rad)';
  }

  Spaceship.prototype.accelerate = function() {
    // Max speed = 40
    if (this.velocity < 40) {
      this.velocity = this.velocity + Math.max(this.velocity * 0.1, 1);
    }
  }

  Spaceship.prototype.turn = function(direction) {
    if (direction === 'left') {
      this.velocity = this.velocity + Math.max(this.velocity * 0.1, 1);
      this.angle = this.angle - 0.03;
    } else if (direction === 'right') {
      this.velocity = this.velocity + Math.max(this.velocity * 0.1, 1);
      this.angle = this.angle + 0.03;
    }
  }

  Spaceship.prototype.brake = function() {
    this.velocity = 0.9 * this.velocity;
    if (this.velocity < 0.01) {
      this.velocity = 0;
    }
  }

  Spaceship.prototype.changeColor = throttle(function() {
    this.element.style.borderBottomColor = getRandomHexColor();
  }, 500, this);

  function handleKeys(evt) {
    var key = keys[evt.keyCode];
    switch (key) {
      case 'space':
      case 'up':
        game.spaceship.accelerate();
        break;
      case 'left':
        game.spaceship.turn('left');
        break;
      case 'right':
        game.spaceship.turn('right');
      case 'down':
        game.spaceship.brake();
        break;
      case 'esc':
        game.stop();
        break;
      default:
        game.spaceship.changeColor();
    }
  }

  function handleResize() {
    game.resize();
  }


  function createElement(tag, attrs, parent) {
    var elem = document.createElement(tag);

    for (var prop in attrs) {
      elem[prop] = attrs[prop];
    }
    if (!parent) {
      parent = document.body;
    }
    parent.appendChild(elem);
    return elem;
  }

  function getRandomHexColor() {
    return '#' + [0,0,0].map(getRandomHexValue).join('');
  }

  function getRandomHexValue() {
    var digits = '0123456789abcdef';
    return digits[Math.floor(Math.random() * digits.length)];
  }

  function throttle(func, limit, context) {
    var wait = false;
    return function () {
      context = this;
      if (!wait) {
        func.call(context);
        wait = true;
        setTimeout(function () {
          wait = false;
        }, limit);
      }
    }
  }

  function shouldShowGame() {
    var hasTouch = 'ontouchstart' in window;
    var smallScreen = $(window).width() < 900;

    return !hasTouch && !smallScreen;
  }

  // Start game if not mobile
  if (shouldShowGame()) {
    var game = new Game();
    game.init();
    $(document).on('keydown', handleKeys);
    $(window).on('resize', handleResize);
  }



}(jQuery);
