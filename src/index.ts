export type ICommandHandler<TCommand> = (command: TCommand) => Promise<void>;

export type IQueryHandler<TQuery, TResult> = (
  query: TQuery
) => Promise<TResult>;
