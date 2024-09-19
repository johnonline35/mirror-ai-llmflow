import Bottleneck from "bottleneck";

export class ConcurrencyService {
  /**
   * Executes tasks concurrently, enforcing a concurrency limit.
   * @param items - The list of items to process.
   * @param concurrencyLimit - The number of concurrent tasks to run.
   * @param taskFn - The task function to run for each item.
   * @param errorHandler - Optional error handler for handling task errors. Defaults to logging the error and returning null.
   * @returns An array of results from the task function.
   */
  async execute<T, R>(
    items: T[],
    concurrencyLimit: number,
    taskFn: (item: T) => Promise<R>,
    errorHandler: (item: T, error: any) => R | null = (item, error) => {
      console.error(`Error processing item: ${item}`, error);
      return null;
    }
  ): Promise<(R | null)[]> {
    const limiter = new Bottleneck({
      maxConcurrent: concurrencyLimit,
    });

    const promises = items.map((item) =>
      limiter
        .schedule(() => taskFn(item))
        .catch((error) => errorHandler(item, error))
    );

    return Promise.all(promises);
  }
}
