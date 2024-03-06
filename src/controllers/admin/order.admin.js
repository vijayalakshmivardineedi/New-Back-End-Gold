const order = require("../../models/order");



exports.updateOrder = (req, res) => {
  order.updateOne(
    { _id: req.body.orderId, "orderStatus.type": req.body.type },
    {
      $set: {
        "orderStatus.$": [
          { type: req.body.type, date: new Date(), isCompleted: true },
        ],
      },
    }
  ).exec((error, orders) => {
    if (error) return res.status(400).json({ error });
    if (orders) {
      res.status(201).json({ orders });
    }
  });
};

exports.getCustomerOrders = async (req, res) => {
  const orders = await order.find({})
    .populate("items.productId", "name")
    .exec();
  res.status(200).json({ orders });
};