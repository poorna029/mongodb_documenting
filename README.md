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





# finding or fetching documents from collection 

## find method 
- will fetch all the documents from a collection 
- The find() method returns a Cursor instance
- You can print the documents retrieved using the for await...of syntax as shown below
```js
    const findResult = orders.find({
        name: "Lemony Snicket",
        date: {
            $gte: new Date(new Date().setHours(00, 00, 00)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
        },
    });

    for await (const doc of findResult) {
        console.log(doc);
    }


    ouptput : 
    [
  { name: "Lemony Snicket", type: "horseradish pizza", qty: 1, status: "delivered", date: ... },
  { name: "Lemony Snicket", type: "coal-fired oven pizza", qty: 3, status: "canceled", date: ...},
  ...
]


```

- to filter the documents based on our requirement we have to 
- pass filter object or condition , returns documents if the condition is satisfied 

```js 
db.collectionName.find({gender:"male"})

db.collectionName.find() and db.collectionName.find({}) both are same ,
they fetch all documents within the collection 

```

## findOne method 
- will fetch first document from the collection ,if no match returns null 
- The findOne() method returns a Promise instance

- to filter the documents based on our requirement we have to 
- pass filter object or condition
- but returns first document , even though multiple documents satisfies the condition 



## sort , limit , skip , projection 

- **sort()**: Specifies the sort order for the returned documents.

- **limit()**: Specifies the maximum number of documents to return from a query.

- **skip()**: Specifies the number of documents to skip before returning query results.


## sort

``` js
const query ={}
const sortFields = { fieldName: -1 };
myColl.find(query).sort(sortFields);
```

- To sort returned documents by a field in ascending (lowest first) order, use a value of 1. 
- To sort in descending (greatest first) order instead, use -1

## skip 

```js 
const query ={}
const sortFields = { length: -1 };
const skipNum = 4;
myColl.find(query).sort(sortFields).skip(skipNum);


```

- omits the first 'N' matching documents from the result
- skip along with sort() is used to omit the top (for descending order)
or bottom (for ascending order) results for a given query

**Note** : it is not mandatory to use sort but it will effect the order of documents , 
use sort if order matters to you 





## limit 

- This method specifies the maximum number of documents that the operation can return,
but the operation can return a smaller number of documents if there are 
not enough documents present to reach the limit

```js 
const query = {};
// sort in descending (-1) order by length
const sortFields = { length: -1 };
const limitNum = 3;
const cursor = myColl.find(query).sort(sortFields).limit(limitNum);
``` 

## projection 

```js
// return only* the name field
const projectFields = { name: 1 };
const cursor = myColl.find().project(projectFields);
for await (const doc of cursor) {
  console.dir(doc);
}
output :
{ "_id": 1, "name": "apples" }
{ "_id": 2, "name": "bananas" }
{ "_id": 3, "name": "oranges" }
{ "_id": 4, "name": "avocados" }
```

```js 
// return only the name field
const projectFields = { _id: 0, name: 1 };
const cursor = myColl.find().project(projectFields);
for await (const doc of cursor) {
  console.dir(doc);
}
output :
{ "name": "apples" }
{ "name": "bananas" }
{ "name": "oranges" }
{ "name": "avocados" }
```

## Literal Value Queries :

- Literal value queries allow you to query for data that exactly matches a value you provide in the query document
- A literal value query has two parts: a field name and a value
- you have to follow { fieldName : value } pattern  as shown in below example 
```js 
const query = { "name": "apples" };
const cursor = myColl.find(query);
for await (const doc of cursor) {
  console.dir(doc);
}
output : 
{ "_id": 1, "name": "apples", "qty": 5, "rating": 3 }
```

**Note** Literal Value queries are equivalent to $eq comparator , As a result, the following two queries are equivalent:

```js
myColl.find({
   rating: { $eq: 5 }
});

or 

myColl.find({
   rating: 5
});

```

## Comparison Operators 

Comparison operators allow you to query for data based on comparisons with values in a collection. Common comparison operators include $gt for "greater than" comparisons, $lt for "less than" comparisons, and $ne for "not equal to" comparisons. The following operation uses the comparison operator $gt to search for documents in which the qty field value is greater than 5 and prints them out:


| Name   | Description |
|--------|-------------|
| `$eq`  | Matches values that are equal to a specified value. |
| `$gt`  | Matches values that are greater than a specified value. |
| `$gte` | Matches values that are greater than or equal to a specified value. |
| `$in`  | Matches any of the values specified in an array. |
| `$lt`  | Matches values that are less than a specified value. |
| `$lte` | Matches values that are less than or equal to a specified value. |
| `$ne`  | Matches all values that are not equal to a specified value. |
| `$nin` | Matches none of the values specified in an array. |




```js
// $gt means "greater than"
const query = { qty: { $gt : 5 } };
const cursor = myColl.find(query);
for await (const doc of cursor) {
  console.dir(doc);
}
``` 

