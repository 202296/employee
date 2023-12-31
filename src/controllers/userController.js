const { generateToken } = require('../configs/jwtoken');
const User = require('../models/userModel');
const Product = require("../models/productModel");
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../configs/refreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const sendEmail = require('./emailController');


const createUser = asyncHandler(async(req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser)
    } else {
        // User already exists
        throw new Error('User Already Exists');
    }
});

const loginUserCtrl = asyncHandler(async(req, res) =>{
    const {email, password} = req.body;
    // check if user exist or not
    const findUser = await User.findOne({email})
    if(findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const Updateuser = await User.findByIdAndUpdate(
        findUser.id, 
        {
            refreshToken: refreshToken,
        }, 
        {
            new: true,
        }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});



const loginAdmin = asyncHandler(async(req, res) =>{
    const {email, password} = req.body;
    // check if user exist or not
    const findAdmin = await User.findOne({email})
    if(findAdmin.role !== 'admin') throw new Error('Not Authorised');
    if(findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const UpdateAdmin = await User.findByIdAndUpdate(
        findAdmin.id, 
        {
            refreshToken: refreshToken,
        }, 
        {
            new: true,
        }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});
// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) throw new Error('No Refresh token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token.')
        }
        const accessToken = generateToken(user?._id)
        res.json({accessToken});
    })   
});

// Logout Functionality

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
      throw new Error('No Refresh Token in Cookies');
    }
  
    const refreshToken = cookie.refreshToken;
  
    const user = await User.findOne({ refreshToken });
  
    if (!user) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // No Content
    }
  
    await User.findOneAndUpdate(
      { refreshToken: refreshToken }, // Corrected filter
      { refreshToken: '' },          // Update data
      { new: true }                  // Options, if needed
    );
  
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // No Content
  });
  

// Update a user

const UpdateaUser = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    validateMongodbId(_id)
    try {
        const UpdateaUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
        {
            new: true,
        }
        );
        res.json(UpdateaUser)
    } catch (error) {
        throw new Error(error);
    }
})

// Save User Address

const saveAddress = asyncHandler(async (req, res, next) => {
    const {_id} = req.user;
    validateMongodbId(_id)
    try {
        const UpdateaUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,
        },
        {
            new: true,
        }
        );
        res.json(UpdateaUser)
    } catch (error) {
        throw new Error(error);
    }
})

// Get all user

const getallUser = asyncHandler(async(req, res) =>{
 try {
    const getUsers = await User.find();
    res.json(getUsers);
    }
  catch (error) {
        throw new Error(error)
    }
});

// Get a single user

const getaUser = asyncHandler(async(req, res) => {
        const {id} = req.params;
        validateMongodbId(id)
        try {
            const getaUser = await User.findById(id);
            res.json({
                getaUser,
            })
        } catch (error) {
            throw new Error(error);
        }
});

// Delete a single user

const deleteaUser = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async(req, res)=> {
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const block = await User.findByIdAndUpdate(
            id,
         {
            isBlocked: true,
         },
        {
            new: true,
        }
    );
    res.json({
        message: "User Blocked"
    })
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async(req, res)=> {
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const unblock = await User.findByIdAndUpdate(
            id,
         {
            isBlocked: false,
         },
        {
            new: true,
        }
    );
    res.json({
        message: "User Unblocked"
    })
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });


  const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "Forgot Password Link",
        htm: resetURL,
      };
      sendEmail(data)
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
  });

  const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  });


module.exports = {
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deleteaUser, 
    UpdateaUser, 
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    saveAddress
}