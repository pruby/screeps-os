class Lock {
  constructor() {
    this.locked = false;
    this.waiting = [];
  }

  *lock() {
    if (this.locked) {
      var process = K.executing.process;
      this.waiting.push({process, sequence: process.sequence});
      yield* process._wait('lock');
    } else {
      this.locked = true;
    }
  }

  try() {
    if (this.locked) {
      return false;
    } else {
      this.locked = true;
      return true;
    }
  }

  unlock() {
    var waiter = this.waiting.pop();
    if (waiter) {
      waiter.process.wakeOnce(waiter.sequence);
    } else {
      this.locked = false;
    }
  }
}

module.exports = Lock;
