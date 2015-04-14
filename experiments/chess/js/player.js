/* 
  White starts first
*/

'use strict';

var Player = function (canvas, color, playForwardDirection) {
  this.canvas = canvas;
  this.color = color; // can be white or black
  this.playForwardDirection = playForwardDirection;
  this.piecesList = [];
  this.captured = [];
}

Player.prototype.initialise = function () {
  if (this.color === 'white') {
    this.pieces = [
      { name: 'rook', position: 'a1'},
      { name: 'knight', position: 'b1'},
      { name: 'bishop', position: 'c1'},
      { name: 'queen', position: 'd1'},
      { name: 'king', position: 'e1'},
      { name: 'bishop', position: 'f1'},
      { name: 'knight', position: 'g1'},
      { name: 'rook', position: 'h1'},
      { name: 'pawn', position: 'a2'},
      { name: 'pawn', position: 'b2'},
      { name: 'pawn', position: 'c2'},
      { name: 'pawn', position: 'd2'},
      { name: 'pawn', position: 'e2'},
      { name: 'pawn', position: 'f2'},
      { name: 'pawn', position: 'g2'},
      { name: 'pawn', position: 'h2'}
    ];
  } else {
    this.pieces = [
      { name: 'rook', position: 'a8'},
      { name: 'knight', position: 'b8'},
      { name: 'bishop', position: 'c8'},
      { name: 'queen', position: 'd8'},
      { name: 'king', position: 'e8'},
      { name: 'bishop', position: 'f8'},
      { name: 'knight', position: 'g8'},
      { name: 'rook', position: 'h8'},
      { name: 'pawn', position: 'a7'},
      { name: 'pawn', position: 'b7'},
      { name: 'pawn', position: 'c7'},
      { name: 'pawn', position: 'd7'},
      { name: 'pawn', position: 'e7'},
      { name: 'pawn', position: 'f7'},
      { name: 'pawn', position: 'g7'},
      { name: 'pawn', position: 'h7'}
    ];
  }

  this.pieces.forEach(function(p) {
    var piece = new Piece(this.canvas, this.color, p, this.playForwardDirection);
    piece.initialise();
    this.piecesList.push(piece);
  }, this);
}

