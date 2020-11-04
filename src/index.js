import './assets/scss/main.scss';

let arr = [];

const GemPuzzle = {
    number: 9,
    moves: 0,
    cols: null,

    init() {
        let container = document.createElement('div');
        container.classList.add('container');

        let main = document.createElement('div');
        main.classList.add('cells_items');

        let time = document.createElement('div');
        time.classList.add('time');
        time.innerHTML = 'Время:';
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
        moves.innerHTML = `Ходов:${this.moves}`;

        let cells_item_width = 100 / Math.sqrt(this.number);
        for (let i = 1; i < this.number; i++) {
            let cells_item = document.createElement('div');
            cells_item.classList.add('cells_item');
            cells_item.style.cssText = `width: calc(${cells_item_width}% - 10px)`;
            cells_item.setAttribute('draggable', true);
            main.appendChild(cells_item);
        }

        // создаём пустой последний элемент
        let cells_item = document.createElement('div');
        cells_item.classList.add('cells_item');
        cells_item.style.cssText = `width: calc(${cells_item_width}% - 10px)`;
        cells_item.setAttribute('draggable', true);

        main.appendChild(cells_item);

        container.appendChild(main);
        container.appendChild(time);
        container.appendChild(moves);

        document.body.appendChild(container);

        this.time();

        this.cols = document.querySelectorAll('.cells_item');
        let q = 0;
        for (let i = 0; i < Math.sqrt(this.number); i++) {
            arr[i] = [];
            for (let j = 0; j < Math.sqrt(this.number); j++) {
                arr[i][j] = (q + 1).toString();
                if (q == this.number - 1) {
                    arr[i][j] = '';
                }
                q++;
            }
        }

        q = 0;
        for (let i = 0; i < Math.sqrt(this.number); i++) {
            for (let j = 0; j < Math.sqrt(this.number); j++) {
                this.cols[q].innerHTML = arr[i][j];
                q++;
            }
        }

        function randomInteger(min, max) {
            let rand = min + Math.random() * (max + 1 - min);
            return Math.floor(rand);
        }

        let mouseClickEmulation = {
            target: {
                innerHTML: '',
            },
        };
        for (let n = 0; n < 1290; n++) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length; j++) {
                    if (arr[i][j] == '') {
                        let k = randomInteger(1, 4);
                        if (i != arr.length - 1 && k == 1) {
                            mouseClickEmulation.target.innerHTML = arr[i + 1][j];
                        } else if (k == 2) {
                            mouseClickEmulation.target.innerHTML = arr[i][j + 1];
                        } else if (k == 3) {
                            mouseClickEmulation.target.innerHTML = arr[i][j - 1];
                        } else if (i != 0 && k == 4) {
                            mouseClickEmulation.target.innerHTML = arr[i - 1][j];
                        }
                    }
                }
            }
            this.handleClick(mouseClickEmulation);
        }
    },

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
        moves.innerHTML = `Ходов:${this.moves}`;
    },

    handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    },

    handleDragEnd(e) {
        // удаляем класс со всех элементов
        this.style.opacity = 1;
        [].forEach.call(GemPuzzle.cols, function (col) {
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

    handleDragEnter(e) {
        // добавляем класс для текущего элемента
        this.classList.add('over');
    },

    handleDragLeave(e) {
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
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].indexOf(dragSrcEl.innerHTML) != -1) {
                let j = arr[i].indexOf(dragSrcEl.innerHTML);
                dragSrcEl_i = i;
                dragSrcEl_j = j;
            }
        }
        // разрешает перетягивать только ближайшие к пустой ячейке
        let isDraggable = false;
        if (dragSrcEl_i != arr.length - 1 && arr[dragSrcEl_i + 1][dragSrcEl_j] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (arr[dragSrcEl_i][dragSrcEl_j + 1] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (arr[dragSrcEl_i][dragSrcEl_j - 1] == '' && e.target.innerHTML == '') {
            isDraggable = true;
        } else if (dragSrcEl_i != 0 && arr[dragSrcEl_i - 1][dragSrcEl_j] == '') {
            isDraggable = true;
        }

        // ничего не делает если подняли и опустили один и тот же элемент
        // или пытаемся перетянуть не ближайший к пустой ячейке элемент
        if (dragSrcEl != this && isDraggable) {
            if (e.target.innerHTML == '') {
                GemPuzzle.incrementMoves();
                dragSrcEl.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].indexOf('') != -1) {
                        let j = arr[i].indexOf('');
                    }
                }
                let q = 0;
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < arr.length; j++) {
                        arr[i][j] = GemPuzzle.cols[q].innerHTML;
                        q++;
                    }
                }
            }
        }
        return false;
    },

    handleClick(e) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].indexOf(e.target.innerHTML) != -1) {
                let j = arr[i].indexOf(e.target.innerHTML);
                // i j - позиция элемента на который кликнули
                if (i != arr.length - 1 && arr[i + 1][j] == '') {
                    arr[i + 1][j] = arr[i][j];
                    arr[i][j] = '';
                } else if (arr[i][j + 1] == '') {
                    arr[i][j + 1] = arr[i][j];
                    arr[i][j] = '';
                } else if (arr[i][j - 1] == '') {
                    arr[i][j - 1] = arr[i][j];
                    arr[i][j] = '';
                } else if (i != 0 && arr[i - 1][j] == '') {
                    arr[i - 1][j] = arr[i][j];
                    arr[i][j] = '';
                }
                GemPuzzle.incrementMoves();
                break;
            }
        }
        let q = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
                GemPuzzle.cols[q].innerHTML = arr[i][j];
                q++;
            }
        }
    },
};

GemPuzzle.init();
let dragSrcEl = null;
[].forEach.call(GemPuzzle.cols, function (col) {
    col.addEventListener('dragstart', GemPuzzle.handleDragStart, false);
    col.addEventListener('dragenter', GemPuzzle.handleDragEnter, false);
    col.addEventListener('dragover', GemPuzzle.handleDragOver, false);
    col.addEventListener('dragleave', GemPuzzle.handleDragLeave, false);
    col.addEventListener('drop', GemPuzzle.handleDrop, false);
    col.addEventListener('dragend', GemPuzzle.handleDragEnd, false);
    col.addEventListener('click', GemPuzzle.handleClick, false);
});
