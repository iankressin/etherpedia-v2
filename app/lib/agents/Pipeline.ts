type PipeLineTask = (userPrompt: string) => Promise<string>;
type StepCallback = (output: string) => Promise<void> | void;

export class Pipeline {
  private tasks: PipeLineTask[] = [];
  private stepCallbacks: (StepCallback | undefined)[] = [];

  constructor(tasks: PipeLineTask[] = []) {
    this.tasks = tasks;
  }

  public push(task: PipeLineTask, stepCallback?: StepCallback) {
    let newLength = this.tasks.push(task);
    this.stepCallbacks[newLength - 1] = stepCallback;
    return this;
  }

  public async run(initialInput: string): Promise<string> {
    let lastTaskResult = initialInput;

    for (let index = 0; index < this.tasks.length; index++) {
      lastTaskResult = await this.tasks[index](lastTaskResult);

      // TODO: this await can increase the waiting time to the article.
      // Maybe we shoud run the stepCallbacks in "parallel" with the tasks.
      await this.stepCallbacks[index]?.(lastTaskResult);
    }

    return lastTaskResult;
  }
}
