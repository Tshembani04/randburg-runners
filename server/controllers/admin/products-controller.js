// const { imageUploadUtil } = require("../../helpers/cloudinary");
// const Product = require("../../models/Product");

// // Handle image upload
// const handleImageUpload = async (req, res) => {
//   try {
//     // Convert the uploaded file buffer to a base64 string
//     const b64 = Buffer.from(req.file.buffer).toString("base64");
//     // Create a data URL for the image
//     const url = "data:" + req.file.mimetype + ";base64," + b64;
//     const result = await imageUploadUtil(url);

//     // Send the result back to the client
//     res.json({
//       success: true,
//       result,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };

// //add a new product
// const addProduct = async (req, res) => {
//   // Extract product details from the request body
//   try {
//     const {
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//       averageReview,
//     } = req.body;

//     console.log(averageReview, "averageReview");

//     // Create a new product instance with the provided details
//     const newlyCreatedProduct = new Product({
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//       averageReview,
//     });

//     await newlyCreatedProduct.save();
//     res.status(201).json({
//       success: true,
//       data: newlyCreatedProduct,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };

// //fetch all products

// const fetchAllProducts = async (req, res) => {
//   try {
//     const listOfProducts = await Product.find({});
//     res.status(200).json({
//       success: true,
//       data: listOfProducts,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };

// //edit a product
// const editProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//       averageReview,
//     } = req.body;

//     let findProduct = await Product.findById(id);
//     if (!findProduct)
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });

//     findProduct.title = title || findProduct.title;
//     findProduct.description = description || findProduct.description;
//     findProduct.category = category || findProduct.category;
//     findProduct.brand = brand || findProduct.brand;
//     findProduct.price = price === "" ? 0 : price || findProduct.price;
//     findProduct.salePrice =
//       salePrice === "" ? 0 : salePrice || findProduct.salePrice;
//     findProduct.totalStock = totalStock || findProduct.totalStock;
//     findProduct.image = image || findProduct.image;
//     findProduct.averageReview = averageReview || findProduct.averageReview;

//     await findProduct.save();
//     res.status(200).json({
//       success: true,
//       data: findProduct,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };

// //delete a product
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndDelete(id);

//     if (!product)
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });

//     res.status(200).json({
//       success: true,
//       message: "Product delete successfully",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };

// module.exports = {
//   handleImageUpload,
//   addProduct,
//   fetchAllProducts,
//   editProduct,
//   deleteProduct,
// };


const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// ============================================================
// HANDLE IMAGE UPLOAD
// ============================================================

const handleImageUpload = async (req, res) => {
  try {
    // Convert uploaded file buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");

    // Create data URL
    const url = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error occurred while uploading image",
    });
  }
};

// ============================================================
// ADD PRODUCT
// ============================================================

const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      variants,
    } = req.body;

    // Make sure variants are always an array
    const productVariants = Array.isArray(variants) ? variants : [];

    // Calculate total stock from variants
    const calculatedTotalStock = productVariants.length
      ? productVariants.reduce(
          (total, variant) => total + Number(variant.stock || 0),
          0
        )
      : Number(totalStock || 0);

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock: calculatedTotalStock,
      averageReview,
      variants: productVariants,
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Error occurred while creating product",
    });
  }
};

// ============================================================
// FETCH ALL PRODUCTS
// ============================================================

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});

    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// ============================================================
// EDIT PRODUCT
// ============================================================

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      variants,
    } = req.body;

    const findProduct = await Product.findById(id);

    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ----------------------------------------------------------
    // Basic product fields
    // ----------------------------------------------------------

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;

    findProduct.price =
      price === "" ? 0 : price !== undefined ? price : findProduct.price;

    findProduct.salePrice =
      salePrice === ""
        ? 0
        : salePrice !== undefined
        ? salePrice
        : findProduct.salePrice;

    findProduct.image = image || findProduct.image;

    findProduct.averageReview =
      averageReview !== undefined
        ? averageReview
        : findProduct.averageReview;

    // ----------------------------------------------------------
    // Variants
    // ----------------------------------------------------------

    if (Array.isArray(variants)) {
      findProduct.variants = variants;

      // Recalculate total stock
      findProduct.totalStock = variants.reduce(
        (total, variant) => total + Number(variant.stock || 0),
        0
      );
    } else if (totalStock !== undefined) {
      // Keep backwards compatibility for products
      // that don't use variants.
      findProduct.totalStock = totalStock;
    }

    await findProduct.save();

    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Error occurred while updating product",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};