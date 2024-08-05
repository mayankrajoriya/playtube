const express=require("express")
const router=express.Router();
const registerUser=require("../controllers/userController")
const upload=require("../middlewares/multerMiddleware")

router.route("/register").post(upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]), registerUser)
// router.route("/login").post(loginUser)


module.exports=router