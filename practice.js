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
      const {orders,users,products,categories,reviews} = await con();

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
      // you have to explicitly carryforward it like ,name:{$first:"$name"} whatever the name it encounters it carry farwards it
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
                                 
    }
    // completed()

    // 12. Count orders by user

    const sfq12 = await orders.aggregate([{$group:{_id:"$userId",count:{$sum:1}}}]);
    
    const sfq12_v2 = await orders.aggregate([{$group:{_id:"$userId",Ordercount:{$sum:1}}},
                                              {$lookup:{from:"users",localField:"_id",foreignField:"_id",as :"order"}},
                                              // here localfield , _id is not orderId , after aggregation _id will be userId 
                                              {$project:{name:{$arrayElemAt:["$order.username",0]},email:{$arrayElemAt:["$order.email",0]},Ordercount:1}}
    ])
    

      console.log(await sfq12_v2.toArray());
    
    
    
    



      

    
    


    

    }catch(e){
        console.error(e.message);
    }

}



friend()