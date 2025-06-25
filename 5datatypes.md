
BSON (Binary JSON) was designed to store documents in a format that is both:

- Efficient in size
- Easy and fast to scan and decode

# BSON Types :


- String 
- Number 
    - Int32
    - Int64 
    - Double 
    - Decimal 

- Array 
- Binary
- JS code 
- Date 
    - ISODate 
    - Timestamp 
- Boolean 
- ObjectID 
- RegEx 
- Null
- Object 

```js



const { ObjectId, Decimal128, Binary, Timestamp, Long, Code, DBRef, MinKey, MaxKey } = require('mongodb');

await db.collection("bson_test").insertOne({
  stringField: "This is a string",
  int32Field: 123,
  int64Field: Long.fromNumber(9007199254740991),
  doubleField: 3.14159,
  decimalField: Decimal128.fromString("12345.6789"),
  arrayField: [1, "two", true, null],
  binaryField: new Binary(Buffer.from("hello world")),
  jsCodeField: new Code("function() { return true; }"),
  dateField: new Date("2023-12-01T10:00:00Z"),
  timestampField: Timestamp.fromNumber(Date.now()),
  booleanField: true,
  objectIdField: new ObjectId(),
  regexField: /mongo.*db/i,
  nullField: null,
  objectField: {
    nestedString: "nested",
    nestedNumber: 42
  },
  minKeyField: new MinKey(),
  maxKeyField: new MaxKey(),
  dbRefField: new DBRef("otherCollection", new ObjectId()),
  comment: "This document contains nearly every BSON type"
});
```

| Concept        | SQL (RDBMS)              | MongoDB / BSON Equivalent |
| -------------- | ------------------------ | ------------------------- |
| Integer        | `INT`, `BIGINT`          | `Int32`, `Int64`          |
| Decimal Number | `DECIMAL(10,2)`          | `Decimal128`              |
| Floating Point | `FLOAT`, `DOUBLE`        | `Double`                  |
| Text           | `VARCHAR`, `TEXT`        | `String`                  |
| Boolean        | `BOOLEAN`, `TINYINT`     | `Boolean`                 |
| Timestamp      | `TIMESTAMP`              | `ISODate`, `Timestamp`    |
| JSON           | N/A (JSON extension)     | `Object`, `Array`         |
| Binary         | `BLOB`, `BYTEA`          | `Binary`                  |
| NULL           | `NULL`                   | `null` (explicit in BSON) |
| Regex Matching | `LIKE`, `REGEXP`         | `RegEx`                   |
| Auto-ID / UUID | `AUTO_INCREMENT`, `UUID` | `ObjectId`                |


```js
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "salary", "created_at"],
      properties: {
        id: { bsonType: "int" },
        name: { bsonType: "string" },
        salary: { bsonType: "decimal" },
        is_active: { bsonType: "bool" },
        created_at: { bsonType: "date" }
      }
    }
  }
});
```

| Idea                  | SQL                       | MongoDB (BSON)                      |
| --------------------- | ------------------------- | ----------------------------------- |
| Schema Definition     | Required (`CREATE TABLE`) | Optional (`$jsonSchema` validator)  |
| Data Types            | Enforced at table level   | Enforced at value level (BSON)      |
| Data Type Declaration | Declarative               | Embedded via the actual value       |
| Flexibility           | Low                       | High (per-document flexibility)     |
| Enforcement           | Strict                    | Optional (unless validator enabled) |


```js

{
  $jsonSchema: {
    bsonType: "object",
    required: [
      "stringField",
      "int32Field",
      "int64Field",
      "doubleField",
      "decimalField",
      "arrayField",
      "binaryField",
      "jsCodeField",
      "dateField",
      "timestampField",
      "booleanField",
      "objectIdField",
      "regexField",
      "nullField",
      "objectField"
    ],
    properties: {
      stringField: { bsonType: "string" },
      int32Field: { bsonType: "int" },
      int64Field: { bsonType: "long" },
      doubleField: { bsonType: "double" },
      decimalField: { bsonType: "decimal" },
      arrayField: {
        bsonType: "array",
        items: {} // accepts any valid BSON type inside array
      },
      binaryField: { bsonType: "binData" },
      jsCodeField: { bsonType: "javascript" },
      dateField: { bsonType: "date" },
      timestampField: { bsonType: "timestamp" },
      booleanField: { bsonType: "bool" },
      objectIdField: { bsonType: "objectId" },
      regexField: { bsonType: "regex" },
      nullField: { bsonType: "null" },
      objectField: {
        bsonType: "object",
        required: ["nestedString", "nestedNumber"],
        properties: {
          nestedString: { bsonType: "string" },
          nestedNumber: { bsonType: "int" }
        }
      }
    }
  }
}

```


typical data scema 

