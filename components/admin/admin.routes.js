const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productControl = require('./admin.controllers');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'images/');
    },
    filename: (req, file, cb) =>{
        const unique = Date.now();
        cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({storage});
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/login', productControl.adminLogin);
router.get('/product',productControl.getAll);
router.get('/product/:id', productControl.getProductByID);
router.post('/product', upload.single('photo'), productControl.addProduct);
router.put('/product/:id', upload.single('photo'), productControl.updateProduct);
router.delete('/product/:id', productControl.deleteProduct);
module.exports = router;