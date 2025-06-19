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




### example :
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

