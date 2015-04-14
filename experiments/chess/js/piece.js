'use strict';

var Piece = function(canvas, color, piece, playForwardDirection) {
  this.canvas = canvas;
  this.color = color;
  this.piece = piece;
  this.playForwardDirection = playForwardDirection;
  this.image = new Image();
  this.image.src = 'images/' + this.color + '/' + this.piece.name + '.svg';
  this.renderCount = 0;
}

Piece.prototype.initialise = function () {
  var self = this;
  this.image.onload = function () {
    self.render(self.piece.position);
  }
}

Piece.prototype.render = function (newpos, oldpos, board) {
  var ctx = this.canvas.getContext('2d');
  var xPos = newpos.split('')[0].charCodeAt(0) - 96;
  var yPos = 9 - newpos.split('')[1];
  if (board) {
    var bgColor = board.getTileColor(newpos);
    ctx.fillStyle = bgColor;
    ctx.fillRect(xPos * 50 - 50, yPos * 50 - 50, 50, 50); 
  }
  var img = this.image;
  ctx.drawImage(
    img, 
    xPos * 50 - 50 + 3, // centering
    yPos * 50 - 50
  );
  this.renderCount++;
}

Piece.prototype.renderCaptured = function (player, opponent) {
  var xOffset = 420; // 5 * 8
  var yOffset = 50;
  var ctx = this.canvas.getContext('2d');
  var num = player.captured.length + opponent.captured.length;
  var xPos = (num - 1) % 5;
  var yPos = (num - xPos - 1) / 5;
  var img = this.image;
  ctx.drawImage(
    img, 
    xPos * 50 + xOffset, // centering
    yPos * 50 + yOffset
  );

}

Piece.prototype.isValidMove = function (newpos, oldpos, playerPieces, opponentPieces, player, opponent) {
  switch(this.piece.name) {
    case 'pawn':
      return this.isValidPawnMove(newpos, oldpos, playerPieces, opponentPieces);
      break;
    case 'bishop':
      return this.isValidBishopMove(newpos, oldpos, playerPieces, opponentPieces);
      break;
    case 'rook':
      return this.isValidRookMove(newpos, oldpos, playerPieces, opponentPieces);
      break;
    case 'queen':
      return this.isValidQueenMove(newpos, oldpos, playerPieces, opponentPieces);
      break;
    case 'king':
      return this.isValidKingMove(newpos, oldpos, playerPieces, opponentPieces, player, opponent);
      break;
    case 'knight':
      return this.isValidKnightMove(newpos, oldpos, playerPieces, opponentPieces);
      break;
    default:
      return false;
  }
}

// Returns the change between newpos and oldpos as [x,y]
Piece.prototype.getMoveDirection = function (newpos, oldpos) {
  return [
    GLOBALS.cols.indexOf(newpos.split('')[0]) - GLOBALS.cols.indexOf(oldpos.split('')[0]),
    GLOBALS.rows.indexOf(parseInt(newpos.split('')[1])) - GLOBALS.rows.indexOf(parseInt(oldpos.split('')[1]))
  ]
}

// Returns an array containing the co-ordinates of squares between two points
// Excluding those squares
Piece.prototype.getSquareList = function (newpos,oldpos) {
  // Make sure its a straight line
  var moveDirection = this.getMoveDirection(newpos, oldpos);

  var list = [];
  var i;
  if (moveDirection[0] === 0 &&  moveDirection[1] === 0) {
    return false;
  }
  if (moveDirection[0] === 0 || moveDirection[1] === 0 || Math.abs(moveDirection[0]) === Math.abs(moveDirection[1])) {
    // forward/backward    

    var stepsCount = Math.abs(moveDirection[0] || moveDirection[1]);
    var nextTile;
    var startX = GLOBALS.cols.indexOf(oldpos.split('')[0]);
    var startY = GLOBALS.rows.indexOf(parseInt(oldpos.split('')[1]));

    var xDirection, yDirection;
    moveDirection[0] === 0 ? yDirection = 0 : yDirection = moveDirection[0] / stepsCount;
    moveDirection[1] === 0 ? xDirection = 0 : xDirection = moveDirection[1] / stepsCount;
    var direction = [yDirection, xDirection]

    for (i=1;i<stepsCount;i++) {
      nextTile = GLOBALS.cols[startX+(i*direction[0])] + GLOBALS.rows[startY + (i*direction[1])]
      list.push(nextTile);
    }
    return list;

  } else {
    // invalid move
    return false;
  }
}

