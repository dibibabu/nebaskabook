var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
const productHelper=require('../helpers/product-helpers')
const moment=require('moment')
const twlioHelpers = require('../helpers/twlio-helpers');
const collection = require('../config/collection');
var db=require('../config/connection')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{

  res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  try {
    let cartCount=null
    let user=req.session.user
  
    let wishCount=null
    if(req.session.user){
      wishCount=await userHelpers.getWishCount(req.session.user._id)
       }
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
       }
  productHelper.getproducts().then((products)=>{
    
  
    productHelper.viewCategory().then((categories)=>{
  
      productHelper.viewBanner().then((banner)=>{
    res.render('index', {user,products,wishCount,banner,cartCount,categories,layout:'user-layout'});
  })
    })
  })
  } catch (error) {
    next(error)
  }

  
});


router.get('/login',(req,res,next)=>{
  try {
    console.log("reached here");
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
    res.render('user/login',{"loginErr":req.session.loginErr,layout:'user-layout'})
    req.session.loginErr = false;
  }
  } catch (error) {
    next(error)
  }
})


//signup

router.get('/signup',(req,res,next)=>{
  try {
    console.log("reached here");
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
    res.render('user/signup',{"loginErr":req.session.loginErr,layout:'user-layout',userErr:req.session.userError})
  
    req.session.loginErr = false;
  }
  } catch (error) {
    next(error)
  }
})

//otp
router.get('/otp',(req,res,next)=>{
 try {
   if(req.session.loggedIn){
     res.redirect('/')
   }else{
     res.render('user/otp',{layout:'user-layout'})
   }
 } catch (error) {
  next(error)
 }
})

//post otp
router.post('/otp',(req,res,next)=>{
    
 try {
   twlioHelpers.otpVerify(req.body, req.session.body).then((data) => {
 
       if (data.valid) {
           console.log("otp verification success");
 
           userHelpers.doSignup(req.session.body).then((data) => {
               if (data.isUserValid) {
 
                   console.log("userdata valid");
 
                   req.session.isloggedin = true;
                   req.session.user = data.user
                   res.redirect('/login')
               } else {
                   console.log("userdata not valid");
                   req.session.isloggedin = false;
                   res.redirect('/signup')
               }
           }).catch((err) => {
               req.session.err = err
               res.redirect('/signup')
 
           })
 
       }
 
   })
 
 } catch (error) {
  next(error)
 }

})

//post signup

router.post('/signup',async(req,res,next)=>{

 try {
   let user= await db.get().collection(collection.USER_COLLECTION).findOne(({email:req.body.email}))
 
 
   if(user){
     req.session.userError= 'user already exist'
   res.redirect('/signup')
   }else{
 
     req.session.body=req.body
 twlioHelpers.dosms(req.session.body).then((data)=>{
  
   if(data.valid){
 
     res.redirect('/otp')
   }else{
     res.redirect('/signup')
   }
 })
 }
 } catch (error) {
  next(error)
 }

})
//login
router.post('/login',(req,res,next)=>{
  try {
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')
      }else{
        req.session.loginErr=true
        res.redirect('/login')
      }
    })
  } catch (error) {
    next(error)
  }

})

//logout
router.get('/logout',(req,res,next)=>{ 
 try {
   req.session.destroy()
   res.redirect('/')
 } catch (error) {
  next(error)
 }
})
//quick view

router.get('/quick-view',async(req,res,next)=>{
  try {
    let user=req.session.user
    let cartCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
       }
  
  
    productHelper.getProductDetails(req.query.id).then((products)=>{
      res.render('user/quick-view',{layout:'user-layout',products,user,cartCount})
      
    })
  } catch (error) {
    next(error)
  }
})





//add to cart

router.get('/add-to-cart/:id',verifyLogin,(req,res,next)=>{
try {
 
   
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
     
      // res.redirect('/')
     
    })
} catch (error) {
  next(error)
}
})


//view-cart

router.get('/view-cart',verifyLogin,async(req,res,next)=>{
 try {
   let user=req.session.user
   let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
   let cartCount=null
   let products=await userHelpers.getCartProducts(req.session.user._id)
   let totalValue=0
   if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(user._id)
   }
 
 
   if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
   }
  
  
     res.render('user/view-cart',{user,totalValue,cartCount,wishCount,products,layout:'user-layout'})
    
 } catch (error) {
  next(error)
 }
  })
// change product quantity

router.post('/change-product-quantity',(req,res,next)=>{
 try {
   userHelpers.changeProductQuantity(req.body).then(async(response)=>{
     response.total=await userHelpers.getTotalAmount(req.body.user)
 
        res.json(response)
   })
 } catch (error) {
  next(error)
 }
})


