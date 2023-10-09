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
    // createOrder,
    // getOrders,
    // updateOrderStatus,
    // getAllOrders,
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post("/admin-login", loginAdmin);
// router.post("/cart/cash-order", authMiddleware, createOrder);
router.get('/all-users', getallUser);
// router.get("/get-orders", authMiddleware, getOrders);
// router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
// router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);

router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/:id', authMiddleware , isAdmin, getaUser);
router.delete('/:id', deleteaUser);
router.put(
    "/order/update-order/:id",
    authMiddleware,
    isAdmin,
    // updateOrderStatus
  );
router.put('/edit-user', authMiddleware, UpdateaUser);
router.put("/save-address", authMiddleware, saveAddress);

module.exports = router;