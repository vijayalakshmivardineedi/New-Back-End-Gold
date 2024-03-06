const express = require("express");
const router = express.Router();
const { addCoupon, getAllCoupons, editCoupon, deleteCoupon, getCouponsById } = require("../controllers/coupons");
const { requireSignIn, adminMiddleware } = require("../common-middleware");

// Define your routes
router.post("/admin/addCoupon", requireSignIn, adminMiddleware, addCoupon);
router.get("/admin/getCoupons", requireSignIn, adminMiddleware, getAllCoupons);
router.get("/admin/getCouponsById/:id", requireSignIn, adminMiddleware, getCouponsById);
router.put("/admin/editCoupons/:id", requireSignIn, adminMiddleware, editCoupon);
router.delete("/admin/deleteCoupons/:id",requireSignIn, adminMiddleware, deleteCoupon);


router.get("/user/coupons", getAllCoupons);


module.exports = router;
