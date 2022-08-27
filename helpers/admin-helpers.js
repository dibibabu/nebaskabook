const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const { response } = require("../app");


module.exports={

  getUserDtls : () => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
        resolve(users);
      } catch (error) {
        reject(error)
      }
    });
  },
  
 blockUsers : (usrId) => {
    return new Promise((resolve, reject) => {
    try {
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId) },
          {
            $set: {
              blockUsers: true
            }
          }).then(() => {
            resolve();
          });
    } catch (error) {
      reject(error)
    }
    });
  },
  
  
  unBlockUsers :(usrId) => {
    return new Promise((resolve, reject) => {
     try {
       db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId) },
         {
           $set: {
             blockUsers: false
           }
         }).then(() => {
           resolve();
         });
     } catch (error) {
      reject(error)
     }
    });
  },
  
  changeStatus : (proId, data) => {
  
    return new Promise((resolve, reject) => {
     try {
       console.log("got into db db");
       db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(proId) },
         {
           $set: {
             status: data
           }
         }).then((response) => {
           resolve(response);
         });
     } catch (error) {
      reject(error)
     }
    });
  },


  getCoupons : () => {
  
    return new Promise((resolve, reject) => {
     try {
       let coupons = db.get().collection(collection.COUPON_COLLECTION).find().toArray()
       resolve(coupons)
     } catch (error) {
      reject(error)
     }
    })
  },


  generateCoupon : (couponData) => {
  
    const oneDay = 1000 * 60 * 60 * 24
  
    let couponObj={
      Name: couponData.name.toUpperCase(),
      Offer: parseFloat(couponData.offer),
      Validity: new Date(new Date().getTime()+(oneDay*parseInt(couponData.validity)))
    }
    return new Promise((resolve, reject) => {
    try {
        db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((result) => {
          if (result[0] == null) {
    
            db.get().collection(collection.COUPON_COLLECTION).createIndex({ "Name": 1 }, { unique: true })
            db.get().collection(collection.COUPON_COLLECTION).createIndex({ "validity": 1 }, { expireAfterSeconds: 0 })
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponObj).then((response) => {
              resolve(response)
            })
          } else {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponObj).then((response) => {
              resolve(response)
            })
    
    
          }
    
        })
    } catch (error) {
      reject(error)
    }
    })
  
  },


  deleteCoupon:(couponId)=>{
  
    return new Promise((resolve, reject) => {
     try {
       db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
   
         resolve()
       })
     } catch (error) {
      reject(error)
     }
    })
  },

  onlinePaymentCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).find({ 
          paymentMethod: "Razorpay" }).count()
        resolve(count)
       

      } catch (err) {
        reject(err)
      }

    })
  },


  totalUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.USER_COLLECTION).find().count()
        resolve(count)
        console.log('total uuuuuuuuuuser');
        console.log(count);
      } catch (err) {
        reject(err)
      }
    })
  },


  totalOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).find().count()
        resolve(count)
        console.log('total ooooooooooooorder');
        console.log(count);
      } catch (err) {
        reject(err)
      }
    })
  },

cancelOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              status: "canceled"
            }
          },

         {
            $count: 'number'
          }

        ]).toArray()
        resolve(count)
        console.log('total cancel ooooooooooooorder');
        console.log(count);
      } catch (err) {
        reject(err)
      }

    })
  },


  totalCOD: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "COD", }).count()
        resolve(count)
        console.log('total coddddddddddd');
        console.log(count);
      } catch (err) {
        reject(err)
      }
    })
  },

totalDeliveryStatus: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let statusCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
            status: data
            }
          },

          {
            $count: 'number'
          }

        ]).toArray()
        resolve(statusCount)
        console.log('status count');
        console.log(statusCount);
      } catch (err) {
        reject(err)
      }
    })
  },


totalCost: () => {
    return new Promise(async (resolve, reject) => {
      try {
        total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
         
          {
            $project: {
              'totalAmount': 1
            }
          },
          {
            $group: {
              _id: null,
              sum: { $sum: '$totalAmount' }
            }
          }
        ]).toArray()
        resolve(total)
        console.log('total cooooooooooooooost');
        console.log(total);
      } catch (err) {
        reject(err)
      }
    })
  },
  


  
}