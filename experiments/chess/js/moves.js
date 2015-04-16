'use strict';

var Moves = function (chess) {
  this.canvas = chess.canvas;
  this.turn = chess.turn;
  this.board = chess.board;
  this.player1 = chess.player1;
  this.player2 = chess.player2;
  this.selectedTile = null;
}

Moves.prototype.initialise = function () {

  this.renderTurnText(this.turn);
  
  function handleClick (event) {
    // Get the tile name
    var x = GLOBALS.cols[Math.floor(event.clientX / 50)];
    var y = 9 - GLOBALS.rows[Math.floor(event.clientY / 50)];
    if (!x || !y) return;
    var tile = x + y;

    this.handleSelection(tile);
  }

  // Add event listeners
  this.canvas.addEventListener('mousedown', handleClick.bind(this), false);
}

Moves.prototype.handleSelection = function (tile) {
  
  var listOfPlayerPositions = this[this.turn].pieces.map(function(piece) {return piece.position});
  var from, turn, idx;
  var player = this[this.turn];
  var opponent;
  this[this.turn] === this.player1 ? opponent = this.player2 : opponent = this.player1;


  if (!this.selectedTile) {
    // Check if the tile can be selected
    if (listOfPlayerPositions.indexOf(tile) > -1) {
        this.selectTile(tile);
    }
  } else {
    // Check if the move is valid...
    idx = listOfPlayerPositions.indexOf(this.selectedTile);
    from = this[this.turn].pieces[idx];

    if (this.isValidMove(from, tile, player, opponent, idx)) {

      // Special rule for castling
      var xDir = GLOBALS.cols.indexOf(tile.split('')[0]) - GLOBALS.cols.indexOf(from.position.split('')[0]);
      var rookCol, rookNewCol, rookRow, rookPos, rookIdx, rook, rookFrom, rookNewPos;
      if (from.name === 'king' && (Math.abs(xDir) === 2)) {
        if (xDir > 0) {
          rookCol = 'h';
          rookNewCol = 'f';
        } else {
          rookCol = 'a';
          rookNewCol = 'd';
        }
        player.color === 'white' ? rookRow = '1' : rookRow = '8';
        rookPos = rookCol + rookRow;
        rookNewPos = rookNewCol + rookRow;
        rookIdx = player.piecesList.map(function(piece) {
          return piece.piece.position;
        }).indexOf(rookPos);
        rook = player.piecesList[rookIdx];
        rookFrom = player.piecesList[rookIdx].piece;
        this.movePiece(rookFrom, rookNewPos, player, opponent, true);
      }
      this.movePiece(from, tile, player, opponent, false);
    } else {
      this.unselectTile(this.selectedTile);      
    }
  }
}

Moves.prototype.isValidMove = function (from, newpos, player, opponent, idx) {
  if (this.wouldBeChecked(player, opponent, from, newpos)) {
    // would make it CHECK
    return false;
  } else if (player.pieces.map(function(piece) {return piece.position}).indexOf(newpos) > -1) {
    // no move made
    return false;
  } else {
    var piece = this[this.turn].piecesList[idx];
    var isValid = piece.isValidMove(newpos, from.position, player.pieces, opponent.pieces, player, opponent);
    return isValid;
  }
}

Moves.prototype.wouldBeChecked = function (player, opponent, from, newpos) {

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Deep copy the player objects
  var playerPieces = deepCopy(player.pieces)
  var opponentPieces = deepCopy(opponent.pieces)

  // Perform the play
  var idx = playerPieces
    .map(function(piece) { return JSON.stringify(piece)})
    .indexOf(JSON.stringify(from));
  
  playerPieces[idx].position = newpos;
  // was there a capture?
  var capturedIdx = opponentPieces.map(function(piece) {return piece.position}).indexOf(newpos);

  var kingPos = playerPieces.filter (
    function(piece) {if (piece.name === 'king') {return true;}}
  )[0].position;

  return opponent.piecesList.some(function(piece, idx) {
    if (capturedIdx === idx) {
      return false; // just return false, this piece is no longer valid
    } else {
      return piece.isValidMove(kingPos, piece.piece.position, playerPieces, opponentPieces);
    }
  }, this);
}

Moves.prototype.isCheck = function (from, newpos, player, opponent) {
  var kingPos = opponent.pieces.filter (
    function(piece) {if (piece.name === 'king') {return true;}}
  )[0].position;
  return player.piecesList.some(function(piece, idx) {
    return piece.isValidMove(kingPos, piece.piece.position, player.pieces, opponent.pieces);
  }, this);
}

