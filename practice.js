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
      const {orders,users,products,categories,reviews,supporttickets,inventory,payments,orderitems,carts,addresses} = await con();

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

  const sfq29 = await users.aggregate([{$lookup:{from:"orders",localField:"_id",foreignField:"userId",as :"top_5_orders"}},
                                       {$addFields:{ordersCount:{$size:"$top_5_orders"}}},
                                       {$match:{ordersCount:{$gt:0}}},
                                       {$sort:{ordersCount:-1}},
                                       {$limit:5}
                                      ]);
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
  const sfq29_v2 = await orders.aggregate([{$group:{_id:"$userId",count:{$sum:1}}},
                                           {$lookup:{from:"users",localField:"_id",foreignField:"_id",as :"top_5_orders"}},
                                           {$sort:{count:-1,"top_5_orders.username":1}},{$limit:5},
                                           {$project:{_id:0,count:1,name:{$arrayElemAt:["$top_5_orders.username",0]}}}
                                          ]);
    
    // console.log(await sfq29_v2.toArray()); 
                                /*
                                      [
                                        { count: 3, name: 'Adah.Fay68_48' },
                                        { count: 3, name: 'Brendon.Pacocha11_13' },
                                        { count: 3, name: 'Carrie_Davis_63' },
                                        { count: 3, name: 'Charles_Macejkovic_75' },
                                        { count: 3, name: 'Drew_Farrell45_47' }
                                      ]
                                */
    // Top 10 categories with most products

    const sfq30 = await products.aggregate([{$group:{_id:"$categoryId",count:{$sum:1}}},
                                            {$sort:{count:-1}},
                                            {$limit:10},
                                            {$lookup:{from:"categories",localField:"_id",foreignField:"_id",as:"products_by_catgory"}},
                                            {$project:{_id:0,name:{$arrayElemAt:["$products_by_catgory.name",0]},count:1}}
                                          ]);
    console.log(await sfq30.toArray());
    /*
                                [
                              { count: 13, name: 'Pets' },
                              { count: 13, name: 'Books' },
                              { count: 10, name: 'Office Supplies' },
                              { count: 8, name: 'Home & Kitchen' },
                              { count: 8, name: 'Toys' },
                              { count: 8, name: 'Automotive' },
                              { count: 7, name: 'Electronics' },
                              { count: 6, name: 'Health' },
                              { count: 5, name: 'Beauty' },
                              { count: 5, name: 'Jewelry' }
                            ]
     */
    

                            /*
    ### **Simple Projections**
    31. Show only product names and prices
    32. Display user emails and creation dates
    33. Show order IDs and total amounts
    34. List category names and descriptions
    35. Show product names and categories
    36. Display review ratings and comments
    37. Show user usernames only
    38. List order statuses and creation dates
    39. Show product prices in descending order
    40. Display support ticket subjects and statuses
    */

    // 31. Show only product names and prices
    const sfq31_depricated  = await products.find({},{_id:0,name:1,price:1});
    // in olden mongodb drivers it may work but , now this method is depricated 

    const sfq31 = await products.aggregate([{$project:{_id:0,name:1,price:1}}]);
    
    const sfq31_v2 = await products.find({}).project({_id:0,name:1,price:1});

    const sfq31_v3 = await products.aggregate([{$replaceRoot:{newRoot:{name:"$name",price:"$price"}}} ]);

    // 32. Display user emails and creation dates

    const sfq32 = await users.find({}).project({_id:0,username:1,createdAt:1});
    const sfq32_v2 = await users.aggregate([{$project:{_id:0,username:1,createdAt:1}}]);
    const sfq32_v3 = await users.aggregate([{$replaceRoot:{newRoot:{username:"$username",createdAt:"$createdAt"}}}]);

    const sfq32_v4 = await users.aggregate([{$facet:{"newDoc":[{$project:{_id:0,username:1,createdAt:1}}]}},{$unwind:"$newDoc"},{$replaceRoot:{newRoot:"$newDoc"}}]);

    // console.log(await sfq32_v4.toArray());

    // 33. Show order IDs and total amounts

    const sfq33 = await orders.aggregate([{$project:{_id:0,orderId:"$_id",totalAmount:1}}]);
    const sfq33_v2 = await orders.aggregate([{$addFields:{orderId:"$_id"}},{$unset:"_id"},{$project:{orderId:1,totalAmount:1}}]);
    const sfq33_v3 = await orders.aggregate([{$set:{orderId:"$_id"}},{$unset:"_id"},{$project:{orderId:1,totalAmount:1}}]);
    // console.log(await sfq33_v2.toArray());

    // 34. List category names and descriptions
    const sfq34 = await categories.aggregate([{$project:{_id:0,name:1,description:1}}]);
    const sfq34_v2 = await categories.aggregate([{$replaceRoot:{newRoot:{name:"$name",description:"$description"}}}]);
    const sfq34_v3 = await categories.find({}).project({_id:0,name:1,description:1});
    const sfq34_v4 = await categories.aggregate([{$facet:{"newDoc":[{$project:{_id:0,name:1,description:1}}]}},{$unwind:"$newDoc"},{$replaceRoot:{newRoot:"$newDoc"}}])
    // console.log(await sfq34_v4.toArray());

    // 35. Show product names and categories
    const sfq35 = await products.aggregate([{$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as :"prodName_catName"}},{$unwind:"$prodName_catName"},{$replaceRoot:{newRoot:{productName:"$name",category:"$prodName_catName.name"}}}]);
    // console.log(await sfq35.toArray());

    // 36. Display review ratings and comments

    const sfq36 = await reviews.find({}).project({_id:0,rating:1,comment:1});
    const sfq36_v2 = await reviews.aggregate([{$project:{_id:0,rating:1,comment:1}}]);
    // console.log(await sfq36_v2.toArray());

    // 37. Show user usernames only

    const sfq37 = await users.find({}).project({_id:0,username:1});
    const sfq37_v2 = await users.aggregate([{$project:{_id:0,username:1}}]);
    // console.log(await sfq37_v2.toArray());

    // 38. List order statuses and creation dates

    const sfq38 = await orders.find({}).project({_id:0,status:1,createdAt:1});
    const sfq38_v2 = await orders.aggregate([{$project:{_id:0,status:1,createdAt:1}}]);
    // console.log(await sfq38_v2.toArray());

    // 39. Show product prices in descending order

    const sfq39 = await products.find({}).project({_id:0,price:1}).sort({price:-1});
    const sfq39_v2 = await products.aggregate([{$project:{_id:0,price:1}}]);
    // console.log(await sfq39.toArray());

    // 40. Display support ticket subjects and statuses

    const sfq40 = await supporttickets.find({}).project({_id:0,subject:1,status:1}).sort({price:-1});
    const sfq40_v2 = await supporttickets.aggregate([{$project:{_id:0,subject:1,status:1}}]);
    console.log(await sfq40_v2.toArray());

     // ### **Date-based Queries**
    // 41. Find orders created today
    // 42. Count orders by day of week
    // 43. Find products created this year
    // 44. Users registered this month
    // 45. Reviews posted in last 7 days
    // 46. Orders placed in December
    // 47. Products added in Q1
    // 48. Support tickets opened this week
    // 49. Payments made yesterday
    // 50. Find users by registration month 

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    today.setDate(today.getDate()-20); // here i am taking 20 days back because i have populated the db around the same date 
    tomorrow.setDate(tomorrow.getDate()+1);

    const sfq41 = await orders.find({createdAt:{$gte:today,$lt:tomorrow}}).toArray();
    const sfq41_v2 = await orders.aggregate([{$match:{$and:[{createdAt:{$gte:today}},{createdAt:{$lt:tomorrow}}]}}]).toArray();

    // console.log(sfq41_v2 , sfq41);

    // 42. Count orders by day of week 
    const sfq42 = await orders.aggregate([{$project:{dayOfWeek:{$dayOfWeek:"$createdAt"},createdAt:1}},
                                          {$group:{_id:"$dayOfWeek",count:{$sum:1}}},
                                          {$addFields:{day:{$arrayElemAt:[["sun","mon","tue","wed","thu","fri","sat"],{$subtract:["$_id",1]}]}}}]).toArray();
    // console.log(sfq42);


    // 43. Find products created this year
    const sfq43 = await products.aggregate([{$match:{createdAt:{$gte:new Date(new Date("2025").toISOString()),$lt:new Date(new Date("2026").toISOString())}}}]).toArray();
    const sfq43_v2 = await products.find({createdAt:{$gte:new Date(new Date("2025").toISOString()),$lt:new Date(new Date("2026").toISOString())}}).toArray();
    // console.log(sfq43_v2);

    // 44. Users registered this month
    const start_date = new Date(new Date().getFullYear(),new Date().getMonth()-2,1);
    const end_date = new Date(new Date().getFullYear(),new Date().getMonth()-1,1);
    
    const sfq44 = await users.find({createdAt:{$gte:start_date,$lt:end_date}}).toArray();
    // console.log(sfq44);

    // 45. Reviews posted in last 7 days

    const seven_days_ago = new Date(Date.now()-7*24*60*60*1000);
    const sfq45 = await reviews.find({createdAt:{$gte:seven_days_ago}}).toArray();
    // console.log(sfq45);

    // 46. Orders placed in December 
    const sfq46 = await orders.find({$expr:{$and:[{$eq:[{$month : "$createdAt"},12]},{$eq:[{"$year":"$createdAt"},2024]}]}}).toArray();
    // console.log(sfq46);

    // 47. Products added in Q1 (jan,feb,mar)

    const sfq47 = await products.find({$expr:{$in:[{$month:"$createdAt"},[1,2,3]]}}).sort({createdAt:1}).toArray();
    // console.log(sfq47)

    // 48. Support tickets opened this week  
    const ten_days_ago = new Date(Date.now() - 10*24*3600*1000); // ten days because i run my db around 10 days ago
    const sfq48 = await supporttickets.find({createdAt:{$gt:ten_days_ago}}).toArray();
    // console.log(sfq48);

    // 49. Payments made yesterday 

    const yesterday = new Date("2025","5","29"); // i am taking yesterday as june 29 becuase i have only one record at the last date

    const sfq49 = await payments.find({createdAt:{$gt:yesterday}}).toArray();
    // console.log(yesterday,sfq49);

    // 50. Find users by registration month  

    const sfq50 = await users.aggregate([{$group:{_id:{$month:"$createdAt"},count:{$sum:1}}},
                                         {$sort:{_id:1}},{$project:{month:{$arrayElemAt:[["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","now","dec"],{$subtract:["$_id",1]}]},count:1,_id:0}},
                                         {$replaceRoot: {newRoot: { month: "$month", count: "$count"}}}
                                        ]).toArray();
                  
    console.log(sfq50);

     // ### **Basic Calculations**
    // 51. Calculate average product price
    // 52. Find total revenue from all orders
    // 53. Average order amount
    // 54. Count total order items
    // 55. Calculate average review rating
    // 56. Sum all inventory stock
    // 57. Average user age (if birth date available)
    // 58. Total pending payments
    // 59. Count active carts
    // 60. Average items per order

    // 51-60 solutions 

    // Q)51. Calculate average product price
    const sfq51 = await products.aggregate([{$group:{_id:null,avgPrice:{$avg:"$price"}}},
                                            {$project:{avgPrice:1,_id:0}}
                                          ]).next();
    // console.log(sfq51);

    // Q)52. Find total revenue from all orders
    const sfq52 = await orders.aggregate([{$group:{_id:null,totalRevenue : {$sum:"$totalAmount"}}}]).next() ;
    // console.log(sfq52);

    // Q)53. Average order amount
    const sfq53 = await orders.aggregate([{$group:{_id:null,avgOrderAmount:{$avg:"$totalAmount"}}}]).next() ;
    // console.log(sfq53);

    // Q)54. Count total order items
    const sfq54 = await orderitems.aggregate([{$group:{_id:null,orderedItemsCount:{$sum:1}}},{$project:{_id:0}}]).next() ;
    // console.log(sfq54);

    // Q)56. Sum all inventory stock 
    const sfq56 = await inventory.aggregate([{$group:{_id:null,totalStock:{$sum:"$stock"}}},{$project:{_id:0}}]).next() ;
    // console.log(sfq56);

    // Q)57. Average user age , no user age field existed 
    // leaving 57 

    // Q)58. Total pending payments
    const sfq58 = await payments.countDocuments({status:"pending"});
    // console.log(sfq58);

    // Q)59. Count active carts
    const sfq59 = await carts.countDocuments({items:{$exists:true,$ne:[]}});
    // console.log(sfq59)

    // 60. Average items per order 

    const sfq60 = await orderitems.aggregate([{$group:{_id:null,avgOrders:{$avg:"$quantity"}}},
                                              {$project:{_id:0,avgOrders:{$round:["$avgOrders",0]}}}
                                            ]).next();
    // console.log(sfq60);

                                                          
  }
    // completed()
    // ### **Simple Text Matching**
    // 61. Find products containing "phone" in name
    // 62. Users with "gmail" email addresses
    // 63. Products with "sale" in description
    // 64. Support tickets with "refund" in subject
    // 65. Categories containing "Home"
    // 66. Find users with username starting with "A"
    // 67. Products ending with "Pro"
    // 68. Orders from users with "test" in username
    // 69. Reviews containing "excellent"
    // 70. Addresses in "California"

    // Q)61. Find products containing "phone" in name 

    const sfq61 = await products.find({name:/computer/i}).toArray(); //phone is not there in the db so, instead used phone
    // console.log(sfq61);

    const sfq61_v2 = await products.find({name:{$regex:"computer",$options:"i"}}).toArray();
    // console.log(sfq61_v2);

    // Q)62. Users with "gmail" email addresses 

    const sfq62 = await users.find({email:{$regex:"@gmail.com$",$options:"i"}}).toArray();
    // console.log(sfq62);

    const sfq62_v2 = await users.find({email:/@gmail.com$/i}).toArray();
    // console.log(sfq62_v2);

    // Note: in both sfq62 and sfq62_v2 both the questions in regex in the "$" indicates 
    // it is checking whether it ends with the specified string or not

    // Q)63. Products with "sale" in description

    const sfq63 = await products.find({description:{$regex:"clam",$options:"i"}}).toArray(); //sale is not found in our db so small change
    // console.log(sfq63);

    const sfq63_v2 = await products.find({description:/clam/i}).toArray();
    // console.log(sfq63_v2);



    // Q)64. Support tickets with "refund" in subject
    
    const sfq64 = await supporttickets.find({subject:{$regex:"minus",$options:"i"}}).toArray(); // here in our db "refund" is not there so "minus"
    // console.log(sfq64);
    
    const sfq64_v2 = await supporttickets.find({subject:/minus/i}).toArray();
    // console.log(sfq64_v2);



    // Q)65. Categories containing "Home"

    const sfq65 = await categories.find({name:{$regex:"home",$options:"i"}}).toArray();
    // console.log(sfq65);

    const sfq65_v2 = await categories.find({name:/home/i}).toArray();
    // console.log(sfq65_v2);



    // Q)66. Find users with username starting with "A"

    const sfq66 = await users.find({username:{$regex:"^A"}}).toArray();
    // console.log(sfq66);

    const sfq66_v2 = await users.find({username:/^A/i}).toArray();
    // console.log(sfq66_v2);



    // 67. Products ending with "Pro"

    const sfq67 = await products.find({name:/^Inc/i}).toArray(); //in our db , products not found with "Pro" as starting so "Inc"
    // console.log(sfq67);

    const sfq67_v2 = await products.find({name:{$regex:"^Inc",$options:"i"}}).toArray();
    // console.log(sfq67_v2);



    // 68. Orders from users with "test" in username 

    const sfq68 = await users.find({username:{$regex:"adah",$options:"i"}}).toArray(); // we dont have any name found with test so  , i took adah
    // console.log(sfq68);

    const sfq68_v2 = await users.find({username:/adah/i}).toArray();
    // console.log(sfq68_v2);
    



    // 69. Reviews containing "excellent"

    const sfq69 = await reviews.find({comment:/infit/i}).toArray(); // there is no match found with "excellent" so "infit"
    // console.log(sfq69);

    const sfq69_v2 = await reviews.find({comment:{$regex:"infit",$options:"i"}}).toArray();
    // console.log(sfq69_v2);




    // 70. Addresses in "California"

    const sfq70 = await addresses.find({state:/california/i}).toArray();
    // console.log(sfq70);

    const sfq70_v2 = await addresses.find({state:{$regex:"california",$options:"i"}}).toArray();
    // console.log(sfq70_v2);

    // ----> Note : fo advance search use text indexing ,
    //              we can see in next session we will create indexing for faster search operations

   





















    
    
    

    

   
    



    

    


    

    






    


    

    




   
    

    



    


    




    
    


    










    




    




    












    

    



    


    


    
    



    


    



    
        

    




 
    
    
                            
    
    




    
    

    
    



    



    










    


    




    
    
    
    



      

    
    


    

    }catch(e){
        console.error(e.message);
    }

}



friend()