const Product = require('../models/product')
const Category = require('../models/category')
const shortid = require("shortid");
const path = require('path');
const multer = require('multer');
const fs = require('fs');


const generatedProductCodes = new Set(); // Define a set to store generated product codes

const generateproductCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let productCode;
  let numberOfNumbers = 0;
  do {
    productCode = 'C-';
    numberOfNumbers = 0;
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex];
      // Check if the character is a number
      if (/\d/.test(randomChar)) {
        numberOfNumbers++;
      }
      productCode += randomChar;
    }
  } while (generatedProductCodes.has(productCode) || numberOfNumbers < 3); // Check for uniqueness and at least three numbers
  generatedProductCodes.add(productCode); // Add the generated product code to the set
  return productCode;
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '../ProductsImages');
    // Check if the Categories folder exists, create it if it doesn't
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + '-' + file.originalname);
  }
});

// Updated multer upload configuration to accept multiple images
const upload = multer({ storage }).fields([
  { name: 'images', maxCount: 5 }, // Adjust maxCount as needed
  { name: 'video', maxCount: 1 }
]);


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

exports.createProduct = async (req, res) => {
  try {
      upload(req, res, async (err) => {
          if (err) {
              console.error('Error uploading product files:', err);
              return res.status(500).json({ success: false, message: 'An error occurred while uploading product files.' });
          }

          const {
              category, name, description, productBy,
              quantity, height, width, length, size, totalProductWeight,
              goldType, goldWeight, goldKt,
              diamondType, diamondSize, diamondShape, diamondKt, diamondColour, diamondCount, diamondWeight, diamondClarity, diamondSettingType,
              stone, stoneSize, stoneShape, stonesCount, stoneColour, stoneWeight, stoneSettingtype,
              diamondprice, goldprice, stoneprice, makingCharges, gst, offer, total,
          } = req.body;

          // Convert prices and charges to Indian format
          

          let productPictures = [];
          let videoProduct = null;

          if (req.files) {
              // Check if images are uploaded
              if (req.files['images'] && req.files['images'].length > 0) {
                  productPictures = req.files['images'].map(image => ({
                      img: `/publicProduct/${image.filename}` // Assuming 'filename' is the correct property that holds the file name.
                  }));
              }

              if (req.files['video'] && req.files['video'].length > 0) {
                  videoProduct = "/publicProduct/" + req.files['video'][0].filename;
              }
          }

          // Convert size array to array of objects with size property
          // Check if size is an array before mapping over it
        

          const productCode = generateproductCode();
          const product = new Product({
              category, name, description, productBy, productCode,
              quantity, height, width, length, size, totalProductWeight,
              goldType, goldWeight, goldKt,
              diamondType, diamondSize, diamondShape, diamondKt, diamondColour, diamondCount, diamondWeight, diamondClarity, diamondSettingType,
              stone, stoneSize, stoneShape, stonesCount, stoneColour, stoneWeight, stoneSettingtype,
              diamondprice, goldprice, stoneprice, makingCharges, gst, offer, total, productPictures,
              ...(videoProduct && { videoProduct }), // Add videoProduct only if it's not null
          });

          try {
              await product.save();
              return res.status(201).json({ success: true, product, message: 'Product added successfully.' });
          } catch (error) {
              console.error('Error creating product:', error);
              return res.status(500).json({ success: false, message: 'An error occurred while creating the product.' });
          }
      });
  } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while creating the product.' });
  }
};




// exports.getProductByCategory = async (req, res) => {
//   try {
//     const category = req.params.category;
//     const products = await Product.find({ category: category });
//     if (!products || products.length === 0) {
//       return res.status(404).json({ success: false, message: 'No products found in this category.' });
//     }
//     return res.status(200).json({ success: true, products });
//   } catch (error) {
//     console.error('Error fetching products by category:', error);
//     return res.status(500).json({ success: false, message: 'An error occurred while fetching products by category.' });
//   }
// };  /// getting all details


exports.getProductByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    console.log('Category:', category); // Log category for debugging
    const products = await Product.find({ category: category }).select('name quantity productPictures total');
    console.log('Products:', products); // Log products for debugging
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found in this category.' });
    }
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching products by category.' });
  }
};

