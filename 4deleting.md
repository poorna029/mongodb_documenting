# deleting document/s from collection 

- db.collection.remove() - legacy method , removed from native driver method , but existed in shell commands
- db.collection.deleteOne()
- db.collection.deleteMany()
- db.collection.findOneAndDelete()
- db.collection.findAndModify()


## db.collection.remove() :
- Remove specific documents based on a query.

- Remove all documents from a collection if no query is provided.

```js
db.collection.remove(<query>, <justOne>)

```

| Parameter | Type    | Description                                 |
| --------- | ------- | ------------------------------------------- |
| `query`   | Object  | Condition to match documents                |
| `justOne` | Boolean | If true, deletes only one matching document |


example :
```js
db.books.remove({ title: "To Kill a Mockingbird" }, true)  // deletes just one
```

**note**

- remove() reflected a minimalist philosophy: delete by simply providing a query — no overhead, no boilerplate.


**But minimalism can create ambiguity:**
- What if someone deletes everything by mistake?

- What if you wanted a safe transactional delete?

- Hence, philosophical evolution led to more explicit, intention-revealing APIs like deleteOne() and deleteMany().

- remove() is not ACID compliance method 

## db.collection.deleteOne() : 
Removes a single document from a collection.

**syntax:**

```js
db.collection.deleteOne(
    <filter>,
    {
      writeConcern: <document>,
      collation: <document>,
      hint: <document|string>
    }
)
```

**Returns:**	A document containing:
- A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled

- deletedCount containing the number of deleted documents

MongoDB's philosophy evolved from:

- Minimalism → simple shell commands (remove()),

- To explicitness and developer safety → deleteOne().






| Feature                    | `deleteOne()` | `deleteMany()` | `remove()`              | `findOneAndDelete()` | `findAndModify()`           |
| -------------------------- | ------------- | -------------- | ----------------------- | -------------------- | --------------------------- |
| Delete only 1 doc?         | ✅             | ❌              | ⚠️ With `justOne: true` | ✅                    | ✅                           |
| Returns deleted document?  | ❌             | ❌              | ❌                       | ✅                    | ✅                           |
| Deprecated?                | ❌             | ❌              | ⚠️ Yes (drivers)        | ❌                    | ❌                           |
| Driver Supported?          | ✅             | ✅              | Deprecated              | ✅                    | ✅                           |
| Transactional-safe?        | ✅             | ✅              | ❌                       | ✅                    | ✅                           |
| Default Behavior w/o Query | Throws error  | Throws error   | Deletes all ❌           | Throws error         | Throws error                |
| Use Case Fit               | Most precise  | Bulk deletes   | Legacy only             | Delete + retrieve    | Update or delete atomically |


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

### collation (document):
so users , can have username with their choice of case-sensitive , but it is leading to duplicates like ram , can create account with Ram , RAM and so on ...  Sometimes they can't even delete their own accounts , because they forget names like naming conventions while creating accounts was different than when they are deleting was different  , this led string matching issue and then this concept called **collation** came 

collation teaches mongodb how to compare strings and treat them according to the culture and religion :

“In France, résumé and resume are not the same.
In Germany, ß is often treated like ss.”

“Collation respects culture — not just computers.”


```js

"John" ≠ "john"

"résumé" ≠ "resume"

"straße" ≠ "strasse"
```

Mongodb judged strings by exact binary code points, not by how humans read or pronounce them.

But our users are not computers. They’re from India, France, Nigeria, Brazil… and each has their own alphabet, accents, and rules.



So we built collation — a way to tell MongoDB:

    “Compare strings like a human from this part of the world.”

```js 
{
    collation: {
      locale: "en",        // Speak like an English reader
      strength: 2          // Ignore case
    }
  }
```

| Field      | What It Does                                                  |
| ---------- | ------------------------------------------------------------- |
| `locale`   | Sets cultural comparison rules (e.g., "en", "fr", "de", "es") |
| `strength` | Controls what MongoDB **ignores or matches** in text          |


**strength**

“There are five levels of strength,” 
“From ignoring everything, to caring about every accent, punctuation, and tone.”

| Strength | What It Compares                 | Example                        |
| -------- | -------------------------------- | ------------------------------ |
| 1        | Base characters only             | `"john"` ≈ `"JOHN"` ≈ `"jóhn"` |
| 2        | Base + diacritics, ignores case  | `"john"` ≈ `"JOHN"`            |
| 3        | Case-sensitive, accent-sensitive | `"john"` ≠ `"John"`            |
| 4        | Adds punctuation                 | `"John!"` ≠ `"John"`           |
| 5        | Full Unicode (like tone marks)   | Deep, linguistic-level match   |

1 -> too loose to 5 -> too strict 

Diacritics = Signs placed above, below, or through letters to guide pronunciation or meaning.

examples of diacritics :
    é → "café", ü → "über" 

```js
db.users.deleteOne(
  { name: "john" },
  {
    collation: {
      locale: "en",        // Speak like an English reader
      strength: 2          // Ignore case
    }
  }
)
```

if suppose user actual name in db is "John" , now because strength is 2 , it ignose case , so treats as john = John 

"john" matched "John", "JOHN", "JoHn".

Accents could be ignored or respected, depending on strength.


**_So should I always use collation with strength: 1 to be safe?_**

In a European HR system, deleteOne({ name: "resume" }) deleted both "resume" and "résumé" — 
because of a loose collation.

In an Indian school portal, "Ram" ≠ "RAM" caused duplicate student accounts. They fixed it by using collation: { locale: "en", strength: 2 } on deleteOne() and find().
if suppose student registers as Ram and teacher enrolls with RAM , so mismatch when deleting 

