import './assets/scss/main.scss';
import movesound from './assets/sounds/move.mp3';
import * as drag from './drag_drop.js';
import * as swap from './swap.js';

const GemPuzzle = {
    size: 16,
    selIndex: 1,
    moves: 0,
    isSound: true,
    arr: [],
    movesArr: [],
    cols: null,
    dragSrcEl: null,
    winMovesArr: [],
    bestScorePos: 0,
    interval: null,
    bgNum: null,

    init() {
        let container = document.createElement('div');
        container.classList.add('container');

        const main = document.createElement('div');
        main.classList.add('cells_items');

        const fieldSize = document.createElement('select');
        fieldSize.classList.add('field_size');
        const fieldSizeArr = ['3x3', '4x4', '5x5', '6x6', '7x7', '8x8'];
        for (let i = 0; i < fieldSizeArr.length; i += 1) {
            const fieldSizeOption = document.createElement('option');
            fieldSizeOption.innerHTML = fieldSizeArr[i];
            fieldSize.appendChild(fieldSizeOption);
        }

        // размер поля по умолчанию 4x4
        if (this.selIndex === 0) {
            this.size = 9;
        } else if (this.selIndex === 1) {
            this.size = 16;
        } else if (this.selIndex === 2) {
            this.size = 25;
        } else if (this.selIndex === 3) {
            this.size = 36;
        } else if (this.selIndex === 4) {
            this.size = 49;
        } else if (this.selIndex === 5) {
            this.size = 64;
        }

        fieldSize.selectedIndex = this.selIndex;
        fieldSize.addEventListener('change', () => {
            container = document.querySelector('.container');
            this.selIndex = fieldSize.options.selectedIndex;
            container.remove();
            this.arr = [];
            this.init();
        });

        const cellsItemRowCount = Math.sqrt(this.size);
        main.style.cssText = `grid-template-columns: repeat(${cellsItemRowCount}, minmax(20px, 120px));
                              grid-template-rows: repeat(${cellsItemRowCount}, minmax(30px, 60px));`;

        const time = document.createElement('div');
        time.classList.add('time');
        time.innerHTML = 'Время: ';
        const minutes = document.createElement('span');
        minutes.classList.add('minutes');
        minutes.innerHTML = '00';
        const separator = document.createElement('span');
        separator.classList.add('separator');
        separator.innerHTML = ':';
        const seconds = document.createElement('span');
        seconds.classList.add('seconds');
        seconds.innerHTML = '00';

        time.append(minutes, separator, seconds);

        const moves = document.createElement('div');
        moves.classList.add('moves');
        moves.innerHTML = `Ходов: ${this.moves}`;

        const menuBtn = document.createElement('a');
        menuBtn.classList.add('resolveBtn');
        menuBtn.innerHTML = 'Меню';
        menuBtn.addEventListener('click', this.openMenu.bind(this));

        const topMenu = document.createElement('div');
        topMenu.classList.add('top_menu');
        topMenu.append(time, moves, menuBtn);

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const gameMenuUl = document.createElement('ul');
        gameMenuUl.classList.add('game_menu');
        const menuArr = ['Новая игра', 'Сохранить игру', 'Таблица рекордов'];
        for (let i = 0; i < menuArr.length; i += 1) {
            const gameMenuLi = document.createElement('li');
            gameMenuLi.innerHTML = menuArr[i];
            gameMenuUl.appendChild(gameMenuLi);
        }

        const bestScore = document.createElement('div');
        bestScore.classList.add('best_score');
        bestScore.innerHTML = '<h3>Таблица рекордов</h3>';
        let table = document.createElement('table');
        let row = table.insertRow(0);

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);

        cell1.innerHTML = 'Дата';
        cell2.innerHTML = 'Ходов';
        cell3.innerHTML = 'Время';
        cell4.innerHTML = 'Размер поля';

        const backBtn = document.createElement('a');
        backBtn.innerHTML = 'Назад';
        backBtn.classList.add('back_btn');

        bestScore.append(table, backBtn);

        backBtn.addEventListener('click', () => {
            bestScore.classList.toggle('visible');
        });

        overlay.append(gameMenuUl, bestScore);

        const sound = document.createElement('div');
        sound.classList.add('sound');
        sound.innerHTML = 'Выключить звук';
        sound.addEventListener('click', () => {
            this.isSound = !this.isSound;
            if (this.isSound) {
                sound.innerHTML = 'Выключить звук';
            } else {
                sound.innerHTML = 'Включить звук';
            }
        });

        const solve = document.createElement('div');
        solve.classList.add('solve');
        solve.innerHTML = 'Решить';
        solve.addEventListener('click', () => {
            this.interval = setInterval(this.solvePuzzle.bind(this), 500);
        });

        let j = 0;
        if (this.bgNum === null) {
            this.bgNum = this.randomInteger(1, 150);
        }
        for (let i = 0; i < this.size; i += 1) {
            const cellsItem = document.createElement('div');
            cellsItem.classList.add('cells_item');
            cellsItem.style.order = i + 1;
            if (i === this.size - 1) {
                cellsItem.style.backgroundColor = 'transparent';
                cellsItem.style.border = 'none';
            }
            cellsItem.setAttribute('draggable', true);
            cellsItem.style.background = `url(./assets/img/${this.bgNum}.jpg)`;
            main.appendChild(cellsItem);
        }

        container.appendChild(topMenu);
        main.appendChild(overlay);
        container.append(main, fieldSize, sound, solve);

        document.body.appendChild(container);

        let elHeight = document.querySelector('.cells_item').offsetWidth;

        main.style.cssText = `grid-template-columns: repeat(${cellsItemRowCount}, minmax(20px, 120px));
        grid-template-rows: repeat(${cellsItemRowCount}, ${elHeight}px);`;

        let k = 0;
        let cellsItem = document.querySelectorAll('.cells_item');
        for (let i = 0; i < Math.sqrt(this.size); i++) {
            for (let j = 0; j < Math.sqrt(this.size); j++) {
                cellsItem[k].style.backgroundPosition = 900 - j * elHeight + 'px ' + (900 - i * elHeight) + 'px';
                k++;
            }
        }

        this.time();

        // заполнение массива числами от 1 до size-1
        // загрузка сохранённой игры из localstorage
        this.cols = document.querySelectorAll('.cells_item');
        let q = 0;
        if (localStorage.getItem('gameSave')) {
            this.arr = JSON.parse(localStorage.getItem('gameSave'));
        } else {
            for (let i = 0; i < Math.sqrt(this.size); i += 1) {
                this.arr[i] = [];
                for (let j = 0; j < Math.sqrt(this.size); j += 1) {
                    this.arr[i][j] = (q + 1).toString();
                    if (q === this.size - 1) {
                        this.arr[i][j] = '';
                    }
                    q += 1;
                }
            }

            // присвоение конкретным полям значений массива
            q = 0;
            for (let i = 0; i < Math.sqrt(this.size); i += 1) {
                for (let j = 0; j < Math.sqrt(this.size); j += 1) {
                    this.cols[q].innerHTML = this.arr[i][j];
                    if (q === this.size - 1) {
                        this.cols[q].dataset.empty = true;
                    }
                    q += 1;
                }
            }

            // перемешивание игрового поля
            let isRandom = true;
            for (let n = 1; n < 100; n += 1) {
                const i = this.randomInteger(0, Math.sqrt(this.size) - 1);
                const j = this.randomInteger(0, Math.sqrt(this.size) - 1);
                swap.checkNextEl.call(this, i, j, this.findEl(this.arr[i][j]), isRandom);
            }
            this.movesArr.pop();
        }

        this.cols.forEach( (col) => {
            col.addEventListener('dragstart', drag.handleDragStart.bind(this));
            col.addEventListener('dragenter', drag.handleDragEnter);
            col.addEventListener('dragover', drag.handleDragOver);
            col.addEventListener('dragleave', drag.handleDragLeave);
            col.addEventListener('drop', drag.handleDrop.bind(this));
            col.addEventListener('dragend', drag.handleDragEnd.bind(this));
            col.addEventListener('click', this.handleClick.bind(this));
        });
    },

    randomInteger(min, max) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    },

    findEl(el) {
        for (let i = 0; i < this.cols.length; i += 1) {
            if (this.cols[i].innerHTML == el) {
                return this.cols[i];
            }
        }
        return false;
    },

    openMenu() {
        const overlay = document.querySelector('.overlay');
        overlay.classList.toggle('visible');

        const newGameLi = document.querySelector('li:first-child');
        newGameLi.addEventListener('click', () => {
            const container = document.querySelector('.container');
            container.remove();
            this.moves = 0;
            this.init();
        });

        const saveGameLi = document.querySelector('li:nth-child(2)');
        saveGameLi.addEventListener('click', () => {
            localStorage.setItem('gameSave', JSON.stringify(this.arr));
        });

        const bestScoreLi = document.querySelector('li:nth-child(3)');
        bestScoreLi.addEventListener('click', () => {
            const bestScore = document.querySelector('.best_score');
            bestScore.classList.toggle('visible');
        });
    },

    solvePuzzle() {
        let _i = 0;
        let _j = 0;

        if (this.movesArr == 0) {
            clearTimeout(this.interval);
        } else {
            _i = this.movesArr[this.movesArr.length - 1][0];
            _j = this.movesArr[this.movesArr.length - 1][1];

            swap.checkNextEl.call(this, _i, _j, this.findEl.bind(this, this.arr[_i][_j]));
            this.movesArr.pop();
        }
    },

    time() {
        let sec = 0;
        function pad(val) {
            return val > 9 ? val : `0${val}`;
        }
        const seconds = document.querySelector('.seconds');
        const minutes = document.querySelector('.minutes');
        setInterval(() => {
            seconds.innerHTML = pad(++sec % 60);
            minutes.innerHTML = pad(parseInt(sec / 60, 10));
        }, 1000);
    },

    incrementMoves() {
        this.moves += 1;
        const moves = document.querySelector('.moves');
        moves.innerHTML = `Ходов: ${this.moves}`;
    },

    checkWin() {
        // выигрышная комбинация
        const winArr = [];
        let q = 0;
        for (let i = 0; i < this.arr.length; i += 1) {
            winArr[i] = [];
            for (let j = 0; j < this.arr.length; j += 1) {
                winArr[i][j] = (q + 1).toString();
                if (q === this.size - 1) {
                    winArr[i][j] = '';
                }
                q += 1;
            }
        }

        let isWin = true;
        for (let i = 0; i < this.arr.length; i += 1) {
            for (let j = 0; j < this.arr.length; j += 1) {
                if (this.arr[i][j] !== winArr[i][j]) {
                    isWin = false;
                }
            }
        }

        if (isWin === true) {
            const minutes = document.querySelector('.minutes').innerHTML;
            const seconds = document.querySelector('.seconds').innerHTML;
            alert(`Ура! Вы решили головоломку за ${minutes}:${seconds} и ${this.moves} ходов`);

            const date = new Date();
            const dateDay = date.getDay();
            const dateMonth = date.getMonth();
            const dateYear = date.getFullYear();
            const dateHour = date.getHours();
            const dateMinutes = date.getMinutes();

            const min = document.querySelector('.minutes').innerHTML;
            const sec = document.querySelector('.seconds').innerHTML;

            this.winMovesArr[this.bestScorePos] = [];
            this.winMovesArr[this.bestScorePos].date = `${dateDay + 1}.${dateMonth + 1}.${dateYear} ${dateHour}:${dateMinutes}`;
            this.winMovesArr[this.bestScorePos].moves = `${this.moves}`;
            this.winMovesArr[this.bestScorePos].time = `${min}:${sec}`;
            this.winMovesArr[this.bestScorePos].size = `${Math.sqrt(this.size)}x${Math.sqrt(this.size)}`;

            this.bestScorePos += 1;
            this.winMovesArr.sort((a, b) => {
                if (parseInt(a.moves) > parseInt(b.moves)) {
                    return 1;
                }
                if (parseInt(a.moves) < parseInt(b.moves)) {
                    return -1;
                }
                return 0;
            });
            const oldTable = document.querySelector('table');
            if (oldTable) {
                oldTable.remove();
            }

            let table = document.createElement('table');
            let row = table.insertRow(0);

            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);

            cell1.innerHTML = 'Дата';
            cell2.innerHTML = 'Ходов';
            cell3.innerHTML = 'Время';
            cell4.innerHTML = 'Размер поля';

            let bestScore = document.querySelector('.best_score');
            let backBtn = document.querySelector('.back_btn');
            bestScore.insertBefore(table, backBtn);

            for (let i = 0; i < 10; i += 1) {
                row = table.insertRow(i + 1);

                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell3 = row.insertCell(2);
                cell4 = row.insertCell(3);

                try {
                    cell1.innerHTML = this.winMovesArr[i].date;
                    cell2.innerHTML = this.winMovesArr[i].moves;
                    cell3.innerHTML = this.winMovesArr[i].time;
                    cell4.innerHTML = this.winMovesArr[i].size;
                } catch {}
            }
        }
    },

    moveSound() {
        if (this.isSound) {
            const sound = new Audio(movesound);
            sound.play();
        }
    },

    handleClick(e) {
        for (let i = 0; i < this.arr.length; i += 1) {
            if (this.arr[i].indexOf(e.target.innerHTML) !== -1) {
                const j = this.arr[i].indexOf(e.target.innerHTML);
                // i j - позиция элемента на который кликнули
                swap.checkNextEl.call(this, i, j, e.target);
                this.checkWin();
                this.moveSound();
                break;
            }
        }
    },
};

GemPuzzle.init();
