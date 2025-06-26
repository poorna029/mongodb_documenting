# SQL to MongoDB Mapping Guide

A comprehensive reference for converting SQL concepts and queries to MongoDB equivalents.

## Table of Contents

- [Overview](#overview)
- [Terminology and Concepts](#terminology-and-concepts)
- [Executables](#executables)
- [Schema Operations](#schema-operations)
- [Insert Operations](#insert-operations)
- [Select/Query Operations](#selectquery-operations)
- [Update Operations](#update-operations)
- [Delete Operations](#delete-operations)
- [Further Reading](#further-reading)

## Overview

This guide provides a comprehensive mapping between SQL and MongoDB operations, helping developers transition from relational databases to MongoDB's document-based approach.

> **Note**: In addition to the mappings below, consider checking the [MongoDB FAQ](https://docs.mongodb.com/manual/faq/) for common questions about MongoDB.

## Terminology and Concepts

| SQL Terms/Concepts | MongoDB Terms/Concepts | Notes |
|-------------------|------------------------|-------|
| **database** | database | Direct equivalent |
| **table** | collection | Collections are schema-less |
| **row** | document or BSON document | Documents can have varying structures |
| **column** | field | Fields can contain complex data types |
| **index** | index | Similar indexing concepts |
| **table joins** | `$lookup`, embedded documents | MongoDB favors embedding over joining |
| **primary key** | `_id` field | Automatically generated if not specified |
| **aggregation (GROUP BY)** | aggregation pipeline | See [SQL to Aggregation Mapping](https://docs.mongodb.com/manual/reference/sql-aggregation-comparison/) |
| **SELECT INTO NEW_TABLE** | `$out` | Part of aggregation pipeline |
| **MERGE INTO TABLE** | `$merge` | Part of aggregation pipeline |
| **UNION ALL** | `$unionWith` | Part of aggregation pipeline |
| **transactions** | transactions | Multi-document transactions available |

> **Best Practice**: For many scenarios, denormalized data models (embedded documents and arrays) minimize the need for multi-document transactions.

## Executables

| Purpose | MongoDB | MySQL | Oracle | Informix | DB2 |
|---------|---------|--------|--------|----------|-----|
| **Database Server** | `mongod` | `mysqld` | `oracle` | `IDS` | `DB2 Server` |
| **Database Client** | `mongosh` | `mysql` | `sqlplus` | `DB-Access` | `DB2 Client` |

## Schema Operations

### Sample Document Structure

All examples assume a MongoDB collection named `people` with documents following this structure:

```javascript
{
  _id: ObjectId("509a8fb2f3f4948bd2f983a0"),
  user_id: "abc123",
  age: 55,
  status: 'A'
}
```

### Create and Alter Operations

| SQL Operation | MongoDB Equivalent |
|---------------|-------------------|
| **Create Table** | **Implicit Creation** |
| `CREATE TABLE people (id MEDIUMINT NOT NULL AUTO_INCREMENT, user_id VARCHAR(30), age NUMBER, status CHAR(1), PRIMARY KEY (id))` | `db.people.insertOne({ user_id: "abc123", age: 55, status: "A" })` or `db.createCollection("people")` |
| **Add Column** | **Add Field to Documents** |
| `ALTER TABLE people ADD join_date DATETIME` | `db.people.updateMany({ }, { $set: { join_date: new Date() } })` |
| **Drop Column** | **Remove Field from Documents** |
| `ALTER TABLE people DROP COLUMN join_date` | `db.people.updateMany({ }, { $unset: { "join_date": "" } })` |
| **Create Index** | **Create Index** |
| `CREATE INDEX idx_user_id_asc ON people(user_id)` | `db.people.createIndex({ user_id: 1 })` |
| **Create Compound Index** | **Create Compound Index** |
| `CREATE INDEX idx_user_id_asc_age_desc ON people(user_id, age DESC)` | `db.people.createIndex({ user_id: 1, age: -1 })` |
| **Drop Table** | **Drop Collection** |
| `DROP TABLE people` | `db.people.drop()` |

## Insert Operations

| SQL Insert | MongoDB Insert |
|------------|----------------|
| `INSERT INTO people(user_id, age, status) VALUES ("bcd001", 45, "A")` | `db.people.insertOne({ user_id: "bcd001", age: 45, status: "A" })` |

## Select/Query Operations

> **Note**: The `find()` method always includes the `_id` field unless explicitly excluded through projection.

| SQL Query | MongoDB Query |
|-----------|---------------|
| **Select All** | **Find All** |
| `SELECT * FROM people` | `db.people.find()` |
| **Select Specific Columns** | **Project Specific Fields** |
| `SELECT id, user_id, status FROM people` | `db.people.find({ }, { user_id: 1, status: 1 })` |
| **Select Without ID** | **Exclude _id Field** |
| `SELECT user_id, status FROM people` | `db.people.find({ }, { user_id: 1, status: 1, _id: 0 })` |
| **Where Clause** | **Filter Documents** |
| `SELECT * FROM people WHERE status = "A"` | `db.people.find({ status: "A" })` |
| **Not Equal** | **$ne Operator** |
| `SELECT * FROM people WHERE status != "A"` | `db.people.find({ status: { $ne: "A" } })` |
| **AND Condition** | **Multiple Conditions** |
| `SELECT * FROM people WHERE status = "A" AND age = 50` | `db.people.find({ status: "A", age: 50 })` |
| **OR Condition** | **$or Operator** |
| `SELECT * FROM people WHERE status = "A" OR age = 50` | `db.people.find({ $or: [{ status: "A" }, { age: 50 }] })` |
| **Greater Than** | **$gt Operator** |
| `SELECT * FROM people WHERE age > 25` | `db.people.find({ age: { $gt: 25 } })` |
| **Less Than** | **$lt Operator** |
| `SELECT * FROM people WHERE age < 25` | `db.people.find({ age: { $lt: 25 } })` |
| **Range Query** | **Combined Operators** |
| `SELECT * FROM people WHERE age > 25 AND age <= 50` | `db.people.find({ age: { $gt: 25, $lte: 50 } })` |
| **Like (Contains)** | **Regex Pattern** |
| `SELECT * FROM people WHERE user_id LIKE "%bc%"` | `db.people.find({ user_id: /bc/ })` or `db.people.find({ user_id: { $regex: /bc/ } })` |
| **Like (Starts With)** | **Regex Pattern** |
| `SELECT * FROM people WHERE user_id LIKE "bc%"` | `db.people.find({ user_id: /^bc/ })` or `db.people.find({ user_id: { $regex: /^bc/ } })` |
| **Order By ASC** | **Sort Ascending** |
| `SELECT * FROM people WHERE status = "A" ORDER BY user_id ASC` | `db.people.find({ status: "A" }).sort({ user_id: 1 })` |
| **Order By DESC** | **Sort Descending** |
| `SELECT * FROM people WHERE status = "A" ORDER BY user_id DESC` | `db.people.find({ status: "A" }).sort({ user_id: -1 })` |
| **Count All** | **Count Documents** |
| `SELECT COUNT(*) FROM people` | `db.people.countDocuments()` or `db.people.find().count()` |
| **Count with Condition** | **Count with Filter** |
| `SELECT COUNT(user_id) FROM people` | `db.people.countDocuments({ user_id: { $exists: true } })` |
| **Count with Where** | **Count with Query** |
| `SELECT COUNT(*) FROM people WHERE age > 30` | `db.people.countDocuments({ age: { $gt: 30 } })` |
| **Distinct** | **Distinct Values** |
| `SELECT DISTINCT(status) FROM people` | `db.people.aggregate([{ $group: { _id: "$status" } }])` or `db.people.distinct("status")` |
| **Limit** | **Limit Results** |
| `SELECT * FROM people LIMIT 1` | `db.people.findOne()` or `db.people.find().limit(1)` |
| **Limit with Offset** | **Skip and Limit** |
| `SELECT * FROM people LIMIT 5 OFFSET 10` | `db.people.find().limit(5).skip(10)` |
| **Explain Query** | **Explain Execution** |
| `EXPLAIN SELECT * FROM people WHERE status = "A"` | `db.people.find({ status: "A" }).explain()` |

## Update Operations

| SQL Update | MongoDB Update |
|------------|----------------|
| **Update with Condition** | **Update Many Documents** |
| `UPDATE people SET status = "C" WHERE age > 25` | `db.people.updateMany({ age: { $gt: 25 } }, { $set: { status: "C" } })` |
| **Increment Value** | **$inc Operator** |
| `UPDATE people SET age = age + 3 WHERE status = "A"` | `db.people.updateMany({ status: "A" }, { $inc: { age: 3 } })` |

## Delete Operations

| SQL Delete | MongoDB Delete |
|------------|----------------|
| **Delete with Condition** | **Delete Many Documents** |
| `DELETE FROM people WHERE status = "D"` | `db.people.deleteMany({ status: "D" })` |
| **Delete All** | **Delete All Documents** |
| `DELETE FROM people` | `db.people.deleteMany({})` |

## Key MongoDB Methods Reference

### Query Methods
- `db.collection.find()` - Find documents
- `db.collection.findOne()` - Find single document
- `db.collection.distinct()` - Get distinct values
- `db.collection.countDocuments()` - Count documents

### Modification Methods
- `db.collection.insertOne()` - Insert single document
- `db.collection.insertMany()` - Insert multiple documents
- `db.collection.updateOne()` - Update single document
- `db.collection.updateMany()` - Update multiple documents
- `db.collection.replaceOne()` - Replace single document
- `db.collection.deleteOne()` - Delete single document
- `db.collection.deleteMany()` - Delete multiple documents

### Schema Methods
- `db.createCollection()` - Create collection
- `db.collection.createIndex()` - Create index
- `db.collection.drop()` - Drop collection

### Query Operators
- `$ne` - Not equal
- `$gt` - Greater than
- `$lt` - Less than
- `$gte` - Greater than or equal
- `$lte` - Less than or equal
- `$exists` - Field exists
- `$regex` - Regular expression
- `$or` - Logical OR
- `$and` - Logical AND

### Update Operators
- `$set` - Set field value
- `$unset` - Remove field
- `$inc` - Increment value

## Further Reading

If you're considering migrating your SQL application to MongoDB, download the **MongoDB Application Modernization Guide**.

### Resources Included:
- **Presentation**: Data modeling methodology with MongoDB
- **White paper**: Best practices for migrating from RDBMS to MongoDB
- **Reference schema**: MongoDB schema with RDBMS equivalent
- **Assessment tool**: Application Modernization scorecard

### Additional Documentation:
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Query and Projection Operators](https://docs.mongodb.com/manual/reference/operator/query/)
- [Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)
- [Aggregation Pipeline](https://docs.mongodb.com/manual/aggregation/)
- [Data Modeling](https://docs.mongodb.com/manual/core/data-modeling-introduction/)

---

> **💡 Pro Tip**: MongoDB's flexible document model allows for denormalized data structures that can eliminate the need for complex joins. Consider embedding related data within documents for better performance.