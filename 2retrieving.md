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
- it returns in the form of batch of documents i.e.,cursor , a pointer of result set of query to access each document at once preventing memory overload and  improving performance 

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



# sort , limit , skip , projection 

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






![docs](https://www.mongodb.com/docs/manual/crud/)
