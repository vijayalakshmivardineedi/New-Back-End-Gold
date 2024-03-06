const Wishlist = require("../models/wishlist");


exports.addItemToWishlist = async (req, res) => {
  const { wishlistItem } = req.body;

  if (!Array.isArray(wishlistItem)) {
    return res.status(400).json({ error: 'wishlistItem should be an array' });
  }

  try {
    const existingWishlist = await Wishlist.findOne({ user: req.user._id });

    if (existingWishlist) {
      // Wishlist already exists, update or add items
      for (const newWishlistItem of wishlistItem) {
        const existingItemIndex = existingWishlist.wishlistItems.findIndex(
          (item) => item.name== newWishlistItem.name
        );

        if (existingItemIndex !== -1) {
          // Item already exists, update its quantity or other properties
          // In this case, return a message indicating that the item is already in the wishlist
          return res.status(201).json({ message: 'Item is already in the wishlist' });
        } else {
          // Item is not in the wishlist, add it
          existingWishlist.wishlistItems.push(newWishlistItem);
        }
      }

      await existingWishlist.save();
      return res.status(201).json({ message: 'Wishlist updated successfully', wishlist: existingWishlist });
    } else {
      // Wishlist does not exist, create a new one
      const newWishlist = new Wishlist({
        user: req.user._id,
        wishlistItems: wishlistItem,
      });
      const savedWishlist = await newWishlist.save();
      return res.status(201).json({ message: 'Wishlist created successfully', wishlist: savedWishlist });
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.getWishlistItems = async(req, res) => {

    try {
      const wishlistItems = await Wishlist.findOne({ user: req.user._id })
      res.json(wishlistItems);
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch wishlist items' });
    }
 // }
};

// new update remove wishlist items
exports.removeWishlistItems = (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is missing in the request body' });
  }

  // Remove the product from the wishlist based on productId
  Wishlist.updateOne(
    { user: req.user._id },
    {
      $pull: {
        wishlistItems: {
          _id: productId,
        },
      },
    }
  )
    .exec()
    .then((result) => {
      if (result) {
        res.status(201).json({ message: "Successfully Removed", result });
      } else {
        res.status(400).json({ error: 'Error removing item from wishlist' });
      }
    })
    .catch((error) => {
      console.error("Error removing item from wishlist:", error);
      res.status(500).json({ error: 'Internal server error' });
    });
};
