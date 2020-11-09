import './assets/scss/main.scss';
import movesound from './assets/sounds/move.mp3';

const GemPuzzle = {
    size: 9,
    selIndex: 1,
    moves: 0,
    isSound: true,
    arr: [],
    cols: null,
    dragSrcEl: null,
    winMovesArr: [],
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

        time.appendChild(minutes);
        time.appendChild(separator);
        time.appendChild(seconds);

        const moves = document.createElement('div');
        moves.classList.add('moves');
        moves.innerHTML = `Ходов: ${this.moves}`;

        const menuBtn = document.createElement('a');
        menuBtn.classList.add('resolveBtn');
        menuBtn.innerHTML = 'Меню';
        menuBtn.addEventListener('click', this.openMenu);

        const topMenu = document.createElement('div');
        topMenu.classList.add('top_menu');
        topMenu.appendChild(time);
        topMenu.appendChild(moves);
        topMenu.appendChild(menuBtn);

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

        bestScore.appendChild(table);
        bestScore.appendChild(backBtn);
        let n = 0;
        backBtn.addEventListener('click', () => {
            bestScore.classList.toggle('visible');

            const date = new Date();
            const dateDay = date.getDay();
            const dateMonth = date.getMonth();
            const dateYear = date.getFullYear();
            const dateHour = date.getHours();
            const dateMinutes = date.getMinutes();

            const min = document.querySelector('.minutes').innerHTML;
            const sec = document.querySelector('.seconds').innerHTML;

            this.winMovesArr[n] = [];
            this.winMovesArr[n].date = `${dateDay + 1}.${dateMonth + 1}.${dateYear} ${dateHour}:${dateMinutes}`;
            this.winMovesArr[n].moves = `${this.moves}`;
            this.winMovesArr[n].time = `${min}:${sec}`;
            this.winMovesArr[n].size = `${Math.sqrt(this.size)}x${Math.sqrt(this.size)}`;
            n += 1;
            this.winMovesArr.sort((a, b) => {
                if (parseInt(a.moves, 2) > parseInt(b.moves, 2)) {
                    return 1;
                }
                if (parseInt(a.moves, 2) < parseInt(b.moves, 2)) {
                    return -1;
                }
                return 0;
            });
            const oldTable = document.querySelector('table');
            if (oldTable) {
                oldTable.remove();
            }

            table = document.createElement('table');
            row = table.insertRow(0);

            cell1 = row.insertCell(0);
            cell2 = row.insertCell(1);
            cell3 = row.insertCell(2);
            cell4 = row.insertCell(3);

            cell1.innerHTML = 'Дата';
            cell2.innerHTML = 'Ходов';
            cell3.innerHTML = 'Время';
            cell4.innerHTML = 'Размер поля';

            bestScore.insertBefore(table, backBtn);

            for (let i = 0; i < 10; i += 1) {
                row = table.insertRow(i + 1);

                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell3 = row.insertCell(2);
                cell4 = row.insertCell(3);

                cell1.innerHTML = this.winMovesArr[i].date;
                cell2.innerHTML = this.winMovesArr[i].moves;
                cell3.innerHTML = this.winMovesArr[i].time;
                cell4.innerHTML = this.winMovesArr[i].size;
            }
            console.log(table.rows.length, this.winMovesArr);
        });

        overlay.appendChild(gameMenuUl);
        overlay.appendChild(bestScore);

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
        container.appendChild(main);
        container.appendChild(fieldSize);
        container.appendChild(sound);

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

            // история ходов
            const movesArr = [];
            // перемешивание игрового поля
            for (n = 0; n < 20; n += 1) {
                const i = this.randomInteger(0, Math.sqrt(this.size) - 1);
                const j = this.randomInteger(0, Math.sqrt(this.size) - 1);
                this.checkNextEl(i, j, this.findEl(this.arr[i][j]));

                // q = 0;
                // movesArr[n] = [];
                // for (let i = 0; i < Math.sqrt(this.size); i++) {
                //     movesArr[n][i] = [];
                //     for (let j = 0; j < Math.sqrt(this.size); j++) {
                //         this.arr[i][j] = this.cols[q].innerHTML;
                //         movesArr[n][i][j] = this.arr[i][j];
                //         q++;
                //     }
                // }
            }
            this.moves = 0;
        }

        [].forEach.call(this.cols, (col) => {
            col.addEventListener('dragstart', this.handleDragStart.bind(GemPuzzle));
            col.addEventListener('dragenter', this.handleDragEnter);
            col.addEventListener('dragover', this.handleDragOver);
            col.addEventListener('dragleave', this.handleDragLeave);
            col.addEventListener('drop', this.handleDrop.bind(GemPuzzle));
            col.addEventListener('dragend', this.handleDragEnd.bind(GemPuzzle));
            col.addEventListener('click', this.handleClick.bind(GemPuzzle));
        });
    },

    randomInteger(min, max) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    },

    findEl(el) {
        for (let i = 0; i < GemPuzzle.cols.length; i += 1) {
            if (GemPuzzle.cols[i].style.order === el) {
                return GemPuzzle.cols[i];
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
            GemPuzzle.init();
        });

        const saveGameLi = document.querySelector('li:nth-child(2)');
        saveGameLi.addEventListener('click', () => {
            localStorage.setItem('gameSave', JSON.stringify(GemPuzzle.arr));
        });

        const bestScoreLi = document.querySelector('li:nth-child(3)');
        bestScoreLi.addEventListener('click', () => {
            const bestScore = document.querySelector('.best_score');
            bestScore.classList.toggle('visible');
        });
    },

    solvePuzzle() {},

    time() {
        let sec = 0;
        function pad(val) {
            return val > 9 ? val : `0${val}`;
        }
        const seconds = document.querySelector('.seconds');
        const minutes = document.querySelector('.minutes');
        setInterval(() => {
            seconds.innerHTML = pad((sec += 1 % 60));
            minutes.innerHTML = pad(parseInt(sec / 60, 10));
        }, 1000);
    },

    incrementMoves() {
        this.moves += 1;
        const moves = document.querySelector('.moves');
        moves.innerHTML = `Ходов: ${this.moves}`;
    },

    handleDragStart(e) {
        e.target.style.opacity = '0.4';
        this.dragSrcEl = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    },

    handleDragEnd(e) {
        // удаляем класс со всех элементов
        e.target.style.opacity = 1;
        [].forEach.call(this.cols, (col) => {
            col.classList.remove('over');
        });
    },

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    },

    handleDragEnter() {
        // добавляем класс для текущего элемента
        this.classList.add('over');
    },

    handleDragLeave() {
        // удаляем класс с предыдущего элемента
        this.classList.remove('over');
    },

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        // dragSrcEl - что перетянули
        // e.target - куда перетянули
        let dragSrcElI = 0;
        let dragSrcElJ = 0;
        for (let i = 0; i < this.arr.length; i += 1) {
            if (this.arr[i].indexOf(this.dragSrcEl.innerHTML) !== -1) {
                const j = this.arr[i].indexOf(this.dragSrcEl.innerHTML);
                dragSrcElI = i;
                dragSrcElJ = j;
            }
        }

        // если подняли и опустили не один и тот же элемент
        if (this.dragSrcEl !== e.target) {
            this.checkNextEl(dragSrcElI, dragSrcElJ, this.dragSrcEl);
            this.moveSound();
        }
    },

    swapCell(target) {
        let posEmptyEl;
        const trg = target;
        for (let i = 0; i < this.cols.length; i += 1) {
            if (this.cols[i].dataset.empty === 'true') {
                posEmptyEl = i;
            }
        }

        const temp = trg.style.order;
        trg.style.order = this.cols[posEmptyEl].style.order;
        this.cols[posEmptyEl].style.order = temp;

        this.arr[this.rowPos(this.cols[posEmptyEl])][this.colPos(this.cols[posEmptyEl])] = '';

        this.arr[this.rowPos(target)][this.colPos(target)] = target.innerHTML;
    },

    rowPos(target) {
        let rowPosition;
        const size = Math.sqrt(GemPuzzle.size);
        if (target.style.order % size === 0) {
            rowPosition = Math.floor(target.style.order / size) - 1;
        } else {
            rowPosition = Math.floor(target.style.order / size);
        }
        return rowPosition;
    },

    colPos(target) {
        let colPosition;
        const size = Math.sqrt(GemPuzzle.size);
        if (target.style.order % size === 0) {
            colPosition = size;
        } else {
            colPosition = target.style.order % size;
        }
        return colPosition - 1;
    },

    checkNextEl(i, j, target) {
        if (i !== this.arr.length - 1 && this.arr[i + 1][j] === '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (this.arr[i][j + 1] === '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (this.arr[i][j - 1] === '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (i !== 0 && this.arr[i - 1][j] === '') {
            this.swapCell(target);
            this.incrementMoves();
        }
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
                this.checkNextEl(i, j, e.target);
                this.checkWin();
                this.moveSound();
                break;
            }
        }
    },
};

GemPuzzle.init();
