// ### **Basic Filtering & Counting**
// 1. Count total number of users
// 2. Count total number of products
// 3. Find all products with price greater than $100
// 4. Find all orders with status "delivered"
// 5. Count orders by status
// 6. Find users created in the last 30 days
// 7. List all category names
// 8. Find products in "Electronics" category
// 9. Count reviews with 5-star ratings
// 10. Find all pending orders

//1) solution_for_question1 , we can write sfq1, rest same like sfq2,sfq3... 
//2) since server and db calls are async calls, we can name
// freind function and write answers one by one

const con = require("./index");



 async function friend(){
    try{
      const {orders,users,products,categories} = await con();

        const completed = async () =>{
        // 1) Count total number of users

        let sfq1 = await users.countDocuments(); //for accuracy, ans -> 200000 , for accuracy 

        let sfq1_v2 = await users.estimatedDocumentCount(); // ans -> 200000 , for performance and rough clarity

        // `count()` is deprecated in MongoDB. Use `countDocuments()` for accurate, transaction-aware counts
        // or `estimatedDocumentCount()` for fast, approximate counts. `count()` estimates document matches
        // using metadata, not cursor state, and may be inaccurate. It’s unsafe in transactions as it
        // ignores uncommitted changes, unlike `countDocuments()`, which respects session/transaction changes.


        //  either use estimatedDocumentCount method or 
        // countDocuments()



        // 2) Count total number of products
        let sfq2 = await products.countDocuments(); //ans -> 200000

        let sfq2_v2 = await products.estimatedDocumentCount(); // ans -> 200000  


        // 3) Find all products with price greater than $100 
        let sfq3 = await products.find({price:{$gt:999.99}}).toArray();
        //  toArray() loads entire results into memory 

        sfq3.forEach(doc => {
          console.log(doc);
        });
        // forEach loads one doc at once , great for streaming large data sets , great for performance 


        // 

        let sfq4 = await orders.find({status:"delivered"}).toArray() ;// [{ delivered: 499675 }]

        // Find all orders with status "delivered"

        let sfq4_v2 = await orders.aggregate([{$match:{status:"delivered"}},{$group:{_id:"status",total:{$sum:1}}},{$project:{_id:0,delivered:"$total"}}]).toArray();//[ { delivered: 499675 } ]
        let sfq4_v3 = await orders.countDocuments({status:"delivered"}); // res -> 499675 , 
        let sfq4_v4 = await orders.aggregate([
                                                { $match: { status: "delivered" } },
                                                { $group: { _id: null, delivered: { $sum: 1 } } },
                                                { $project: { _id: 0, delivered: 1 } }
                                              ]).toArray();
        console.log(sfq4_v4); // [{ delivered: 499675 }] 

        let sfq4_v5 = await orders.aggregate([
                                                { $match: { status: "delivered" } },
                                                { $count: "delivered" }
                                              ]
                                              )
        // sfq5_v4 returns cursor so we have to unpack
        console.log( await sfq5_v3.next())
        let sfq4_v6 = await orders.aggregate([
                                                {
                                                  $facet: {
                                                    delivered: [
                                                      { $match: { status: "delivered" } },
                                                      { $count: "count" },
                                                      { $project: { _id: 0, delivered: "$count" } }
                                                    ]
                                                  }
                                                },
                                                { $unwind: "$delivered" }
                                              ]
                                              )
        
        console.log(await sfq4_v6.next()); // { delivered: { delivered: 499675 } }
        

        let sfq4_v7 = await orders.aggregate([
                                              {$facet: {
                                                delivered: [
                                                  {$match: {status: "delivered"}},
                                                  {$count: "count"}
                                                ],
                                                pending: [
                                                  {$match: {status: "pending"}},
                                                  {$count: "count"}
                                                ]
                                              }}
                                            ]);
        console.log(await sfq4_v7.next());     //{ delivered: [ { count: 499675 } ], pending: [ { count: 499043 } ] }
    


    // 5) Count orders by status 

    let sfq5 = await orders.aggregate([{$group:{_id:"$status",count:{$sum:1}}}]) ;
    // console.log(await sfq5.toArray());
    // ans -> [
                                            // { _id: 'cancelled', count: 499756 },
                                            // { _id: 'shipped', count: 501526 },
                                            // { _id: null, count: 4 },
                                            // { _id: 'delivered', count: 499675 },
                                            // { _id: 'pending', count: 499043 }
                                          // ]

    // 6)Find users created in the last 30 days

    let now = new Date();
    let thirty_days_ago = new Date(now);
    thirty_days_ago.setDate(now.getDate()-30);
    // console.log(now,thirty_days_ago);
    let sfq6 = await users.find({$and:[{createdAt:{$lt:now}},{createdAt:{$gt:thirty_days_ago}}] }).sort({createdAt:-1}).limit(5);
    // let sfq6 = await users.find({$and:[{createdAt:{$lt:new Date()}},{createdAt:{$gt:new Date(new Date().getTime()-30*24*60*60*1000)}}] }).sort({createdAt:-1}).limit(5);
    console.log(await sfq6.toArray());
                                 
    }
    // completed()


    // 7)List all category names

    const sfq7 = await categories.distinct("name");
    console.log(sfq7);
    const sfq7_v2 = await categories.aggregate([{$group:{_id:"$name"}},{$project:{_id:0,name:"$_id"}}]);
    console.log(await sfq7_v2.toArray())
    


    

    }catch(e){
        console.error(e.message);
    }

}



friend()