//remove from cart

router.post("/removeProductFromCart", (req, res,next) => {
  try {
    userHelpers.removeProductFromCart(req.body).then((response) => {
      res.json(response);
    });
  } catch (error) {
   next(error)
  }
 });

//place order
router.get('/place-order',verifyLogin,async(req,res,next)=>{
 
 try {
  let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
      let cartCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
       }
   let user=req.session.user
   let total=await userHelpers.getTotalAmount(user._id)
   let saveAddress=await userHelpers.getSavedAddress(user._id)

 userHelpers.getCoupon().then((coupon)=>{
 
   res.render('user/checkout',{coupon,user,wishCount,saveAddress,total,cartCount,layout:'user-layout'})
  })
 } catch (error) {
  next(error)
 }
})

//place order post
router.post('/place-order',async(req,res,next)=>{
try {
  if(req.body.saveAddress=='on'){
  
    await userHelpers.addNewAddress(req.body,req.session.user._id)
  }
  
   
    let products=await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    let discountData = null
  
    if(req.body.Coupon_Code){    
      await userHelpers.checkCoupon(req.body.Coupon_Code,totalPrice).then((response) => {
          console.log(response);
           discountData = response
      }).catch(() => discountData = null)
           
  }
  
  
    
    userHelpers.placeOrder(req.body,products,totalPrice,discountData).then((orderId)=>{
     
     
  
      if(req.body['Payment-Method']==='COD'){
        res.json({codSuccess:true})
  
      }else{
        let netAmount = (discountData) ? discountData.amount : totalPrice
        userHelpers.generateRazorpay(orderId,netAmount).then((response)=>{
          res.json(response)
  
        })
      }
      
    })
} catch (error) {
  next(error)
}


})

//Order Success
router.get('/order-success',verifyLogin,async(req,res,next)=>{
  try {
    let wishCount=null
    if(req.session.user){
      wishCount=await userHelpers.getWishCount(req.session.user._id)
       }
       let cartCount=null
       if(req.session.user){
         cartCount=await userHelpers.getCartCount(req.session.user._id)
          }
    let user=req.session.user
    res.render('user/order-success',{layout:'user-layout',user, wishCount,cartCount})
  } catch (error) {
    next(error)
  }

})

//VIEW ORDERS
router.get('/orders',verifyLogin,async(req,res,next)=>{
 try {
  let wishCount=null
    if(req.session.user){
      wishCount=await userHelpers.getWishCount(req.session.user._id)
       }
       let cartCount=null
       if(req.session.user){
         cartCount=await userHelpers.getCartCount(req.session.user._id)
          }
   let user=req.session.user
 console.log(user);
   let orders=await userHelpers.getUserOrders(user._id)
   orders.forEach(element => {
 
     element.date = moment(element.date).format("DD-MM-YY")
 
 });
 
   res.render('user/orders',{layout:'user-layout',user,wishCount,orders,cartCount})
 
 } catch (error) {
  next(error)
 }
})

//view order details

router.get('/view-order-products',verifyLogin,async(req,res,next)=>{
 try {
   let user=req.session.user
   let orderId=req.query.id
   let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
      let cartCount=null
      if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
         }
   let orderBill=await userHelpers.getUserOrderBill(req.query.id)
  
  
   console.log(orderBill);
   let products=await userHelpers.getOrderProducts(req.query.id)
   res.render('user/trackOrder',{layout:'user-layout',user,products, wishCount,orderBill,orderId, cartCount})
  
 } catch (error) {
  next(error)
 }
}) 


//order tracking

 router.get('/viewbill',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let orderBill=await userHelpers.getUserOrderBill(req.query.id)
  let products=await userHelpers.getOrderProducts(req.query.id)
   res.render('user/view-bill',{layout:'user-layout',user,products,orderBill})
  })


//cancel order
router.get('/order-cancel/:id',verifyLogin,(req,res,next)=>{



 try {
   userHelpers.cancelOrder(req.params.id).then(()=>{
 
    
   res.redirect('/orders')
 })
 
 } catch (error) {
  next(error)
 }

})


//catogories find
router.get('/selected-category',verifyLogin,async(req,res,next)=>{

 try {
  let user=req.session.user
  let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
      let cartCount=null
      if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
         }
   productHelper.getselectedproducts(req.query.id).then((product)=>{
   res.render('user/selected-category',{layout:'user-layout',product,wishCount,cartCount,user})
   }) 
 } catch (error) {
  next(error)
 }
})
  

//user profile
router.get('/my-account',verifyLogin,async(req,res,next)=>{
 try {
  let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
      let cartCount=null
      if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
         }
   let user=req.session.user
   let order=await userHelpers.getUserOrders(user._id)
  
 
   res.render('user/profile',{layout:'user-layout',order,user,wishCount,cartCount})
 } catch (error) {
  next(error)
 }
})


