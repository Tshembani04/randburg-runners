// const mongoose = require("mongoose");

// const ProductSchema = new mongoose.Schema(
//   {
//     image: String,
//     title: String,
//     description: String,
//     category: String,
//     brand: String,
//     price: Number,
//     salePrice: Number,
//     totalStock: Number,
//     averageReview: Number,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", ProductSchema);


const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    variants: {
      type: [VariantSchema],
      default: [],
    },

    totalStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageReview: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);