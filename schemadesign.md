# MongoDB Validation: From Scratch to Expert

## Level 1: Baby Steps - Your First Validation

Let's start with the simplest possible collection - a list of books.

### Basic Book Collection
```javascript
// Step 1: Create without validation first
db.createCollection("books")

// Step 2: Add a simple book
db.books.insertOne({
  title: "Harry Potter",
  author: "J.K. Rowling"
})

// Step 3: Now let's add basic validation
db.runCommand({
  collMod: "books",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title"],
      properties: {
        title: {
          bsonType: "string",
          description: "Title must be a string and is required"
        }
      }
    }
  }
})
```

**What we learned:**
- `bsonType: "object"` - The document itself is an object
- `required: ["title"]` - Title field must exist
- `properties` - Rules for each field

## Level 2: Adding More Rules

Let's make our book collection smarter:

```javascript
db.runCommand({
  collMod: "books",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
          description: "Title must be 1-200 characters"
        },
        author: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Author name must be 2-100 characters"
        },
        pages: {
          bsonType: "int",
          minimum: 1,
          maximum: 10000,
          description: "Pages must be between 1 and 10000"
        },
        published: {
          bsonType: "bool",
          description: "Is the book published?"
        }
      }
    }
  }
})

// Test it
db.books.insertOne({
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  pages: 180,
  published: true
})
```

**New concepts:**
- `minLength/maxLength` - String length limits
- `minimum/maximum` - Number range limits
- `bsonType: "int"` - Whole numbers only
- `bsonType: "bool"` - True/false values

## Level 3: Advanced Types and Arrays

Let's create a more complex book collection:

```javascript
db.createCollection("advancedBooks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author", "isbn"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        author: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100
        },
        isbn: {
          bsonType: "string",
          pattern: "^[0-9]{3}-[0-9]{10}$",
          description: "ISBN must be format: 123-1234567890"
        },
        genres: {
          bsonType: "array",
          minItems: 1,
          maxItems: 5,
          items: {
            bsonType: "string",
            enum: ["fiction", "non-fiction", "mystery", "romance", "sci-fi", "fantasy", "biography", "history"]
          },
          description: "Must have 1-5 genres from allowed list"
        },
        price: {
          bsonType: "double",
          minimum: 0,
          maximum: 1000,
          description: "Price must be between 0 and 1000"
        },
        publishDate: {
          bsonType: "date",
          description: "Must be a valid date"
        },
        inStock: {
          bsonType: "bool"
        }
      }
    }
  }
})

// Test it
db.advancedBooks.insertOne({
  title: "Dune",
  author: "Frank Herbert",
  isbn: "978-0441013593",
  genres: ["sci-fi", "fantasy"],
  price: 15.99,
  publishDate: new Date("1965-08-01"),
  inStock: true
})
```

**New concepts:**
- `pattern` - Regular expression matching
- `bsonType: "array"` - List of items
- `minItems/maxItems` - Array size limits
- `items` - Rules for each array element
- `enum` - Must be one of these values
- `bsonType: "double"` - Decimal numbers
- `bsonType: "date"` - Date values

## Level 4: Nested Objects (Objects within Objects)

Let's create a user profile collection:

```javascript
db.createCollection("userProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "profile"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$",
          description: "Username: letters, numbers, underscore only"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be valid email format"
        },
        profile: {
          bsonType: "object",
          required: ["firstName", "lastName"],
          properties: {
            firstName: {
              bsonType: "string",
              minLength: 1,
              maxLength: 50
            },
            lastName: {
              bsonType: "string",
              minLength: 1,
              maxLength: 50
            },
            age: {
              bsonType: "int",
              minimum: 13,
              maximum: 120
            },
            address: {
              bsonType: "object",
              properties: {
                street: {
                  bsonType: "string",
                  maxLength: 100
                },
                city: {
                  bsonType: "string",
                  maxLength: 50
                },
                zipCode: {
                  bsonType: "string",
                  pattern: "^[0-9]{5}(-[0-9]{4})?$",
                  description: "ZIP code: 12345 or 12345-6789"
                },
                country: {
                  bsonType: "string",
                  enum: ["USA", "Canada", "UK", "Australia", "India", "Germany", "France"]
                }
              }
            }
          }
        },
        preferences: {
          bsonType: "object",
          properties: {
            newsletter: {
              bsonType: "bool"
            },
            notifications: {
              bsonType: "object",
              properties: {
                email: { bsonType: "bool" },
                sms: { bsonType: "bool" },
                push: { bsonType: "bool" }
              }
            }
          }
        }
      }
    }
  }
})

// Test it
db.userProfiles.insertOne({
  username: "john_doe",
  email: "john@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe",
    age: 25,
    address: {
      street: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA"
    }
  },
  preferences: {
    newsletter: true,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
})
```

