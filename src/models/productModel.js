const mongoose = require('mongoose');

// Declare the Schema for Product collection
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantityInStock: {
    type: Number,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: String,
    required: true,
  },
});

// Create the Product model
module.exports = mongoose.model('Product', productSchema);
