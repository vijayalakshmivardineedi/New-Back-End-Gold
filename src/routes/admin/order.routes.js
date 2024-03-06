const express=require('express');


const { updateOrder, getCustomerOrders } = require('../../controllers/admin/order.admin');
const { adminMiddleware, requireSignIn } = require('../../common-middleware');


const router = express.Router();
router.post(`/order/update`, requireSignIn, adminMiddleware, updateOrder);
router.post(`/order/getCustomerOrders`,requireSignIn,adminMiddleware,getCustomerOrders);

module.exports = router;