**New concepts:**
- Nested objects with their own validation rules
- Objects within objects within objects
- Complex regular expressions
- Optional nested fields

## Level 5: Complex Arrays with Object Elements

E-commerce order system:

```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderId", "customerId", "items", "totalAmount", "status"],
      properties: {
        orderId: {
          bsonType: "string",
          pattern: "^ORD-[0-9]{8}-[A-Z]{2}$",
          description: "Format: ORD-12345678-AB"
        },
        customerId: {
          bsonType: "string",
          pattern: "^CUST-[0-9]{6}$"
        },
        items: {
          bsonType: "array",
          minItems: 1,
          maxItems: 50,
          items: {
            bsonType: "object",
            required: ["productId", "name", "quantity", "price"],
            properties: {
              productId: {
                bsonType: "string",
                pattern: "^PROD-[0-9]{6}$"
              },
              name: {
                bsonType: "string",
                minLength: 1,
                maxLength: 100
              },
              quantity: {
                bsonType: "int",
                minimum: 1,
                maximum: 100
              },
              price: {
                bsonType: "double",
                minimum: 0.01,
                maximum: 10000
              },
              discount: {
                bsonType: "double",
                minimum: 0,
                maximum: 100,
                description: "Discount percentage"
              },
              category: {
                bsonType: "string",
                enum: ["electronics", "clothing", "books", "home", "sports", "toys"]
              }
            }
          }
        },
        totalAmount: {
          bsonType: "double",
          minimum: 0.01
        },
        status: {
          bsonType: "string",
          enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
        },
        orderDate: {
          bsonType: "date"
        },
        shippingAddress: {
          bsonType: "object",
          required: ["street", "city", "zipCode"],
          properties: {
            street: { bsonType: "string", maxLength: 100 },
            city: { bsonType: "string", maxLength: 50 },
            zipCode: { bsonType: "string", pattern: "^[0-9]{5}(-[0-9]{4})?$" },
            country: { bsonType: "string", enum: ["USA", "Canada", "UK"] }
          }
        },
        paymentMethod: {
          bsonType: "string",
          enum: ["credit_card", "debit_card", "paypal", "cash_on_delivery"]
        }
      }
    }
  }
})

// Test it
db.orders.insertOne({
  orderId: "ORD-12345678-AB",
  customerId: "CUST-123456",
  items: [
    {
      productId: "PROD-111111",
      name: "Wireless Mouse",
      quantity: 2,
      price: 25.99,
      discount: 10,
      category: "electronics"
    },
    {
      productId: "PROD-222222",
      name: "Coffee Mug",
      quantity: 1,
      price: 12.50,
      category: "home"
    }
  ],
  totalAmount: 59.23,
  status: "pending",
  orderDate: new Date(),
  shippingAddress: {
    street: "456 Oak St",
    city: "Boston",
    zipCode: "02101",
    country: "USA"
  },
  paymentMethod: "credit_card"
})
```

## Level 6: Advanced Validation with Conditional Logic

Employee management system with conditional validation:

```javascript
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["employeeId", "firstName", "lastName", "email", "department", "role"],
      properties: {
        employeeId: {
          bsonType: "string",
          pattern: "^EMP-[0-9]{6}$"
        },
        firstName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        department: {
          bsonType: "string",
          enum: ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"]
        },
        role: {
          bsonType: "string",
          enum: ["intern", "junior", "senior", "lead", "manager", "director"]
        },
        salary: {
          bsonType: "double",
          minimum: 20000,
          maximum: 500000
        },
        startDate: {
          bsonType: "date"
        },
        skills: {
          bsonType: "array",
          maxItems: 20,
          items: {
            bsonType: "string",
            minLength: 2,
            maxLength: 30
          }
        },
        certifications: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["name", "issuer", "dateObtained"],
            properties: {
              name: {
                bsonType: "string",
                minLength: 2,
                maxLength: 100
              },
              issuer: {
                bsonType: "string",
                minLength: 2,
                maxLength: 100
              },
              dateObtained: {
                bsonType: "date"
              },
              expiryDate: {
                bsonType: "date"
              },
              certificationId: {
                bsonType: "string",
                maxLength: 50
              }
            }
          }
        },
        performance: {
          bsonType: "object",
          properties: {
            currentRating: {
              bsonType: "double",
              minimum: 1.0,
              maximum: 5.0
            },
            reviews: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["date", "rating", "reviewer"],
                properties: {
                  date: { bsonType: "date" },
                  rating: { 
                    bsonType: "double",
                    minimum: 1.0,
                    maximum: 5.0
                  },
                  reviewer: { bsonType: "string" },
                  comments: { 
                    bsonType: "string",
                    maxLength: 1000
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})
```

