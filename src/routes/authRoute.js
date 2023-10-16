const express = require('express');
const {
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
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const asyncHandler = require("express-async-handler");


const router = express.Router();

router.post('/register', asyncHandler(createUser));
router.post('/login', asyncHandler(loginUserCtrl));
router.post("/admin-login", asyncHandler(loginAdmin));
router.get('/all-users', asyncHandler(getallUser));
router.get('/refresh', asyncHandler(handleRefreshToken));
router.get('/logout', asyncHandler(logout));
router.get('/:id', authMiddleware , isAdmin, asyncHandler(getaUser));
router.delete('/:id', asyncHandler(deleteaUser));
router.put('/edit-user', authMiddleware, asyncHandler(UpdateaUser));
router.put("/save-address", authMiddleware, asyncHandler(saveAddress));

module.exports = router;