## Logical operators 

Logical operators allow you to query for data using logic applied to the results of field-level operators. For instance, you can use the $or method to query for documents that match either a $gt comparison operator or a literal value query. The following operation uses the logical operator **_$not_** to search for documents with a quantity value that is not greater than 5 and prints them out:

| Name  | Description |
|-------|-------------|
| `$and` | Joins query clauses with a logical AND; returns all documents that match the conditions of both clauses. |
| `$not` | Inverts the effect of a query predicate and returns documents that do not match the query predicate. |
| `$nor` | Joins query clauses with a logical NOR; returns all documents that fail to match both clauses. |
| `$or`  | Joins query clauses with a logical OR; returns all documents that match the conditions of either clause. |


```js
const query = { qty: { $not: { $gt: 5 }}};
const cursor = myColl.find(query);
for await (const doc of cursor) {
  console.dir(doc);
}

output :
{ "_id": 4, "name": "avocados", "qty": 3, "rating": 5 }
{ "_id": 1, "name": "apples", "qty": 5, "rating": 3 }
```


**Note**
Whenever a query document contains multiple elements, those elements are combined together with an implicit **_$and_** logical operator to figure out which documents match the query. As a result, the following two queries are equivalent:

```js
myColl.find({
  rating: { $eq: 5 },
  qty: { $gt: 4 }
});
, 
myColl.find({
  $and: [
     { rating: { $eq: 5 }},
     { qty: { $gt: 4 }}
  ]
});
```

## Element Operators

Element operators allow you to query based on the presence, absence, or type of a field. The following operation uses the element operator $exists to search for documents containing the **_color_** field:

```js
const query = { color: { $exists: true } };
const cursor = myColl.find(query);
for await (const doc of cursor) {
  console.dir(doc);
}
```




## Evaluation Operators
Evaluation operators allow you to execute higher level logic, like regex and text searches, when querying for documents in a collection. Common evaluation operators include $regex and $text. The following operation uses the evaluation operator _**$mod**_ to search for documents in which the qty field value is divisible by 3 with a remainder of 0:

```js
// $mod means "modulo" and returns the remainder after division
const query = { qty: { $mod: [ 3, 0 ] } };
const cursor = myColl.find(query);
for await (const doc of cursor) {
  console.dir(doc);
}

output :
{ "_id": 3, "name": "oranges", "qty": 6, "rating": 2 }
{ "_id": 4, "name": "avocados", "qty": 3, "rating": 5 }
```

## Count Documents 
Overview
In this guide, you can learn how to count the number of documents in your MongoDB collections. The Node.js driver provides two methods for counting documents in a collection:

**collection.countDocuments()** returns the number of documents in the collection that match the specified query. If you specify an empty query document, countDocuments() returns the total number of documents in the collection.

**collection.estimatedDocumentCount()** returns an estimation of the number of documents in the collection based on collection metadata.

_**Note**_
estimatedDocumentCount() is faster than countDocuments() because the estimation uses the collection's metadata rather than scanning the collection. In contrast, countDocuments() takes longer to return, but provides an *accurate* count of the number of documents

**Tip**

You can improve performance when using countDocuments() to return the total number of documents in a collection by avoiding a collection scan. To do this, use a hint to take advantage of the built-in index on the _id field. Use this technique only when calling countDocuments() with an empty query parameter.

```js
collection.countDocuments({}).hint("_id");
``` 

## Retrieve Distinct Values 
Overview
Use the distinct() method to retrieve all distinct values for a specified field across a collection.

Sample Documents
To follow the examples in this guide, use the following code snippet to insert documents that describe restaurants into the myDB.restaurants collection:
```js
const myDB = client.db("myDB");
const myColl = myDB.collection("restaurants");

await myColl.insertMany([
  { "_id": 1, "restaurant": "White Bear", "borough": "Queens", "cuisine": "Chinese" },
  { "_id": 2, "restaurant": "Via Carota", "borough": "Manhattan", "cuisine": "Italian" },
  { "_id": 3, "restaurant": "Borgatti's", "borough": "Bronx", "cuisine": "Italian" },
  { "_id": 4, "restaurant": "Tanoreen", "borough": "Brooklyn", "cuisine": "Middle Eastern" },
  { "_id": 5, "restaurant": "Äpfel", "borough": "Queens", "cuisine": "German" },
  { "_id": 6, "restaurant": "Samba Kitchen", "borough": "Manhattan", "cuisine": "Brazilian" },
]);


// specify "borough" as the field to return values for
const cursor = myColl.distinct("borough");
for await (const doc of cursor) {
  console.dir(doc);
}

output :
[ "Bronx", "Brooklyn", "Manhattan", "Queens" ]

``` 

### Document Field Parameter :
```js 
//specify "borough" as the field to return distinct values for 
const cursor = myColl.distinct("borough");
for await (const doc of cursor) {
  console.dir(doc);
}

output :
[ "Bronx", "Brooklyn", "Manhattan", "Queens" ]
```
"borough" is a document field parameter 