## Level 7: Using $or, $and, and Complex Conditions

Product catalog with complex business rules:

```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["productId", "name", "category", "price"],
      properties: {
        productId: {
          bsonType: "string",
          pattern: "^[A-Z]{3}-[0-9]{6}$"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100
        },
        category: {
          bsonType: "string",
          enum: ["electronics", "clothing", "books", "home", "sports", "automotive"]
        },
        price: {
          bsonType: "double",
          minimum: 0.01
        },
        discountedPrice: {
          bsonType: "double",
          minimum: 0.01
        },
        stockQuantity: {
          bsonType: "int",
          minimum: 0
        },
        dimensions: {
          bsonType: "object",
          properties: {
            length: { bsonType: "double", minimum: 0.1 },
            width: { bsonType: "double", minimum: 0.1 },
            height: { bsonType: "double", minimum: 0.1 },
            weight: { bsonType: "double", minimum: 0.01 }
          }
        },
        specifications: {
          bsonType: "object",
          properties: {
            brand: { bsonType: "string", maxLength: 50 },
            model: { bsonType: "string", maxLength: 50 },
            color: { bsonType: "string", maxLength: 30 },
            material: { bsonType: "string", maxLength: 50 },
            warranty: {
              bsonType: "object",
              properties: {
                duration: { bsonType: "int", minimum: 0, maximum: 120 },
                unit: { enum: ["days", "months", "years"] },
                type: { enum: ["manufacturer", "extended", "store"] }
              }
            }
          }
        },
        tags: {
          bsonType: "array",
          maxItems: 10,
          items: {
            bsonType: "string",
            minLength: 2,
            maxLength: 20
          }
        },
        isActive: {
          bsonType: "bool"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      },
      // Complex validation: if discountedPrice exists, it must be less than price
      if: {
        properties: {
          discountedPrice: { bsonType: "double" }
        },
        required: ["discountedPrice"]
      },
      then: {
        properties: {
          discountedPrice: {
            bsonType: "double",
            minimum: 0.01
          }
        }
      }
    }
  }
})
```

## Level 8: Expert Level - Multi-Collection Validation System

Complete e-learning platform with related collections:

### Students Collection
```javascript
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "email", "profile", "enrollmentDate"],
      properties: {
        studentId: {
          bsonType: "string",
          pattern: "^STU-[0-9]{8}$"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        profile: {
          bsonType: "object",
          required: ["firstName", "lastName", "dateOfBirth"],
          properties: {
            firstName: { bsonType: "string", minLength: 1, maxLength: 50 },
            lastName: { bsonType: "string", minLength: 1, maxLength: 50 },
            dateOfBirth: { bsonType: "date" },
            phone: { bsonType: "string", pattern: "^[+]?[0-9]{10,15}$" },
            address: {
              bsonType: "object",
              properties: {
                street: { bsonType: "string", maxLength: 100 },
                city: { bsonType: "string", maxLength: 50 },
                state: { bsonType: "string", maxLength: 50 },
                zipCode: { bsonType: "string", pattern: "^[0-9]{5,6}$" },
                country: { bsonType: "string", maxLength: 50 }
              }
            },
            emergencyContact: {
              bsonType: "object",
              required: ["name", "relationship", "phone"],
              properties: {
                name: { bsonType: "string", minLength: 2, maxLength: 100 },
                relationship: { bsonType: "string", maxLength: 50 },
                phone: { bsonType: "string", pattern: "^[+]?[0-9]{10,15}$" }
              }
            }
          }
        },
        enrollmentDate: { bsonType: "date" },
        status: {
          bsonType: "string",
          enum: ["active", "suspended", "graduated", "dropped"]
        },
        coursesEnrolled: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["courseId", "enrollmentDate", "status"],
            properties: {
              courseId: { bsonType: "string", pattern: "^CRS-[0-9]{6}$" },
              enrollmentDate: { bsonType: "date" },
              status: { enum: ["enrolled", "in-progress", "completed", "failed", "dropped"] },
              grade: { bsonType: "string", enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"] },
              completionDate: { bsonType: "date" }
            }
          }
        },
        academicRecord: {
          bsonType: "object",
          properties: {
            gpa: { bsonType: "double", minimum: 0.0, maximum: 4.0 },
            totalCredits: { bsonType: "int", minimum: 0 },
            completedCredits: { bsonType: "int", minimum: 0 },
            degreeProgram: { bsonType: "string", maxLength: 100 },
            expectedGraduation: { bsonType: "date" }
          }
        }
      }
    }
  }
})
```

