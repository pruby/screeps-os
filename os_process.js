const Cond = require('util_sync_cond')

class Process {
  constructor(name) {
    this.name = name;
    K.addProcess(this);
    this.state = "run";
    this.generator = this._sys_run();
    this.completed = new Cond({oneShot: true});
    this.error = null;
    this.sequence = 0;
    this.arguments = Array.prototype.slice.call(arguments, 1);
    this.runTime = 0;
    this.startTime = Game.time;
    // Eager-run the initialisation phase
    K.resume(this);
  }

  *_sys_run() {
    console.log(`Process ${this.name} starting`);
    this._setup.apply(this, this.arguments);
    yield* this._defer();
    yield* this._run();
    yield* this._halt();
  }

  // Default implementation does nothing
  _setup() {}
  *_run() {}

  *_defer() {
    K.enqueueRunnable(this);
    yield true;
    this.sequence += 1;
  }

  *_wait(reason) {
    this.state = `wait (${reason})`;
    yield true;
    this.sequence += 1;
  }

  *_waitUntil(t) {
    K.scheduleRunnable(this, t);
    this.state = "sleep";
    yield true;
    this.sequence += 1;
  }

  *_sleep(t) {
    t = Game.time + t;
    K.scheduleRunnable(this, t);
    this.state = "sleep";
    yield true;
    this.sequence += 1;
  }

  *_halt() {
    this.state = "stop";
    console.log(`Process ${this.name} stopped`);
    this.completed.signal();
    K.removeProcess(this);
    yield true;
  }

  *_cooperate() {
    var used = Game.cpu.getUsed();
    if (used >= K.executing.allowance + K.executing.started) {
      yield* this._defer();
    }
  }

  isStopped() {
    return this.state === 'stop';
  }

  wake() {
    this.sequence += 1;
    this.state = "run";
    K.enqueueRunnable(this);
  }

  wakeOnce(sequence) {
    if (sequence === this.sequence) {
      this.wake();
    }
  }

  kill() {
    this.sequence += 1; // Invalidate wake triggers
    this.state = "stop";
    console.log(`Process ${this.name} killed`);
    this.completed.signal();
  }
}

module.exports = Process;
