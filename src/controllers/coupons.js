const Coupon = require('../models/coupon');

const generatedCouponCodes = new Set(); // Define the set to store generated coupon codes

const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let couponCode;
    let numberOfNumbers = 0;
    do {
      couponCode = 'C-';
      numberOfNumbers = 0;
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const randomChar = characters[randomIndex];
        // Check if the character is a number
        if (/\d/.test(randomChar)) {
          numberOfNumbers++;
        }
        couponCode += randomChar;
      }
    } while (generatedCouponCodes.has(couponCode) || numberOfNumbers < 3); // Check for uniqueness and at least three numbers
    generatedCouponCodes.add(couponCode); // Add the generated coupon code to the set
    return couponCode;
};

// Your other controller functions

exports.addCoupon = async (req, res) => {
    try {
      const {
        offerName,
        offerAmount,
        discountPercentage,
        description,
        startDate,
        expiryDate,
        applicableFor,
      } = req.body;
  
      // Check if the coupon code already exists
      const couponCode = generateCouponCode();
      const existingCoupon = await Coupon.findOne({ couponCode });
      if (existingCoupon) {
        return res.status(400).json({ success: false, message: "Coupon code already exists." });
      }
  
      // Create a new coupon
      const newCoupon = new Coupon({
        couponCode,
        offerName,
        offerAmount,
        discountPercentage,
        description,
        startDate,
        expiryDate,
        applicableFor,
      });
  
      // Save the new coupon to the database
      await newCoupon.save();
  
      return res.status(201).json({ success: true, message: "Coupon added successfully.", coupon: newCoupon });
    } catch (error) {
      console.error("Error adding coupon:", error);
      return res.status(500).json({ success: false, message: "An error occurred while adding the coupon." });
    }
  };
  
// Your other controller functions


exports.getAllCoupons = async (req, res) => {
    try {
      const coupons = await Coupon.find();
      return res.status(200).json({ success: true, coupons });
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return res.status(500).json({ success: false, message: "An error occurred while fetching coupons." });
    }
  };

exports.getCouponsById = async (req, res) => {
    try {
        const { id } = req.params; 
        console.log(id)
        let coupons;
        if (id) {
            coupons = await Coupon.findById(id);
        } else {
            coupons = await Coupon.find();
        }
        if (!coupons) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }

        return res.status(200).json({ success: true, coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return res.status(500).json({ success: false, message: "An error occurred while fetching coupons." });
    }
};

  
  // Edit a coupon by ID
  exports.editCoupon = async (req, res) => {
    try {
      const couponId = req.params.id;
      const updates = req.body;
  
      // Update the coupon
      const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updates, { new: true });
  
      if (!updatedCoupon) {
        return res.status(404).json({ success: false, message: "Coupon not found." });
      }
      return res.status(200).json({ success: true, message: "Coupon Successfully Updated." });
    } catch (error) {
      console.error("Error editing coupon:", error);
      return res.status(500).json({ success: false, message: error });
    }
  };
  
  // Delete a coupon by ID
  exports.deleteCoupon = async (req, res) => {
    try {
      const couponId = req.params.id;
  
      // Delete the coupon
      const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
  
      if (!deletedCoupon) {
        return res.status(404).json({ success: false, message: "Coupon not found." });
      }
  
      return res.status(200).json({ success: true, message: "Coupon deleted successfully." });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      return res.status(500).json({ success: false, message: "An error occurred while deleting the coupon." });
    }
  };