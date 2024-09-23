import { Task } from "./task.interface";

export class TaskFlow<TInput = string, TMid = string, TOutput = string>
  implements Task<TInput, TOutput>
{
  constructor(
    private task1: Task<TInput, TMid>,
    private task2: Task<TMid, TOutput>
  ) {}

  async run(input: TInput): Promise<TOutput> {
    const result1 = await this.task1.run(input);
    return this.task2.run(result1);
  }
}
