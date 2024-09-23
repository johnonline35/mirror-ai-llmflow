export interface Task<TInput = string, TOutput = string> {
  run(input: TInput): Promise<TOutput>;
}
