# inserting document/s into a collection 
_we have three methods :_
- insertOne()

- insertMany()

- bulkWrite()


## insertOne 

### using insertOne method -> 

```js
example to insert one document to a collection:

db.collectionName.insertOne({name:"exampleName",age:25,gender:"M"})
```

- using insertOne method we can only insert one document at a time to a collection 
- we have to pass a document to the method 
- you can manage you own _id's or mongodb creates _id 
- if there is no collection with the name we intended to insert the data , mongodb will create a collection with that name and inserts data .



## insertMany

### using insertMany method -> 

```js
db.collectionName.insertMany([
    {name:"ram",age:20,gender:"male"},
    {name:"rashmika", gender:"female"},
    {name:"rahul",age:24}
]);
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









