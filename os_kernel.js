const RUN_ALLOWANCE = 50;
const RUN_MARGIN = 100;
const Heap = require('util_heap');

function escapeHtml(unsafe) {
    if (typeof(unsafe) === 'undefined') {
      unsafe = "";
    }
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

class Kernel {
  constructor() {
    this.processes = {};
    this.runnable = [];
    this.scheduled = new Heap((a, b) => (a.time < b.time));
    this.executing = {process: null, until: 0};
  }

  tick() {
    var t = Game.time;
    Game.cpu.pathfinding = 0;
    while (!this.scheduled.empty() && this.scheduled.peek().time <= t) {
      var nextEntry = this.scheduled.pop();
      this.runnable.push(nextEntry);
    }

    while (Game.cpu.getUsed() < Game.cpu.tickLimit - RUN_ALLOWANCE - RUN_MARGIN && this.runnable.length > 0) {
      var nextEntry = this.runnable.shift();
      if (nextEntry && nextEntry.sequence === nextEntry.process.sequence) {
        this.resume(nextEntry.process, RUN_ALLOWANCE);
      }
    }

    // In my implementation, these must run last, suspend themselves every tick...
    // this.resume(this.processes.creep_control, RUN_ALLOWANCE);
    // this.resume(this.processes.stats, RUN_ALLOWANCE);
  }

  addProcess(process) {
    this.processes[process.name] = process;
  }

  removeProcess(process) {
    delete this.processes[process.name];
  }

  resume(process, allowance) {
    var previous = K.executing;
    K.executing = {process: process, allowance: previous.allowance, started: Game.cpu.getUsed()};
    if (allowance) {
      K.executing.allowance = allowance;
    }
    var begin = Game.cpu.getUsed();
    process.generator.next();
    var ret = Game.cpu.getUsed();
    process.runTime += (ret - begin);
    K.executing = previous;
  }

  enqueueRunnable(process) {
    this.runnable.push({process, sequence: process.sequence});
  }

  scheduleRunnable(process, t) {
    this.scheduled.push({process, sequence: process.sequence, time: t})
  }

  ps(sort) {
    var processes = Object.values(this.processes);
    switch(sort) {
      case "runTime":
        processes = _.sortBy(processes, (p) => -p.runTime);
        break;
      case "perTick":
        processes = _.sortBy(processes, (p) => -(p.runTime / (Game.time - p.startTime + 1)));
        break;
      case "started":
      default:
        processes = _.sortBy(processes, (p) => p.startTime);
        break;
    }

    var output = "<table style=\"border-spacing: 8px 2px; border-collapse: separate;\"><tr><th>Process</th><th>Status</th><th>Total Runtime</th><th>Per Tick</th></tr>";
    for (var proc of processes) {
      var runtime = proc.runTime;
      var perTick = runtime / (Game.time - proc.startTime + 1);
      output += `<tr><td>${escapeHtml(proc.name)}</td><td>${escapeHtml(proc.state)}</td>`
        + `<td>${runtime.toFixed(2)}</td><td>${perTick.toFixed(3)}</td></tr>`;
    }
    output += "</table>";
    console.log(output);
  }
}

module.exports = Kernel;
