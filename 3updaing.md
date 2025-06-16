# Update Documents

If your application stores and modifies data in MongoDB, you probably use insert and update operations. In certain workflows, whether you perform an insert or update operation depends on whether the document exists. In these cases, you can streamline your application logic by using the upsert option available in the following methods:

- updateOne()

- replaceOne()

- updateMany()

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

If a food truck named "Deli Llama" exists, the method call above updates the document in the collection. However, if there are no food trucks named "Deli Llama" in your collection, no changes are made.

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

## update operators 

The top level of an update document contains one or more of the following update operators:

- $set: replaces the value of a field with a specified one

- $inc: increments or decrements field values

- $rename: renames fields

- $unset: removes fields

- $mul: multiplies a field value by a specified number

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