----------------------------------------------------------------------------------------

### Query Parameter :
```js
// exclude Brooklyn restaurants from the output
const query = { borough: { $ne: "Brooklyn" }};

// find the filtered distinct values of "cuisine"
const cursor = myColl.distinct("cuisine", query);
for await (const doc of cursor) {
  console.dir(doc);
}
```

**Note**
here _cuisine_ is document field parameter ,
and _query_ is query parameter 

_____________________________________________________________________________________________

### Options Parameter :
You can specify the collation to the distinct() method by defining a collation field as an options parameter. This field allows you to set regional rules for string ordering and comparisons.

```js
// define an empty query document
const query = {};
// specify German string ordering conventions
const options = { collation: { locale: "de" }};

const cursor = myColl.distinct("restaurant", query, options);
for await (const doc of cursor) {
  console.dir(doc);
}
```

**Note**
In this case, German string ordering conventions place words beginning with "Ä" before those beginning with "B". The code outputs the following:

``` js 
[ "Äpfel", "Borgatti's", "Samba Kitchen", "Tanoreen", "Via Carota", "White Bear" ]
```

If you do not specify the collation field, the output order follows default binary collation rules. These rules place words beginning with "Ä" after the those with unaccented first letters:

```js 
[ "Borgatti's", "Samba Kitchen", "Tanoreen", "Via Carota", "White Bear", "Äpfel" ]
```


## Search Text :
Text searches let you search string type fields in your collection for specified words or phrases. You can perform a text search by using the $text operator, which performs a logical OR on each term separated by a space in the search string.

You can also specify more options to the operator to handle case sensitivity, stop words, and word stemming (such as plural forms or other tenses) for a supported language. This is often used for unstructured text such as transcripts, essays, or web pages.

The $text query operator requires that you specify the search field in a text index on your collection. See the examples below for sample code for creating a text index and using the $text query operator.

``` js
db.movies.createIndex({ title: "text" });
```

``` js 
db.movies.createIndex({ title: "text", plot: "text" });
```

### Query for Words
```js
  // Create a query that searches for the string "trek"
  const query = { $text: { $search: "trek" } };

  // Return only the `title` of each matched document
  const projection = {
    _id: 0,
    title: 1,
  };

  // Find documents based on our query and projection
  const cursor = movies.find(query).project(projection);


  output :

  { title: 'Trek Nation' }
{ title: 'Star Trek' }
{ title: 'Star Trek Into Darkness' }
{ title: 'Star Trek: Nemesis' }
{ title: 'Star Trek: Insurrection' }
{ title: 'Star Trek: Generations' }
{ title: 'Star Trek: First Contact' }
{ title: 'Star Trek: The Motion Picture' }
{ title: 'Star Trek VI: The Undiscovered Country' }
{ title: 'Star Trek V: The Final Frontier' }
{ title: 'Star Trek IV: The Voyage Home' }
{ title: 'Star Trek III: The Search for Spock' }
{ title: 'Star Trek II: The Wrath of Khan' }

```

Success! The query found every document in the movies collection with a title including the word "trek". Unfortunately, the search included one unintended item: "Trek Nation," which is a movie about Star Trek and not part of the Star Trek movie series. To solve this, we can query with a more specific phrase.

by using query by phrase 

### Query By Phrase :

