const Category = require("../models/category");
const slugify = require("slugify");
const shortid = require("shortid");
const path = require('path');
const multer = require('multer');
const fs = require('fs');





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '../CategoriesImages');
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

const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

exports.addCategory = (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error uploading category file:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while uploading category file.' });
      }

      // Extracting category details from the request body
      const { name } = req.body;

      // Constructing category object with basic details
      const categoryObj = {
        name,
      };

      // Saving uploaded image and video paths to the category object
      if (req.files) {
        // Assuming single image and single video are uploaded
        if (req.files['image'] && req.files['image'].length > 0) {
          categoryObj.categoryImage = "/public/" + req.files['image'][0].filename;
        }
        if (req.files['video'] && req.files['video'].length > 0) {
          categoryObj.categoryVideo = "/public/" + req.files['video'][0].filename;
        }
      }

      // Creating a new category instance with category object
      const cat = new Category(categoryObj);

      // Saving category to the database
      cat.save((error, category) => {
        if (error) {
          // If error occurs during database operation, return error response
          return res.status(400).json({ success: false, error });
        }
        // If category saved successfully, return success response with saved category details
        if (category) {
          return res.status(201).json({ success: true, message: 'Category successfully created', category });
        }
      });
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while adding the category.' });
  }
};


exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching the categories.' });
  }
};


exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching the category.' });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId; // Assuming the route parameter is named id
console.log(categoryId)
    // Check if the category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // If there's an associated image file, delete it from the file system
    if (category.categoryImage) {
      const imagePath = path.join(__dirname, '../CategoriesImages', path.basename(category.categoryImage));
      console.log('Deleting image at path:', imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      } else {
        console.log(`Image file does not exist at path: ${imagePath}`);
      }
    }

    // If there's an associated video file, delete it from the file system
    if (category.categoryVideo) {
      const videoPath = path.join(__dirname, '../CategoriesImages', path.basename(category.categoryVideo));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      } else {
        console.log(`Video file does not exist at path: ${videoPath}`);
      }
    }

    // Delete the category
    await category.remove();

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting Category:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while deleting the Category.' });
  }
};

exports.editCategory = (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error uploading category file:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while uploading category file.' });
      }

      // Extracting category details from the request body
      const { name } = req.body;
      const categoryId = req.params.categoryId;

      console.log('Category Name:', name);
      console.log('Category ID:', categoryId);

      // Check if name exists in the request body
      if (!name) {
        console.log('Category name is required.');
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      // Find the category by ID
      const category = await Category.findById(categoryId);

      // If category not found, return 404 error
      if (!category) {
        console.log('Category not found.');
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      console.log('Found Category:', category);

      // Log the uploaded files
      console.log('Uploaded Files:', req.files);

      // Construct updated category object
      category.name = name;

      // Update category image if uploaded
      if (req.files['image'] && req.files['image'].length > 0) {
        // Delete old image file if exists
        if (category.categoryImage) {
          const oldImagePath = path.join(__dirname, '../CategoriesImages', path.basename(category.categoryImage));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Old image file removed successfully.');
          }
        }
        category.categoryImage = "/public/" + req.files['image'][0].filename;
      }

      // Update category video if uploaded
      if (req.files['video'] && req.files['video'].length > 0) {
        // Delete old video file if exists
        if (category.categoryVideo) {
          const oldVideoPath = path.join(__dirname, '../CategoriesVideos', path.basename(category.categoryVideo));
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
            console.log('Old video file removed successfully.');
          }
        }
        category.categoryVideo = "/public/" + req.files['video'][0].filename;
      }

      console.log('Updated Category:', category);

      // Save the updated category
      category.save((error, updatedCategory) => {
        if (error) {
          console.error('Error updating category:', error);
          return res.status(500).json({ success: false, message: 'An error occurred while updating the category.' });
        }
        console.log('Category successfully updated:', updatedCategory);
        return res.status(200).json({ success: true, message: 'Category successfully updated', category: updatedCategory });
      });
    });
  } catch (error) {
    console.error('Error editing category:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while editing the category.' });
  }
};


