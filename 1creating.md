# inserting document/s into a collection 
_we have three methods :_
- insertOne()

- insertMany()

- bulkWrite()


## insertOne 

### using insertOne method -> 


syntax :

```js

db.collection.insertOne(
  <document>,
  {
    writeConcern: <document>,
    bypassDocumentValidation: <boolean>,
    comment: <string>
  }
)

```
### writeConcern (document):
Once upon a time, databases were naive. A command like remove() would delete data as soon as it could, and declare victory. But what if the server crashed before writing to disk? Or before informing replicas? Or before ensuring the change was permanent?

_That’s where writeConcern was born_

writeConcern is like a gauranty that , the command was executed successfully in most of replica sets and servers,
writeConcern consists of 3 things :
- w (write quorum) : How many nodes must see this deletion? :
    - "majority" → Make sure most of the replica set saw it.

    - 1 → Just the primary is enough.

- j (journaling) : Should this deletion be on disk, not just in memory ? :
    - true → Wait till it’s physically journaled to disk.

    - false → It’s enough if it’s in RAM.

- wtimeout : “How long are you willing to wait for this confirmation?”
    - 5000 means, “I’ll wait 5 seconds, then assume failure if it’s still pending.” 

| Concept         | Meaning                               | Analogy                                     |
| --------------- | ------------------------------------- | ------------------------------------------- |
| `w: "majority"` | Require quorum of nodes               | “Most teammates saw it”                     |
| `j: true`       | Ensure data is written to disk        | “Put it in a physical notebook”             |
| `wtimeout`      | Time limit for getting a confirmation | “If they don’t reply in 5s, assume failure” |


typical writeConcern document example :

```js
{ w: "majority", j: true, wtimeout: 5000 }

```

### bypassDocumentValidation :

When you define a schema validation rule for your collection (like with $jsonSchema), MongoDB will check that all inserted documents comply.

Set this to true to skip those checks for the current operation


```js
db.users.insertOne(
  { username: "admin", role: "superuser" },
  { bypassDocumentValidation: true }
)
```

⚠️ Warning:
Skipping validation is dangerous unless used by internal tools or migration scripts. Do not use in public-facing routes unless controlled.




### comment :
The comment field allows you to attach a custom string to the operation. This shows up in logs and monitoring tools.

Use it to trace, audit, or debug operations

example :

```js
db.users.insertOne(
  { name: "Aarav" },
  { comment: "User registration from India region" }
)
```
| Use Case                       | Example Comment                    |
| ------------------------------ | ---------------------------------- |
| Monitoring specific operations | `"inserting high-value customer"`  |
| Debugging API flow             | `"insert from /register endpoint"` |
| Performance audit              | `"batch insert check"`             |



```js
example to insert one document to a collection:

db.students.insertOne(
  {
    name: "Ishita",
    age: 22,
    dept: "Physics"
  },
  {
    writeConcern: { w: "majority", j: true },
    bypassDocumentValidation: false,
    comment: "student registration form"
  }
)

```

- using insertOne method we can only insert one document at a time to a collection 
- we have to pass a document to the method 
- you can manage you own _id's or mongodb creates _id 
- if there is no collection with the name we intended to insert the data , mongodb will create a collection with that name and inserts data .



## insertMany

### using insertMany method -> 
syntax :
```js
db.collection.insertMany(
  [ <document1>, <document2>, ... ],
  {
    ordered: <boolean>,
    writeConcern: <document>,
    bypassDocumentValidation: <boolean>,
    comment: <string>
  }
)
```

### ordered : boolean 
default value is true for ordered property 

| Setting | Meaning                                              | Default |
| ------- | ---------------------------------------------------- | ------- |
| `true`  | Stops at the **first error** (like transaction mode) | ✅ Yes   |
| `false` | **Continues** even if some inserts fail              | ❌ No    |


writeConcern , bypassDocumentation , comment is same as insertOne method 


```js
db.users.insertMany(
  [
    {
      name: "Aarav",
      email: "aarav@example.com",
      country: "India",
      age: 22
    },
    {
      name: "Sofia",
      email: "sofia@example.com",
      country: "Spain",
      age: 29
    },
    {
      name: "Li Wei",
      email: "liwei@example.com",
      country: "China",
      age: 25
    }
  ],
  {
    ordered: false,  // Even if one document fails, insert the rest
    writeConcern: {
      w: "majority", // Wait until majority of replica set confirms
      j: true        // Confirm write has been committed to journal
    },
    bypassDocumentValidation: false, // Enforce schema validation
    comment: "Bulk user import from marketing signup" // Helpful for monitoring/log tracing
  }
)

```

- using insertMany we can pass multiple documents at a time 
- we have to pass array as argument to the insertMany method
- where array should consists of multiple documents which are seperated by comma 
- each document can have different structure / schema / fields or same as you can see above
- all are of different fields of documents 



## bulkWrite() :

n this guide, you can learn how to use the Node.js driver to perform bulk operations. Bulk operations help reduce the number of calls to the server. Instead of sending a request for each operation, you can perform multiple operations within one action

You can also run bulk operations from the client, which allows you to perform bulk writes across multiple namespaces. In MongoDB, a namespace consists of the database name and the collection name in the format <database>.<collection>.

```js
const insertModels = [{
    insertOne: {
        document: {
            title: "The Favourite",
            year: 2018,
            rated: "R",
            released: "2018-12-21"
        }
    }
}, {
    insertOne: {
        document: {
            title: "I, Tonya",
            year: 2017,
            rated: "R",
            released: "2017-12-08"
        }
    }
}];

const insertResult = await movies.bulkWrite(insertModels);
console.log(`Inserted documents: ${insertResult.insertedCount}`);
```









