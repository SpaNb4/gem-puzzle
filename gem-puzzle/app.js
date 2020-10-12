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
        // Target (this) element is the source node.
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    },

    handleDragEnd(e) {
        this.style.opacity = 1;
        // this/e.target is the source node.
        [].forEach.call(cols, function (col) {
            col.classList.remove('over');
        });
    },

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
        return false;
    },

    handleDragEnter(e) {
        // this / e.target is the current hover target.
        this.classList.add('over');
    },

    handleDragLeave(e) {
        this.classList.remove('over');  // this / e.target is previous target element.
    },

    handleDrop(e) {
        // this/e.target is current target element.
        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }

        //
        //// для отладки, перетянул 7 на 5 dragSrcEl=7, e=5;
        //
        console.log(e);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].indexOf(dragSrcEl.innerHTML) != -1) {
                let j = arr[i].indexOf(prev);
                arr[i][j] = this.innerHTML;
                i_del = i;
                j_del = j;
            }
        }

        // Don't do anything if dropping the same column we're dragging.
        if (dragSrcEl != this) {
            // Set the source column's HTML to the HTML of the columnwe dropped on.
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
                    if (arr[i][j] == e.target.innerHTML && (j_del!=j || i_del!=i)) {
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

