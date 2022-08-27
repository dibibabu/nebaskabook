var db=require('../config/connection') 
var collection=require('../config/collection')
const objectId = require('mongodb').ObjectId
  
  module.exports={

  
    addProduct:(product,images)=>{
     
      return new Promise((resolve,reject)=>{
        try {
          db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
              name:product.name,
              price:parseInt(product.price),
              description:product.description,
              category:product.category,
              "deleted":false,
              images 
                     
          }).then((data)=>{
            resolve(data.insertedId)
          })
        } catch (error) {
          reject(error)
        }
      })
    },

getproducts:(()=>{

return new Promise(async(resolve,reject)=>{
     try {
      let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({deleted:false}).toArray()
        resolve(products)
     } catch (error) {
      reject(error)
     }
           
})

}),
getProductDetails:(proId) => {
  return new Promise((resolve, reject) => {
  try {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(proId)}).then((product) => {
          resolve(product);
        });
  } catch (error) {
    reject(error)
  }
  });
},



deleteProduct:(proId) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("got into db db");
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id:objectId(proId)},
      {
        $set:{
          deleted:true
        }
      }).then((response) => {
        console.log("finishedt the operation db ");
          resolve(response);
        });
    } catch (error) {
      reject(error)
    }
  });
},


getAllproducts:((proId)=>{

  return new Promise((resolve,reject)=>{
      try {
         db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
               resolve(product)
         })
    
      } catch (error) {
        reject(error)
      }
  })
  
  }),







editProduct:(proId,product,images)=>{
  return new Promise((resolve, reject) => {
  try {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
      {
        $set:{
          name:product.name,
          price:product.price,
          description:product.description,
          category:product.category,
          images
        }
  
      }).then((response)=>{
     
        resolve()
      })
  } catch (error) {
    reject(error)
  }
  })
},
addCategory:(category,images)=>{
  return new Promise((resolve,reject)=>{
   try {
     db.get().collection(collection.Category_collection).insertOne({
         category:category.category,
         deleted:false,
        
         images 
                
     }).then((data)=>{
       resolve(data.insertedId)
     })
   } catch (error) {
    reject(error)
   }
  })
},
viewCategory:(()=>{

  return new Promise(async(resolve,reject)=>{
       try {
        let categories= await db.get().collection(collection.Category_collection).find({deleted:false}).toArray()
          resolve(categories)
              
       } catch (error) {
        reject(error)
       }
  })
  
  }),

  getOnecategory:((catId)=>{

    return new Promise((resolve,reject)=>{
       try {
          db.get().collection(collection.Category_collection).findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category)
          })
     
       } catch (error) {
        reject(error)
       }
    })
    
    }),


    editCategory:(catId,category,images)=>{
      return new Promise((resolve, reject) => {
        try {
          db.get().collection(collection.Category_collection).updateOne({_id:objectId(catId)},
          {
            $set:{
              
            category:category.category,
              images
            }
      
          }).then((response)=>{
         
            resolve()
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    deleteCategory:(catId) => {
      return new Promise((resolve, reject) => {
       try {
         console.log("got into db db");
         db.get().collection(collection.Category_collection).updateOne({ _id:objectId(catId)},
         {
           $set:{
             deleted:true
           }
         }).then((response) => {
           console.log("finishedt the operation db ");
             resolve(response);
           });
       } catch (error) {
        reject(error)
       }
      });
    },
    getselectedproducts:(cId) => {

console.log(cId);
      return new Promise((resolve, reject) => {
      try {
          db.get().collection(collection.PRODUCT_COLLECTION).find({category:cId,deleted:false}).toArray().then((product) => {
            console.log(product);
              resolve(product);
            });
      } catch (error) {
        reject(error)
      }
         
      });
    },

    addBanner:(banner,images)=>{
      return new Promise((resolve,reject)=>{
       try {
         db.get().collection(collection.BANNER_COLLECTION).insertOne({
             banner:banner.banner,
             caption:banner.banner_caption,
             deleted:false,
            
             images 
                    
         }).then((data)=>{
           resolve(data.insertedId)
         })
       } catch (error) {
        reject (error)
       }
      })
    },

    viewBanner:(()=>{

      return new Promise(async(resolve,reject)=>{
           try {
            let banner= await db.get().collection(collection.BANNER_COLLECTION).find({deleted:false}).toArray()
              resolve(banner)
                  
           } catch (error) {
            reject(error)
           }
      })
      
      }),

      deleteBanner:(banId) => {
        return new Promise((resolve, reject) => {
         
       try {
           db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id:objectId(banId)},
           {
             $set:{
               deleted:true
             }
           }).then((response) => {
            
               resolve(response);
             });
       } catch (error) {
        reject(error)
       }
        });
      },

  

 
  }

 