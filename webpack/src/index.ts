import './main.css';
import Checkers from './classes/checkers';
import './img/black-king.png';
import './img/white-king.png';

const checkers = new Checkers();
const board = checkers.board;
document.getElementById('checkers')?.appendChild(checkers.app.view);

checkers.newGame();

const w = window as any;
w.checkers = checkers;
w.board = board;

w.undo = () => {
  checkers.undo();
};

w.redo = () => {
  checkers.redo();
};

w.flip = () => {
  checkers.flip();
};

const table = document.getElementById('move-notation') as HTMLTableElement;
function clearMoveList() {
  for (let i = table.rows.length - 1; i > 0; i--)
    table.deleteRow(i);
}

w.playBlack = () => {
  board.playerFirst = true;
  board.setBoard('B:W21,22,23,24,25,26,27,28,29,30,31,32:B1,2,3,4,5,6,7,8,9,10,11,12');
  clearMoveList();

  checkers.newGame();
};

w.playWhite = () => {
  board.playerFirst = false;
  board.setBoard('B:W21,22,23,24,25,26,27,28,29,30,31,32:B1,2,3,4,5,6,7,8,9,10,11,12');
  clearMoveList();

  checkers.newGame();
};
