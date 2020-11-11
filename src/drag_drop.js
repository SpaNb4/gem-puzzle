import { checkNextEl } from './swap.js';

export function handleDragStart(e) {
    e.target.style.opacity = '0.4';
    this.dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

export function handleDragEnd(e) {
    // удаляем класс со всех элементов
    e.target.style.opacity = 1;
    [].forEach.call(this.cols, (col) => {
        col.classList.remove('over');
    });
}

export function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

export function handleDragEnter() {
    // добавляем класс для текущего элемента
    this.classList.add('over');
}

export function handleDragLeave() {
    // удаляем класс с предыдущего элемента
    this.classList.remove('over');
}

export function handleDrop(e) {
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
        checkNextEl.call(this, dragSrcElI, dragSrcElJ, this.dragSrcEl);
        this.moveSound();
    }
}