exports.getDetailsByProductId = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details by ID:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching product details.' });
  }
};

exports.getCustamizedByProductId = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).select('goldType goldKt diamondType size');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details by ID:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching product details.' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(productId);
    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Delete product pictures from the ProductsImages folder
    if (product.productPictures && product.productPictures.length > 0) {
      await Promise.all(product.productPictures.map(async (picture) => {
        const imagePath = path.join(__dirname, '../ProductsImages', path.basename(picture.img));
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
            console.log("Image deleted successfully.");
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      }));
    }
    // Delete product video from the ProductsVideos folder
    if (product.videoProduct) {
      const videoPath = path.join(__dirname, '../ProductsImages', path.basename(product.videoProduct));
      console.log("Deleting video file:", videoPath); // Log the deletion of the video file
      if (fs.existsSync(videoPath)) {
        try {
          fs.unlinkSync(videoPath);
          console.log("Video deleted successfully.");
          // Remove the videoProduct field from the database
          product.videoProduct = null;
          await product.save(); // Save the product without the video field
        } catch (err) {
          console.error("Error deleting video:", err);
          return res.status(500).json({ success: false, message: 'An error occurred while deleting the video.' });
        }
      } else {
        console.log("Video does not exist at path:", videoPath);
        // Handle the case where the video file does not exist
      }
    }
    // Delete the product from the database
    await product.remove();
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while deleting the product.' });
  }
};






exports.editProduct = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error uploading product files:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while uploading product files.' });
      }

      const productId = req.params.productId; // Assuming productId is passed in the request URL
      const updateFields = { ...req.body };
      console.log(updateFields)
      delete updateFields.productId; // Remove productId from updateFields

      try {
        const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Delete old image files if new images are uploaded
        if (req.files['images'] && req.files['images'].length > 0 && product.productPictures && product.productPictures.length > 0) {
          try {
            product.productPictures.forEach((picture) => {
              const imagePath = path.join(__dirname, '../ProductsImages', path.basename(picture.img));
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Old image file removed successfully:', imagePath);
              } else {
                console.log('Old image file not found:', imagePath);
              }
            });
          } catch (error) {
            console.error('Error deleting old image files:', error);
          }
        }

        // Delete old video file if new video is uploaded
        if (req.files['video'] && req.files['video'].length > 0 && product.videoProduct) {
          try {
            const videoPath = path.join(__dirname, '../ProductsImages', path.basename(product.videoProduct));
            if (fs.existsSync(videoPath)) {
              fs.unlinkSync(videoPath);
              console.log('Old video file removed successfully:', videoPath);
            } else {
              console.log('Old video file not found:', videoPath);
            }
          } catch (error) {
            console.error('Error deleting old video file:', error);
          }
        }

        let productPictures = [];
        let videoProduct = null;

        if (req.files) {
          if (req.files['images'] && req.files['images'].length > 0) {
            productPictures = req.files['images'].map(image => ({
              img: `/publicProduct/${image.filename}`
            }));
          }

          if (req.files['video'] && req.files['video'].length > 0) {
            videoProduct = "/publicProduct/" + req.files['video'][0].filename;
          }
        }

        if (productPictures.length > 0) {
          updateFields.productPictures = productPictures;
        }

        if (videoProduct) {
          updateFields.videoProduct = videoProduct;
        }
      
        const updatedProduct = await Product.findByIdAndUpdate(productId, { $set: updateFields }, { new: true });

        return res.status(200).json({ success: true, product: updatedProduct, message: 'Product updated successfully.' });
      } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while updating the product.' });
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while updating the product.' });
  }
};



// exports.editProduct = async (req, res) => {
//   try {
//     upload(req, res, async (err) => {
//       if (err) {
//         console.error('Error uploading product files:', err);
//         return res.status(500).json({ success: false, message: 'An error occurred while uploading product files.' });
//       }

//       const productId = req.params.productId;
//       const updates = req.body;
//       const product = await Product.findById(productId);

//       if (!product) {
//         return res.status(404).json({ success: false, message: 'Product not found.' });
//       }

