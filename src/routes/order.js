
const { requireSignIn, userMiddleware } = require("../common-middleware");
const {  getOrders, addOrder } = require("../controllers/order");

const router = require("express").Router();

router.post("/addOrder", requireSignIn, userMiddleware, addOrder);
router.get("/getOrders", requireSignIn, userMiddleware, getOrders);


module.exports = router;