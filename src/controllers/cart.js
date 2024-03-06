const Cart = require("../models/cart");
const mongoose = require('mongoose');


function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    //you update code here

    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
} 

exports.addItemToCart = async (req, res) => {
  try {
    const { cartItem } = req.body;

    if (!Array.isArray(cartItem)) {
      return res.status(400).json({ error: 'cartItem should be an array' });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      // If cart already exists, update the cart
      cartItem.forEach((newCartItem) => {
        const existingCartItem = cart.cartItems.find((c) => c.name === newCartItem.name && c.size === newCartItem.size && c.design === newCartItem.design);

        if (existingCartItem) {
          // If the item already exists in the cart, update its quantity
          existingCartItem.quantity += newCartItem.quantity;
        } else {
          // If the item is not in the cart, push it to the cartItems array
          cart.cartItems.push(newCartItem);
        }
      });

      const updatedCart = await cart.save();
      res.status(201).json({ message: 'Cart updated successfully', cart: updatedCart });
    } else {
      // If cart does not exist, create a new cart
      const newCart = new Cart({
        user: req.user._id,
        cartItems: cartItem,
      });

      const savedCart = await newCart.save();
      if (savedCart) {
        return res.status(201).json({ message: 'Cart created successfully', cart: savedCart });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getCartItems = async(req, res) => {
  
    try {
      const cartItems = await Cart.findOne({ user: req.user._id })
      res.json(cartItems);
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch cart items' });
    }

};


const convertToNumericValue = (formattedValue) => {
  if (typeof formattedValue !== 'string') {
    console.error('Invalid formatted value:', formattedValue);
    return 0; // Or handle this case according to your requirements
  }

  // Removing commas from the formatted value
  const numericString = formattedValue.replace(/,/g, '');

  // Parsing the numeric string into a floating point number
  const numericValue = parseFloat(numericString);

  return numericValue;
};


const convertToIndianFormat = (value) => {
  if (value === "") return value;

  const number = parseFloat(value);
  if (isNaN(number)) return value;

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return formatter.format(number).replace("₹", ""); // Removing the currency symbol
};


exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity, selectedGoldType, selectedSize, selectedDiamondType, selectedGoldKt, sizePrice, diamondTypePrice, goldKtPrice, originalPrice } = req.body;

    // Find the cart item by its _id
    const cartItemToUpdate = await Cart.findOneAndUpdate(
      { "cartItems._id": cartItemId }, // Find cart item using its _id
      {
        $set: {
          "cartItems.$.quantity": quantity,
          "cartItems.$.selectedGoldType": selectedGoldType,
          "cartItems.$.selectedSize": selectedSize,
          "cartItems.$.selectedDiamondType": selectedDiamondType,
          "cartItems.$.selectedGoldKt": selectedGoldKt,
          "cartItems.$.sizePrice": sizePrice,
          "cartItems.$.diamondTypePrice": diamondTypePrice,
          "cartItems.$.goldKtPrice": goldKtPrice
        }
      },
      { new: true }
    );

    if (!cartItemToUpdate) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Calculate subtotal
    const subtotal = (convertToNumericValue(originalPrice) + sizePrice + diamondTypePrice + goldKtPrice) * quantity;

    // Calculate final total
    const finalTotal = convertToIndianFormat(subtotal);

    // Update the final total of the cart item
    cartItemToUpdate.cartItems.find(item => item._id.toString() === cartItemId).finalTotal = finalTotal;

    // Save the updated cart
    await cartItemToUpdate.save();

    res.status(200).json({ message: 'Cart item updated successfully', cart: cartItemToUpdate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// exports.updateCartItem = async (req, res) => {
//   try {
//     const { cartItemId, quantity, selectedGoldType, selectedSize, selectedDiamondType, selectedGoldKt, sizePrice, diamondTypePrice, goldKtPrice, myfinalTotal } = req.body;

//     const cart = await Cart.findOne({ user: req.user._id });
//     console.log(req.user._id);

//     if (!cart) {
//       return res.status(404).json({ error: 'Cart not found' });
//     }

//     // Find the cart item by its _id
//     const cartItemToUpdate = cart.cartItems.find(item => item._id.toString() === cartItemId);

//     if (!cartItemToUpdate) {
//       return res.status(404).json({ error: 'Cart item not found' });
//     }

//     // Update the cart item with the provided properties
//     cartItemToUpdate.quantity = quantity;
//     cartItemToUpdate.selectedGoldType = selectedGoldType;
//     cartItemToUpdate.selectedSize = selectedSize;
//     cartItemToUpdate.selectedDiamondType = selectedDiamondType;
//     cartItemToUpdate.selectedGoldKt = selectedGoldKt;
//     cartItemToUpdate.sizePrice = sizePrice;
//     cartItemToUpdate.diamondTypePrice = diamondTypePrice;
//     cartItemToUpdate.goldKtPrice = goldKtPrice;
//     cartItemToUpdate.finalTotal = finalTotal;

//     const updatedCart = await cart.save();
//     res.status(200).json({ message: 'Cart item updated successfully', cart: updatedCart });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };




const { ObjectId } = require('bson'); // Import ObjectId from BSON

exports.removeCartItems = (req, res) => {
    const { productId } = req.params;
    
    // Check if productId is a valid ObjectId
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid productId' });
    }

    // Convert productId to ObjectId
    const objectId = new ObjectId(productId);

    // Remove the product from the cart based on productId
    Cart.updateOne(
        { user: req.user._id },
        {
            $pull: {
                cartItems: {
                    _id: objectId,
                },
            },
        }
    )
    .exec()
    .then((result) => {
        if (result) {
            res.status(201).json({ message: "Product Successfully Remove From the Crat", result });
        } else {
            res.status(400).json({ error: 'Error removing item from cart' });
        }
    })
    .catch((error) => {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
};

exports.increaseCartItemQuantity = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is missing in the request body' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItem = cart.cartItems.find((item) => item._id.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ error: 'CartItem not found in the cart' });
    }

    // Increase the quantity of the cart item
    cartItem.quantity += 1;

    // Save the updated cart
    const updatedCart = await cart.save();
    res.status(202).json({ message: 'Cart item quantity increased successfully', cart: updatedCart });
  } catch (error) {
    console.error("Error increasing cart item quantity:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to decrease the quantity of an item in the cart
exports.decreaseCartItemQuantity = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is missing in the request body' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItem = cart.cartItems.find((item) => item._id.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ error: 'CartItem not found in the cart' });
    }

    // Decrease the quantity of the cart item, ensuring it doesn't go below 1
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    // Save the updated cart
    const updatedCart = await cart.save();
    res.status(202).json({ message: 'Cart item quantity decreased successfully', cart: updatedCart });
  } catch (error) {
    console.error("Error decreasing cart item quantity:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


