class Heap {
  constructor(cmp, prior) {
    this.compare = cmp;
    if (prior) {
      this.list = Array.from(prior);
      for (var i = 0; i < this.list.length; i++) {
        this._bubbleUp(i);
      }
    } else {
      this.list = [];
    }
  }

  _bubbleUp(i) {
    if (i == 0) {
      return;
    }
    var parent = Math.floor((i - 1) / 2);
    if (this.compare(this.list[i], this.list[parent])) {
      this._swap(parent, i);
      this._bubbleUp(parent);
    }
  }

  _siftDown(i) {
    if (i >= this.list.length) {
      return;
    }
    var child1 = i * 2 + 1;
    var child2 = i * 2 + 2;
    if (this.list.length > child2) {
      if (this.compare(this.list[child1], this.list[i])) {
        if (this.compare(this.list[child1], this.list[child2])) {
          // Swap with child 2
          this._swap(i, child1);
          this._siftDown(child1);
        } else {
          // Swap with child 1
          this._swap(i, child2);
          this._siftDown(child2);
        }
      } else if (this.compare(this.list[child2], this.list[i])) {
        // Swap with child 2
        this._swap(i, child2);
        this._siftDown(child2);
      }
    } else if (this.list.length > child1) {
      if (this.compare(this.list[child1], this.list[i])) {
        this._swap(i, child1);
      }
    }
  }

  _swap(i, j) {
    var t = this.list[i];
    this.list[i] = this.list[j];
    this.list[j] = t;
  }

  push(v) {
    this.list.push(v);
    this._bubbleUp(this.list.length - 1);
  }

  pop() {
    var v = this.list[0];
    if (this.list.length > 1) {
      this.list[0] = this.list.pop();
      this._siftDown(0);
    } else {
      this.list.pop(); // empty
    }
    return v;
  }

  peek() {
    return this.list[0];
  }

  get length() {
    return this.list.length;
  }

  empty() {
    return this.list.length == 0;
  }

  clone() {
    var copy = new Heap(this.compare);
    copy.list = [...this.list];
    return copy;
  }

  *each() {
    while (this.list.length > 0) {
      yield this.pop()
    }
  }
}

module.exports = Heap;
