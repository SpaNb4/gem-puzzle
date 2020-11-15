import './assets/scss/main.scss';
import movesound from './assets/sounds/move.mp3';
import * as drag from './drag_drop';
import * as swap from './swap';

const GemPuzzle = {
    size: 16,
    selIndex: 1,
    moves: 0,
    isSound: true,
    isPause: false,
    isWin: false,
    currTime: 0,
    arr: [],
    movesArr: [],
    cols: null,
    dragSrcEl: null,
    winMovesArr: [],
    interval: null,
    timeInterval: null,
    bgNum: null,

    init() {
        const container = document.createElement('div');
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
            this.selIndex = fieldSize.options.selectedIndex;
            this.clearField();
        });

        const cellsItemRowCount = Math.sqrt(this.size);
        main.style.cssText = `grid-template-columns: repeat(${cellsItemRowCount}, minmax(20px, 120px));
                              grid-template-rows: repeat(${cellsItemRowCount}, minmax(30px, 60px));`;

        const time = document.createElement('div');
        time.classList.add('time');
        time.innerHTML = `<i class="material-icons">alarm</i>
                        <span class='minutes'>00</span>
                        <span class='separator'>:</span>
                        <span class='seconds'>00</span>`;

        const moves = document.createElement('div');
        moves.classList.add('moves');
        moves.innerHTML = `<i class="material-icons">swap_horizontal_circle</i> ${this.moves}`;

        const menuBtn = document.createElement('a');
        menuBtn.classList.add('menu_btn');
        menuBtn.innerHTML = '<i class="material-icons">menu</i>';
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
        const table = document.createElement('table');
        const row = table.insertRow(0);

        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);

        cell1.innerHTML = 'Дата';
        cell2.innerHTML = 'Ходов';
        cell3.innerHTML = 'Время';
        cell4.innerHTML = 'Размер поля';

        const backBtn = document.createElement('a');
        backBtn.classList.add('back_btn');
        backBtn.innerHTML = 'Назад';

        bestScore.append(table, backBtn);

        backBtn.addEventListener('click', () => {
            bestScore.classList.toggle('visible');
        });

        overlay.append(gameMenuUl, bestScore);

        const sound = document.createElement('div');
        sound.classList.add('sound');
        sound.innerHTML = '<i class="material-icons">notifications_active</i>';
        sound.addEventListener('click', () => {
            this.isSound = !this.isSound;
            if (this.isSound) {
                sound.innerHTML = '<i class="material-icons">notifications_active</i>';
            } else {
                sound.innerHTML = '<i class="material-icons">notifications_off</i>';
            }
        });

        const solve = document.createElement('div');
        solve.classList.add('solve');
        solve.innerHTML = '<i class="material-icons">last_page</i>';
        solve.addEventListener('click', () => {
            if (!this.interval) {
                this.interval = setInterval(this.solvePuzzle.bind(this), 200);
            } else {
                clearInterval(this.interval);
                this.interval = null;
            }
        });

        const bottomMenu = document.createElement('div');
        bottomMenu.classList.add('bottom_menu');
        bottomMenu.append(sound, fieldSize, solve);

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

        const win = document.createElement('div');
        win.classList.add('win');

        container.appendChild(topMenu);
        main.append(overlay, win);
        container.append(main, bottomMenu);

        document.body.appendChild(container);

        if (localStorage.getItem('bestScore')) {
            this.winMovesArr = JSON.parse(localStorage.getItem('bestScore'));
            this.addResToScore();
        }

        const elHeight = document.querySelector('.cells_item').offsetWidth;

        main.style.cssText = `grid-template-columns: repeat(${cellsItemRowCount}, minmax(20px, 120px));
        grid-template-rows: repeat(${cellsItemRowCount}, ${elHeight}px);`;

        let k = 0;
        const cellsItem = document.querySelectorAll('.cells_item');
        for (let i = 0; i < Math.sqrt(this.size); i += 1) {
            for (let j = 0; j < Math.sqrt(this.size); j += 1) {
                cellsItem[k].style.backgroundPosition = `${900 - j * elHeight}px ${900 - i * elHeight}px`;
                k += 1;
            }
        }

        this.fieldFill();

        this.cols.forEach((col) => {
            col.addEventListener('dragstart', drag.handleDragStart.bind(this));
            col.addEventListener('dragenter', drag.handleDragEnter);
            col.addEventListener('dragover', drag.handleDragOver);
            col.addEventListener('dragleave', drag.handleDragLeave);
            col.addEventListener('drop', drag.handleDrop.bind(this));
            col.addEventListener('dragend', drag.handleDragEnd.bind(this));
            col.addEventListener('click', this.handleClick.bind(this));
        });
    },

    clearField() {
        const container = document.querySelector('.container');
        container.remove();
        this.isSound = true;
        this.isPause = false;
        this.isWin = false;
        this.currTime = 0;
        this.arr = [];
        this.movesArr = [];
        this.moves = 0;
        clearInterval(this.timeInterval);
        this.init();
    },

    fieldFill() {
        // заполнение массива числами от 1 до size-1
        // загрузка сохранённой игры из localstorage
        this.cols = document.querySelectorAll('.cells_item');
        let q = 0;
        if (localStorage.getItem('gameSave')) {
            const saveData = JSON.parse(localStorage.getItem('gameSave')).arr;
            this.arr = saveData.arr;
            this.currTime = saveData.currTime;
            this.moves = saveData.moves;
            const moves = document.querySelector('.moves');
            moves.innerHTML = `<i class="material-icons">swap_horizontal_circle</i> ${this.moves}`;
            this.movesArr = saveData.movesArr;
            this.colsSet();
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
            this.colsSet();
            // перемешивание игрового поля
            const isRandom = true;
            for (let n = 1; n < 2000; n += 1) {
                const i = this.randomInteger(0, Math.sqrt(this.size) - 1);
                const j = this.randomInteger(0, Math.sqrt(this.size) - 1);
                swap.checkNextEl.call(this, i, j, this.findEl(this.arr[i][j]), isRandom);
            }
        }
        this.getTime();
        this.movesArr.pop();
    },

    colsSet() {
        let q = 0;
        for (let i = 0; i < this.cols.length; i += 1) {
            this.cols[q].innerHTML = q + 1;
            if (q === this.size - 1) {
                this.cols[q].innerHTML = '';
                this.cols[q].dataset.empty = true;
            }
            q += 1;
        }
        q = 0;
        for (let i = 0; i < Math.sqrt(this.size); i += 1) {
            for (let j = 0; j < Math.sqrt(this.size); j += 1) {
                this.findEl(this.arr[i][j]).style.order = q + 1;
                q += 1;
            }
        }
    },

    randomInteger(min, max) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    },

    findEl(el) {
        for (let i = 0; i < this.cols.length; i += 1) {
            if (this.cols[i].innerHTML === el) {
                return this.cols[i];
            }
        }
        return false;
    },

    openMenu() {
        this.isPause = !this.isPause;
        this.getTime();
        const overlay = document.querySelector('.overlay');
        overlay.classList.toggle('visible');

        const menuBtn = document.querySelector('.menu_btn');
        if (menuBtn.innerHTML === '<i class="material-icons">menu</i>') {
            menuBtn.innerHTML = '<i class="material-icons">menu_open</i>';
        } else {
            menuBtn.innerHTML = '<i class="material-icons">menu</i>';
        }

        const time = document.querySelector('.time i');
        if (time.innerHTML === 'alarm') {
            time.innerHTML = 'alarm_off';
        } else {
            time.innerHTML = 'alarm';
        }

        const newGameLi = document.querySelector('li:first-child');
        newGameLi.addEventListener('click', () => {
            localStorage.removeItem('gameSave');
            this.isPause = !this.isPause;
            this.clearField();
        });

        const saveGameLi = document.querySelector('li:nth-child(2)');
        saveGameLi.addEventListener('click', () => {
            localStorage.setItem('gameSave', JSON.stringify({ arr: this }));
        });

        const bestScoreLi = document.querySelector('li:nth-child(3)');
        bestScoreLi.addEventListener('click', () => {
            const bestScore = document.querySelector('.best_score');
            bestScore.classList.toggle('visible');
        });
    },

    solvePuzzle() {
        let i = 0;
        let j = 0;

        if (this.isWin) {
            clearInterval(this.interval);
        } else {
            [i, j] = this.movesArr[this.movesArr.length - 1];
            swap.checkNextEl.call(this, i, j, this.findEl(this.arr[i][j]));
            this.movesArr.pop();
        }
    },

    getTime() {
        function pad(val) {
            return val > 9 ? val : `0${val}`;
        }
        const seconds = document.querySelector('.seconds');
        const minutes = document.querySelector('.minutes');
        if (!this.isPause) {
            this.timeInterval = setInterval(() => {
                // eslint-disable-next-line no-plusplus
                seconds.innerHTML = pad(++this.currTime % 60);
                minutes.innerHTML = pad(parseInt(this.currTime / 60, 10));
            }, 1000);
        } else {
            clearInterval(this.timeInterval);
        }
    },

    incrementMoves() {
        this.moves += 1;
        const moves = document.querySelector('.moves');
        moves.innerHTML = `<i class="material-icons">swap_horizontal_circle</i> ${this.moves}`;
    },

    addResToScore() {
        if (this.isWin) {
            const minutes = document.querySelector('.minutes').innerHTML;
            const seconds = document.querySelector('.seconds').innerHTML;

            const win = document.querySelector('.win');
            win.innerHTML = `<i class="material-icons close_btn">close</i> Ура! Вы решили головоломку за ${minutes}:${seconds} и ${this.moves + 1} ходов`;

            const closeBtn = document.querySelector('.close_btn');
            closeBtn.addEventListener('click', () => {
                win.classList.toggle('visible');
            });

            win.classList.toggle('visible');

            const date = new Date();
            const dateDay = date.getDay();
            const dateMonth = date.getMonth();
            const dateHour = date.getHours();
            const dateMinutes = date.getMinutes();

            const min = document.querySelector('.minutes').innerHTML;
            const sec = document.querySelector('.seconds').innerHTML;

            const index = this.winMovesArr.length;

            this.winMovesArr[index] = {};
            this.winMovesArr[index].date = `${dateDay + 1}.${dateMonth + 1} ${dateHour}:${dateMinutes}`;
            this.winMovesArr[index].moves = `${this.moves + 1}`;
            this.winMovesArr[index].time = `${min}:${sec}`;
            this.winMovesArr[index].size = `${Math.sqrt(this.size)}x${Math.sqrt(this.size)}`;

            this.winMovesArr.sort((a, b) => {
                if (parseInt(a.moves, 10) > parseInt(b.moves, 10)) {
                    return 1;
                }
                if (parseInt(a.moves, 10) < parseInt(b.moves, 10)) {
                    return -1;
                }
                return 0;
            });
        }
        localStorage.setItem('bestScore', JSON.stringify(this.winMovesArr));

        const oldTable = document.querySelector('table');
        if (oldTable) {
            oldTable.remove();
        }

        const table = document.createElement('table');
        let row = table.insertRow(0);

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);

        cell1.innerHTML = 'Дата';
        cell2.innerHTML = 'Ходов';
        cell3.innerHTML = 'Время';
        cell4.innerHTML = 'Размер поля';

        const bestScore = document.querySelector('.best_score');
        const backBtn = document.querySelector('.back_btn');
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
                // eslint-disable-next-line no-empty
            } catch {}
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
                break;
            }
        }
    },
};

GemPuzzle.init();
