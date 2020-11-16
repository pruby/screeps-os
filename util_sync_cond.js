class Cond {
  constructor(opts) {
    if (!opts) {
      opts = {};
    }
    this.waiting = [];
    this.triggered = false;
    this.oneShot = opts.oneShot ? true : false;
  }

  *wait(timeout) {
    if (!this.triggered || !this.oneShot) {
      var process = K.executing.process;
      this.waiting.push({process, sequence: process.sequence});
      if (timeout) {
        var t = Game.time + timeout;
        K.scheduleRunnable(process, t);
      }
      yield* process._wait('cond');
    }
  }

  signal() {
    this.triggered = true;
    var waiter;
    while (waiter = this.waiting.pop()) {
      waiter.process.wakeOnce(waiter.sequence);
    }
  }
}

Cond.wait_any = function*(conditions, timeout) {
  var already = false;
  for (var cond of conditions) {
    if (cond.triggered && cond.oneShot) {
      already = true;
    }
  }

  if (!already) {
    var process = K.executing.process;
    for (var cond of conditions) {
      cond.waiting.push({process, sequence: process.sequence});
    }
    if (timeout) {
      var t = Game.time + timeout;
      K.scheduleRunnable(process, t);
    }
    yield* process._wait('cond');
  }
}

Cond.wait_all = function*() {
  for (var cond of arguments) {
    yield* cond.wait();
  }
}

module.exports = Cond;