//       console.log("Received updates:");
//       console.log(updates);

//       if (typeof updates === 'object' && updates !== null) {
//         for (const key in updates) {
//           if (Object.prototype.hasOwnProperty.call(updates, key)) {
//             // Check if the key exists in the product object
//             if (product[key] !== undefined) {
//               // If the key represents a currency value, convert it to Indian format
//               if (['diamondprice', 'goldprice', 'stoneprice', 'makingCharges', 'gst', 'offer', 'total'].includes(key)) {
//                 product[key] = convertToIndianFormat(updates[key]);
//               } else {
//                 product[key] = updates[key];
//               }
//             } else {
//               console.warn(`Key "${key}" does not exist in the product schema.`);
//             }
//           }
//         }
//       } else {
//         console.error('Updates is not a valid object:', updates);
//         // Handle this case appropriately, perhaps return an error response
//       }

//       // Handle optional fields: size and reviews
//       if ('size' in updates) {
//         product.size = updates.size;
//       }
//       if ('reviews' in updates) {
//         product.reviews = updates.reviews;
//       }

//       let productPictures = product.productPictures;
//       let videoProduct = product.videoProduct;

//       if (req.files) {
//         if (req.files['images'] && req.files['images'].length > 0) {
//           productPictures = req.files['images'].map(image => ({
//             img: `/publicProduct/${image.filename}` // Assuming 'filename' is the correct property that holds the file name.
//           }));
//         }

//         if (req.files['video'] && req.files['video'].length > 0) {
//           videoProduct = "/publicProduct/" + req.files['video'][0].filename;
//         }
        
//       }

//       // Delete old image files if new images are uploaded
//       if (req.files['images'] && req.files['images'].length > 0 && product.productPictures && product.productPictures.length > 0) {
//         product.productPictures.forEach((picture) => {
//           const imagePath = path.join(__dirname, '../ProductsImages', path.basename(picture.img));
//           if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath);
//             console.log('Old image file removed successfully:', imagePath);
//           }
//         });
//       }

//       // Delete old video file if new video is uploaded
//       if (req.files['video'] && req.files['video'].length > 0 && product.videoProduct) {
//         const videoPath = path.join(__dirname, '../ProductsImages', path.basename(product.videoProduct));
//         if (fs.existsSync(videoPath)) {
//           fs.unlinkSync(videoPath);
//           console.log('Old video file removed successfully:', videoPath);
//         }
//       }

//       // Update product with new image and video paths
//       product.productPictures = productPictures;
//       product.videoProduct = videoProduct;

//       // Save the updated product
//       await product.save();

//       return res.status(200).json({ success: true, message: "Successfully Updated!" });
//     });
//   } catch (error) {
//     console.error('Error editing product:', error);
//     return res.status(500).json({ success: false, message: 'An error occurred while editing the product.' });
//   }
// };





const _ = require('lodash');

exports.getAllProducts = async (req, res) => {
  try {
    // Define an array to hold products from each category
    const productsByCategory = [];

    // Fetch up to 16 products from each category
    const categories = await Product.distinct('category');
    for (const category of categories) {
      const products = await Product.find({ category }).limit(16);
      productsByCategory.push(products);
    }

    // Combine products from different categories
    let mixedProducts = _.flatten(productsByCategory);

    // Shuffle the array of products randomly
    mixedProducts = _.shuffle(mixedProducts);

    // Limit the final result to 16 products
    mixedProducts = mixedProducts.slice(0, 16);

    return res.status(200).json({ success: true, products: mixedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching the products.' });
  }
};


exports.getSimilarProducts = async (req, res) => {
  try {
    // Extract category from request parameters
    const { category } = req.params;
console.log(category)
    // Fetch products based on category
    const products = await Product.find({ category }).exec(); // Ensure execution of the query

    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found for the specified category.' });
    }

    // Shuffle the array of products randomly
    const shuffledProducts = _.shuffle(products);

    // Return only five random products
    const similarProducts = shuffledProducts.slice(0, 5);

    return res.status(200).json({ success: true, similarProducts });
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching the similar products.' });
  }
};


