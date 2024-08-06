const express=require("express")
const router=express.Router();
const {registerUser,loginUser,logoutUser}=require("../controllers/userController")
const upload=require("../middlewares/multerMiddleware")
const verifyJwt = require("../middlewares/isLoggedInUserMiddleware");


router.route("/register").post(
  upload.fields([
      {
          name: "avatar",
          maxCount: 1
      }, 
      {
          name: "coverImage",
          maxCount: 1
      }
  ]),
  registerUser
  )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt,  logoutUser)


module.exports=router


