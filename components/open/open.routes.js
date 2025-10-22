const express = require('express');
const router = express.Router();
const pool = require('../../db');
const productControl = require('./open.controllers');
router.use(express.json());

router.post('/register', productControl.registerUser);
router.post('/login', productControl.loginUser);
router.get('/product', productControl.getAll);
router.get('/product/:id',productControl.getByID);


module.exports = router;