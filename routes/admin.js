var express = require("express");
require('dotenv').config()
const { Admin } = require("mongodb");
const { route, response } = require("../app");
const { Category_collection } = require("../config/collection");
var router = express.Router();
var adminHelper = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
var productHelper = require("../helpers/product-helpers");
const userHelpers=require('../helpers/user-helpers')
const multer=require('../middlewares/multter')
const adminData = {
  username: process.env.ADMIN_NAME,
  password: process.env.ADMIN_PASSWORD,
};

//get home
router.get("/",async(req, res, next)=> {

  if (req.session.isAdminLogedIn) {
      try {
    
    
      let delivery = {}
      delivery.pending = 'pending'
      delivery.Placed = 'placed'
      delivery.Shipped = 'shipped'
      delivery.Deliverd = 'delivered'
      delivery.Cancelled = 'canceled'
      const allData = await Promise.all
        ([
          adminHelper.onlinePaymentCount(),
          adminHelper.totalUsers(),
          adminHelper.totalOrder(),
          adminHelper.cancelOrder(),
          adminHelper.totalCOD(),
          adminHelper.totalDeliveryStatus(delivery.pending),
          adminHelper.totalDeliveryStatus(delivery.Placed),
          adminHelper.totalDeliveryStatus( delivery.Shipped),
          adminHelper.totalDeliveryStatus(delivery.Deliverd),
          adminHelper.totalDeliveryStatus(delivery.Cancelled),
          adminHelper.totalCost(),
        ]);
      res.render('admin/admin', {
         layout: 'admin-layout',

        OnlinePymentcount: allData[0],
        totalUser: allData[1],
        totalOrder: allData[2],
        cancelOrder: allData[3],
        totalCod: allData[4],
        pending: allData[5],
        Placed: allData[6],
        Shipped: allData[7],
        Deliverd: allData[8],
        Cancelled: allData[9],
        totalCost: allData[10],
      })
   
  } catch (err) {
    next(err)
  }

     } else {
    res.redirect("/admin/admin-login");      
  }
});



router.get("/admin-manage-user", function (req, res, next) {
 try {
   if (req.session.isAdminLogedIn) {
     adminHelper.getUserDtls().then((userDtls) => {    
       res.render("admin/admin-manage-user", { userDtls,layout:"admin-layout" });
     });
   } else {
     res.redirect("/admin/admin-login");      
   }
 } catch (error) {
  next(error)
 }
});



router.get("/view-product", function (req, res, next) {
try {
    if (req.session.isAdminLogedIn) {
      productHelper.getproducts().then((products) => {    
        res.render("admin/view-product", { products,layout:"admin-layout" });
      });
    } else {
      res.redirect("/admin/admin-login");      
    }
} catch (error) {
  next(error)
}
});     



//get addproduct
router.get("/add-product", function (req, res, next) {
 try {
   if (req.session.isAdminLogedIn) {
     productHelpers.viewCategory().then((categories)=>{
     res.render("admin/add-product", { title: "Admin", layout:"admin-layout" ,categories});
     })
       
   } else {
     res.redirect("/admin/admin-login");      
   }
 } catch (error) {
  next(error)
 }
}); 


//adding product
router.post('/add-product',store.array('image',4),function(req,res,next){

  
try {
    let images=[]
  let files=req.files
  
  
  images=files.map((value)=>{
   return value.filename
  
  })
  console.log('images=',images);
    productHelper.addProduct(req.body,images).then((response)=>{
  
      res.redirect('/admin/view-product')
     
    })
    
} catch (error) {
  next(error)
}
 

})





router.get("/admin-login", (req, res,next) => {
 try {
   if (req.session.isAdminLogedIn) {
     res.redirect("/admin/");
   } else {
     res.render("admin/admin-login",{layout:"admin-layout",admin:true});
   }
 } catch (error) {
  next(error)
 }
});



router.post("/admin-login", (req, res,next) => {
try {
    if (
      req.body.username === adminData.username &&
      req.body.password === adminData.password       
    ) {
      req.session.isAdminLogedIn = true;
      res.redirect("/admin/");
    } else {
      res.redirect("/admin/admin-login");
    }
} catch (error) {
  next(error)
}
});


//logout
router.get("/admin-logout", (req, res,next) => {
try {
    req.session.isAdminLogedIn = null;
    res.redirect("/admin/admin-login");  
} catch (error) {
  next(error)
}
});