### Courses Collection
```javascript
db.createCollection("courses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["courseId", "title", "department", "credits", "instructor"],
      properties: {
        courseId: {
          bsonType: "string",
          pattern: "^CRS-[0-9]{6}$"
        },
        title: {
          bsonType: "string",
          minLength: 5,
          maxLength: 100
        },
        description: {
          bsonType: "string",
          maxLength: 2000
        },
        department: {
          bsonType: "string",
          enum: ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Business", "Engineering"]
        },
        credits: {
          bsonType: "int",
          minimum: 1,
          maximum: 6
        },
        instructor: {
          bsonType: "object",
          required: ["instructorId", "name", "email"],
          properties: {
            instructorId: { bsonType: "string", pattern: "^INS-[0-9]{6}$" },
            name: { bsonType: "string", minLength: 2, maxLength: 100 },
            email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
            office: { bsonType: "string", maxLength: 50 },
            officeHours: { bsonType: "string", maxLength: 200 }
          }
        },
        schedule: {
          bsonType: "object",
          properties: {
            days: {
              bsonType: "array",
              items: {
                bsonType: "string",
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
              }
            },
            startTime: { bsonType: "string", pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" },
            endTime: { bsonType: "string", pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" },
            room: { bsonType: "string", maxLength: 20 },
            building: { bsonType: "string", maxLength: 50 }
          }
        },
        prerequisites: {
          bsonType: "array",
          items: {
            bsonType: "string",
            pattern: "^CRS-[0-9]{6}$"
          }
        },
        syllabus: {
          bsonType: "object",
          properties: {
            objectives: {
              bsonType: "array",
              items: { bsonType: "string", maxLength: 200 }
            },
            topics: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["week", "topic"],
                properties: {
                  week: { bsonType: "int", minimum: 1, maximum: 16 },
                  topic: { bsonType: "string", maxLength: 200 },
                  assignments: {
                    bsonType: "array",
                    items: { bsonType: "string", maxLength: 100 }
                  }
                }
              }
            },
            gradingPolicy: {
              bsonType: "object",
              properties: {
                assignments: { bsonType: "double", minimum: 0, maximum: 100 },
                midterm: { bsonType: "double", minimum: 0, maximum: 100 },
                final: { bsonType: "double", minimum: 0, maximum: 100 },
                participation: { bsonType: "double", minimum: 0, maximum: 100 }
              }
            }
          }
        },
        capacity: {
          bsonType: "int",
          minimum: 1,
          maximum: 500
        },
        enrolledCount: {
          bsonType: "int",
          minimum: 0
        },
        isActive: {
          bsonType: "bool"
        },
        semester: {
          bsonType: "string",
          enum: ["Fall", "Spring", "Summer"]
        },
        year: {
          bsonType: "int",
          minimum: 2020,
          maximum: 2030
        }
      }
    }
  }
})
```