```js

{
  $jsonSchema: {
    bsonType: "object",
    required: ["user", "orders", "audit", "preferences"],
    properties: {
      user: {
        bsonType: "object",
        required: ["_id", "name", "email", "dob", "createdAt"],
        properties: {
          _id: { bsonType: "objectId" },
          name: { bsonType: "string", description: "User's full name" },
          email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
          phone: { bsonType: ["string", "null"], maxLength: 15 },
          dob: { bsonType: "date" },
          isActive: { bsonType: "bool" },
          age: { bsonType: "int" },
          createdAt: { bsonType: "date" },
          roles: {
            bsonType: "array",
            items: { bsonType: "string", enum: ["user", "admin", "manager"] }
          },
          tags: {
            bsonType: "array",
            items: { bsonType: ["string", "int"] }
          },
          metadata: {
            bsonType: "object",
            properties: {
              height_cm: { bsonType: "double" },
              verified: { bsonType: "bool" },
              avatar: { bsonType: "binData" },
              bio: { bsonType: "string", maxLength: 500 }
            }
          }
        }
      },

      orders: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["orderId", "products", "total", "status"],
          properties: {
            orderId: { bsonType: "objectId" },
            timestamp: { bsonType: "timestamp" },
            total: { bsonType: "decimal" },
            status: { bsonType: "string", enum: ["pending", "shipped", "delivered"] },
            deliveryETA: { bsonType: ["date", "null"] },
            products: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["sku", "quantity", "price"],
                properties: {
                  sku: { bsonType: "string" },
                  quantity: { bsonType: "int" },
                  price: { bsonType: "decimal" },
                  discounts: {
                    bsonType: ["double", "null"]
                  },
                  batchId: { bsonType: "objectId" }
                }
              }
            }
          }
        }
      },

      audit: {
        bsonType: "object",
        properties: {
          updatedAt: { bsonType: "date" },
          updatedBy: { bsonType: "objectId" },
          notes: { bsonType: "string" },
          deleted: { bsonType: "bool" },
          deletionLog: {
            bsonType: "object",
            properties: {
              reason: { bsonType: "string" },
              deletedAt: { bsonType: "date" },
              confirmedBy: { bsonType: "objectId" }
            }
          }
        }
      },

      preferences: {
        bsonType: "object",
        required: ["notifications", "language"],
        properties: {
          notifications: { bsonType: "bool" },
          language: { bsonType: "string", enum: ["en", "hi", "fr", "es"] },
          timezone: { bsonType: "string" },
          theme: { bsonType: "string", enum: ["light", "dark"] },
          flags: {
            bsonType: "object",
            properties: {
              betaTester: { bsonType: "bool" },
              migrated: { bsonType: "bool" },
              deprecatedFields: { bsonType: "array", items: { bsonType: "string" } }
            }
          }
        }
      },

      searchRegex: { bsonType: "regex" },
      nullTest: { bsonType: "null" },
      rawJSField: { bsonType: "javascript" },
      mixedArray: {
        bsonType: "array",
        items: { bsonType: ["int", "string", "object", "bool"] }
      }
    }
  }
}

```

```js

const { ObjectId, Decimal128, Binary, Timestamp } = require("mongodb");

await db.collection("bson_typed_collection").insertOne({
  user: {
    _id: new ObjectId(),
    name: "Arundhati Roy",
    email: "aru.roy@example.com",
    phone: null,
    dob: new Date("1990-05-15"),
    isActive: true,
    age: 34,
    createdAt: new Date(),
    roles: ["user", "manager"],
    tags: ["premium", 42],
    metadata: {
      height_cm: 160.5,
      verified: true,
      avatar: new Binary(Buffer.from("\x89PNG\r\n\x1a\n...", "binary")), // PNG image data
      bio: "Award-winning author and speaker."
    }
  },

  orders: [
    {
      orderId: new ObjectId(),
      timestamp: Timestamp.fromNumber(Date.now()),
      total: Decimal128.fromString("999.99"),
      status: "shipped",
      deliveryETA: new Date("2025-07-01T12:00:00Z"),
      products: [
        {
          sku: "BOOK12345",
          quantity: 2,
          price: Decimal128.fromString("499.99"),
          discounts: 10.5,
          batchId: new ObjectId()
        }
      ]
    }
  ],

  audit: {
    updatedAt: new Date(),
    updatedBy: new ObjectId(),
    notes: "Bulk update triggered by admin",
    deleted: false,
    deletionLog: {
      reason: "",
      deletedAt: null,
      confirmedBy: null
    }
  },

  preferences: {
    notifications: true,
    language: "en",
    timezone: "Asia/Kolkata",
    theme: "dark",
    flags: {
      betaTester: true,
      migrated: false,
      deprecatedFields: ["legacyField1", "legacyField2"]
    }
  },

  searchRegex: /Roy/i,
  nullTest: null,
  rawJSField: new Code("function() { return this.age >= 18; }"),
  mixedArray: [42, "hello", { nested: true }, false]
});

```
