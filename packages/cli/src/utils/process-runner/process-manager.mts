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
  }

  private cleanup(signal: string): void {
    console.log(`\nCleaning up processes (signal: ${signal})...`);
    this.processes.forEach((proc) => {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    this.processes.clear();
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