### Assignments Collection
```javascript
db.createCollection("assignments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["assignmentId", "courseId", "title", "dueDate", "maxPoints"],
      properties: {
        assignmentId: {
          bsonType: "string",
          pattern: "^ASG-[0-9]{8}$"
        },
        courseId: {
          bsonType: "string",
          pattern: "^CRS-[0-9]{6}$"
        },
        title: {
          bsonType: "string",
          minLength: 5,
          maxLength: 100
        },
        description: {
          bsonType: "string",
          maxLength: 5000
        },
        type: {
          bsonType: "string",
          enum: ["homework", "quiz", "exam", "project", "presentation", "lab"]
        },
        dueDate: {
          bsonType: "date"
        },
        maxPoints: {
          bsonType: "double",
          minimum: 1,
          maximum: 1000
        },
        instructions: {
          bsonType: "string",
          maxLength: 10000
        },
        attachments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["filename", "url"],
            properties: {
              filename: { bsonType: "string", maxLength: 200 },
              url: { bsonType: "string", maxLength: 500 },
              fileType: { bsonType: "string", maxLength: 10 },
              fileSize: { bsonType: "int", minimum: 1 }
            }
          }
        },
        submissions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["studentId", "submissionDate"],
            properties: {
              studentId: { bsonType: "string", pattern: "^STU-[0-9]{8}$" },
              submissionDate: { bsonType: "date" },
              files: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["filename", "url"],
                  properties: {
                    filename: { bsonType: "string", maxLength: 200 },
                    url: { bsonType: "string", maxLength: 500 },
                    fileSize: { bsonType: "int", minimum: 1 }
                  }
                }
              },
              textSubmission: {
                bsonType: "string",
                maxLength: 50000
              },
              grade: {
                bsonType: "double",
                minimum: 0
              },
              feedback: {
                bsonType: "string",
                maxLength: 2000
              },
              gradedDate: {
                bsonType: "date"
              },
              gradedBy: {
                bsonType: "string",
                pattern: "^INS-[0-9]{6}$"
              }
            }
          }
        },
        rubric: {
          bsonType: "object",
          properties: {
            criteria: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["name", "maxPoints"],
                properties: {
                  name: { bsonType: "string", maxLength: 100 },
                  description: { bsonType: "string", maxLength: 500 },
                  maxPoints: { bsonType: "double", minimum: 1 }
                }
              }
            }
          }
        },
        isActive: {
          bsonType: "bool"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
})
```

## Level 9: Advanced Validation Techniques

### Using Custom Validation Messages
```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          description: "Product name is required and must be at least 2 characters"
        },
        price: {
          bsonType: "double",
          minimum: 0.01,
          description: "Price must be a positive number greater than 0"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})
```

### Conditional Validation with $jsonSchema
```javascript
db.createCollection("vehicles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "brand", "model"],
      properties: {
        type: {
          bsonType: "string",
          enum: ["car", "truck", "motorcycle", "boat"]
        },
        brand: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        model: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        }
      },
      // If type is "car", require specific car fields
      if: {
        properties: { type: { const: "car" } }
      },
      then: {
        properties: {
          doors: {
            bsonType: "int",
            minimum: 2,
            maximum: 5
          },
          fuelType: {
            bsonType: "string",
            enum: ["gasoline", "diesel", "electric", "hybrid"]
          },
          transmission: {
            bsonType: "string",
            enum: ["manual", "automatic", "cvt"]
          }
        },
        required: ["doors", "fuelType", "transmission"]
      },
      // If type is "motorcycle", require motorcycle fields
      else: {
        if: {
          properties: { type: { const: "motorcycle" } }
        },
        then: {
          properties: {
            engineSize: {
              bsonType: "int",
              minimum: 50,
              maximum: 2000
            },
            hasLicense: {
              bsonType: "bool"
            }
          },
          required: ["engineSize"]
        }
      }
    }
  }
})
```

