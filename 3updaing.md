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
```js
{
  _id: ...,
  entries: [
    { x: false, y: 1 },
    { x: "hello", y: 100 },
    { x: "goodbye", y: 1000 }
  ]
}
```
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

**Example:**
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



