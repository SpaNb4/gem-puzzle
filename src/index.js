import './assets/scss/main.scss';

const GemPuzzle = {
    size: 16,
    selIndex: 1,
    moves: 0,
    arr: [],
    cols: null,
    dragSrcEl: null,

    init() {
        let container = document.createElement('div');
        container.classList.add('container');

        let main = document.createElement('div');
        main.classList.add('cells_items');

        let fieldSize = document.createElement('select');
        fieldSize.classList.add('field_size');
        let fieldSize_arr = ['3x3', '4x4', '5x5', '6x6', '7x7', '8x8'];
        for (let i = 0; i < fieldSize_arr.length; i++) {
            let fieldSize_option = document.createElement('option');
            fieldSize_option.innerHTML = fieldSize_arr[i];
            fieldSize.appendChild(fieldSize_option);
        }

        // размер поля по умолчанию 4x4
        if (this.selIndex == 0) {
            this.size = 9;
        } else if (this.selIndex == 1) {
            this.size = 16;
        } else if (this.selIndex == 2) {
            this.size = 25;
        } else if (this.selIndex == 3) {
            this.size = 36;
        } else if (this.selIndex == 4) {
            this.size = 49;
        } else if (this.selIndex == 5) {
            this.size = 64;
        }

        fieldSize.selectedIndex = this.selIndex;
        fieldSize.addEventListener('change', () => {
            let container = document.querySelector('.container');
            this.selIndex = fieldSize.options.selectedIndex;
            container.remove();
            this.arr = [];
            this.init();
        });

        let cells_item_row_count = Math.sqrt(this.size);
        main.style.cssText = `grid-template-columns: repeat(${cells_item_row_count}, 1fr);
                              grid-template-rows: repeat(${cells_item_row_count}, minmax(75px, auto));`;

        let time = document.createElement('div');
        time.classList.add('time');
        time.innerHTML = 'Время: ';
        let minutes = document.createElement('span');
        minutes.classList.add('minutes');
        minutes.innerHTML = '00';
        let separator = document.createElement('span');
        separator.classList.add('separator');
        separator.innerHTML = ':';
        let seconds = document.createElement('span');
        seconds.classList.add('seconds');
        seconds.innerHTML = '00';

        time.appendChild(minutes);
        time.appendChild(separator);
        time.appendChild(seconds);

        let moves = document.createElement('div');
        moves.classList.add('moves');
        moves.innerHTML = `Ходов: ${this.moves}`;

        let menuBtn = document.createElement('a');
        menuBtn.classList.add('resolveBtn');
        menuBtn.innerHTML = 'Меню';
        menuBtn.addEventListener('click', this.openMenu);

        let top_menu = document.createElement('div');
        top_menu.classList.add('top_menu');
        top_menu.appendChild(time);
        top_menu.appendChild(moves);
        top_menu.appendChild(menuBtn);

        let overlay = document.createElement('div');
        overlay.classList.add('overlay');
        let game_menu_ul = document.createElement('ul');
        game_menu_ul.classList.add('game_menu');
        let menu_arr = ['Новая игра', 'Сохранить игру', 'Счёт', 'Правила', 'Настройки'];
        for (let i = 0; i < menu_arr.length; i++) {
            let game_menu_li = document.createElement('li');
            game_menu_li.innerHTML = menu_arr[i];
            game_menu_ul.appendChild(game_menu_li);
        }

        overlay.appendChild(game_menu_ul);

        for (let i = 0; i < this.size; i++) {
            let cells_item = document.createElement('div');
            cells_item.classList.add('cells_item');
            cells_item.style.order = i + 1;
            if (i == this.size - 1) {
                cells_item.style.backgroundColor = 'transparent';
                cells_item.style.border = 'none';
            }
            cells_item.setAttribute('draggable', true);
            main.appendChild(cells_item);
        }

        container.appendChild(top_menu);
        main.appendChild(overlay);
        container.appendChild(main);
        container.appendChild(fieldSize);

        document.body.appendChild(container);

        this.time();

        // заполнение массива числами от 1 до size-1
        // загрузка сохранённой игры из localstorage
        this.cols = document.querySelectorAll('.cells_item');
        let q = 0;
        if (localStorage.getItem('gameSave')) {
            this.arr = JSON.parse(localStorage.getItem('gameSave'));
        } else {
            for (let i = 0; i < Math.sqrt(this.size); i++) {
                this.arr[i] = [];
                for (let j = 0; j < Math.sqrt(this.size); j++) {
                    this.arr[i][j] = (q + 1).toString();
                    if (q == this.size - 1) {
                        this.arr[i][j] = '';
                    }
                    q++;
                }
            }

            // присвоение конкретным полям значений массива
            q = 0;
            for (let i = 0; i < Math.sqrt(this.size); i++) {
                for (let j = 0; j < Math.sqrt(this.size); j++) {
                    this.cols[q].innerHTML = this.arr[i][j];
                    if (q == this.size - 1) {
                        this.cols[q].dataset.empty = true;
                    }
                    q++;
                }
            }

            // история ходов
            let movesArr = [];
            // перемешивание игрового поля

            function findEl(el) {
                for (let i = 0; i < GemPuzzle.cols.length; i++) {
                    if (GemPuzzle.cols[i].style.order == el) {
                        return GemPuzzle.cols[i];
                    }
                }
            }

            for (let n = 0; n < 20; n++) {
                let i = this.randomInteger(0, Math.sqrt(this.size) - 1);
                let j = this.randomInteger(0, Math.sqrt(this.size) - 1);
                this.checkNextEl(i, j, findEl(this.arr[i][j]));

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
            this.moves = -1;
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
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    },

    openMenu() {
        let overlay = document.querySelector('.overlay');
        overlay.classList.toggle('visible');

        let new_game_li = document.querySelector('li:first-child');
        new_game_li.addEventListener('click', () => {
            let container = document.querySelector('.container');
            container.remove();
            GemPuzzle.init();
        });
        let save_game_li = document.querySelector('li:nth-child(2)');
        save_game_li.addEventListener('click', () => {
            localStorage.setItem('gameSave', JSON.stringify(GemPuzzle.arr));
        });
    },

    solvePuzzle() {},

    time() {
        let sec = 0;
        function pad(val) {
            return val > 9 ? val : '0' + val;
        }
        let seconds = document.querySelector('.seconds');
        let minutes = document.querySelector('.minutes');
        setInterval(function () {
            seconds.innerHTML = pad(++sec % 60);
            minutes.innerHTML = pad(parseInt(sec / 60, 10));
        }, 1000);
    },

    incrementMoves() {
        this.moves++;
        let moves = document.querySelector('.moves');
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
        [].forEach.call(this.cols, function (col) {
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
        let dragSrcEl_i = 0;
        let dragSrcEl_j = 0;
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i].indexOf(this.dragSrcEl.innerHTML) != -1) {
                let j = this.arr[i].indexOf(this.dragSrcEl.innerHTML);
                dragSrcEl_i = i;
                dragSrcEl_j = j;
            }
        }
        // разрешает перетягивать только ближайшие к пустой ячейке
        let isDraggable = false;
        if (dragSrcEl_i != this.arr.length - 1 && this.arr[dragSrcEl_i + 1][dragSrcEl_j] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (this.arr[dragSrcEl_i][dragSrcEl_j + 1] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (this.arr[dragSrcEl_i][dragSrcEl_j - 1] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (dragSrcEl_i != 0 && this.arr[dragSrcEl_i - 1][dragSrcEl_j] == '') {
            isDraggable = true;
        }

        // ничего не делает если подняли и опустили один и тот же элемент
        // или пытаемся перетянуть не ближайший к пустой ячейке элемент
        if (this.dragSrcEl != e.target && isDraggable) {
            if (e.target.innerHTML == '') {
                this.incrementMoves();
                this.dragSrcEl.innerHTML = e.target.innerHTML;
                e.target.innerHTML = e.dataTransfer.getData('text/html');

                let q = 0;
                for (let i = 0; i < this.arr.length; i++) {
                    for (let j = 0; j < this.arr.length; j++) {
                        this.arr[i][j] = this.cols[q].innerHTML;
                        q++;
                    }
                }
            }
        }
        return false;
    },

    swapCell(target) {
        let posEmptyEl;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.cols[i].dataset.empty == 'true') {
                posEmptyEl = i;
            }
        }

        let temp = target.style.order;
        target.style.order = this.cols[posEmptyEl].style.order;
        this.cols[posEmptyEl].style.order = temp;

        function rowPos(target) {
            let rowPosition;
            let size = Math.sqrt(GemPuzzle.size);
            if (target.style.order % size == 0) {
                rowPosition = Math.floor(target.style.order / size) - 1;
            } else {
                rowPosition = Math.floor(target.style.order / size);
            }
            return rowPosition;
        }

        function colPos(target) {
            let colPosition;
            let size = Math.sqrt(GemPuzzle.size);
            if (target.style.order % size == 0) {
                colPosition = size;
            } else {
                colPosition = target.style.order % size;
            }
            return colPosition - 1;
        }

        this.arr[rowPos(this.cols[posEmptyEl])][colPos(this.cols[posEmptyEl])] = '';

        this.arr[rowPos(target)][colPos(target)] = target.innerHTML;
    },

    checkNextEl(i, j, target) {
        if (i != this.arr.length - 1 && this.arr[i + 1][j] == '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (this.arr[i][j + 1] == '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (this.arr[i][j - 1] == '') {
            this.swapCell(target);
            this.incrementMoves();
        } else if (i != 0 && this.arr[i - 1][j] == '') {
            this.swapCell(target);
            this.incrementMoves();
        }
    },

    checkWin() {
        // выигрышная комбинация
        let winArr = [];
        let q = 0;
        for (let i = 0; i < this.arr.length; i++) {
            winArr[i] = [];
            for (let j = 0; j < this.arr.length; j++) {
                winArr[i][j] = (q + 1).toString();
                if (q == this.size - 1) {
                    winArr[i][j] = '';
                }
                q++;
            }
        }

        let isWin = true;
        for (let i = 0; i < this.arr.length; i++) {
            for (let j = 0; j < this.arr.length; j++) {
                if (this.arr[i][j] != winArr[i][j]) {
                    isWin = false;
                }
            }
        }

        if (isWin == true) {
            let minutes=document.querySelector('.minutes').innerHTML;
            let seconds=document.querySelector('.seconds').innerHTML;
            alert(`Ура! Вы решили головоломку за ${minutes}:${seconds} и ${this.moves} ходов`);
        }
    },

    handleClick(e) {
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i].indexOf(e.target.innerHTML) != -1) {
                let j = this.arr[i].indexOf(e.target.innerHTML);
                // i j - позиция элемента на который кликнули
                this.checkNextEl(i, j, e.target, true);
                this.checkWin();
                break;
            }
        }
    },
};

GemPuzzle.init();