### Advanced Array Validation
```javascript
db.createCollection("socialMediaPosts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "userId", "content", "timestamp"],
      properties: {
        postId: {
          bsonType: "string",
          pattern: "^POST-[0-9]{10}$"
        },
        userId: {
          bsonType: "string",
          pattern: "^USER-[0-9]{8}$"
        },
        content: {
          bsonType: "string",
          minLength: 1,
          maxLength: 5000
        },
        timestamp: {
          bsonType: "date"
        },
        media: {
          bsonType: "array",
          maxItems: 10,
          items: {
            bsonType: "object",
            required: ["type", "url"],
            properties: {
              type: {
                bsonType: "string",
                enum: ["image", "video", "audio", "document"]
              },
              url: {
                bsonType: "string",
                pattern: "^https?://[^\\s/$.?#].[^\\s]*$"
              },
              thumbnail: {
                bsonType: "string",
                pattern: "^https?://[^\\s/$.?#].[^\\s]*$"
              },
              metadata: {
                bsonType: "object",
                properties: {
                  width: { bsonType: "int", minimum: 1 },
                  height: { bsonType: "int", minimum: 1 },
                  duration: { bsonType: "int", minimum: 1 },
                  fileSize: { bsonType: "int", minimum: 1 },
                  format: { bsonType: "string", maxLength: 10 }
                }
              }
            }
          }
        },
        hashtags: {
          bsonType: "array",
          maxItems: 30,
          items: {
            bsonType: "string",
            pattern: "^#[a-zA-Z0-9_]{1,30}$"
          }
        },
        mentions: {
          bsonType: "array",
          maxItems: 50,
          items: {
            bsonType: "string",
            pattern: "^@[a-zA-Z0-9_]{1,30}$"
          }
        },
        likes: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "timestamp"],
            properties: {
              userId: { bsonType: "string", pattern: "^USER-[0-9]{8}$" },
              timestamp: { bsonType: "date" }
            }
          }
        },
        comments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["commentId", "userId", "content", "timestamp"],
            properties: {
              commentId: { bsonType: "string", pattern: "^CMT-[0-9]{10}$" },
              userId: { bsonType: "string", pattern: "^USER-[0-9]{8}$" },
              content: { bsonType: "string", minLength: 1, maxLength: 1000 },
              timestamp: { bsonType: "date" },
              likes: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["userId", "timestamp"],
                  properties: {
                    userId: { bsonType: "string", pattern: "^USER-[0-9]{8}$" },
                    timestamp: { bsonType: "date" }
                  }
                }
              },
              replies: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["replyId", "userId", "content", "timestamp"],
                  properties: {
                    replyId: { bsonType: "string", pattern: "^RPL-[0-9]{10}$" },
                    userId: { bsonType: "string", pattern: "^USER-[0-9]{8}$" },
                    content: { bsonType: "string", minLength: 1, maxLength: 500 },
                    timestamp: { bsonType: "date" }
                  }
                }
              }
            }
          }
        },
        visibility: {
          bsonType: "string",
          enum: ["public", "friends", "private"]
        },
        location: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string", maxLength: 100 },
            coordinates: {
              bsonType: "object",
              required: ["latitude", "longitude"],
              properties: {
                latitude: { bsonType: "double", minimum: -90, maximum: 90 },
                longitude: { bsonType: "double", minimum: -180, maximum: 180 }
              }
            }
          }
        },
        isEdited: {
          bsonType: "bool"
        },
        editHistory: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["editedAt", "previousContent"],
            properties: {
              editedAt: { bsonType: "date" },
              previousContent: { bsonType: "string", maxLength: 5000 }
            }
          }
        }
      }
    }
  }
})
```

## Level 10: Expert Validation Patterns

### Financial Transaction System
```javascript
db.createCollection("transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["transactionId", "fromAccount", "toAccount", "amount", "currency", "timestamp", "type"],
      properties: {
        transactionId: {
          bsonType: "string",
          pattern: "^TXN-[0-9]{12}$"
        },
        fromAccount: {
          bsonType: "string",
          pattern: "^ACC-[0-9]{10}$"
        },
        toAccount: {
          bsonType: "string",
          pattern: "^ACC-[0-9]{10}$"
        },
        amount: {
          bsonType: "double",
          minimum: 0.01,
          maximum: 1000000
        },
        currency: {
          bsonType: "string",
          enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR"]
        },
        exchangeRate: {
          bsonType: "double",
          minimum: 0.0001
        },
        timestamp: {
          bsonType: "date"
        },
        type: {
          bsonType: "string",
          enum: ["transfer", "payment", "deposit", "withdrawal", "refund", "fee"]
        },
        status: {
          bsonType: "string",
          enum: ["pending", "processing", "completed", "failed", "cancelled", "disputed"]
        },
        description: {
          bsonType: "string",
          maxLength: 500
        },
        metadata: {
          bsonType: "object",
          properties: {
            merchantId: { bsonType: "string", pattern: "^MER-[0-9]{8}$" },
            merchantName: { bsonType: "string", maxLength: 100 },
            merchantCategory: { bsonType: "string", maxLength: 50 },
            location: {
              bsonType: "object",
              properties: {
                country: { bsonType: "string", maxLength: 3 },
                city: { bsonType: "string", maxLength: 50 },
                coordinates: {
                  bsonType: "object",
                  properties: {
                    latitude: { bsonType: "double", minimum: -90, maximum: 90 },
                    longitude: { bsonType: "double", minimum: -180, maximum: 180 }
                  }
                }
              }
            },
            paymentMethod: {
              bsonType: "object",
              properties: {
                type: { enum: ["card", "bank_transfer", "digital_wallet", "cash"] },
                cardType: { enum: ["credit", "debit", "prepaid"] },
                last4Digits: { bsonType: "string", pattern: "^[0-9]{4}$" },
                brand: { enum: ["visa", "mastercard", "amex", "discover"] }
              }
            },
            riskScore: {
              bsonType: "double",
              minimum: 0,
              maximum: 100
            },
            fraudFlags: {
              bsonType: "array",
              items: {
                bsonType: "string",
                enum: ["unusual_amount", "unusual_location", "unusual_time", "velocity_check", "duplicate_transaction"]
              }
            }
          }
        },
        fees: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["type", "amount"],
            properties: {
              type: { enum: ["processing", "international", "overdraft", "service"] },
              amount: { bsonType: "double", minimum: 0 },
              currency: { bsonType: "string", enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR"] }
            }
          }
        },
        auditTrail: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["timestamp", "action", "userId"],
            properties: {
              timestamp: { bsonType: "date" },
              action: { enum: ["created", "approved", "rejected", "modified", "cancelled"] },
              userId: { bsonType: "string", pattern: "^USR-[0-9]{8}$" },
              reason: { bsonType: "string", maxLength: 200 },
              ipAddress: { bsonType: "string", pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" }
            }
          }
        }
      }
    }
  }
})
```

