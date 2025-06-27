// creating a fake ecommerce db , so that we can practice some questions ,
// practice questions are there in practice.js
// after installing and impementing database don't forget to comment generateAll() in this i have commented in the end
//  here i've purposefully commmented since in my case , fake db is generated

// >Note : uncomment generateAll() function for successfull generation of fak ecom_db in your local machine

// npm install @faker-js/faker mongodb
// i've tried faker olden version throwing errors 

const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker'); // Updated import

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'ecom_db';
let client =null;
let db;



// Helper: Generate batches to handle large datasets
async function generateInBatches(collection, data, batchSize = 10000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    try {
      await collection.insertMany(batch, { ordered: false });
      console.log(`Inserted ${Math.min(i + batchSize, data.length)}/${data.length} records for ${collection.collectionName}`);
    } catch (err) {
      console.error(`Error in batch ${i}:`, err.message);
    }
  }
}

// Main function to generate all collections
async function generateAll() {
  client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);

    // Drop all collections to start fresh
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection ${collection.name}`);
    }

    console.log('Starting data generation...');

    // Generate Categories (~50)
    const categories = [];
    const categoryNames = [
      'Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Beauty', 'Jewelry',
      'Furniture', 'Automotive', 'Health', 'Pets', 'Groceries', 'Office Supplies', 'Music',
    ];

    for (let i = 0; i < Math.min(50, categoryNames.length); i++) {
      categories.push({
        name: categoryNames[i],
        description: faker.lorem.sentence(),
      });
    }

    await db.collection('categories').insertMany(categories);
    console.log('Inserted ~50 categories');

    // Generate Users (100,000)
    const users = [];
    for (let i = 0; i < 100000; i++) {
      users.push({
        username: `${faker.internet.username()}_${i}`,
        email: faker.internet.email().toLowerCase(),
        passwordHash: faker.string.alphanumeric(64), // Updated method
        createdAt: faker.date.past({ years: 2 }), // Updated method
      });
    }
    await generateInBatches(db.collection('users'), users);

    // Generate Products (100,000)
    const categoryIds = (await db.collection('categories').find({}, { projection: { _id: 1 } }).toArray()).map(c => c._id);
    const products = [];
    for (let i = 0; i < 100000; i++) {
      products.push({
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }), // Updated method
        categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
        createdAt: faker.date.past({ years: 2 }), // Updated method
      });
    }
    await generateInBatches(db.collection('products'), products);

    // Generate Inventory (100,000)
    const productIds = (await db.collection('products').find({}, { projection: { _id: 1 } }).toArray()).map(p => p._id);
    const inventory = [];
    for (let i = 0; i < 100000; i++) {
      inventory.push({
        productId: productIds[i],
        stock: faker.number.int({ min: 0, max: 500 }), // Updated method
        lastUpdated: faker.date.recent(),
      });
    }
    await generateInBatches(db.collection('inventory'), inventory);

    // Generate Orders (1,000,000)
    const userIds = (await db.collection('users').find({}, { projection: { _id: 1 } }).toArray()).map(u => u._id);
    const orders = [];
    const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    for (let i = 0; i < 1000000; i++) {
      orders.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        totalAmount: faker.number.float({ min: 20, max: 5000, precision: 0.01 }), // Updated method
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: faker.date.past({ years: 1 }), // Updated method
      });
    }
    await generateInBatches(db.collection('orders'), orders);

    // Generate Order Items (3,000,000)
    const orderIds = (await db.collection('orders').find({}, { projection: { _id: 1 } }).toArray()).map(o => o._id);
    const productsWithPrices = await db.collection('products').find({}, { projection: { _id: 1, price: 1 } }).toArray();
    const orderItems = [];
    for (let i = 0; i < 3000000; i++) {
      const product = productsWithPrices[Math.floor(Math.random() * productsWithPrices.length)];
      orderItems.push({
        orderId: orderIds[Math.floor(Math.random() * orderIds.length)],
        productId: product._id,
        quantity: faker.number.int({ min: 1, max: 10 }), // Updated method
        unitPrice: product.price,
      });
    }
    await generateInBatches(db.collection('orderitems'), orderItems);

    // Generate Reviews (500,000)
    const reviews = [];
    for (let i = 0; i < 500000; i++) {
      reviews.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        productId: productIds[Math.floor(Math.random() * productIds.length)],
        rating: faker.number.int({ min: 1, max: 5 }), // Updated method
        comment: faker.lorem.sentences({ min: 2, max: 2 }), // Updated method
        createdAt: faker.date.past({ years: 1 }), // Updated method
      });
    }
    await generateInBatches(db.collection('reviews'), reviews);

    // Generate Carts (100,000)
    const carts = [];
    for (let i = 0; i < 100000; i++) {
      const items = [];
      const itemCount = faker.number.int({ min: 1, max: 5 }); // Updated method

      for (let j = 0; j < itemCount; j++) {
        items.push({
          productId: productIds[Math.floor(Math.random() * productIds.length)],
          quantity: faker.number.int({ min: 1, max: 10 }), // Updated method
        });
      }

      if (i < userIds.length) {
        carts.push({
          userId: userIds[i],
          items,
          updatedAt: faker.date.recent(),
        });
      }
    }
    await generateInBatches(db.collection('carts'), carts);

    // Generate Addresses (100,000)
    const addresses = [];
    for (let i = 0; i < 100000; i++) {
      addresses.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        street: faker.location.streetAddress(), // Updated method
        city: faker.location.city(), // Updated method
        state: faker.location.state(), // Updated method
        postalCode: faker.location.zipCode(), // Updated method
        country: faker.location.country(), // Updated method
      });
    }
    await generateInBatches(db.collection('addresses'), addresses);

    // Generate Payments (1,000,000)
    const ordersWithAmounts = await db.collection('orders').find({}, { projection: { _id: 1, totalAmount: 1 } }).toArray();
    const payments = [];
    const methods = ['credit_card', 'paypal', 'bank_transfer'];
    const paymentStatuses = ['completed', 'pending', 'failed'];
    for (let i = 0; i < 1000000; i++) {
      const order = ordersWithAmounts[i];
      payments.push({
        orderId: order._id,
        amount: order.totalAmount,
        method: methods[Math.floor(Math.random() * methods.length)],
        status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        createdAt: faker.date.past({ years: 1 }), // Updated method
      });
    }
    await generateInBatches(db.collection('payments'), payments);

    // Generate Support Tickets (50,000)
    const tickets = [];
    const ticketStatuses = ['open', 'in_progress', 'closed'];
    for (let i = 0; i < 50000; i++) {
      tickets.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)],
        createdAt: faker.date.past({ years: 1 }), // Updated method
      });
    }
    await generateInBatches(db.collection('supporttickets'), tickets);

    // Generate Wishlists (100,000)
    const wishlists = [];
    for (let i = 0; i < 100000; i++) {
      const productCount = faker.number.int({ min: 1, max: 10 }); // Updated method
      const wishlistProductIds = [];
      for (let j = 0; j < productCount; j++) {
        wishlistProductIds.push(productIds[Math.floor(Math.random() * productIds.length)]);
      }
      if (i < userIds.length) {
        wishlists.push({
          userId: userIds[i],
          productIds: wishlistProductIds,
          updatedAt: faker.date.recent(),
        });
      }
    }
    await generateInBatches(db.collection('wishlists'), wishlists);

    console.log('All collections generated successfully!');
  } catch (err) {
    console.error('Error:', err);
  } 
}

// generateAll(); 

// comment this after generating ecom db otherwise it will insert freshly again and again 


const con = async ()=>{
    client = new MongoClient(uri);
try {
    await client.connect();
    db = client.db(dbName);
    global.db = db;
    const orders = db.collection("orders");
    const carts = db.collection("carts");
    const reviews = db.collection("reviews");
    const supporttickets = db.collection("supporttickets");
    const addresses = db.collection("addresses");
    const categories = db.collection("categories");
    const inventory = db.collection("inventory");
    const orderitems = db.collection("orderitems");
    const payments = db.collection("payments");
    const  wishlists = db.collection("wishlists");
    const  products = db.collection("products");
    const users = db.collection("users"); 
    console.log('Connected to MongoDB');
    return {db,orders, addresses,carts,categories,inventory,orderitems,payments,products,reviews,supporttickets,users,wishlists} ;
}catch(e){
    console.log(e.message);
}}

module.exports = con ;

// now go to practice.js for practice