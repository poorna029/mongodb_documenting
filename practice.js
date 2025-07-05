//1) solution_for_question1 , we can write sfq1, rest same like sfq2,sfq3... 
//2) since server and db calls are async calls, we can name
// freind function and write answers one by one



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




// 11. Count products by category
// 12. Count orders by user
// 13. Sum total amount of all orders
// 14. Count reviews by rating
// 15. Group users by creation year
// 16. Count support tickets by status
// 17. Group orders by month
// 18. Count products by price range (0-50, 51-100, 100+)
// 19. Count inventory items by stock level (0, 1-10, 11-50, 50+)
// 20. Group payments by method

const con = require("./index");



 async function friend(){
    try{
      const {orders,users,products,categories,reviews,supporttickets,inventory,payments} = await con();

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



    // 7)List all category names

    const sfq7 = await categories.distinct("name");
    console.log(sfq7);
    const sfq7_v2 = await categories.aggregate([{$group:{_id:"$name"}},{$project:{_id:0,name:"$_id"}}]);
    console.log(await sfq7_v2.toArray())
    const sfq7_v3 = await categories.aggregate([
                                                {
                                                    $group: {
                                                      _id: null,
                                                      names: { $addToSet: "$name" }
                                                    }
                                                  },
                                                  {
                                                    $project: {
                                                      _id: 0,
                                                      names: 1
                                                    }
                                                  }
                                                ]);
    console.log(await sfq7_v3.toArray());

    // 8) Find products in "Electronics" category

    const sfq8 = await products.aggregate([{$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"e_products"}},
                                           {$match:{"e_products.0":{$exists:true}}},
                                          //  {$unwind: "$e_products"},
                                           {$match:{"e_products.name":"Electronics"}},
                                           {$project:{name:1,categoryDescription:"$e_products.description",categoryName:"$e_products.name"}},
                                           {$limit:2}
                                          ]);
      // lookup : which joins prodects and categories :

            // "First, go to the products collection — that's our main list of items."
            // "For each product, use its categoryId field to find a matching category in the categories collection."
            // "Match the product’s categoryId with the _id of the category, and put the result into 
            // a new field called e_products."

      // match: do we need this filter ? -> {$match:{"e_products.0":{$exists:true}}} 
            // actually no , only if there's always a perfect match of every product's categoryId that matches
            // any one of the _id field in categories collection , but
            // still it is a low cost safety check and heavy performance boost , best practice , 
            // for now its alright everything , it catches up future possible mismatches if any
      
      // match : why {$match:{"e_products.name":"Electronics"}}
            // 
            // we only need products category of Electronics , so we used this match 
            // can we use multiple , yes we can 



      // result :  {
                      // _id: new ObjectId('685e9641c9f627da9a3623be'),
                      // name: 'Small Bronze Soap',
                      // categoryDescription: [ 'Paens alter voveo subito repudiandae dolore trepide dolor.' ],
                      // categoryName: [ 'Electronics' ]
                // }
      // here we are getting , categoryDescription and categoryName as array values now this is not good , so for this we use unwind 


      // observation here , don't use unwind before {$match:{"e_products.0":{$exists:true}}},
      // since e_products has no more arrays pipeline get 0 results

      const sfq8_v2 = await products.aggregate([{$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"e_products"}},
                                           {$match:{"e_products.0":{$exists:true}}},
                                           {$unwind: "$e_products"},
                                           {$match:{"e_products.name":"Electronics"}},
                                           {$project:{name:1,categoryDescription:"$e_products.description",categoryName:"$e_products.name"}},
                                           {$limit:2}
                                          ]);


      const sfq8_v3= await products.aggregate([{$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"e_products"}},
                                           {$unwind: "$e_products"},
                                           {$match:{"e_products.name":"Electronics"}},
                                           {$project:{name:1,categoryDescription:"$e_products.description",categoryName:"$e_products.name"}},
                                           
                                           {$limit:2}
                                          ]);
      
      while(await sfq8.hasNext()){
        console.log(await sfq8.next());
      }
      console.log("***********************************************");
      while(await sfq8_v2.hasNext()){
        console.log(await sfq8_v2.next());
      }
      console.log("***********************************************");
      while(await sfq8_v3.hasNext()){
        console.log(await sfq8_v3.next());
      }

      // 9) Count reviews with 5-star ratings
      const sfq9 = await reviews.countDocuments({rating:5}); 

      const sfq9_v2 = await reviews.aggregate([{$match:{rating:5}},{$group:{_id:"5 star rating",count:{$sum:1}}}]);

      console.log(await sfq9);


      // 10) Find all pending orders 

      const sfq10 = await orders.find({status:"pending"})
      
      const sfq10_count = await orders.countDocuments({status:"pending"});

      // while(await sfq10.hasNext()){
      //   console.log(sfq10.next());
      // }
      console.log(await sfq10)


      // 11. Count products by category 

      const sfq11 = await products.aggregate([{$group:{_id:"$categoryId",count:{$sum:1}}}]);
      console.log(await sfq11.toArray())

      const sfq11_v2 = await categories.aggregate([{$lookup:{from:"products",localField:"_id",foreignField:"categoryId",as :"categorywise_products"}},
        {$group:{_id:"$_id",name:{$first:"$name"},count:{$sum:{$size:"$categorywise_products"}}}},
        {$project:{_id:0,name:1,count:1}},
      {$sort:{name:1}}]);

      // what i've learned here is if you want group and you don't want to miss each category name labelling , 
      // you have to explicitly carryforward it like ,name:{$first:"$name"} whatever the name it encounters first in the name field it carry farwards to next stage
      // otherwise it will remove the field 

      console.log(await sfq11_v2.toArray());
       
      // const sfq11_v3 = await products.aggregate([
      //             { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      //             {
      //               $lookup: {
      //                 from: "categories",
      //                 localField: "_id",
      //                 foreignField: "_id",
      //                 as: "category"
      //               }
      //             },
      //             {
      //               $project: {
      //                 categoryName: { $arrayElemAt: ["$category.name", 0] },
      //                 productCount: "$count",_id:0
      //               }
      //             }
      //           ]);
      // stage flow : 1) groups with categoryId and gives count of each category ,
      //              2) lookup adds , category array corresponding to each id , in that array it consists data about categories collection id and name
      //              3) now , projecting what we want , but categoryName is like getting direct name from an object within an array
      //                 {$arrayEleAt:["required field",index]}

      
    const sfq11_v4 = await categories.aggregate([{$lookup:{from:"products",localField:"_id",foreignField:"categoryId",as : "product"}},
                                // after this you will get _id : with each category , name : name of the category , product : array of matched products 
                                // with respective categoyId of product with categories collection _id 
                                {$addFields:{count:{$size:"$product"}}},
                                // this give array size of different categoryId size respective product array 
                                {$project:{_id:0,name:1,count:1}}

                                ])
                      // flow : 1) get number of products under one category , so we will get array within new field 
                      //            2) add an extra field , which counts the array of product 
                      //            3) prject require fields

    // 12. Count orders by user

    const sfq12 = await orders.aggregate([{$group:{_id:"$userId",count:{$sum:1}}}]);
    
    
    const sfq12_v2 = await orders.aggregate([{$group:{_id:"$userId",Ordercount:{$sum:1}}},
                                              {$lookup:{from:"users",localField:"_id",foreignField:"_id",as :"order"}},
                                              // here localfieldId(_id) is not orderId , after aggregation localfieldId(_id) will be userId 
                                              {$project:{name:{$arrayElemAt:["$order.username",0]},email:{$arrayElemAt:["$order.email",0]},Ordercount:1}}
    ])
    

    
                                              // [{
                                              //   _id: new ObjectId('685e963ff7594f87e3d1c806'),
                                              //   Ordercount: 11,
                                              //   name: 'Russel_Pouros_10419',
                                              //   email: 'cleta37@yahoo.com'
                                              // },...many items]
    

    // 13) Sum total amount of all orders

    const sfq13 = await orders.aggregate([{$group:{_id:null,total:{$sum:"$totalAmount"}}}]);

    //    [ { _id: null, total: 5020658766.134685 } ]
    

    // 14) Count reviews by rating 

    const sfq14 = await reviews.aggregate([{$group:{_id:"$rating",count:{$sum:1}}}]) ; 

    console.log(await sfq14.toArray());//[
                                          //   { _id: 4, count: 199874 },
                                          //   { _id: 3, count: 200516 },
                                          //   { _id: 2, count: 199929 },
                                          //   { _id: 5, count: 200280 },
                                          //   { _id: 1, count: 199401 }
                                          // ]
    // 15. Group users by creation year 

                          //     const sfq15 = await users.aggregate([{$group:{_id:{$year:{date:"$createdAt"}},users:{$push:"$$ROOT"},count:{$sum:1}}},{
                          //   $project: {
                          //     year: "$_id",
                          //     users: 1,
                          //     count: 1,
                          //     _id: 0
                          //   }
                          // }]);

                          // const sfq15 = await users.aggregate([
                          //   {
                          //     $group: {
                          //       _id: {$year: "$createdAt"},
                          //       users: {$push: "$$ROOT"},
                          //       count: {$sum: 1}
                          //     }
                          //   },
                          //   {
                          //     $project: {
                          //       year: "$_id",
                          //       users: 1,
                          //       count: 1,
                          //       _id: 0
                          //     }
                          //   }
                          // ]);

                          const sfq15 = await users.aggregate([
                            {
                              $group: {
                                _id: {$year: "$createdAt"},
                                count: {$sum: 1}
                              }
                            },
                            {
                              $project: {
                                year: "$_id",
                                count: 1,
                                _id: 0
                              }
                            },
                            {
                              $sort: {year: 1}
                            }
                          ]);

                          const sfq15_v2 = await users.aggregate([
                            {
                              $group: {
                                _id: {$year: "$createdAt"},
                                userNames: {$push: "$username"},
                                count: {$sum: 1}
                              }
                            },
                            {
                              $project: {
                                joined_year: "$_id",
                                userNames: 1,
                                count: 1,
                                _id: 0
                              }
                            }
                          ]);
                              console.log(await sfq15_v2.toArray());
        // 16. Count support tickets by status 

    const sfq16 = await supporttickets.aggregate([{$group:{_id:"$status",count:{$sum:1}}},{$project:{status:"$_id",_id:0,count:1}}])

    // console.log(await sfq16.toArray());

                                       // [
                                       //   { count: 159, status: 'open' },
                                       //   { count: 186, status: 'closed' },
                                       //   { count: 155, status: 'in_progress' }
                                       // ]

    // 17. Group orders by month

    const sfq17 = await orders.aggregate([{$group:{_id:{year:{$year:"$createdAt"},month:{$month:"$createdAt"}},NoOfOrdersByMonth:{$sum:1},orderIDs:{$push:"$_id"}}},{$sort:{"_id.year":1,"_id.month":1}}]);
    // console.log(await sfq17.toArray());
                                        //[{
                                        //   _id: { year: 2024, month: 12 },
                                        //   NoOfOrdersByMonth: 12,
                                        //   orderIDs: [
                                        //     new ObjectId('68658dbbccda6db24eae18bc'),
                                        //     new ObjectId('68658dbbccda6db24eae18be'),
                                        //     new ObjectId('68658dbbccda6db24eae18c1'),
                                        //     new ObjectId('68658dbbccda6db24eae18cf'),
                                        //     new ObjectId('68658dbbccda6db24eae18d7'),
                                        //     new ObjectId('68658dbbccda6db24eae18dc'),
                                        //     new ObjectId('68658dbbccda6db24eae18ea'),
                                        //     new ObjectId('68658dbbccda6db24eae18ed'),
                                        //     new ObjectId('68658dbbccda6db24eae18f2'),
                                        //     new ObjectId('68658dbbccda6db24eae18f7'),
                                        //     new ObjectId('68658dbbccda6db24eae18fb'),
                                        //     new ObjectId('68658dbbccda6db24eae1901')
                                        //   ]
                                        // },...]

    // 18. Count products by price range (0-50, 51-100, 100+)

    const sfq18 = await products.aggregate([{$bucket:{groupBy:"$price",boundaries:[0,51,101,Infinity],default:"other",output:{count:{$sum:1}}}}]);
    // console.log(await sfq18.toArray());
                                        //[{
                                        //   _id: { year: 2025, month: 5 },
                                        //   NoOfOrdersByMonth: 10,
                                        //   orderIDs: [
                                        //     new ObjectId('68658dbbccda6db24eae18b7'),
                                        //     new ObjectId('68658dbbccda6db24eae18c2'),
                                        //     new ObjectId('68658dbbccda6db24eae18cb'),
                                        //     new ObjectId('68658dbbccda6db24eae18e3'),
                                        //     new ObjectId('68658dbbccda6db24eae18e6'),
                                        //     new ObjectId('68658dbbccda6db24eae18eb'),
                                        //     new ObjectId('68658dbbccda6db24eae18ec'),
                                        //     new ObjectId('68658dbbccda6db24eae18ee'),
                                        //     new ObjectId('68658dbbccda6db24eae18fd'),
                                        //     new ObjectId('68658dbbccda6db24eae1912')
                                        //   ]
                                        // },...]

    // 19. Count inventory items by stock level (0, 1-10, 11-50, 50+) 

    const sfq19 = await inventory.aggregate([{$bucket:{groupBy:"$stock",boundaries:[0,11,51,Infinity],default:"other",output:{count:{$sum:1}}}}]);
    // console.log(await sfq19.toArray());

                   // [ { _id: 0, count: 2 },    (0-10)
                   // { _id: 11, count: 5 },     (11-50)
                   //  { _id: 51, count: 93 } ]  (51+)

  // 20. Group payments by method : 

    const sfq20 = await payments.aggregate([{$group:{_id:"$method",count:{$sum:1}}},{$project:{method:"$_id",count:1,_id:0}}]);
    // console.log(await sfq20.toArray());

                              // [
                              //   { count: 38, method: 'bank_transfer' },
                              //   { count: 31, method: 'credit_card' },
                              //   { count: 31, method: 'paypal' }
                              // ]
    
    // ### **Basic Sorting & Limiting**

    // 21. Find top 10 most expensive products
    // 22. Find 5 most recent orders
    // 23. List users sorted by username alphabetically
    // 24. Find oldest 10 products
    // 25. Top 10 highest rated products (by average rating)
    // 26. Most recent 20 reviews
    // 27. Find cheapest 15 products
    // 28. Latest 10 support tickets
    // 29. Find 5 users with most orders
    // 30. Top 10 categories with most products


    // 21. Find top 10 most expensive products : 

    const sfq21 = await products.find().sort({price:-1}).limit(10);

    
    // console.log(await sfq21.toArray(),"hello");
                            // [
                            //   {
                            //     _id: new ObjectId('68658dbbccda6db24eae1828'),
                            //     name: 'Oriental Gold Chips',
                            //     description: 'Vinco volutabrum eaque impedit soluta cotidie degenero. Deprecator aperiam aeneus necessitatibus quam cupiditate alo. Sunt dens videlicet ratione arceo impedit tempora soluta tabesco colo.',
                            //     price: 993.2948670549474,
                            //     categoryId: new ObjectId('68658dbbccda6db24eae177e'),
                            //     createdAt: 2023-09-14T07:56:51.552Z
                            //   },...
                            // ]
    const sfq21_v2 = await products.aggregate([{$sort:{price:-1}},{$limit:10}]);
    // console.log(await sfq21_v2.toArray());
                            // [
                            //   {
                            //     _id: new ObjectId('68658dbbccda6db24eae1828'),
                            //     name: 'Oriental Gold Chips',
                            //     description: 'Vinco volutabrum eaque impedit soluta cotidie degenero. Deprecator aperiam aeneus necessitatibus quam cupiditate alo. Sunt dens videlicet ratione arceo impedit tempora soluta tabesco colo.',
                            //     price: 993.2948670549474,
                            //     categoryId: new ObjectId('68658dbbccda6db24eae177e'),
                            //     createdAt: 2023-09-14T07:56:51.552Z
                            //   },...
                            // ]

    // 22. Find 5 most recent orders

    const sfq22 = await orders.find().sort({createdAt:-1}).limit(5);
    // console.log(await sfq22.toArray());
                          //[
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae18f4'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17d7'),
                          //   totalAmount: 2645.428906310332,
                          //   status: 'cancelled',
                          //   createdAt: 2025-06-29T21:54:02.637Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1902'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17d0'),
                          //   totalAmount: 1974.627351097116,
                          //   status: 'delivered',
                          //   createdAt: 2025-06-29T14:55:04.917Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae18e4'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17da'),
                          //   totalAmount: 4146.756545881014,
                          //   status: 'cancelled',
                          //   createdAt: 2025-06-23T00:37:54.223Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1906'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17ba'),
                          //   totalAmount: 2408.0362279657793,
                          //   status: 'delivered',
                          //   createdAt: 2025-06-18T08:29:48.822Z
                          // },...]
    

    const sfq22_v2 = await orders.aggregate([{$sort:{createdAt:-1}},{$limit:5}]);
    // console.log(await sfq22_v2.toArray());

                          //     [
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae18f4'),
                          //     userId: new ObjectId('68658dbbccda6db24eae17d7'),
                          //     totalAmount: 2645.428906310332,
                          //     status: 'cancelled',
                          //     createdAt: 2025-06-29T21:54:02.637Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1902'),
                          //     userId: new ObjectId('68658dbbccda6db24eae17d0'),
                          //     totalAmount: 1974.627351097116,
                          //     status: 'delivered',
                          //     createdAt: 2025-06-29T14:55:04.917Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae18e4'),
                          //     userId: new ObjectId('68658dbbccda6db24eae17da'),
                          //     totalAmount: 4146.756545881014,
                          //     status: 'cancelled',
                          //     createdAt: 2025-06-23T00:37:54.223Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1906'),
                          //     userId: new ObjectId('68658dbbccda6db24eae17ba'),
                          //     totalAmount: 2408.0362279657793,
                          //     status: 'delivered',
                          //     createdAt: 2025-06-18T08:29:48.822Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae18bd'),
                          //     userId: new ObjectId('68658dbbccda6db24eae17ec'),
                          //     totalAmount: 64.63686411790306,
                          //     status: 'delivered',
                          //     createdAt: 2025-06-13T10:19:46.711Z
                          //   }
                          // ]
    // 23. List users sorted by username alphabetically

    const sfq23 = await users.find().sort({username:1}).limit(10);
    // wherever i use limit it is for simple output check,  but not because for query


    // console.log(await sfq23.toArray());

                          //   [
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17e8'),
                          //     username: 'Abe92_93',
                          //     email: 'constantin_boyle33@gmail.com',
                          //     passwordHash: 'aDBLiK32bPyvQq7aTdITMSHIN7CzC96XasRNSglErCAFKzt7TUj8ycMiwhIex2qU',
                          //     createdAt: 2024-05-04T01:27:28.161Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17bb'),
                          //     username: 'Adah.Fay68_48',
                          //     email: 'tianna.krajcik44@yahoo.com',
                          //     passwordHash: 'DyuhI4wjXUbzXdcj4JOdBU8w0FgxDIoru3fB8WAEuT41MLaWl0XhV44T4sqiWsBl',
                          //     createdAt: 2024-06-04T17:47:35.157Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17a3'),
                          //     username: 'Adriana37_24',
                          //     email: 'robin_heathcote@hotmail.com',
                          //     passwordHash: 'PxFBExb0Q6Vrmjy2CJqM4ajdXmIBPi6c1stARQ3o6J4177n8DMds5cFNnI7gWZ5n',
                          //     createdAt: 2023-11-01T13:36:23.594Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17e0'),
                          //     username: 'Amiya_Hilpert_85',
                          //     email: 'cindy.dickinson@hotmail.com',
                          //     passwordHash: 'FRqLtt1IJtPJVQVBoEa6x4tSVeMU60nznjOMdMzr4YnIGYMOW7LTWOcCu1nwt9d3',
                          //     createdAt: 2023-08-19T13:47:11.011Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17d8'),
                          //     username: 'Anita.Gottlieb_77',
                          //     email: 'lawrence_smitham38@hotmail.com',
                          //     passwordHash: 'YfTWslVe6f2wtKHACIafobmmwy3AxsP1bx8w8qsqLtSlJD5yDCmeQhM7kqymb6BS',
                          //     createdAt: 2025-03-17T03:52:07.154Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17e9'),
                          //     username: 'Bettye26_94',
                          //     email: 'lance8@gmail.com',
                          //     passwordHash: 'LZ5nMGLAk7PE5OpeKernLCgpYaUuZR8UrqZGQFHynLbpmcYW8CJFJFORr3o1UFyG',
                          //     createdAt: 2025-02-14T12:23:38.010Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17d7'),
                          //     username: 'Brandi.Schaden73_76',
                          //     email: 'vivianne.smitham@hotmail.com',
                          //     passwordHash: '7vOb6Hspv81H8z0pgVIxfbK7xv6DANcMAvHDdlsnNC0f8vGnsZEPuqq0wSp9Awaj',
                          //     createdAt: 2025-01-31T10:41:08.870Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1798'),
                          //     username: 'Brendon.Pacocha11_13',
                          //     email: 'kieran_cummerata@yahoo.com',
                          //     passwordHash: 'klSjvWLc3ItaYUQvPFrZwjA4RW3zDjZuYnEcDo35FJkRZ5YIGT0oN3OghMuBm5Zi',
                          //     createdAt: 2024-11-28T18:04:09.944Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1792'),
                          //     username: 'Carlos16_7',
                          //     email: 'rodger_oreilly@yahoo.com',
                          //     passwordHash: '8sKqyc8ajqM9XEA5RgwS0BY60bzjq5xn8TkOFE4mg34DXnDXPpYUzAjIUanJZ7FB',
                          //     createdAt: 2023-08-10T00:19:04.475Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17c6'),
                          //     username: 'Carolyne_Donnelly53_59',
                          //     email: 'chadd.kemmer@hotmail.com',
                          //     passwordHash: 'YZJ1wn7Oiv6oYdqp0jyH33PTxYE6H8Y9EZ8Kfp0NLMMP5zXuiELSTljAf8zlYekW',
                          //     createdAt: 2025-02-04T06:13:48.875Z
                          //   }
                          // ]
    const sfq23_v2 = await users.aggregate([{$sort:{username:1}},{$limit:10}]);
    // console.log(await sfq23_v2.toArray());

    // i am not copying exact results everywhere just copying to showcase , how will be the output


                          //   [
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17e8'),
                          //     username: 'Abe92_93',
                          //     email: 'constantin_boyle33@gmail.com',
                          //     passwordHash: 'aDBLiK32bPyvQq7aTdITMSHIN7CzC96XasRNSglErCAFKzt7TUj8ycMiwhIex2qU',
                          //     createdAt: 2024-05-04T01:27:28.161Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae17bb'),
                          //     username: 'Adah.Fay68_48',
                          //     email: 'tianna.krajcik44@yahoo.com',
                          //     passwordHash: 'DyuhI4wjXUbzXdcj4JOdBU8w0FgxDIoru3fB8WAEuT41MLaWl0XhV44T4sqiWsBl',
                          //     createdAt: 2024-06-04T17:47:35.157Z
                          //   },
    // 24. Find oldest 10 products 

    const sfq24 = await products.find().sort({createdAt:1}).limit(10);

    // console.log(await sfq24.toArray()); 
                          //   [
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1817'),
                          //     name: 'Licensed Plastic Car',
                          //     description: 'Adflicto nemo officiis tribuo delinquo. Suffoco tersus debeo. Bellicus supra adstringo adficio vindico.',
                          //     price: 541.9734185662137,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1789'),
                          //     createdAt: 2023-07-08T07:40:35.927Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1800'),
                          //     name: 'Ergonomic Concrete Ball',
                          //     description: 'Cometes adhuc sollers acquiro dolores at vulticulus currus adopto tam. Tonsor amita suadeo allatus thymbra culpo thalassinus blandior. Iure cometes cras consuasor astrum communis.',
                          //     price: 902.6151502392977,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1781'),
                          //     createdAt: 2023-07-13T12:56:31.607Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae182f'),
                          //     name: 'Soft Wooden Hat',
                          //     description: 'Vindico sulum degero adulescens decet aegrotatio viridis vinum ambitus. Aestas cado tabella nemo utique. Decor adicio communis pectus tero volutabrum.',
                          //     price: 521.3800346872351,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1785'),
                          //     createdAt: 2023-07-19T03:27:09.229Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae183c'),
                          //     name: 'Fantastic Granite Hat',
                          //     description: 'Aranea stabilis vilicus crur caritas dicta absum considero quas. Succurro vociferor arguo voluntarius cariosus. Illum tantillus harum volubilis ago ter deleniti atrocitas strenuus.',
                          //     price: 715.7064955691374,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae177e'),
                          //     createdAt: 2023-07-24T08:33:11.899Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1840'),
                          //     name: 'Unbranded Granite Mouse',
                          //     description: 'Vicissitudo cotidie ascit auditor. Conspergo defendo substantia super cresco deporto. Sint vomito vorax vir complectus.',
                          //     price: 869.3916831928232,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1787'),
                          //     createdAt: 2023-08-03T02:40:56.348Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae181f'),
                          //     name: 'Generic Steel Shirt',
                          //     description: 'Autem advenio corrupti sollers arcesso. Uxor succedo utrimque turba suscipit spoliatio ago amiculum tot. Pauper villa ullus amissio.',
                          //     price: 70.7609985238856,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1786'),
                          //     createdAt: 2023-08-11T04:19:59.504Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1825'),
                          //     name: 'Frozen Bamboo Tuna',
                          //     description: 'Vado tepesco laborum pecco delibero cito. Minima cunabula similique territo vita suppellex altus inventore. Cursim uterque cunctatio.',
                          //     price: 314.1846727878849,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1789'),
                          //     createdAt: 2023-08-17T20:28:40.081Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1833'),
                          //     name: 'Fantastic Granite Soap',
                          //     description: 'Depopulo umerus utrimque triduana. Tempore caelum minus somnus amor curo absconditus utor minima damnatio. Articulus tollo nemo vinum strues.',
                          //     price: 959.074559973885,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1781'),
                          //     createdAt: 2023-08-24T11:59:03.025Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1816'),
                          //     name: 'Rustic Marble Bike',
                          //     description: 'Thorax depereo sit eos comis. Aegrus commodi aer thymbra cum corrupti. Depopulo adinventitias unde.',
                          //     price: 614.4791062149882,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1783'),
                          //     createdAt: 2023-09-07T00:21:15.172Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae183a'),
                          //     name: 'Gorgeous Rubber Computer',
                          //     description: 'Videlicet creptio cumque. Defero thesis cuppedia iure carbo dapifer vicinus. Cumque agnitio suppellex utrum rerum aequitas aegrotatio.',
                          //     price: 696.186745765028,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1788'),
                          //     createdAt: 2023-09-11T23:43:15.634Z
                          //   }
                          // ]
    const sfq24_v2 = await products.aggregate([{$sort:{createdAt:1}},{$limit:10}]);
    // console.log(await sfq24_v2.toArray());

                          //   [
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1817'),
                          //     name: 'Licensed Plastic Car',
                          //     description: 'Adflicto nemo officiis tribuo delinquo. Suffoco tersus debeo. Bellicus supra adstringo adficio vindico.',
                          //     price: 541.9734185662137,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1789'),
                          //     createdAt: 2023-07-08T07:40:35.927Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae1800'),
                          //     name: 'Ergonomic Concrete Ball',
                          //     description: 'Cometes adhuc sollers acquiro dolores at vulticulus currus adopto tam. Tonsor amita suadeo allatus thymbra culpo thalassinus blandior. Iure cometes cras consuasor astrum communis.',
                          //     price: 902.6151502392977,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1781'),
                          //     createdAt: 2023-07-13T12:56:31.607Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae182f'),
                          //     name: 'Soft Wooden Hat',
                          //     description: 'Vindico sulum degero adulescens decet aegrotatio viridis vinum ambitus. Aestas cado tabella nemo utique. Decor adicio communis pectus tero volutabrum.',
                          //     price: 521.3800346872351,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae1785'),
                          //     createdAt: 2023-07-19T03:27:09.229Z
                          //   },
                          //   {
                          //     _id: new ObjectId('68658dbbccda6db24eae183c'),
                          //     name: 'Fantastic Granite Hat',
                          //     description: 'Aranea stabilis vilicus crur caritas dicta absum considero quas. Succurro vociferor arguo voluntarius cariosus. Illum tantillus harum volubilis ago ter deleniti atrocitas strenuus.',
                          //     price: 715.7064955691374,
                          //     categoryId: new ObjectId('68658dbbccda6db24eae177e'),
                          //     createdAt: 2023-07-24T08:33:11.899Z
                          //   },
    // 25. Top 10 highest rated products (by average rating)

    const sfq25 = await products.aggregate([{$lookup:{from:"reviews",localField:"_id",foreignField:"productId",as:"highest_rated"}},{$unwind:"$highest_rated"},{$sort:{"highest_rated.rating":-1}},{$limit:10},{$project:{_id:0,name:1,price:1,rating:"$highest_rated.rating",createdAt:1}}]);
    // console.log(await sfq25.toArray());

                          // [
                          //   {
                          //     name: 'Fresh Aluminum Car',
                          //     price: 803.9699758729361,
                          //     createdAt: 2023-11-03T21:06:39.404Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Sleek Bamboo Computer',
                          //     price: 789.9584081881837,
                          //     createdAt: 2024-04-06T19:08:10.821Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Soft Silk Towels',
                          //     price: 448.1328002143344,
                          //     createdAt: 2024-09-09T05:02:16.973Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Fresh Aluminum Car',
                          //     price: 803.9699758729361,
                          //     createdAt: 2023-11-03T21:06:39.404Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Incredible Bronze Gloves',
                          //     price: 567.545082454347,
                          //     createdAt: 2023-11-17T15:59:03.595Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Soft Silk Towels',
                          //     price: 448.1328002143344,
                          //     createdAt: 2024-09-09T05:02:16.973Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Electronic Aluminum Car',
                          //     price: 756.879854916901,
                          //     createdAt: 2024-08-11T15:25:22.499Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Soft Silk Towels',
                          //     price: 448.1328002143344,
                          //     createdAt: 2024-09-09T05:02:16.973Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Sleek Bamboo Computer',
                          //     price: 789.9584081881837,
                          //     createdAt: 2024-04-06T19:08:10.821Z,
                          //     rating: 5
                          //   },
                          //   {
                          //     name: 'Fresh Aluminum Car',
                          //     price: 803.9699758729361,
                          //     createdAt: 2023-11-03T21:06:39.404Z,
                          //     rating: 5
                          //   }
                          // ]
    
    // 26. Most recent 20 reviews 

                                                          
  }
    // completed()
    



    
    const sfq26 = await reviews.find().sort({createdAt:-1}).limit(20);
    // console.log(await sfq26.toArray());


                          //   [
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1bf9'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17af'),
                          //   productId: new ObjectId('68658dbbccda6db24eae1817'),
                          //   rating: 5,
                          //   comment: 'Cresco alii somniculosus decens. Depopulo tum adeo tum.',
                          //   createdAt: 2025-07-02T11:02:20.455Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1c14'),
                          //   userId: new ObjectId('68658dbbccda6db24eae178f'),
                          //   productId: new ObjectId('68658dbbccda6db24eae181c'),
                          //   rating: 2,
                          //   comment: 'Vinum ipsam saepe altus carbo saepe. Vacuus deripio ratione delicate nemo spargo.',
                          //   createdAt: 2025-06-30T01:42:31.617Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1b14'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17ea'),
                          //   productId: new ObjectId('68658dbbccda6db24eae183f'),
                          //   rating: 5,
                          //   comment: 'Provident volaticus tabesco arma tergiversatio consuasor aqua sponte studio volva. Carcer voluntarius reprehenderit abscido corroboro.', 
                          //   createdAt: 2025-06-29T18:26:07.750Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1b68'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17b2'),
                          //   productId: new ObjectId('68658dbbccda6db24eae17f0'),
                          //   rating: 5,
                          //   comment: 'Tabernus voluptate ager tamdiu. Tristis cotidie aro sperno maiores.',
                          //   createdAt: 2025-06-29T12:42:09.164Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1aa1'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17c9'),
                          //   productId: new ObjectId('68658dbbccda6db24eae17f2'),
                          //   rating: 3,
                          //   comment: 'Volva curo vulariter taedium tantum clamo utor despecto tego solvo. Quasi agnosco volaticus suffoco ea callide vorago decimus.',
                          //   createdAt: 2025-06-29T11:01:48.592Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1a98'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17c2'),
                          //   productId: new ObjectId('68658dbbccda6db24eae1831'),
                          //   rating: 4,
                          //   comment: 'Ver audacia amplus triduana aro. Beatae speciosus provident canis causa.',
                          //   createdAt: 2025-06-28T11:23:18.675Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1a66'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17e1'),
                          //   productId: new ObjectId('68658dbbccda6db24eae1811'),
                          //   rating: 1,
                          //   comment: 'Tepidus caput barba curia clarus decerno alias cogito nobis volaticus. Nam attero caries.',
                          //   createdAt: 2025-06-27T09:29:36.710Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1be8'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17c6'),
                          //   productId: new ObjectId('68658dbbccda6db24eae180b'),
                          //   rating: 2,
                          //   comment: 'Solum solus calculus soluta denuo debilito thymum suadeo debeo sodalitas. Odit absens verbera acies denuo vergo concido tonsor terminatio aurum.',
                          //   createdAt: 2025-06-27T04:37:28.307Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1a60'),
                          //   userId: new ObjectId('68658dbbccda6db24eae179d'),
                          //   productId: new ObjectId('68658dbbccda6db24eae1806'),
                          //   rating: 5,
                          //   comment: 'Voluptate depraedor rerum solus veritas debilito turpis concido porro celer. Ara dolore barba caries amplexus voluptates amita celer coniuratio.',
                          //   createdAt: 2025-06-25T14:53:51.650Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1aa4'),
                          //   userId: new ObjectId('68658dbbccda6db24eae1796'),
                          //   productId: new ObjectId('68658dbbccda6db24eae180d'),
                          //   rating: 1,
                          //   comment: 'Tenetur condico caute impedit nobis maiores via solium. Verumtamen desolo explicabo usitas alias abundans.',
                          //   createdAt: 2025-06-24T04:29:56.377Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1b89'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17a6'),
                          //   productId: new ObjectId('68658dbbccda6db24eae182b'),
                          //   rating: 1,
                          //   comment: 'Audax villa valetudo esse angulus amitto voveo agnitio despecto. Omnis carus absorbeo facere agnosco vapulus.',
                          //   createdAt: 2025-06-23T09:51:13.418Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1bfe'),
                          //   userId: new ObjectId('68658dbbccda6db24eae179b'),
                          //   productId: new ObjectId('68658dbbccda6db24eae184f'),
                          //   rating: 4,
                          //   comment: 'Adeptio eveniet unus adstringo. Voro cedo conscendo stipes victoria admoveo curia.',
                          //   createdAt: 2025-06-23T02:04:55.274Z
                          // },
                          // {
                          //   _id: new ObjectId('68658dbbccda6db24eae1b8e'),
                          //   userId: new ObjectId('68658dbbccda6db24eae17d3'),
                          //   productId: new ObjectId('68658dbbccda6db24eae184b'),
                          //   rating: 5,
                          //   comment: 'Modi capto copia cotidie colo ea tardus decumbo. Bene utrimque aegrotatio xiphias virga carmen pecus coaegresco usitas.',
                          //   createdAt: 2025-06-22T11:14:35.744Z
                          // },...]
    const sfq26_V2 = await reviews.aggregate([{$sort:{createdAt:-1}},{$limit:20}]);
    // console.log(await sfq26_V2.toArray());  
    
    // 27. Find cheapest 15 products
    // 28. Latest 10 support tickets
    // 29. Find 5 users with most orders
    // 30. Top 10 categories with most products

    // 27. Find cheapest 15 products

    const sfq27 = await products.find().sort({price:1}).limit(15);
    // console.log(await sfq27.toArray());
    /*
                           [
                            {
                              _id: new ObjectId('68658dbbccda6db24eae17fb'),
                              name: 'Handmade Steel Bike',
                              description: 'Aggero asperiores acsi temporibus verbum valens. Victoria odit tergeo certe ipsa ademptio deserunt soleo defessus xiphias. Valeo deserunt tertius conculco contra.',
                              price: 16.552300922663296,
                              categoryId: new ObjectId('68658dbbccda6db24eae1786'),
                              createdAt: 2023-11-19T22:18:47.907Z
                            },
                            {
                              _id: new ObjectId('68658dbbccda6db24eae1850'),
                              name: 'Handmade Steel Table',
                              description: 'Bellicus territo vesica qui viduo deprimo universe hic. Deserunt capio defungo hic porro accusantium corrumpo molestiae. Minima vilitas tersus similique alius cui contego teres aspernatur.',
                              price: 39.26968893174772,
                              categoryId: new ObjectId('68658dbbccda6db24eae177d'),
                              createdAt: 2024-03-11T05:19:51.454Z
                            },
                            
                            ...,
                            {
                              _id: new ObjectId('68658dbbccda6db24eae184f'),
                              name: 'Elegant Metal Mouse',
                              description: 'Cicuta spoliatio bos vicissitudo tametsi cohors creo advenio. Vitae amplitudo audax coepi amoveo minima. Concedo aequus quo porro desidero unde abundans tertius.',
                              price: 139.60838348334238,
                              categoryId: new ObjectId('68658dbbccda6db24eae177c'),
                              createdAt: 2024-02-17T05:22:33.748Z
                            }
                          ]
    */
   const sfq27_v2 = await products.aggregate([{$sort:{price:1}},{$limit:15}]);
  //  console.log(await sfq27_v2.toArray()); output is same as above no change so i am not pasting answer , 
  

  // 28. Latest 10 support tickets

  const sfq28 = await supporttickets.find().sort({createdAt:-1}).limit(10);
  // console.log(await sfq28.toArray());
  /*
                             [
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae1d89'),
                                  userId: new ObjectId('68658dbbccda6db24eae178d'),
                                  subject: 'Centum sunt adflicto decerno aequitas cuius arcesso canto vis modi.',
                                  description: 'Vae sol adeo cattus nisi tepesco comedo vobis vergo aperte. Beatae vergo sollicito dolores. Accendo cumque aggredior sufficio aegrotatio civis.',
                                  status: 'closed',
                                  createdAt: 2025-07-02T16:33:20.586Z
                                },
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae1ea9'),
                                  userId: new ObjectId('68658dbbccda6db24eae17cc'),
                                  subject: 'Vos corporis clarus congregatio taedium amplus creber utor blanditiis cariosus.',
                                  description: 'Delectatio sponte vicissitudo coadunatio. Defluo abundans officiis blanditiis. Validus volubilis ambitus vigilo dignissimos subito cupiditas defendo subnecto.',
                                  status: 'in_progress',
                                  createdAt: 2025-07-01T08:57:39.584Z
                                },...,
                                
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae1f08'),
                                  userId: new ObjectId('68658dbbccda6db24eae178d'),
                                  subject: 'Aliquid alioqui reprehenderit abbas tergum.',
                                  description: 'Sol cetera triumphus cado ocer autus. Comis summisse dens auctor stabilis utrimque cena carmen suffragium cito. Audax peior denuncio vita totam sponte.',
                                  status: 'closed',
                                  createdAt: 2025-06-24T06:28:37.314Z
                                }
                              ]

   */
  const sfq28_v2 = await supporttickets.aggregate([{$sort:{createdAt:-1}},{$limit:10}]);
  // console.log(await sfq28_v2.toArray());

  // i am not posting , because there is no change in answer from the above answer

  // 29. Find 5 users with most orders

  const sfq29 = await users.aggregate([{$lookup:{from:"orders",localField:"_id",foreignField:"userId",as :"top_5_orders"}},{$addFields:{ordersCount:{$size:"$top_5_orders"}}},{$match:{ordersCount:{$gt:0}}},{$sort:{ordersCount:-1}},{$limit:5}]);
  // console.log(await sfq29.toArray());
  /* 
                                [
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae17ab'),
                                  username: 'Mason.Jerde96_32',
                                  email: 'elmer_oconner35@yahoo.com',
                                  passwordHash: 's8t0KZThtRGYXlxDO9Jn3fnsLMd6qMOCuTUfW2TUKNaLX5G6IVczkTGzIKjcTEjp',
                                  createdAt: 2023-09-01T15:25:13.966Z,
                                  top_5_orders: [ [Object], [Object], [Object] ],
                                  ordersCount: 3
                                },
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae1793'),
                                  username: 'Pascale.Klocko5_8',
                                  email: 'bertha1@gmail.com',
                                  passwordHash: 'TaVdHfbbCYNebxGCnFDVHZW5Era54PXZvWfqyPCBg0Gh4LVRCIsmD7mqQDcpJc25',
                                  createdAt: 2025-01-06T13:01:32.528Z,
                                  top_5_orders: [ [Object], [Object], [Object] ],
                                  ordersCount: 3
                                },
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae17ba'),
                                  username: 'Drew_Farrell45_47',
                                  email: 'maritza.turner25@hotmail.com',
                                  passwordHash: 'bKUjzYN2lc7wVjh6Nl4RQkWx6NLufN00YdbEvcNlFnDsCznrBEob7JfjUp0mTaRs',
                                  createdAt: 2024-01-21T04:16:26.257Z,
                                  top_5_orders: [ [Object], [Object], [Object] ],
                                  ordersCount: 3
                                },
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae17b3'),
                                  username: 'Nya.Gleichner_40',
                                  email: 'kari73@yahoo.com',
                                  passwordHash: 'L42TarxFADqbKdNglLr4WihMoXr2oj3YWNngJzVlwAwIoTfY8y2SRJ3W9gTzRrxL',
                                  createdAt: 2024-01-22T20:49:52.997Z,
                                  top_5_orders: [ [Object], [Object], [Object] ],
                                  ordersCount: 3
                                },
                                {
                                  _id: new ObjectId('68658dbbccda6db24eae1798'),
                                  username: 'Brendon.Pacocha11_13',
                                  email: 'kieran_cummerata@yahoo.com',
                                  passwordHash: 'klSjvWLc3ItaYUQvPFrZwjA4RW3zDjZuYnEcDo35FJkRZ5YIGT0oN3OghMuBm5Zi',
                                  createdAt: 2024-11-28T18:04:09.944Z,
                                  top_5_orders: [ [Object], [Object], [Object] ],
                                  ordersCount: 3
                                }
                              ]

  */
  const sfq29_v2 = await orders.aggregate([]); 

  




 
    
    
                            
    
    




    
    

    
    



    



    










    


    




    
    
    
    



      

    
    


    

    }catch(e){
        console.error(e.message);
    }

}



friend()