Moves.prototype.isCheckMate = function (from, newpos, player, opponent) {
  // Checkmate scenarios - 
  // 1. Is it possible to capture the piece that has just moved into the 'check' position?
  // 2. Can king move to another position?
  // 3. Can another piece block the check?
  var kingPos = opponent.pieces.filter (
    function(piece) {if (piece.name === 'king') {return true;}}
  )[0].position;

  function canCaptureCheckingPiece() {
    // Loop through player pieces, and see if you can capture the piece that lost
    return opponent.piecesList.some(function(piece, idx) {
      return piece.isValidMove(newpos, piece.piece.position, opponent.pieces, player.pieces);
    });
  }

  function canMoveKing() {
    // Get address of all available squares around the king
    var kingIdx = opponent.pieces.map(function(piece) {return piece.name}).indexOf('king');
    var tiles = [];
    var xOffset, yOffset, xCol, yCol;
    var yIdx = GLOBALS.cols.indexOf(kingPos.split('')[0]);
    var xIdx = GLOBALS.rows.indexOf(parseInt(kingPos.split('')[1]));
    // if its a valid square, add it to the tiles
    return [0,1,2,3,4,5,6,7,8].some(function(i) {
      yOffset = i % 3 - 1;
      xOffset = Math.floor(i/3) - 1;
      yCol = GLOBALS.cols[yIdx + yOffset];
      xCol = GLOBALS.rows[xIdx + xOffset];
      if (xCol && yCol) {
        var tile = yCol + xCol
        if (this.isValidMove({name:'king', position:kingPos}, tile, opponent, player, kingIdx)) {
          return true;
        }
      }
    }, this);
  }

  function canBlockCheckMate() {
    // Knight can never be blocked
    if (from.name === 'knight') { return false; }
    // Loop through opponent.pieces and tiles checking if checkmate can be blocked
    var pieceIdx = player.pieces.map(function(piece) {return piece.position}).indexOf(from.position);
    var piece = player.piecesList[pieceIdx];
    var blockableTiles = piece.getSquareList(kingPos, from.position);

    var fr, to;
    return opponent.piecesList.some(function(p,i) {
      fr = opponent.pieces[i];
      return blockableTiles.some(function(t) {
        return this.isValidMove(fr, t, opponent, player, i);
      }, this);
    }, this);
  }

  if (canCaptureCheckingPiece() || canMoveKing.call(this) || canBlockCheckMate.call(this)) {
    return false;
  } else {
    return true;    
  }
}

Moves.prototype.movePiece = function (from, newpos, player, opponent, dontSwitchTurns) {
  // Get idx in player's array
  var idx = this[this.turn].pieces
    .map(function(piece) { return JSON.stringify(piece)})
    .indexOf(JSON.stringify(from));
  var piece = this[this.turn].piecesList[idx];
  piece.render(newpos, from.position, this.board);
  this.clearTile(from.position);

  // Update array
  this[this.turn].pieces[idx].position = newpos;
  // Check if there is a capture
  var opponentIdx = opponent.pieces.map(function(piece) {return piece.position}).indexOf(newpos);
  if (opponentIdx > -1) {
    // get the index in the opponents list
    opponent.pieces.splice(opponentIdx, 1);
    var captured = opponent.piecesList.splice(opponentIdx, 1)[0];
    opponent.captured.push(captured);
    captured.renderCaptured(player, opponent);
  }

  // Pawn becomes queen by default
  if (from.name === 'pawn') {
    var targetRow;
    var validPieces = ['queen', 'rook', 'knight', 'bishop'];
    player.playForwardDirection ? targetRow = 8 : targetRow = 1;
    if (parseInt(newpos.split('')[1]) === targetRow) {
      var newPiece = prompt("Select a piece (type 'queen', 'rook', 'knight', 'bishop')");
      if (validPieces.indexOf(newPiece) === -1) {
        newPiece = 'queen';
      }
      player.pieces[idx].name = newPiece;
      player.piecesList[idx].promoteToQueen(newpos, this.board, newPiece);
    }
  }

  // It's the other players turn
  if (!dontSwitchTurns) {
    this.turn === 'player1' ? this.turn = 'player2' : this.turn = 'player1';
    if (this.isCheck(from, newpos, player, opponent)) {
      if (this.isCheckMate(from, newpos, player, opponent)) {
      this.renderTurnText(this.turn, 'CHECKMATE');
      } else {
        this.renderTurnText(this.turn, 'CHECK');
      }
    } else {
      this.renderTurnText(this.turn);
    }
  }
}

Moves.prototype.renderTurnText = function (player, checkText) {
  var displayText;
  player === 'player1' ? displayText = 'White' : displayText = 'Black';
  displayText += '\'s turn';
  if (checkText) {
    displayText += ' (' + checkText + ')';
  }

  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(420, 0, 250, 25);

  ctx.fillStyle = GLOBALS.colors.black;
  ctx.font = '14px sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(displayText, 420, 10);
}

Moves.prototype.selectTile = function (tile) {
    var x = tile.split('')[0];
    var y = parseInt(tile.split('')[1]);
    var ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = GLOBALS.colors.selected;
    ctx.lineWidth = 1;
    ctx.strokeRect(GLOBALS.cols.indexOf(x) * 50 + 1, ((7 - GLOBALS.rows.indexOf(y)) * 50) + 1, 48, 48);    
    this.selectedTile = tile;
}

Moves.prototype.unselectTile = function () {
  var x = this.selectedTile.split('')[0];
  var y = parseInt(this.selectedTile.split('')[1]);
  var ctx = this.canvas.getContext('2d');
  ctx.strokeStyle = this.board.getTileColor(this.selectedTile);
  ctx.lineWidth = 2;
  ctx.strokeRect(GLOBALS.cols.indexOf(x) * 50 + 1, ((7 - GLOBALS.rows.indexOf(y)) * 50) + 1, 48, 48);    
  this.selectedTile = null;
}

Moves.prototype.clearTile = function (tile) {
  var x = tile.split('')[0];
  var y = parseInt(tile.split('')[1]);
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = this.board.getTileColor(tile);
  ctx.fillRect(GLOBALS.cols.indexOf(x) * 50, ((7 - GLOBALS.rows.indexOf(y)) * 50), 50, 50);    
  this.selectedTile = null;
}