Piece.prototype.isValidPawnMove = function (newpos, oldpos, playerPieces, opponentPieces) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  var opponentPositions = opponentPieces.map(function(piece) {return piece.position});
  var directionMultiplier;
  this.playForwardDirection ? directionMultiplier = 1 : directionMultiplier = -1;

  // Move straight ahead
  if (moveDirection[0] === 0) {
    if (moveDirection[1] === 1 * directionMultiplier) {
      // Same column, 1 step forward
      if (this.squaresAreEmpty([newpos], playerPieces, opponentPieces)) {
        if (opponentPositions.indexOf(newpos) === -1) {
          return true;
        }
      }
    } else if (moveDirection[1] === 2 * directionMultiplier) {
      var tile = newpos.split('')[0] + parseInt(newpos.split('')[1] - directionMultiplier);
      var tilesArr = [newpos, tile]
      var startingPawnPosition;
      directionMultiplier === 1 ? startingPawnPosition = 2 : startingPawnPosition = 7;
      return parseInt(oldpos.split('')[1]) === startingPawnPosition && this.squaresAreEmpty(tilesArr, playerPieces, opponentPieces);
    }
  } else if (Math.abs(moveDirection[0]) === 1 && moveDirection[1] === directionMultiplier && opponentPositions.indexOf(newpos) !== -1) {
    // moving 1 space left/right, 1 space forward, and is a capture scenario
    return true;
  }
  return false;
}

Piece.prototype.isValidBishopMove = function (newpos, oldpos, playerPieces, opponentPieces) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  var tiles;

  if (Math.abs(moveDirection[0]) === Math.abs(moveDirection[1])) {
    tiles = this.getSquareList(newpos, oldpos)
    if (tiles && this.squaresAreEmpty(tiles, playerPieces, opponentPieces)) {
      return true;
    }
  }
  return false;
}

Piece.prototype.isValidRookMove = function (newpos, oldpos, playerPieces, opponentPieces) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  var tiles;

  if (Math.abs(moveDirection[0]) === 0 || Math.abs(moveDirection[1]) === 0) {
    tiles = this.getSquareList(newpos, oldpos)
    if (tiles && this.squaresAreEmpty(tiles, playerPieces, opponentPieces)) {
      return true;
    }
  }
  return false;
}

Piece.prototype.isValidQueenMove = function (newpos, oldpos, playerPieces, opponentPieces) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  var tiles;
  tiles = this.getSquareList(newpos, oldpos)
  if (tiles && this.squaresAreEmpty(tiles, playerPieces, opponentPieces)) {
    return true;
  }
  return false;
}

Piece.prototype.isValidKingMove = function (newpos, oldpos, playerPieces, opponentPieces, player, opponent) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  var tiles;

  if (Math.abs(moveDirection[0]) === 1 || Math.abs(moveDirection[1]) === 1) {
    tiles = this.getSquareList(newpos, oldpos);
    if (tiles && this.squaresAreEmpty(tiles, playerPieces, opponentPieces)) {
      return true;
    }
  } else if (Math.abs(moveDirection[0]) === 2 && Math.abs(moveDirection[1]) === 0 && this.renderCount === 1) {
    // Castling...?
    // 1. Check that the rook hasn't moved yet
    var rookCol;
    moveDirection[0] > 0 ? rookCol = 'h' : rookCol = 'a';
    var rookAddr = rookCol + newpos.split('')[1];
    var rookIdx = playerPieces.map(function(piece) {return piece.position}).indexOf(rookAddr);
    if (player.piecesList[rookIdx].renderCount === 1) {
      tiles = [newpos];
      tiles = this.getSquareList(rookAddr, oldpos);
    }
    if (tiles.length) {
      if (!this.squaresAreEmpty(tiles, playerPieces, opponentPieces)) {
        return false;
      }

      // Check that king can safely pass through each square, except 'B'
      tiles.forEach(function(tile) {
        if (tile.split('')[0] !== 'b') {
          if(this.kingWouldBeChecked(newpos, oldpos, playerPieces, opponentPieces, player, opponent)) {
            return false;
          }
        }
      }, this);
    }
    return true;
  }
  return false;
}

Piece.prototype.kingWouldBeChecked = function (newpos, oldpos, playerPieces, opponentPieces, player, opponent) {
  // Loop through opponent pieces to see if each could check the player
  return opponent.piecesList.some(function(piece) {
    piece.isValidMove(newpos, piece.piece.position, opponentPieces, playerPieces, opponent, player);
  });
}


Piece.prototype.isValidKnightMove = function (newpos, oldpos, playerPieces, opponentPieces) {
  var moveDirection = this.getMoveDirection(newpos, oldpos);
  if ((Math.abs(moveDirection[0]) + Math.abs(moveDirection[1]) === 3) && Math.abs(moveDirection[0]) !== 0 && Math.abs(moveDirection[1]) !== 0) {
    return true;
  }
  return false;
}


// Returns true if all the tiles in a given array are empty
// Otherwise returns false
Piece.prototype.squaresAreEmpty = function (tilesArr, playerPieces, opponentPieces) {
  var occupiedPositions = playerPieces.concat(opponentPieces).map(function(piece) {return piece.position});
  return tilesArr.every(function(tile) {
    return occupiedPositions.indexOf(tile) === -1;
  });
}

// Promotes the piece to queen
Piece.prototype.promoteToQueen = function (tile, board) {
  this.piece.name = 'queen';
  this.image.src = 'images/' + this.color + '/' + this.piece.name + '.svg';
  this.render(tile, tile, board);
}


