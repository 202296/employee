const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
// const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
    {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      dateOfBirth: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      salary: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      hireDate: {
        type: String,
        required: true,
      },
      jobTitle: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: "employee",
      },
      address: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

//Export the model
module.exports = mongoose.model('User', userSchema);