//block
router.get("/admin-manage-user/block-users/:id", (req, res,next) => {
 try {
   if (req.session.isAdminLogedIn) {
     adminHelper.blockUsers(req.params.id).then(() => {
       res.redirect("/admin/admin-manage-user");
     });
   } else {
     res.redirect("/admin/admin-login");
   }
 } catch (error) {
  next(error)
 }
});

//unblock user
router.get("/admin-manage-user/unblock-users/:id", (req, res,next) => {
try {
    if (req.session.isAdminLogedIn) {
      adminHelper.unBlockUsers(req.params.id).then(() => {
        res.redirect("/admin/admin-manage-user");
      });
    } else {
      res.redirect("/admin/admin-login");
    }
} catch (error) {
  next(error)
}
});


//edit product
router.get('/edit-product',(req,res,next)=>{
try {
    productHelper.getProductDetails(req.query.id).then((product)=>{
      productHelpers.viewCategory().then((categories)=>{
      console.log(product);
      res.render('admin/edit-product',{layout:'admin-layout',product,categories})
    })
    
  })
} catch (error) {
  next(error)
}
})

//post edit product
router.post('/edit-product',store.array('image',4),(req,res,next)=>{

 try {
   let images=[]
   let files=req.files
   console.log(req.body);
   console.log(req.files);
   images=files.map((value)=>{
    return value.filename
   
   })
   productHelper.editProduct(req.query.id,req.body,images).then((response)=>{
 
     res.redirect('/admin/view-product')
    
   })
 } catch (error) {
  next(error)
 }
})




//delete product
router.get("/delete-product", (req, res,next) => {
  try {
    if (req.session.isAdminLogedIn) {
      console.log("got here");
          let proId=req.query.id
          console.log(proId);
          productHelper.deleteProduct(proId).then((response) => {
  
            console.log("back yes");
            res.redirect("/admin/view-product");
          });
    } else {
      res.redirect("/admin/admin-login");
    }
  } catch (error) {
    next(error)
  }
});

//view category
router.get("/view-category",function(req,res,next){
try {
  if (req.session.isAdminLogedIn) {
  
  productHelper.viewCategory().then((categories)=>{
    res.render("admin/view-category", {categories,layout:"admin-layout" });
  
  })
    
  } else {
    res.redirect("/admin/admin-login");
  }
    
} catch (error) {
  next(error)
}
})


//add category

router.get("/add-category", function (req, res, next) {
try {
    if (req.session.isAdminLogedIn) {
      res.render("admin/add-category", { title: "Admin", layout:"admin-layout" });
    } else {
      res.redirect("/admin/admin-login");      
    }
} catch (error) {
  next(error)
}
}); 

router.post('/add-category',store.array('image',1),function(req,res,next){

  
 try {
   let images=[]
 let files=req.files
 
 
 images=files.map((value)=>{
  return value.filename
 
 })
 console.log('images=',images);
   productHelper.addCategory(req.body,images).then((response)=>{
 
     res.redirect('/admin/view-category')
    
   })
   
 } catch (error) {
  next(error)
 }
 

})


//edit Category
router.get('/edit-category',(req,res,next)=>{
try {
    productHelper.getOnecategory(req.query.id).then((category)=>{
      res.render('admin/edit-category',{layout:'admin-layout',category})
    })
} catch (error) {
  next(error)
}
  
})

//post edit category

router.post('/edit-category',store.array('image',1),(req,res,next)=>{

try {
    let images=[]
    let files=req.files
    console.log(req.body);
    console.log(req.files);
    images=files.map((value)=>{
     return value.filename
    
    })
    productHelper.editCategory(req.query.id,req.body,images).then((response)=>{
  
      res.redirect('/admin/view-category')
     
    })
} catch (error) {
  next(error)
}
})

//delete category

router.get("/delete-category", (req, res,next) => {
 try {
   if (req.session.isAdminLogedIn) {
     
         let catId=req.query.id
         console.log(catId);
         productHelper.deleteCategory(catId).then((response) => {
 
       
           res.redirect("/admin/view-category");
         });
   } else {
     res.redirect("/admin/admin-login");
   }
 } catch (error) {
  next(error)
 }
});

//order control