In an eCommerce platform, collation mismatches created customer confusion when names like "Søren" and "Soren" were treated separately.

always loose is not too good , even strict is not . **be conscious while using**




### hint (document /string) 

even though you have created indexes , sometime mongodb uses collection scan while taking more time causing performance issues ,
if there are multiple index choices , it may take wrong ones or none , becuase of confusion . so we have to say explicitly , we have control over that
with option called **hint**


```js

db.orders.deleteOne(
  { userId: "U123", status: "cancelled" },
  { hint: { userId: 1 } }
)
```

This tells MongoDB: “Use the index that starts with userId, not status.”



A delivery app once had an index on orderDate, and another on userId.

They tried to delete orders using:

```js
db.orders.deleteOne({ userId: "U987", orderDate: { $lt: ISODate("2024-01-01") } })
```

MongoDB chose the wrong index (orderDate) because it had better cardinality — 
but the query became slower because it still had to filter userId manually.

They fixed it using:

```js
hint: { userId: 1, orderDate: 1 }
```

_Boom! The query sped up 10× and stopped timing out under load._

## db.collection.deleteMany() :







| **Feature**                           | **`remove()`**                                   | **`deleteOne()`**                   | **`deleteMany()`**                  | **`findOneAndDelete()`**                                          | **`findAndModify()` (with remove)**                                       |
| ------------------------------------- | ------------------------------------------------ | ----------------------------------- | ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 🧠 **Purpose**                        | Deletes one or many documents based on filter.   | Deletes **one** matching document.  | Deletes **all** matching documents. | Finds one doc and deletes it **atomically**, returns deleted doc. | Finds one doc, can **update or remove** it, returns modified/deleted doc. |
| 🧬 **Syntax**                         | `remove(filter, justOne)`                        | `deleteOne(filter)`                 | `deleteMany(filter)`                | `findOneAndDelete(filter, options)`                               | `findAndModify({ query, remove: true })`                                  |
| ⚠️ **Deprecation Status**             | **Deprecated** in drivers (but allowed in shell) | ✅ Recommended                       | ✅ Recommended                       | ✅ Recommended                                                     | ✅ Supported but superseded by `findOneAndDelete()`                        |
| 📐 **Control Granularity**            | Minimal (optional flag for `justOne`)            | Precise — removes first match       | Precise — removes all matches       | Precise — removes one & returns it                                | Full control — can update or remove                                       |
| 💥 **Bulk Delete Support**            | ✅ Yes                                            | ❌ No                                | ✅ Yes                               | ❌ No                                                              | ❌ No                                                                      |
| 🔁 **Return Document?**               | ❌ No                                             | ❌ No                                | ❌ No                                | ✅ Returns deleted doc                                             | ✅ Returns deleted (or updated) doc                                        |
| 🔒 **Atomicity**                      | ❌ No (non-atomic on multiple docs)               | ✅ Atomic for single document        | ✅ Atomic per document (not bulk)    | ✅ Fully atomic                                                    | ✅ Fully atomic                                                            |
| 🧱 **Transactions**                   | ❌ Not recommended inside transactions            | ✅ Supported                         | ✅ Supported                         | ✅ Supported                                                       | ✅ Supported                                                               |
| 🧰 **Use Cases**                      | Legacy scripts, quick deletes                    | Deleting 1 user/token safely        | Deleting batches (e.g., logs)       | Delete + retrieve item in 1 step                                  | Conditional delete/update logic                                           |
| 🕵️ **Find First, Then Delete?**      | ❌ Not built-in                                   | ❌ Not built-in                      | ❌ Not built-in                      | ✅ Built-in                                                        | ✅ Built-in                                                                |
| 🧪 **Soft Delete Compatible?**        | Needs manual logic                               | Needs manual logic                  | Needs manual logic                  | ❌ Deletes directly                                                | ❌ Deletes directly                                                        |
| 🧱 **Driver Support (Modern)**        | 🚫 Deprecated                                    | ✅ Full                              | ✅ Full                              | ✅ Full                                                            | ✅ Full                                                                    |
| 📉 **Performance**                    | Fast but unsafe                                  | Fast and safe                       | Fast for large deletes              | Slightly heavier (returns doc)                                    | Slightly heavier (returns doc)                                            |
| 🚨 **Danger of Accidental Full Wipe** | ⚠️ **HIGH** (`remove({})` deletes all)           | ❌ No (deletes one)                  | ⚠️ Yes, but clearer intent          | ❌ No                                                              | ❌ No                                                                      |
| 📚 **Default Behavior (no filter)**   | Deletes all docs ❌                               | Throws error ❌                      | Throws error ❌                      | Throws error ❌                                                    | Throws error ❌                                                            |
| 📖 **Recommended Use**                | ❌ Avoid in new apps                              | ✅ Use for targeted delete           | ✅ Use for batch delete              | ✅ When you need to return deleted doc                             | ✅ When complex condition/return is needed                                 |
| 🔐 **Security/Compliance Friendly?**  | ❌ Dangerous if unchecked                         | ✅ Safe & auditable                  | ✅ Safe & auditable                  | ✅ Safe with returnable doc                                        | ✅ Versatile but needs care                                                |
| 📊 **Return Type**                    | `{ acknowledged, deletedCount }`                 | `{ acknowledged, deletedCount: 1 }` | `{ acknowledged, deletedCount: N }` | `{ deleted document }`                                            | `{ value: deleted document }`                                             |
