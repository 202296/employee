const { generateToken } = require('../configs/jwToken');
const User = require('../models/userModel');
// const Product = require("../models/productModel");
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../configs/refreshToken');
const jwt = require('jsonwebtoken');
// const crypto = require('crypto')


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
            dateOfBirth: findUser?.dateOfBirth,
            department: findUser?.department,
            salary: findUser?.salary,
            email: findUser?.email,
            hireDate: findUser?.hireDate,
            jobTitle: findUser?.jobTitle,
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
            dateOfBirth: findAdmin?.dateOfBirth,
            department: findAdmin?.department,
            salary: findAdmin?.salary,
            email: findAdmin?.email,
            hireDate: findAdmin?.hireDate,
            jobTitle: findAdmin?.jobTitle,
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
            dateOfBirth: req?.body?.dateOfBirth,
            department: req?.body?.department,
            salary: req?.body?.salary,
            email: req?.body?.email,
            hireDate: req?.body?.hireDate,
            jobTitle: req?.body?.jobTitle,
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


module.exports = {
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deleteaUser, 
    UpdateaUser, 
    handleRefreshToken,
    logout,
    loginAdmin,
    saveAddress,
}