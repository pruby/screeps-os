const Kernel = require('os_kernel');
const Process = require('os_process');
const Init = require('proc_init');

const MIN_RUNTIME = 300;

K = new Kernel();
var init = new Init("init", "hello");
console.log(`Main starting in tick ${Game.time}`);

module.exports.loop = function() {
    if (Game.cpu.tickLimit >= MIN_RUNTIME) {
        K.tick();
    } else {
        console.log("Lost tick due to low CPU bucket");
    }

    if (Game.cpu.bucket >= 9000) {
        Game.cpu.generatePixel()
    }
};
