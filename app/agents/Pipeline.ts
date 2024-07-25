type PipeLineTask = (userPrompt: string) => Promise<string>;

export class Pipeline {
  private tasks: PipeLineTask[] = [];

  constructor(tasks: PipeLineTask[] = []) {
    this.tasks = tasks;
  }

  public push(task: PipeLineTask) {
    this.tasks.push(task);
    return this;
  }

  public async run(initialInput: string): Promise<string> {
    let lastTaskResult = initialInput;

    for (const task of this.tasks) {
      lastTaskResult = await task(lastTaskResult);
    }

    return lastTaskResult;
  }
}
