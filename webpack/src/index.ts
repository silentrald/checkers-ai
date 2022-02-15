import './main.css';
import Checkers from './classes/checkers';

const checkers = new Checkers();
document.getElementById('checkers')?.appendChild(checkers.app.view);