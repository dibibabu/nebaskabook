var db=require('../config/connection')
var collection=require('../config/collection') 
const bcrypt=require('bcrypt')
const { response, use } = require('../app')
const { ObjectId } = require('mongodb')
const objectId = require('mongodb').ObjectId
const Razorpay=require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_vovwbHwVyhwb4I',
    key_secret: 'DCbxKiZCPrBbjMWhHdFTjUki',
  });
 const { v4 : uuidv4 } = require('uuid')
const { log } = require('console')
module.exports={
    doSignup:(userData)=>{

        const userInfo={}
    
      
            return new Promise(async(resolve, reject) => {
                userData.password=await bcrypt.hash(userData.password,10) 
                db.get().collection(collection.USER_COLLECTION).insertOne({
                    
                    
                    username:userData.username,
                    
                    email:userData.email,
                    
                    password:userData.password,
    
                    phone:userData.phone,
                   
                    "blockUsers":false
    
    
                    
                }).then((data)=>{
    
                    if(data){
                        userInfo.isUserValid=true;
                        userInfo.user=userData
                        resolve(userInfo)
                    }else{
                        userInfo.isUserValid=false
                        resolve(userInfo)
                    }
    
    
                    console.log('ressssssssssssssss data');
                    console.log(data);
                    resolve(data)
    
                }).catch((err)=>{
                    reject(err)
                })
            })
            
             
    
        },
    doLogin:(userData)=>{
        return new Promise(async(resolve, reject) => {
            try {
                let loginStatus=false
                let response={}
                let user= await db.get().collection(collection.USER_COLLECTION ).findOne({username: userData.username,blockUsers:false})
                if(user){
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                           
                            response.user=user
                            response.status=true
                            resolve(response)
                        }else{
                            console.log('failed');
                            resolve({status:false})
                        }
                    })
                }else{
                    console.log('also login failed');
                    resolve({status:false})
                }
            } catch (error) {
                reject(error) 
            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve, reject) => {
           try {
             let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
             if(userCart){
                  let proExist=userCart.products.findIndex(product=>product.item==proId)
                  if(proExist!=-1){
                     db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':objectId(proId)},
                     {
                         $inc:{'products.$.quantity':1}
                     }
                     ).then(()=>{
                         resolve()
                     })
                  }else{
                  db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                  {
                     $push:{products:proObj}
                  }
                  
                  ).then((response)=>{
                     resolve()
                  })
                 }
             }else{
                 let cartObj={
                     user:objectId(userId),
                     products:[proObj]
                 }
                 db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                     resolve()
 
                 })
             }
           } catch (error) {
            reject(error)
           }
        })
    },

    removeProductFromCart: (details) => {
   
        let productId = details.productId
        let cartId = details.cartId
        return new Promise((resolve, reject) => {
           try {
             db.get().collection(collection.CART_COLLECTION).updateOne({ _id:objectId(cartId) },
                 {
                     $pull: { products: { item:objectId(productId) } }
                 }
             ).then((response) => {
                 resolve({ productRemoved: true })
             })
           } catch (error) {
            reject(error)
           }
        })
    
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve, reject) => {
          try {
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
              {
                  $match:{user:objectId(userId)} 
              },
              {
                  $unwind:'$products'
              },
              {
                  $project:{
                      item:'$products.item',
                      quantity:'$products.quantity'
                  }
              },
              {
                  $lookup:{
                      from:collection.PRODUCT_COLLECTION,
                      localField:'item',
                      foreignField:'_id',
                      as:'product'
                  }
  
              },
              {
                  $project:{
                      item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                  }
              },
              {
                $addFields:{
                    sum:{$multiply:['$quantity','$product.price']}

                }
            }
              
            ]).toArray()
            resolve(cartItems)  
          } catch (error) {
            reject(error)
          }
        }
    )},
    getCartCount:(userId)=>{
        return new Promise(async(resolve, reject) => {
           try {
             let count=0
             let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
             if(cart){
                 count=cart.products.length
             }
             resolve(count)
           } catch (error) {
            reject(error)
           }
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            try {
                if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                }) 
            }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                {
                    $inc:{'products.$.quantity':details.count}
                }
                ).then((response)=>{
                    resolve({status:true})
                })
            } 
            } catch (error) {
                reject(error)
            }
        })
    },

    getTotalAmount:(userId)=>{
        
        return new Promise(async(resolve, reject) => {
           try {
             let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
               {
                   $match:{user:objectId(userId)} 
               },
               {
                   $unwind:'$products'
               },
               {
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity'
                   }
               },
               {
                   $lookup:{
                       from:collection.PRODUCT_COLLECTION,
                       localField:'item',
                       foreignField:'_id',
                       as:'product'
                   }
   
               },
               {
                   $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                   }
               },
               {
                 $group:{
                     _id:null,
                     total:{$sum:{$multiply:['$quantity','$product.price']}}
                 }
               }
               
             ]).toArray()
             if(total.length==0){
                 resolve(total)
             }else{
             resolve(total[0].total) 
         } 
           } catch (error) {
            reject(error)
           }
          }
      )

    },

    placeOrder:(order,products,total,discountData)=>{
        return new Promise((resolve, reject) => {
            try {
                let netAmount = (discountData) ? discountData.amount : total;
                let discount = (discountData) ? discountData.discount : null;
                 console.log(order,products,total);
                let status =order['Payment-Method']==='COD'?'placed':'pending'
                let orderObj={
                    deliveryDetails:{
                        name:order.First_Name,
                        Last_Name:order.Last_Name,
                        mobile:order.Phone,
                        Alt_Phone:order.Alt_Phone,
                        address:order.Street_Address,
                        Town_City:order.Town_City,
                        pincode:order.Post_Code,
                        Country_State:order.Country_State,
                        Extra_Details:order.Extra_Details
                    },
                    userId:objectId(order.userId),
                    paymentMethod:order['Payment-Method'],
                       
            
                
                    products:products,
                    totalAmount:total,
                     discountAmount : discount,
                     totalPayed:netAmount,
                    status:status,
                    date:new Date()
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                    resolve(response.insertedId)
                })
            } catch (error) {
                reject(error)
            }
        })

    },

    getCartProductList:(userId)=>{
        return new Promise(async(resolve, reject) => {
            try {
                let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    
                resolve(cart.products)
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve, reject) => {
           try {
             let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
             
             resolve(orders)
           } catch (error) {
            reject(error)
           }
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve, reject) => {
         try {
             let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               {
                   $match:{_id:objectId(orderId)}
               },
               {
                   $unwind:'$products'
               },
               {
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity'
                   }
       
               },
               {
                   $lookup:{
                       from:collection.PRODUCT_COLLECTION,
                       localField:'item',
                       foreignField:'_id',
                       as:'product'
                   }
       
               },
               {
                   $project:{
                       item:1,
                       quantity:1,
                       product:{$arrayElemAt:['$product',0]}
                   }
               }
              
             ]).toArray()
             resolve(orderItems) 
         } catch (error) {
            reject(error)
         }
               
        }
    
    
    )},

    cancelOrder:(orderId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set:{
    
                        status:'canceled',
                        fixed:true
    
                    }
                }
                
                )
              
                
                .then(()=>{
                    resolve();
                })
            } catch (error) {
                reject(error)
            }
        })
    },
   
   
   
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve, reject) => {
       try {
             var options={
                 amount:total*100,
                 currency:'INR',
                 receipt:""+orderId
             };
             instance.orders.create(options,function(err,order){
             if(err){
                 console.log(err);
             }else{
            console.log("New Order:" ,order);
            resolve(order)
             }
 
             });
       } catch (error) {
        reject(error)
       }
        })
    },
   
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', 'DCbxKiZCPrBbjMWhHdFTjUki');
    
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
    
            } catch (error) {
                reject(error)
                
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve, reject) => {
          try {
              db.get().collection(collection.ORDER_COLLECTION)
              .updateOne({_id:objectId(orderId)},
              {
                  $set:{
                      status:'placed'
                  }
              }
              ).then(()=>{
                  resolve()
              })
          } catch (error) {
            reject(error)
          }
        })
    },
    getFullOrder:()=>{

        return new Promise((resolve, reject) => {
          try {
             let orders= db.get().collection(collection.ORDER_COLLECTION).find().toArray()
              resolve(orders)
          } catch (error) {
            reject(error)
          }
        })
    },

    
    addToWish:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve, reject) => {
           try {
             let userWish=await db.get().collection(collection.WISH_COLLECTION).findOne({user:objectId(userId)})
             if(userWish){
                  let proExist=userWish.products.findIndex(product=>product.item==proId)
                  if(proExist!=-1){
                     db.get().collection(collection.WISH_COLLECTION).updateOne({'products.item':objectId(proId)},
                     {
                         $pull:{products:{item:objectId(proId)}}
                         // $inc:{'products.$.quantity':1}
                     }
                     ).then(()=>{
                         resolve({active:true})
                     })
                  }else{
                  db.get().collection(collection.WISH_COLLECTION).updateOne({user:objectId(userId)},
                  {
                     $push:{products:proObj}
                  }
                  
                  ).then((response)=>{
                     resolve()
                  })
                 }
             }else{
                 let wishObj={
                     user:objectId(userId),
                     products:[proObj]
                 }
                 db.get().collection(collection.WISH_COLLECTION).insertOne(wishObj).then((response)=>{
                     resolve()
 
                 })
             }
           } catch (error) {
            reject(error)
            
           }
        })
    },
    getWishProducts:(userId)=>{
        return new Promise(async(resolve, reject) => {
         try {
             let wishItems=await db.get().collection(collection.WISH_COLLECTION).aggregate([
               {
                   $match:{user:objectId(userId)} 
               },
               {
                   $unwind:'$products'
               },
               {
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity'
                   }
               },
               {
                   $lookup:{
                       from:collection.PRODUCT_COLLECTION,
                       localField:'item',
                       foreignField:'_id',
                       as:'product'
                   }
   
               },
               {
                   $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                   }
               }
               
             ]).toArray()
             resolve(wishItems) 
             
             console.log(wishItems);
         } catch (error) {
            reject(error)
            
         }
        }
    )},

    removeWishProduct:(details)=>{

        let productId=details.proId
        let wishId=details.wishId

        return new Promise((resolve, reject) => {
          try {
              db.get().collection(collection.WISH_COLLECTION).updateOne({_id:objectId(wishId)},
              {
                  $pull:{products:{item:objectId(productId)}}
              }
              ).then((response)=>{
                  resolve()
              })
  
          } catch (error) {
            reject(error)
          }
            
        })
    },
    

    addNewAddress: (address, userId) => {

        let addressData = {

            addressId: uuidv4(),
            First_Name: address.First_Name,
            Last_Name: address.Last_Name,
            Company_Name: address.Company_Name,
            Street_Address: address.Street_Address,
            Extra_Details: address.Extra_Details,
            Town_City: address.Town_City,
            Country_State: address.Country_State,
            Post_Code: address.Post_Code,
            Phone: address.Phone,
            Alt_Phone: address.Alt_Phone

        }

        console.log(addressData);

        return new Promise(async(resolve, reject) => {
           try {
             let getAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: objectId(userId) })
             console.log(getAddress);
             if (getAddress) {
                 db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: objectId(userId) },
                     {
                         $push: {
                             address: addressData
                         }
                     }).then((response) => {
                         resolve(response)
                     })
 
             } else {
                 let addressObj = {
                     user: objectId(userId),
                     address: [addressData]
                 }
 
                 db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then((response) => {
                     resolve(response)
                 })
             }
           } catch (error) {
            reject(error)
           }
        })
    },
    getSavedAddress:(userId)=>{
        return new Promise((resolve,reject)=>{
        try {
             db.get().collection(collection.ADDRESS_COLLECTION).findOne({user: objectId(userId)}).then((savedAddress)=>{
                if(savedAddress){
                    let addressArray=savedAddress.address
                    if(addressArray.length > 0){
                        resolve(savedAddress)
                    }else{
                        resolve(false)
                    }
                 }else{
                    resolve(false)
                 }
             })
        } catch (error) {
            reject(error)
        }
        
        })
    },


    getWishCount:(userId)=>{

        console.log('333333333333');
        return new Promise(async(resolve, reject) => {
          try {
              let count=0
              let wish=await db.get().collection(collection.WISH_COLLECTION).findOne({user:objectId(userId)})
              if(wish){
                  count=wish.products.length
              }
              resolve(count)
          } catch (error) {
            reject(error)
          }
        })
    },

    getUserOrderBill:(orderId)=>{
        return new Promise(async(resolve, reject) => {
           try {
             let orderBill=await db.get().collection(collection.ORDER_COLLECTION).find({_id:objectId(orderId)}).toArray()
             
             resolve(orderBill)
           } catch (error) {
            reject(error)
           }
        })
    },


    checkCoupon: (code, amount) => {
        const coupon = code.toString().toUpperCase();

        console.log(coupon);

        return new Promise((resolve, reject) => {
           try {
             db.get().collection(collection.COUPON_COLLECTION).findOne({ Name: coupon }).then((response) => {
                 console.log(response);
                 console.log('from db');
                 if (response == null) {
                     // let response = {status : false}
                     console.log(response + "          null resp");
                     reject({ status: false })
                 } else {
                     let offerPrice = parseFloat(amount * response.Offer/100)
                     // let discountPrice = amount - offerPrice
                     let newTotal = parseInt(amount - offerPrice)
                     // response = {
                     //     amount: newTotal,
                     //     discount: discountPrice
                     // }
                     console.log("          Nonnull resp");
                     resolve(response = {
                         couponCode : coupon, 
                         status: true,
                         amount: newTotal,
                         discount: offerPrice
                     })
                 }
             })
           } catch (error) {
            reject(error)
           }
        })
    },


    getSameAddress: (address_Id) => {
        return new Promise((resolve, reject) => {
          try {
              db.get().collection(collection.ADDRESS_COLLECTION).findOne({ "address.addressId": address_Id }).then((res) => {
                  console.log('got addrs');
                  console.log(res);
                  resolve(res)
              })
          } catch (error) {
            reject(error)
          }
        })
    },


    editAddress: (addressData, addressId) => {
        return new Promise((resolve, reject) => {
            try {
                 db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ "address.addressId": addressId },
                    {
                        $set: {
                            "address.$.First_Name": addressData.First_Name,
                            "address.$.Last_Name": addressData.Last_Name,
                            "address.$.Company_Name": addressData.Company_Name,
                            "address.$.Street_Address": addressData.Street_Address,
                            "address.$.Extra_Details": addressData.Extra_Details,
                            "address.$.Town_City": addressData.Town_City,
                            "address.$.Country_State": addressData.Country_State,
                            "address.$.Post_Code": addressData.Post_Code,
                            "address.$.Phone": addressData.Phone,
                            "address.$.Alt_Phone": addressData.Alt_Phone
    
                        }
                    }).then(() => resolve())
            } catch (error) {
                reject(error)  
            }
        })
    },

    
    removeAddress: (address_Id, userId) => {
        console.log('remove sddress');
        return new Promise(async (resolve, reject) => {
       try {
             db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: objectId(userId) },
                 {
                     $pull: {
                         address: { addressId: address_Id }
                     }
                 },
                 {
                     multi: true
                 }).then(() => {
                     resolve()
                     console.log('add removed');
                 })
       } catch (error) {
        reject(error)
       }

        })
    },

    getCoupon : () => {
        return new Promise(async (resolve, reject) => {
          try {
            const coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
            resolve(coupon);
          } catch (error) {
            reject(error)
          }
        });
      },
      
    




    
}