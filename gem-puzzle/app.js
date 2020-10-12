let arr = [];

const GemPuzzle = {
    number: 9,

    init() {
        let container = document.createElement('div');
        container.classList.add('container');

        let main = document.createElement('div');
        main.classList.add('cells_items');

        let cells_item_width = 100 / Math.sqrt(this.number);
        for (let i = 1; i < this.number; i++) {
            let cells_item = document.createElement('div');
            cells_item.classList.add('cells_item');
            cells_item.style.cssText = `width: calc(${cells_item_width}% - 10px)`;
            cells_item.setAttribute('draggable', true);
            cells_item.innerHTML = i;
            main.appendChild(cells_item);
        }

        // создаём пустой последний элемент
        cells_item = document.createElement('div');
        cells_item.classList.add('cells_item');
        cells_item.style.cssText = `width: calc(${cells_item_width}% - 10px)`;
        cells_item.setAttribute('draggable', true);
        cells_item.innerHTML = '';

        main.appendChild(cells_item);
        container.appendChild(main);
        document.body.appendChild(container);

        let cols = document.querySelectorAll('.cells_item');
        let q = 0;
        for (let i = 0; i < Math.sqrt(this.number); i++) {
            arr[i] = [];
            for (let j = 0; j < Math.sqrt(this.number); j++) {
                arr[i][j] = cols[q].innerHTML;
                q++
            }
        }
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
        [].forEach.call(cols, function (col) {
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
                dragSrcEl_j = j
            }
        }

        // разрешает перетягивать только ближайшие к пустой ячейке 
        let bool = false;
        if (dragSrcEl_i != arr.length - 1) {
            if (arr[dragSrcEl_i + 1][dragSrcEl_j] == '' && e.target.innerHTML == '') {
                bool = true;
            }
        }
        if (arr[dragSrcEl_i][dragSrcEl_j + 1] == '' && e.target.innerHTML == '') {
            bool = true;
        }
        if (arr[dragSrcEl_i][dragSrcEl_j - 1] == '' && e.target.innerHTML == '') {
            bool = true;
        }
        if (arr[dragSrcEl_i - 1][dragSrcEl_j] == '' && e.target.innerHTML == '') {
            bool = true;
        }

        // ничего не делает если подняли и опустили один и тот же элемент
        // или пытаемся перетянуть не ближайший к пустой ячейке элемент
        if (dragSrcEl != this && bool) {
            dragSrcEl.innerHTML = this.innerHTML;
            let prev = e.target.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
            let i_del = 0;
            let j_del = 0;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].indexOf(prev) != -1) {
                    let j = arr[i].indexOf(prev);
                    arr[i][j] = this.innerHTML;
                    i_del = i;
                    j_del = j;
                }
            }

            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length; j++) {
                    if (arr[i][j] == e.target.innerHTML && (j_del != j || i_del != i)) {
                        arr[i][j] = '';
                        break;
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
                console.log(i + ' ' + j);
                if (i != arr.length - 1) {
                    if (arr[i + 1][j] == '') {
                        for (let n = 0; n < cols.length; n++) {
                            if (cols[n].innerHTML == '') {
                                cols[n].innerHTML = e.target.innerHTML;
                            }
                        }
                        arr[i + 1][j] = e.target.innerHTML;
                        arr[i][j] = '';
                        e.target.innerHTML = '';
                    }
                }
                if (arr[i][j + 1] == '') {
                    for (let n = 0; n < cols.length; n++) {
                        if (cols[n].innerHTML == '') {
                            cols[n].innerHTML = e.target.innerHTML;
                        }
                    }
                    arr[i][j + 1] = e.target.innerHTML;
                    arr[i][j] = '';
                    e.target.innerHTML = '';
                }
                if (arr[i][j - 1] == '') {
                    for (let n = 0; n < cols.length; n++) {
                        if (cols[n].innerHTML == '') {
                            cols[n].innerHTML = e.target.innerHTML;
                        }
                    }
                    arr[i][j - 1] = e.target.innerHTML;
                    arr[i][j] = '';
                    e.target.innerHTML = '';
                }
                if (arr[i - 1][j] == '') {
                    for (let n = 0; n < cols.length; n++) {
                        if (cols[n].innerHTML == '') {
                            cols[n].innerHTML = e.target.innerHTML;
                        }
                    }
                    arr[i - 1][j] = e.target.innerHTML;
                    arr[i][j] = '';
                    e.target.innerHTML = '';
                }
            }

        }

    },

}

GemPuzzle.init();
var cols = document.querySelectorAll('.cells_item');
var dragSrcEl = null;
[].forEach.call(cols, function (col) {
    col.addEventListener('dragstart', GemPuzzle.handleDragStart, false);
    col.addEventListener('dragenter', GemPuzzle.handleDragEnter, false);
    col.addEventListener('dragover', GemPuzzle.handleDragOver, false);
    col.addEventListener('dragleave', GemPuzzle.handleDragLeave, false);
    col.addEventListener('drop', GemPuzzle.handleDrop, false);
    col.addEventListener('dragend', GemPuzzle.handleDragEnd, false);
    col.addEventListener('click', GemPuzzle.handleClick, false);
});