To make your query more specific, try using the phrase "star trek" instead of just the word "trek". To search by phrase, surround your multi-word phrase with escaped quotes (\"<term>\"):

```js
// Create a query that searches for the phrase "star trek"
const query = { $text: { $search: "\"star trek\"" } };
// Return only the `title` of each matched document
const projection = {
  _id: 0,
  title: 1,
};
// Find documents based on the query and projection
const cursor = movies.find(query).project(projection);



output  :


{ title: 'Star Trek' }
{ title: 'Star Trek Into Darkness' }
{ title: 'Star Trek: Nemesis' }
{ title: 'Star Trek: Insurrection' }
{ title: 'Star Trek: Generations' }
{ title: 'Star Trek: First Contact' }
{ title: 'Star Trek: The Motion Picture' }
{ title: 'Star Trek VI: The Undiscovered Country' }
{ title: 'Star Trek V: The Final Frontier' }
{ title: 'Star Trek IV: The Voyage Home' }
{ title: 'Star Trek III: The Search for Spock' }
{ title: 'Star Trek II: The Wrath of Khan' }


```

These results include all movies in the database that contain the phrase "star trek", which in this case results in only fictional Star Trek movies. Unfortunately, this query returned "Star Trek Into Darkness", a movie that was not part of the original series of movies. To resolve this issue, we can omit that document with a negation.

### Query with Negations :


To use a negated term, place a negative sign, -, in front of the term you to omit from the result set. The query operation omits any documents that contain this term from the search result. Since this query includes two distinct terms, separate them with a space.

```js
// Create a query that searches for the phrase "star trek" while omitting "into darkness"
const query = { $text: { $search: "\"star trek\"  -\"into darkness\"" } };
// Include only the `title` field of each matched document
const projection = {
  _id: 0,
  title: 1,
};
// Find documents based on the query and projection
const cursor = movies.find(query).project(projection);
```

### Sort by Relevance :
Now that the result set reflects the desired results, you can use the text search _textScore_, accessed using the **$meta** operator in the query projection, to order the results by relevance:

 ```js
// Create a query that searches for the phrase "star trek" while omitting "into darkness"r
 const query = { $text: { $search: "\"star trek\"  -\"into darkness\"" } };
 // Sort returned documents by descending text relevance score
 const sort = { score: { $meta: "textScore" } };
 // Include only the `title` and `score` fields in each returned document
 const projection = {
   _id: 0,
   title: 1,
   score: { $meta: "textScore" },
 };
 // Find documents based on the query, sort, and projection
 const cursor = movies
   .find(query)
   .sort(sort)
   .project(projection);



output for above query :

{ title: 'Star Trek', score: 1.5 }
{ title: 'Star Trek: Generations', score: 1.3333333333333333 }
{ title: 'Star Trek: Insurrection', score: 1.3333333333333333 }
{ title: 'Star Trek: Nemesis', score: 1.3333333333333333 }
{ title: 'Star Trek: The Motion Picture', score: 1.25 }
{ title: 'Star Trek: First Contact', score: 1.25 }
{ title: 'Star Trek II: The Wrath of Khan', score: 1.2 }
{ title: 'Star Trek III: The Search for Spock', score: 1.2 }
{ title: 'Star Trek IV: The Voyage Home', score: 1.2 }
{ title: 'Star Trek V: The Final Frontier', score: 1.2 }
{ title: 'Star Trek VI: The Undiscovered Country', score: 1.2 }


```

note : score (or ) relevance score increases , when text match percentage increases 

## Access Data From a Cursor :

Overview
Read operations that return multiple documents do not immediately return all values matching the query. Because a query can potentially match very large sets of documents, these operations return an object called a cursor, which references documents identified by the query. A cursor fetches documents in batches to reduce both memory consumption and network bandwidth usage. Cursors are highly configurable and offer multiple interaction paradigms for different use cases.

The following functions directly return cursors:

- Collection.find()

- Collection.aggregate()

- Collection.listIndexes()

- Collection.listSearchIndexes()

- Db.aggregate()

- Db.listCollections()

### Asynchronous Iteration : 
 ```js
const cursor = myColl.find({});
console.log("async");
for await (const doc of cursor) {
console.log(doc);
}
```

### Manual Iteration :

```js 
const cursor = myColl.find({});
while (await cursor.hasNext()) {
  console.log(await cursor.next());
}
```

### Return an Array of All Documents
For use cases that require all documents matched by a query to be held in memory at the same time, use the toArray() method. Note that large numbers of matched documents can cause performance issues or failures if the operation exceeds memory constraints. Consider using the for await...of syntax to iterate through results rather than returning all documents at once.

```js 
const cursor = myColl.find({});
const allValues = await cursor.toArray();
```

# Update Documents


MongoDB, launched in 2009 by 10gen (now MongoDB Inc.), was designed to solve scalability issues traditional RDBMS faced in cloud and web-scale applications. The philosophy was CRUD-centric (Create, Read, Update, Delete) but optimized for JSON-like documents (BSON).

- v1.x (2009-2011): Primitive update capabilities using .update() with $set and $inc. No upsert, multi-document atomicity was missing.

- v2.x - v3.x: Introduced aggregation pipelines, bulk operations, findAndModify(), and updateOne(), updateMany(). Also introduced Write Concerns and Journaling for reliability.

- v4.x+: Allowed updates inside transactions (multi-document ACID). Full aggregation pipeline support in updates came in MongoDB 4.2.

- v6.x - present: Improved expressivity in updates (e.g., $setWindowFields, $function, $merge), field-level encryption, and schema validation layers to pre-check updates.


## Earlier method of updating a document (MongoDB ≤ v3.x) :

```js
db.users.update(
  { name: "Alice" },
  { $set: { age: 30 } }
);
```

**Behavior:**
- Only updates the first matching document by default.

- If you want to update multiple:

### multiple updates :

```js
db.users.update(
  { city: "Hyderabad" },
  { $inc: { visits: 1 } },
  { multi: true }
);
```
**Limitations:**

- Cannot use aggregation logic.

- Unintuitive behavior unless multi is explicitly set.

- Verbose.



If your application stores and modifies data in MongoDB, you probably use insert and update operations. In certain workflows, whether you perform an insert or update operation depends on whether the document exists. In these cases, you can streamline your application logic by using the upsert option available in the following methods:

- updateOne()   - Updates first match

- replaceOne()  - Replaces the entire document

- updateMany()  - Updates all matches

- findOneAndUpdate() - Updates and returns the modified document

- findOneAndReplace() - Replaces and returns the modified document

**Each method accepts:**

- Query

- Update operation

- Optional flags: upsert, returnDocument, arrayFilters, collation


If the query filter passed to these methods does not find any matches and you set the upsert option to true, MongoDB inserts the update document. Let's go through an example.

### Performing an Update
Suppose your application tracks the current location of food trucks, storing the nearest address data in the myDB.foodTrucks collection, which resembles the following:

```js
[
  { name: "Haute Skillet", address: "42 Avenue B" },
  { name: "Lady of the Latke", address: "35 Fulton Rd" },
  ...
]
```

As an application user, you read about a food truck changing its regular location and want to apply the update. This update might resemble the following:

```js
const myDB = client.db("myDB");
const myColl = myDB.collection("foodTrucks");

const query = { name: "Deli Llama" };
const update = { $set: { name: "Deli Llama", address: "3 Nassau St" }};
const options = {};
myColl.updateOne(query, update, options);
```

If a food truck named "Deli Llama" exists, the method call above updates the document in the collection. However, if there are no food trucks named "Deli Llama" in your collection, no changes are made. But , with upsert() method we can insert even no matched document .below code is example

### Performing an Upsert
Consider the case in which you want to add information about the food truck even if it does not yet exist in your collection. Rather than first querying whether it exists to determine whether to insert or update the document, we can set upsert to true in our call to updateOne() as follows:

```js
const query = { name: "Deli Llama" };
const update = { $set: { name: "Deli Llama", address: "3 Nassau St" }};
const options = { upsert: true };
myColl.updateOne(query, update, options);
```

After you run the operation above, your collection looks similar to the following, even if the "Deli Llama" document did not exist in your collection before the operation:

```js
[
  { name: "Haute Skillet", address: "42 Avenue B" },
  { name: "Lady of the Latke", address: "35 Fulton Rd" },
  { name: "Deli Llama", address: "3 Nassau St" },
  ...
]
```

## field operators :
| Operator       | Example                                                     | What it Does                                                            |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `$set`         | `{ $set: { city: "Delhi" } }`                               | Updates or creates a field with a new value   (Assign or Overwrite a Value)                          |
| `$unset`       | `{ $unset: { tempField: "" } }`                             | Deletes a field from the document                                       |
| `$rename`      | `{ $rename: { location: "address" } }`                      | Renames a field (old name → new name)                                   |
| `$setOnInsert` | `{ $setOnInsert: { createdAt: new Date() } }` *(on upsert)* | Sets the value **only** if the document is newly inserted during upsert |



## arithmatic operators :
| Operator | Example                     | What it Does                                                                 |
| -------- | --------------------------- | ---------------------------------------------------------------------------- |
| `$inc`   | `{ $inc: { age: 1 } }`      | Increments the field value (or creates it if not present)                    |
| `$mul`   | `{ $mul: { price: 1.2 } }`  | Multiplies the field by a given number                                       |
| `$min`   | `{ $min: { score: 95 } }`   | Sets the value **only if** the current value is **greater** than given value |
| `$max`   | `{ $max: { attempts: 5 } }` | Sets the value **only if** the current value is **less** than given value    |


## array operators : 
| Operator    | Example                                         | What it Does                                                          |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `$push`     | `{ $push: { tags: "mongodb" } }`                | Adds an item to the end of an array                                   |
| `$addToSet` | `{ $addToSet: { tags: "uniqueTag" } }`          | Adds item **only if it's not already in** the array (like a `Set`)    |
| `$pull`     | `{ $pull: { scores: { $lt: 60 } } }`            | Removes array items that match the condition                          |
| `$pop`      | `{ $pop: { recent: 1 } }`                       | Removes the **last** item (`1`) or **first** item (`-1`) of the array |
| `$pullAll`  | `{ $pullAll: { tags: ["old1", "old2"] } }`      | Removes **all exact values** listed from the array                    |
| `$each`     | `$push: { items: { $each: [1,2,3] } }`          | Used with `$push` to insert multiple values at once                   |
| `$slice`    | `$push: { logs: { $each: [...], $slice: -5 } }` | Trims the array to the last N elements (`-5` means keep last 5)       |
| `$sort`     | `$push: { list: { $each: [...], $sort: 1 } }`   | Sorts new elements before inserting into array (`1`=asc, `-1`=desc)   |


## metadata operators :
| Operator       | Example                                            | What it Does                                                                |
| -------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `$currentDate` | `{ $currentDate: { lastModified: true } }`         | Sets the field to the **current date/time**                                 |
| `$timestamp`   | `{ $currentDate: { ts: { $type: "timestamp" } } }` | Sets the field to a **BSON internal timestamp** (used for replication logs) |


## bitwise operator :
| Operator | Example                                                     | What it Does                                                               |
| -------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `$bit`   | `db.flags.updateOne({}, { $bit: { access: { and: 5 } } });` | Performs **bitwise operations** (`and`, `or`, `xor`) on **integer fields** |




### updateOne() example :
- Consider a document in the myDB.items collection with fields describing an item for sale, its price, and the quantity available:

```js
{
   _id: 465,
   item: "Hand-thrown ceramic plate",
   price: 32.50,
   quantity: 7,
}
```

- If you apply the _$set_ update operator with a new value for quantity,
 you can use the following update document:

```js
const myDB = client.db("myDB");
const myColl = myDB.collection("items");

const filter = { _id: 465 };

// update the value of the 'quantity' field to 5
const updateDocument = {
   $set: {
      quantity: 5,
   },
};
const result = await myColl.updateOne(filter, updateDocument);
```

- The updated document resembles the following,
with an updated value in the quantity field and all other values unchanged:

```js
{
   _id: 465,
   item: "Hand-thrown ceramic plate",
   price: 32.50,
   quantity: 5,
}
```
- If an update operation fails to match any documents in a collection, it does not make any changes. Update operations can be configured to perform an **upsert** which attempts to perform an update, but if no documents are matched, inserts a new document with the specified fields and values.

- You cannot modify the _id field of a document nor change a field to a value that violates a unique index constraint.

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");
// Create a filter for movies with the title "Random Harvest"
const filter = { title: "Random Harvest" };
/* Set the upsert option to insert a document if no documents match
the filter */
const options = { upsert: true };
// Specify the update to set a value for the plot field
const updateDoc = {
  $set: {
    plot: `A harvest of random numbers, such as: ${Math.random()}`
  },
};
// Update the first document that matches the filter
const result = await movies.updateOne(filter, updateDoc, options);
```


### updateMany() example:

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");
// Create a filter to update all movies with a 'G' rating
    const filter = { rated: "G" };
    // Create an update document specifying the change to make
    const updateDoc = {
      $set: {
        random_review: `After viewing I am ${
          100 * Math.random()
        }% more satisfied with life.`,
      },
    };
    // Update the documents that match the specified filter
    const result = await movies.updateMany(filter, updateDoc);
    console.log(`Updated ${result.modifiedCount} documents`);
    
```

### replaceOne() :

A replace operation performs differently than an update operation. An update operation modifies only the specified fields in a target document. A replace operation removes all fields in the target document and replaces them with new ones.

To perform a replacement operation, create a replacement document that consists of the fields and values that you want to use in your replace operation

You can specify more options, such as upsert, using the optional options parameter. If you set the upsert option field to true the method inserts a new document if no document matches the query.

**Example  :**
Consider a document in the myDB.items collection with fields describing an item for sale, its price,
and the quantity available
```js
{
   _id: 501,
   item: "3-wick beeswax candle",
   price: 18.99,
   quantity: 10,
}
```
now , 
Suppose you wanted to replace this document with one that contains a description for an entirely different item. Your replacement operation might resemble the following:
```js

const myDB = client.db("myDB");
const myColl = myDB.collection("items");

const filter = { _id: 501 };

// replace the matched document with the replacement document
const replacementDocument = {
   item: "Vintage silver flatware set",
   price: 79.15,
   quantity: 1,
};
const result = await myColl.replaceOne(filter, replacementDocument);
```

The replaced document contains the contents of the replacement document and the immutable _id field as follows:
```js
{
   _id: 501,
   item: "Vintage silver flatware set",
   price: 79.15,
   quantity: 1,
}
```

### findOneAndUpdate() :
findOneAndUpdate() is a smart hybrid method. It searches for one document, applies an update,
 and returns the document — either before or after the update — depending on your choice.

```js
db.collection.findOneAndUpdate(
  <filter>,
  <update>,
  {
    returnDocument: "after" | "before", // What version to return
    upsert: true | false,              // Insert if not found
    sort: { field: 1/-1 },             // If multiple match, which one?
    projection: { field: 1/0 },        // Which fields to return?
  }
)
```

```js
db.users.findOneAndUpdate(
  { name: "Ravi" },
  { $set: { status: "active" } },
  { returnDocument: "after" }
)
``` 

what it does :

Finds user with name Ravi

Sets their status to “active”

Returns the updated document(after)



### findOneAndReplace() :

findOneAndReplace() is a MongoDB operation that:

Finds one document using a filter

Replaces it entirely with a new document

Returns the document (before or after replacement)

It’s atomic at the document level, and behaves much like a surgical transplant — you don't just bandage a wound (like $set), you replace the whole organ (document), but keep the ID, identity, and structure intact.

```js
db.collection.findOneAndReplace(
  <filter>,
  <replacementDocument>,
  {
    returnDocument: "before" | "after",
    projection: { field: 1 },
    upsert: true | false,
    sort: { field: 1/-1 }
  }
)
```
example 
```js
db.users.findOneAndReplace(
  { username: "poorna" },
  {
    username: "poorna",
    fullName: "Poorna S.",
    email: "poorna@email.com",
    active: true,
    roles: ["admin", "writer"]
  },
  { returnDocument: "after" }
)
```
**note:** use upsert if you want 

- Underused, but incredibly powerful

- Best when you're in full control of the replacement structure

- A clean, atomic way to bring a document into a new life

### findAndModify() :

```js
db.collection.findAndModify({
  query: { ... },           // What to find
  sort: { field: 1 },       // If multiple matches, sort to pick one
  update: { $set: { ... } },// What to change
  remove: false,            // true = delete instead of update
  new: true                 // true = return updated doc; false = return original
})
```


example :

```js
db.tokens.findAndModify({
  query: { token: "abc123", used: false },
  update: { $set: { used: true, usedAt: new Date() } },
  new: true
})
```

🔍 What it does:
Finds an unused token

Marks it as used

Returns the updated version

✅ Use case:
Coupons

Password reset links

Invite tokens

```js
[
  {
    "_id": ObjectId("a1"),
    "task": "sendWelcomeEmail",
    "createdAt": ISODate("2025-06-18T09:00:00Z")
  },
  {
    "_id": ObjectId("a2"),
    "task": "processPayment",
    "createdAt": ISODate("2025-06-18T09:05:00Z")
  },
  {
    "_id": ObjectId("a3"),
    "task": "sendReminder",
    "createdAt": ISODate("2025-06-18T09:10:00Z")
  }
]
```

```js

db.jobs.findAndModify({
  query: {},                        // Match all jobs
  sort: { createdAt: 1 },           // Pick the oldest one
  remove: true                      // Delete it
})

```
🧠 What This Command Does:
query: {} — matches all jobs

sort: { createdAt: 1 } — sorts by createdAt ascending, so oldest first

remove: true — deletes the document instead of updating it

Returns the deleted document

```js
{
  "_id": ObjectId("a1"),
  "task": "sendWelcomeEmail",
  "createdAt": ISODate("2025-06-18T09:00:00Z")
}
```

 This was the oldest job, so it got removed and returned.

 job queue after operation was the below array 
 

 ```js
 [
  {
    "_id": ObjectId("a2"),
    "task": "processPayment",
    "createdAt": ISODate("2025-06-18T09:05:00Z")
  },
  {
    "_id": ObjectId("a3"),
    "task": "sendReminder",
    "createdAt": ISODate("2025-06-18T09:10:00Z")
  }
]
```

## Update Arrays in a Document

- Positional Operator: $

- All Positional Operator: $[]

- Filtered Positional Operator: $[<identifier>]

### Positional Operator($) :

Specifying Array Elements
Positional operators specify which array elements to update. You can use these operators to apply updates to the first element, all elements, or certain elements of an array that match a criteria.

To specify elements in an array with positional operators, use dot notation. Dot notation is a property access syntax for navigating BSON objects. 

The First Matching Array Element
To update the first array element of each document that matches your query, use the positional operator $.

The positional operator $ references the array matched by the query. You cannot use this operator to reference a nested array. If you want to access a nested array, use the filtered positional operator.

Important
Do not use the $ operator in an upsert call because the driver treats $ as a field name in the insert document.

Example
This example uses the following sample document to show how to update the first matching array element:

{
  _id: ...,
  entries: [
    { x: false, y: 1 },
    { x: "hello", y: 100 },
    { x: "goodbye", y: 1000 }
  ]
}
The following code shows how to increment a value in the first array element that matches a query.

The query matches elements in the entries array where the value of x is a string type. The update increases the y value by 33 in the first matching element.
```js
// Query for all elements in entries array where the value of x is a string
const query = { "entries.x": { $type : "string" } };
// On first matched element, increase value of y by 33
const updateDocument = {
  $inc: { "entries.$.y": 33 }
};
// Execute the update operation
const result = await myColl.updateOne(query, updateDocument);
```
After you run the update operation, the document resembles the following:
```js
{
  _id: ...,
  entries: [
    { x: false, y: 1 },
    { x: "hello", y: 133 },
    { x: "goodbye", y: 1000 }
  ]
}
```
The example includes the entries.x field in the query to match the array that the $ operator applies an update to. If you omit the entries.x field from the query while using the $ operator in an update, the driver is unable to identify the matching array and raises the following error:

MongoServerError: The positional operator did not find the match needed from the query.
Matching All Array Elements
To perform the update on all array elements of each document that matches your query, use the all positional operator $[].

Example
This example uses the following sample documents, which describe phone call logs, to show how to update all matching array elements:
```js
{
  _id: ...,
  date: "5/15/2023",
  calls: [
    { time: "10:08 AM", caller: "Mom", duration: 67 },
    { time: "04:11 PM", caller: "Dad", duration: 121 },
    { time: "06:36 PM", caller: "Grandpa", duration: 13 }
  ]
},
{
  _id: ...,
  date: "5/16/2023",
  calls: [
    { time: "11:47 AM", caller: "Mom", duration: 4 },
  ]
}
```
The following code shows how to remove the duration field from all calls array entries in the document whose date is "5/15/2023":
```js
// Query for all documents where date is the string "5/15/2023"
const query = { date: "5/15/2023" };
// For each matched document, remove duration field from all entries in calls array 
const updateDocument = {
  $unset: { "calls.$[].duration": "" }
};
// Execute the update operation
const result = await myColl.updateOne(query, updateDocument);
```
After you run the update operation, the documents resemble the following:
```js
{
  _id: ...,
  date: "5/15/2023",
  calls: [
    { time: "10:08 AM", caller: "Mom" },
    { time: "04:11 PM", caller: "Dad" },
    { time: "06:36 PM", caller: "Grandpa" }
  ]
},
{
  _id: ...,
  date: "5/16/2023",
  calls: [
    { time: "11:47 AM", caller: "Mom", duration: 4 },
  ]
}

```
Matching Multiple Array Elements
To perform an update on all embedded array elements of each document that matches your query, use the filtered positional operator $[<identifier>].

The filtered positional operator $[<identifier>] specifies the matching array elements in the update document. To identify which array elements to match, pair this operator with <identifier> in an arrayFilters object.

The <identifier> placeholder represents an element of the array field. You must select a value for <identifier> that starts with a lowercase letter and contains only alphanumeric characters.

**Usage**
You can use a filtered positional operator in an update operation. An update operation takes a query, an update document, and optionally, an options object as its parameters.

The following steps describe how to use a filtered positional operator in an update operation:

Format your update document as follows:

```js
{ $<operator>: { "<array>.$[<identifier>].<arrayField>": <updateParameter> } }

This update document contains the following placeholders:

$<operator>: The array update operator

<array>: The array in the document to update

<identifier>: The identifier for the filtered positional operator

<arrayField>: The field in the <array> array element to update

<updateParameter>: The value that describes the update
```
Add the matching criteria in the arrayFilters object. This object is an array of queries that specify which array elements to include in the update. Set this object in an options parameter:
```js
arrayFilters: [
  { "<identifier>.<arrayField1>": <updateParameter1> },
  { "<identifier>.<arrayField2>": <updateParameter2> },
  ...
]
```

Pass the query, the update document, and options to an update method. The following sample code shows how to call the updateOne() method with these parameters:

await myColl.updateOne(query, updateDocument, options);

Example
This example uses the following sample documents, which describe shopping lists for specific recipes, to show how to update certain matching array elements:

```js
[
{
  _id: ...,
  date: "11/12/2023",
  items: [
    { item: "Scallions", quantity: 3, recipe: "Fried rice" },
    { item: "Mangos", quantity: 4, recipe: "Salsa" },
    { item: "Pork shoulder", quantity: 1, recipe: "Fried rice" },
    { item: "Sesame oil", quantity: 1, recipe: "Fried rice" }
  ]
},
{
  _id: ...,
  date: "11/20/2023",
  items: [
    { item: "Coffee beans", quantity: 1, recipe: "Coffee" }
  ]
}]
```


Suppose you want to increase the quantity of items you purchase for a recipe on your "11/12/2023" grocery trip. You want to double the quantity if the item meets all the following criteria:

The item is for the "Fried rice" recipe.

The item name does not include the word "oil".

To double the quantity value in the matching array entries, use the filtered positional 
operator as shown in the following code:

```js

// Query for all documents where date is the string "11/12/2023"
const query = { date: "11/12/2023" };
// For each matched document, change the quantity of items to 2 
const updateDocument = {$mul: { "items.$[i].quantity": 2 }};
// Update only non-oil items used for fried rice 
const options = {
  arrayFilters: [
    {
      "i.recipe": "Fried rice",
      "i.item": { $not: { $regex: "oil" } },
    }
  ]
};
// Execute the update operation
const result = await myColl.updateOne(query, updateDocument, options);
```

The update multiplied the quantity value by 2 for items that matched the criteria. The item "Sesame oil" did not match the criteria in the arrayFilters object and therefore was excluded from the update. The following documents reflect these changes:


```js
{
  _id: ...,
  date: "11/12/2023",
  items: [
    { item: "Scallions", quantity: 6, recipe: "Fried rice" },
    { item: "Mangos", quantity: 4, recipe: "Salsa" },
    { item: "Pork shoulder", quantity: 2, recipe: "Fried rice" },
    { item: "Sesame oil", quantity: 1, recipe: "Fried rice" }
  ]
},
{
  _id: ...,
  date: "11/20/2023",
  items: [
    { item: "Coffee beans", quantity: 1, recipe: "Coffee" }
  ]
}
```


For official docs - [click here](https://www.mongodb.com/docs/manual/crud/)