//view address

router.get('/view-adress',verifyLogin,(req,res,next)=>{
try {
    res.render('user/view-address',{layout:'user-layout'})
  
  
} catch (error) {
  next(error)
}
})


//add to wishlist


router.get('/add-to-wishlist/:id',verifyLogin,(req,res,next)=>{

try {
    let user=req.session.user
  
  
    userHelpers.addToWish(req.params.id,user._id).then(()=>{
  
      res.json({status:true})
  
     
    })
  
} catch (error) {
  next(error)
}


})


// wish list

router.get('/wishlist',verifyLogin,async(req,res,next)=>{
  try {
    let user=req.session.user
    let wishCount=null
    let products=await userHelpers.getWishProducts(req.session.user._id)
    let totalValue=0
    if(products.length>0){
     totalValue=await userHelpers.getTotalAmount(user._id)
    }
    let cartCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
       }
  
  
    if(req.session.user){
   wishCount=await userHelpers.getWishCount(req.session.user._id)
    }
   
      res.render('user/wishlist',{user,totalValue,wishCount,cartCount,products,layout:'user-layout'})
     
  } catch (error) {
    next(error)
  }
  })
  //DELETE WISH

  router.get('/delete-wish',verifyLogin,(req,res,next)=>{

  try {
    let details={
  
      wishId:(req.query.id),
      proId:(req.query.proId)
    }
    
  
  
     userHelpers.removeWishProduct(details).then((response)=>{
  
      
  
      res.redirect('/wishlist')
     })
  } catch (error) {
    next(error)
  }

  })


  //post coupon check


  router.post('/coupon-check',verifyLogin,async(req,res,next)=>{
   try {
     let userId = req.session.user._id
     let couponCode = req.body.coupon
     let totalAmount = await userHelpers.getTotalAmount(userId)
     
  
     userHelpers.checkCoupon(couponCode, totalAmount).then((response) => {
         res.json(response)
         console.log(response);
         console.log('its true');
         
     }).catch((response) => {
         res.json(response)
         console.log('its false');
         
     })
 
   } catch (error) {
    next(error)
   }


  })


  //VERIFY PAYMENT
router.post('/verify-payment',(req,res,next)=>{
  try {
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log("Payment successfull");
        res.json({status:true})
      })
  
    }).catch((err)=>{
      console.log(err);
      res.json({status:false,errMsg:''})
    })
    
  } catch (error) {
    next(error)
  }
})


//my address profile

router.get('/myAddress',verifyLogin,async(req,res,next)=>{
 try {
   let user=req.session.user
   let saveAddress=await userHelpers.getSavedAddress(user._id)
   let wishCount=null
   if(req.session.user){
     wishCount=await userHelpers.getWishCount(req.session.user._id)
      }
      let cartCount=null
      if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
         }
 
   res.render('user/myAdress',{layout:'user-layout',saveAddress,user,wishCount,cartCount})
 } catch (error) {
  next (error)

 }
})


//edit-add address

router.get('/editAddAddress',verifyLogin,async(req,res,next)=>{
  
try {
    let user=req.session.user
    let userId = req.session.user._id
   
      let addressId = req.query.id
      let addressData = await userHelpers.getSameAddress(addressId)
     
     
     
      addressData = addressData.address[0]
      res.render('user/editAddaddress',{layout:'user-layout', addressData,user})
  
  
  
} catch (error) {
  next(error)
}
})


// post edit adress
router.post('/editAddress',verifyLogin,(req,res,next)=>{
try {
   let addressId = req.query.id
  
  
    userHelpers.editAddress(req.body,addressId).then(() => {
      res.redirect('/my-account')
  })
} catch (error) {
  next(error)
}
})
//delete address
router.get('/deleteAddress',verifyLogin,(req,res,next)=>{
  try {
    let user=req.session.user
    
    addressId = req.query.id
    userHelpers.removeAddress(addressId,user._id).then(() => {
        res.redirect('/myAddress')
    })
  
  } catch (error) {
    next(error)
  }


})

//add address
router.get('/AddAddress',verifyLogin,async(req,res,next)=>{
 try {
   let user=req.session.user
  
 
   res.render('user/Addaddress',{layout:'user-layout',user})
 
 
 } catch (error) {
  next(error)
 }
})


//post add address

router.post('/AddAddress',verifyLogin,(req,res,next)=>{

try {
    let user=req.session.user
    userHelpers.addNewAddress(req.body,user._id).then(() => {
      res.redirect('/myAddress')
  })
    
} catch (error) {
  next(error)
}
})

module.exports = router;
