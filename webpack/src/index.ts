import './main.css';
import Checkers from './classes/checkers';
import Board from './classes/board';

const board = new Board('B:W21,22,23,24,25,26,27,28,29,30,31,32:B1,2,3,4,5,6,7,8,9,10,11,12');
const checkers = new Checkers(board);
document.getElementById('checkers')?.appendChild(checkers.app.view);

(window as any).checkers = checkers;
(window as any).board = board;
