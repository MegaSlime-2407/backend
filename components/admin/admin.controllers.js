const pool = require('../../db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_secret = process.env.JWT_SECRET;

const registerAdmin = async (req, res) => {
    const {adminName, password} = req.body;
    if( !adminName || !password ) {
        return res.status(400).json({error: 'Usermane and password are requiered'});
    }
    try{
        const check = await pool.query('SELECT * FROM admin WHERE adminname = $1', [adminName]);
        if(check.rows.length > 0 ){
            return res.status(400).json({error: "User with this name or email already exists"});
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO admin (adminname,password) VALUES ($1, $2) RETURNING *', [adminName, hashedPass]);
        res.status(201).json({message: 'User created successfully', user: result.rows[0]});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to register'})
    }
};
  
const adminLogin = async (req, res) =>{
    const { adminName, password } = req.body;
    if (!adminName || !password){
        return res.status(400).json({error: 'Admin name and password are required'});
    }
    if (!JWT_secret) {
        return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }
    try{
        const adminResult = await pool.query('SELECT * FROM admin WHERE adminname = $1', [adminName]);
        if (adminResult.rows.length === 0){
            return res.status(401).json({error:'Invalid admin name or password'});
        }
        const adminL = adminResult.rows[0];
        const isRight = await bcrypt.compare(password, adminL.password);
        if (!isRight){
            return res.status(401).json({error:'Invalid admin name or password'});
        }
        const token = jwt.sign({id: adminL.id, username: adminL.username}, JWT_secret, {expiresIn: '1h'});
        res.cookie('token', token, {
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 1000,
            })
            res.status(200);
            res.json({message: 'Login successfully', token});
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to login'})
    }
}

const getAll = async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM product');
        res.json(result.rows);
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to show product'});
    }
};

const getProductByID = async (req,res)=>{
    const {id} = req.params;
    try{
        const result = await pool.query('SELECT * FROM product WHERE productid = $1',[id]);
        if (result.rows.length === 0){
            return res.status(404).json({error:'Product not found'});
        }
        res.json(result.rows[0]);
    } catch(err){
        console.error(err);
        return res.status(500).json({error:'Failed to find product'});
    }
};
const addProduct = async(req, res) => {

    const {productname, description} = req.body;
    const photo = req.file ? req.file.path :null;

    if(!productname || !description || !photo){
        return res.status(400).json({error:'Name, description and photo are required'});
    }
    try {
        const result = await pool.query('INSERT INTO product (productname, description, photo) VALUES ($1,$2,$3) RETURNING *',
        [productname, description, photo]);
        res.json(result.rows);
    } catch (err){
        console.error(err);
        res.status(500).json({error:'Failed to add product'})
    }
};

const updateProduct = async(req, res)=>{
    const {id} = req.params;
    console.log('Requested ID:', id);
    console.log('Parsed ID:', parseInt(id));
    const {productname, description} = req.body;
    const photo = req.file ? req.file.path : null;
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Invalid or missing ID" });
    }
    try{
        const result = await pool.query(
            'UPDATE product SET productname = COALESCE($1, productname), description = COALESCE($2, description), photo = COALESCE($3, photo) WHERE productid = $4 RETURNING * ', [productname, description, photo, id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error:'Product not found'});
        }
        res.json(result.rows);
    } catch(err){
        console.error(err);
        return res.status(500).json({error:'Failed to edit product'});
    }
    

};

const deleteProduct = async (req, res) =>{
    const {id} = req.params;
    console.log('Requested ID:', id);
    console.log('Parsed ID:', parseInt(id));
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Invalid or missing ID" });
    }
    try{
        const result = await pool.query('DELETE FROM product where productid =$1 RETURNING *',[id]);
        if(result.rows.length === 0){
            return res.status(404).json({error:'Product not found'});
        }
        res.json(result.rows);
    } catch(err){
        console.error(err);
        return res.status(500).json({error:'Failed to delete product'});
    }
};

module.exports = {
    registerAdmin,
    adminLogin,
    getAll,
    getProductByID,
    addProduct,
    updateProduct,
    deleteProduct,
};