### Healthcare Records System
```javascript
db.createCollection("medicalRecords", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["recordId", "patientId", "doctorId", "visitDate", "recordType"],
      properties: {
        recordId: {
          bsonType: "string",
          pattern: "^MED-[0-9]{10}$"
        },
        patientId: {
          bsonType: "string",
          pattern: "^PAT-[0-9]{8}$"
        },
        doctorId: {
          bsonType: "string",
          pattern: "^DOC-[0-9]{6}$"
        },
        visitDate: {
          bsonType: "date"
        },
        recordType: {
          bsonType: "string",
          enum: ["consultation", "diagnosis", "treatment", "prescription", "lab_result", "imaging", "surgery"]
        },
        chiefComplaint: {
          bsonType: "string",
          maxLength: 1000
        },
        symptoms: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["symptom", "severity"],
            properties: {
              symptom: { bsonType: "string", maxLength: 200 },
              severity: { enum: ["mild", "moderate", "severe"] },
              duration: { bsonType: "string", maxLength: 100 },
              frequency: { bsonType: "string", maxLength: 100 }
            }
          }
        },
        vitalSigns: {
          bsonType: "object",
          properties: {
            temperature: { bsonType: "double", minimum: 90, maximum: 110 },
            bloodPressure: {
              bsonType: "object",
              properties: {
                systolic: { bsonType: "int", minimum: 60, maximum: 300 },
                diastolic: { bsonType: "int", minimum: 40, maximum: 200 }
              }
            },
            heartRate: { bsonType: "int", minimum: 30, maximum: 300 },
            respiratoryRate: { bsonType: "int", minimum: 5, maximum: 60 },
            oxygenSaturation: { bsonType: "int", minimum: 70, maximum: 100 },
            weight: { bsonType: "double", minimum: 1, maximum: 1000 },
            height: { bsonType: "double", minimum: 30, maximum: 300 }
          }
        },
        diagnosis: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["condition", "icdCode"],
            properties: {
              condition: { bsonType: "string", maxLength: 200 },
              icdCode: { bsonType: "string", pattern: "^[A-Z][0-9]{2}(\\.[0-9]{1,2})?$" },
              type: { enum: ["primary", "secondary", "differential"] },
              severity: { enum: ["mild", "moderate", "severe"] },
              status: { enum: ["active", "resolved", "chronic"] }
            }
          }
        },
        medications: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["name", "dosage", "frequency"],
            properties: {
              name: { bsonType: "string", maxLength: 200 },
              genericName: { bsonType: "string", maxLength: 200 },
              dosage: { bsonType: "string", maxLength: 100 },
              frequency: { bsonType: "string", maxLength: 100 },
              duration: { bsonType: "string", maxLength: 100 },
              route: { enum: ["oral", "injection", "topical", "inhalation", "rectal"] },
              instructions: { bsonType: "string", maxLength: 500 }
            }
          }
        },
        allergies: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["allergen", "reaction"],
            properties: {
              allergen: { bsonType: "string", maxLength: 100 },
              reaction: { bsonType: "string", maxLength: 200 },
              severity: { enum: ["mild", "moderate", "severe", "life-threatening"] }
            }
          }
        },
        labResults: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["testName", "result", "date"],
            properties: {
              testName: { bsonType: "string", maxLength: 200 },
              result: { bsonType: "string", maxLength: 500 },
              normalRange: { bsonType: "string", maxLength: 100 },
              units: { bsonType: "string", maxLength: 20 },
              date: { bsonType: "date" },
              status: { enum: ["normal", "abnormal", "critical"] }
            }
          }
        },
        treatmentPlan: {
          bsonType: "object",
          properties: {
            shortTerm: {
              bsonType: "array",
              items: { bsonType: "string", maxLength: 500 }
            },
            longTerm: {
              bsonType: "array",
              items: { bsonType: "string", maxLength: 500 }
            },
            followUp: {
              bsonType: "object",
              properties: {
                date: { bsonType: "date" },
                instructions: { bsonType: "string", maxLength: 1000 }
              }
            }
          }
        },
        notes: {
          bsonType: "string",
          maxLength: 5000
        },
        attachments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["filename", "type", "url"],
            properties: {
              filename: { bsonType: "string", maxLength: 200 },
              type: { enum: ["image", "pdf", "document", "video"] },
              url: { bsonType: "string", maxLength: 500 },
              uploadDate: { bsonType: "date" }
            }
          }
        },
        confidentialityLevel: {
          bsonType: "string",
          enum: ["public", "restricted", "confidential", "highly_confidential"]
        },
        accessLog: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "timestamp", "action"],
            properties: {
              userId: { bsonType: "string", pattern: "^USR-[0-9]{8}$" },
              timestamp: { bsonType: "date" },
              action: { enum: ["view", "edit", "delete", "share"] },
              ipAddress: { bsonType: "string" }
            }
          }
        }
      }
    }
  }
})
```

