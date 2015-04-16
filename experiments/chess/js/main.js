'use strict';

var GLOBALS = {
  colors: {
    white: '#cccccc',
    black: '#444444',
    selected: '#ff0000'
  },
  rows: [1,2,3,4,5,6,7,8],
  cols: ['a','b','c','d','e','f','g','h']
}

var Game = function () {
  this.canvas = document.createElement('canvas');
  this.canvas.id = 'chess';
  document.body.appendChild(this.canvas);
};

Game.prototype.initialise = function () {
  var tileSizeInPx = 50;
  this.board = new Board(this.canvas, tileSizeInPx);
  this.board.render();

  // Player 1 goes first
  this.turn = 'player1';

  // Set up player pieces
  this.player1 = new Player(this.canvas, 'white', true);
  this.player2 = new Player(this.canvas, 'black', false);
  var moves = new Moves(this);
  this.player1.initialise();
  this.player2.initialise();
  moves.initialise();

  // Link to source code
  this.sourceLink = document.createElement('div');
  this.sourceLink.style.marginTop = '20px';
  this.sourceLink.innerHTML = '<p>Source: <a href="https://github.com/lynnagara/chess" target="_blank">Github</a></p>';
  document.body.appendChild(this.sourceLink);

}

function initialise () {
  var chess = new Game();
  chess.initialise();
}


initialise();