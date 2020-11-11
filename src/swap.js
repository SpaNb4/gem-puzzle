export function swapCell(target, _i, _j) {
    let posEmptyEl;
    const trg = target;

    posEmptyEl = this.size - 1;

    const temp = trg.style.order;
    trg.style.order = this.cols[posEmptyEl].style.order;
    this.cols[posEmptyEl].style.order = temp;

    this.arr[rowPos(this.cols[posEmptyEl], this)][colPos(this.cols[posEmptyEl], this)] = '';

    this.arr[rowPos(target, this)][colPos(target, this)] = target.innerHTML;

    if (this.movesArr.length == 0) {
        this.movesArr.push([Math.sqrt(this.size) - 1, Math.sqrt(this.size) - 1]);
    }
    if (target.innerHTML !== '') {
        this.movesArr.push([_i, _j]);
    }
}

export function rowPos(target, gem) {
    let rowPosition;

    const size = Math.sqrt(gem.size);
    if (target.style.order % size === 0) {
        rowPosition = Math.floor(target.style.order / size) - 1;
    } else {
        rowPosition = Math.floor(target.style.order / size);
    }
    return rowPosition;
}

export function colPos(target, gem) {
    let colPosition;

    const size = Math.sqrt(gem.size);
    if (target.style.order % size === 0) {
        colPosition = size;
    } else {
        colPosition = target.style.order % size;
    }
    return colPosition - 1;
}

export function checkNextEl(i, j, target, isRandom) {
    if (i !== this.arr.length - 1 && this.arr[i + 1][j] === '') {
        swapCell.call(this, target, i, j);
        if (!isRandom) {
            this.incrementMoves();
        }
    } else if (this.arr[i][j + 1] === '') {
        swapCell.call(this, target, i, j);
        if (!isRandom) {
            this.incrementMoves();
        }
    } else if (this.arr[i][j - 1] === '') {
        swapCell.call(this, target, i, j);
        if (!isRandom) {
            this.incrementMoves();
        }
    } else if (i !== 0 && this.arr[i - 1][j] === '') {
        swapCell.call(this, target, i, j);
        if (!isRandom) {
            this.incrementMoves();
        }
    }
}