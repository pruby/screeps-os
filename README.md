# screeps-os

This is the core of my Screeps OS for public release. The idea is to structure Screeps code as a series of processes, which use generators
to allow them to sleep, and wait on certain conditions occurring. Most of my Screeps bot is private, but I've found having this useful so
thought I'd share.

## Files

 * main.js - Instantiates the global Kernel instance K, and launches the Init process. Calls the kernel tick function each loop.
 * os_kernel.js - Contains the Kernel class, which handles scheduling and calls each runnable process.
 * os_process.js - Contains the Process class, which acts as a base for processes. Extend from this and override _setup() and *_run() to implement processes.
 * util_heap.js - Contains the heap implementation used for scheduling.
 * util_sync_cond.js - Contains a condition variable implementation which will wake up waiting processes when triggered.

## Waking processes

Processes may wait on multiple sources at once, for example a whole series of conditions and a timeout. To ensure this works without waking multiple
times, each process has a "sequence" number. This must match when the condition was established for the process to wake, and it increments every
time the process wakes up. This invalidates any pre-existing records added to wait lists, without having to go through and actually remove them.
