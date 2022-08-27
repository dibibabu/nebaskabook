const multer = require('multer');
const uuid = require("uuid").v4;
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, 'public/product-image');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const originalname =`${uuid()}${ext}`;
    cb(null, Date.now()+originalname);
  }
});

console.log("storage=",{storage});
module.exports=store=multer({storage})