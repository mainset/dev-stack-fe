import { type ChildProcess } from 'child_process';

import { initProcessCatchErrorLogger } from './process-runner.mjs';

class ProcessManager {
  private static instance: ProcessManager;
  private processes: Set<ChildProcess>;

  private constructor() {
    this.processes = new Set();
    this.setupCleanupHandlers();
  }

  static getInstance(): ProcessManager {
    ProcessManager.instance ||= new ProcessManager();
    return ProcessManager.instance;
  }

  private setupCleanupHandlers(): void {
    process.on('SIGINT', () => this.cleanup('SIGINT'));
    process.on('SIGTERM', () => this.cleanup('SIGTERM'));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.cleanup('uncaughtException');
    });
    // NOTE: covers every other way out — {runStreamingCommand} exiting because
    // ONE child exited (e.g. the SSR server failed to bind its port), an
    // unhandled rejection, a plain {process.exit()}. Without it the remaining
    // children (e.g. {webpack --watch}) outlived this process, detached from
    // any terminal and still writing into {dist}.
    process.on('exit', () => this.killTrackedProcesses());
  }

  private killTrackedProcesses(): void {
    this.processes.forEach((proc) => {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    this.processes.clear();
  }

  private cleanup(signal: string): void {
    console.log(`\nCleaning up processes (signal: ${signal})...`);
    this.killTrackedProcesses();
    process.exit();
  }

  trackProcess(proc: ChildProcess): void {
    this.processes.add(proc);

    proc.on('exit', () => {
      this.processes.delete(proc);
    });

    proc.on('error', (error) => {
      initProcessCatchErrorLogger('ProcessManager.trackProcess', error);
      this.processes.delete(proc);
    });
  }

  getRunningProcessesCount(): number {
    return this.processes.size;
  }
}

const processManager = ProcessManager.getInstance();

export { processManager };