## Expert Tips and Best Practices

### 1. Performance Considerations
```javascript
// Index fields that are frequently queried
db.students.createIndex({ "studentId": 1 })
db.students.createIndex({ "email": 1 }, { unique: true })
db.students.createIndex({ "profile.lastName": 1, "profile.firstName": 1 })

// Compound indexes for complex queries
db.orders.createIndex({ "customerId": 1, "orderDate": -1 })
db.products.createIndex({ "category": 1, "price": 1, "inStock": 1 })
```

### 2. Validation Levels and Actions
```javascript
// Strict validation - all documents must pass
db.createCollection("strictCollection", {
  validator: { /* rules */ },
  validationLevel: "strict",
  validationAction: "error"
})

// Moderate validation - only new documents must pass
db.createCollection("moderateCollection", {
  validator: { /* rules */ },
  validationLevel: "moderate",
  validationAction: "warn"
})
```

### 3. Updating Validation Rules
```javascript
// Add new validation rules to existing collection
db.runCommand({
  collMod: "existingCollection",
  validator: {
    $jsonSchema: {
      // New rules here
    }
  },
  validationLevel: "moderate" // Don't break existing data
})
```

### 4. Common Patterns for Different Industries

#### E-commerce Pattern
```javascript
// Product, Customer, Order, Review collections
// Focus on: inventory tracking, pricing, customer data
```

#### Healthcare Pattern
```javascript
// Patient, Doctor, Appointment, Record collections
// Focus on: privacy, audit trails, medical codes
```

#### Financial Pattern
```javascript
// Account, Transaction, User, Audit collections
// Focus on: precision, security, regulatory compliance
```

#### Educational Pattern
```javascript
// Student, Course, Assignment, Grade collections
// Focus on: academic integrity, progress tracking
```

### 5. Testing Your Validation
```javascript
// Test valid documents
try {
  db.collection.insertOne(validDocument)
  console.log("✓ Valid document accepted")
} catch (error) {
  console.log("✗ Valid document rejected:", error.message)
}

// Test invalid documents
try {
  db.collection.insertOne(invalidDocument)
  console.log("✗ Invalid document accepted")
} catch (error) {
  console.log("✓ Invalid document correctly rejected:", error.message)
}
```

### 6. Debugging Validation Errors
```javascript
// Get detailed validation error information
db.runCommand({
  insert: "collection",
  documents: [invalidDocument],
  ordered: false
})
```

## Summary: Your Journey to Expert Level

You've now learned:

1. **Level 1-2**: Basic validation with simple types and required fields
2. **Level 3-4**: Arrays, nested objects, and complex patterns
3. **Level 5-6**: Advanced arrays with object elements and conditional logic
4. **Level 7-8**: Multi-collection systems and business logic
5. **Level 9-10**: Expert patterns for real-world applications

**Key Takeaways:**
- Start simple and add complexity gradually
- Always validate user input at the database level
- Use appropriate data types for your use case
- Consider performance implications of your validation rules
- Test your validation thoroughly
- Plan for future changes and growth

**Remember:** Good validation is like a good bouncer - it keeps the troublemakers out while letting the good data in smoothly!

You're now ready to design and implement MongoDB validation schemas for any real-world application. The key is to understand your data, anticipate problems, and build robust validation that grows with your needs.