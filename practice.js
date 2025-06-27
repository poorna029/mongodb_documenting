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
      const {orders,users,products} = await con();

        

        let sfq1 = await users.countDocuments(); //for accuracy 
        let sfq1_v2 = await users.estimatedDocumentCount();
        // count method is deprecated in mongodb so
        //  either use estimatedDocumentCount method or 
        // countDocuments()
        let sfq2 = await products.countDocuments();
        let sfq2_v2 = await products.estimatedDocumentCount();

        let sfq3 = await products.find({price:{$gt:999.99}}).toArray();

        let sfq4 = await orders.find({status:"delivered"}).toArray() ;

        let sfq5 = await orders.aggregate([{$match:{status:"delivered"}},{$group:{_id:"status",total:{$sum:1}}},{$project:{_id:0,delivered:"$total"}}]).toArray();



        console.log(sfq5);



    }catch(e){
        console.error(e.message);
    }

}



friend()