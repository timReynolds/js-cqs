import { ICommandHandler, IQueryHandler } from "./index";

describe("Declaration examples", () => {
  test("Command handler", async () => {
    // Arrange
    interface ICreateSomethingCommand {
      test: string;
    }

    const exampleCommand: ICreateSomethingCommand = {
      test: "Hello"
    };

    const createExampleCommandHander: ICommandHandler<
      ICreateSomethingCommand
    > = command => Promise.resolve();
    // Act
    await expect(createExampleCommandHander(exampleCommand)).resolves // Assert
      .toEqual(undefined);
  });

  test("Query handler", async () => {
    // Arrange
    interface ISomethingQuery {
      testId: string;
    }

    interface IFooBarThingQueryResult {
      foo: string;
      bar: string;
    }

    const findTestByIdQueryHandler: IQueryHandler<
      ISomethingQuery,
      IFooBarThingQueryResult[]
    > = query => Promise.resolve(queryResult);

    const exampleQuery = {
      testId: "id"
    };

    const queryResult = [{ foo: "bar", bar: "foo" }];
    // Act
    await expect(findTestByIdQueryHandler(exampleQuery)).resolves // Assert
      .toEqual(queryResult);
  });
});
