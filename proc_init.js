const Process = require('os_process');

class Init extends Process {
  _setup(a) {
    console.log(`Init starting: ${a}`);
    Game.cpu.pathfinding = 0;
    this.startProcesses();
  }

  startProcesses() {
    // ...
  }

  *_run() {
    while(true) {
      for (var k of Object.keys(Memory.creeps)) {
        if (!(k in Game.creeps)) {
          delete Memory.creeps[k];
        }
      }
      yield* this._sleep(300);
    }
  }
}

module.exports = Init;
