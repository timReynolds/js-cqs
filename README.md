TypeScript Command Query Separation Types
=========================

[![Build Status](https://travis-ci.org/timReynolds/js-cqs.svg?branch=master)](https://travis-ci.org/timReynolds/js-cqs)
[![Coverage Status](https://coveralls.io/repos/github/timReynolds/js-cqs/badge.svg?branch=master)](https://coveralls.io/github/timReynolds/js-cqs?branch=master)

Typescript declarations for the [Command query separation](https://martinfowler.com/bliki/CommandQuerySeparation.html) pattern.

CQS promotes the separation of methods that return and mutate state, put simply;

* Queries: Return a result and do not change the observable state of the system (are free of side effects).
* Commands: Change the state of a system but do not return a value

The main advantage of this pattern is the confidence it provides consumers on the effect each method has on your application state.

In practice most well structure services within the domain layer of a three tier application can easily be split into commands a queries. When doing so you'll the pattern can also provide the following benefits;

* Functions with explicate contracts are easy to decorate with cross cutting concerns
* Transaction or unit of work approaches can be applied only to command handlers
* Only commands must confirm to domain model, queries can be optimized for consumers

# Handlers

Regardless of it being the command or query channel semantically there are two main concepts.

* Handler, function that receives context to mutate or retrieve data
* Invoking context object, will be either a query or command

Below is a simple example to demonstrate the concepts.

## Command

```JS
const createStaffCommand = {
  firstName: 'Tim',
  lastName: 'Reynolds',
  role: 'Developer',
  email: 'tim@timothyreynolds.co.uk'
}
```

## Command Handler

```JS
const createStaffCommandHandler = async (command) => {
  validate(command);
  const newStaffMember = new Staff(command);
  await repository.create(newStaffMember);
  await publisher.publish(newStaffMember.events);
}
```

## Examples

### Building Handlers

Most handlers, command or query, will have dependencies e.g. repository. Injecting dependencies can easily be achieved while maintained the signature of the command by capturing them in a closure.

```JS
module.exports = connection => {
  const staffRepository = StaffRepository({connection});
  return {
    findAllStaffQueryHandler: findAllStaffQueryHandler({ staffRepository })
  };
};
```

This can be applied to one or many commands and abstracted out into builder functions based on the dependencies of the handler.

### Unit of work decoration for transactions safety including event publishing

When commands emit events or mutate data in more than one source you'll often want to ensure consistency via a transactional boundary. This is often a cross cutting concern and can be performed via closures.

```JS
// Take the dependencies then curry to return
// a function that has the same signature as the command
const unitOfWorkHandlerBuilder = (handler, connection, publisher) => command => {
  // When the handler is called, we'll then create a transaction
  // Mock publisher to store events until transaction is successful
  const unitOfWorkPublisher = unitOfWorkPublisherStubFactory();
  return connection.tx(txn => {
      // Recreate the dependencies that are transaction dependent
      const staffRepository = staffRepository({connection: txn});
      // Execute handler with dependencies and command
      return handler({staffRepository, publisher: unitOfWorkPublisher})(command);
    })
    // Move the events published inside the handler from mock to real publisher
    .tap(() => publisher.publish(unitOfWorkPublisher.getEventQueue()));
};
```
This approach leads to a complex builder but removes the transactional cross cutting concern from each handler. Other cross cutting concerns that can be tackled with this approach including logging query handler query and result.

## FAQ

### You mean CQRS? Isn't this CQRS?

Nope, Command Query Responsibility Segregation is a similar but different approach often accredited to Greg Young. Although the premise of each are similar the use of CQRS often promotes the decentralisation of the query model often in separate data stores designed to meet the needs of the query model often via messaging and eventual consistency.

### But I need my command handler to return data?

Often returning data from be avoided for two reasons.

* Firstly, mutated state is already held by the client or upstream so resolved/rejected is enough
* Secondly, if ids are required by the client or upstream for later operation they can create upstream when providing the new state.

There are still edge cases where this might not hold true so don't try to force it, there is an implementation where the command holds a ```Result``` property that can be called after command handler execution.

### Should I use CQS all the time?

Often, but not always. The overhead of using this pattern is low but works best with the domain model approach in a system when effort in modeling entities has been performed using DDD or similar.

Personally I promote these techniques in larger complex data heavy applications. Smaller micro-services or systems that don't deal with the persistence of data won't see the benefit.

### Where can I learn more?

Information about CQS is less discoverable than other software patterns. Martin Fowler provides a good overview on his [blog](https://martinfowler.com/bliki/CommandQuerySeparation.html)
