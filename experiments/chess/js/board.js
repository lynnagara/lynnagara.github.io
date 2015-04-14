'use strict';

var Board = function (element, tileSizeInPx) {
  this.element = element;
  this.tileSizeInPx = tileSizeInPx;
}

Board.prototype.render = function () {
  this.element.width = this.tileSizeInPx * 8 + 300;
  this.element.height = this.tileSizeInPx * 8;

  var i, j;
  this.tiles = []; // 1d array containing the address of all 64 tiles
  var rows = GLOBALS.rows;
  var cols = GLOBALS.cols;

  rows.forEach(function(row, rowIdx) {
    cols.forEach(function(col, colIdx) {
      this.tiles.push(col + row);
      // render the tile
      var x = (7 - rowIdx) * this.tileSizeInPx;
      var y = colIdx * this.tileSizeInPx;
      var ctx = this.element.getContext('2d');
      ctx.fillStyle = this.getTileColor(col + row);
      ctx.fillRect(x, y, this.tileSizeInPx, this.tileSizeInPx); 
    }, this);
  }, this);

  return true;
}

Board.prototype.getTileColor = function (tile) {
  var x = tile.split('')[0];
  var y = parseInt(tile.split('')[1]);
  if ((GLOBALS.cols.indexOf(x) + GLOBALS.rows.indexOf(y)) % 2 === 0) {
    return GLOBALS.colors.black;
  } else {
    return GLOBALS.colors.white;
  }
}