//VIEW ORDERS
router.get('/adminOrders',async(req,res,next)=>{

try {
    let orders=await userHelpers.getFullOrder()
    res.render('admin/orders',{layout:'admin-layout',orders})
  
} catch (error) {
  next(error)
}
})
//cancel orders
router.get('/cancel-order/:id',(req,res,next)=>{



try {
    userHelpers.cancelOrder(req.params.id).then((response)=>{
  
      console.log("#################");
    res.redirect('/admin/adminOrders')
  })
  
} catch (error) {
  next(error)
}

})


router.get("/change-status1/:id", (req, res,next) => {
try {
    let proId=req.params.id
    let data='shipped'
          adminHelper.changeStatus(proId,data).then((response) => {
            res.redirect("/admin/adminOrders");
          });
} catch (error) {
  next(error)
}
});

router.get("/change-status2/:id", (req, res,next) => {
  try {
    let proId=req.params.id
    let data='delivered'
          adminHelper.changeStatus(proId,data).then((response) => {
            res.redirect("/admin/adminOrders");
          });
  } catch (error) {
    next(error)
  }
});

//view ordered details

router.get('/view-ordered',async(req,res,next)=>{
try {
    let user=req.session.user
    let orderBill=await userHelpers.getUserOrderBill(req.query.id)
    
    let products=await userHelpers.getOrderProducts(req.query.id)
    res.render('admin/view-ordered',{layout:'admin-layout',user,products,orderBill})
   
} catch (error) {
  next(error)
}
}) 


//banner
router.get("/view-banner",function(req,res,next){
  try {
    if (req.session.isAdminLogedIn) {
    
    productHelper.viewBanner().then((banner)=>{
      res.render("admin/view-banner", {layout:"admin-layout",banner});
    
    })
      
    } else {
      res.redirect("/admin/admin-login");
    }
  } catch (error) {
    next(error)
  }
    
  })

  //add banner
  router.get("/add-banner", function (req, res, next) {
 try {
     if (req.session.isAdminLogedIn) {
       res.render("admin/add-banner", { title: "Admin", layout:"admin-layout" });
     } else {
       res.redirect("/admin/admin-login");      
     }
 } catch (error) {
  next(error)
 }
  }); 


  //add banner post
  router.post('/add-banner',store.array('image',1),function(req,res,next){

  
 try {
     let images=[]
   let files=req.files
   
   
   images=files.map((value)=>{
    return value.filename
   
   })
   console.log('images=',images);
     productHelper.addBanner(req.body,images).then((response)=>{
   
       res.redirect('/admin/view-banner')
      
     })
     
 } catch (error) {
  next(error)
 }
   
  
  })



  //delete banner

  router.get("/delete-banner", (req, res,next) => {
   try {
     if (req.session.isAdminLogedIn) {
       
           let banId=req.query.id
          
           productHelper.deleteBanner(banId).then((response) => {
   
         
             res.redirect("/admin/view-banner");
           });
     } else {
       res.redirect("/admin/admin-login");
     }
   } catch (error) {
    next(error)
   }
  });


  // coupon generation


  router.get("/view-coupons",(req,res,next)=>{

 try {
     adminHelper.getCoupons().then((coupons)=>{
 
       res.render("admin/view-coupons",{ coupons,title: "Admin", layout:"admin-layout" });
     })
 } catch (error) {
  next(error)
 }
  });

  //add coupon

  router.get('/add-Coupons',(req,res,next)=>{
    try {
      res.render('admin/add-coupons',{title:"Admin",layout:"admin-layout"})
    } catch (error) {
      next(error)
    }
  })
  
  // add coupon post

  router.post('/add-coupons',(req,res,next)=>{

  try {
      adminHelper.generateCoupon(req.body).then((response)=>{
        res.redirect("/admin/view-coupons")
      })
  } catch (error) {
    next(error)
  }
  })


  //delete coupon

  router.get('/delete-coupon',(req,res,next)=>{
try {
      let couponId=req.query.id
  
      adminHelper.deleteCoupon(couponId).then((response)=>{
        res.redirect("/admin/view-coupons")
  
      })
} catch (error) {
  next(error)
}
  })
  

  //admin error

  router.get('/*',(req,res,next)=>{
    try {
       
          res.render('admin/admin-error',{layout:'admin-layout'})
       
    } catch (error) {
      next(error)
    }
      
    })
  







module.exports = router;
