const pool = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const e = require('express');
const JWT_secret = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    const {username, email, password} = req.body;
    if( !username || !email || !password ) {
        return res.status(400).json({error: 'Usermane, email and password are requiered'});
    }

    try{
        const check = await pool.query('SELECT * FROM users WHERE username = $1 or email = $2', [username, email]);
        if(check.rows.length > 0 ){
            return res.status(400).json({error: "User with this name or email already exists"});
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPass]);
        res.status(201).json({message: 'User created successfully', user: result.rows[0]});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to register'})
    }
};

const loginUser = async (req,res) => {
    const {username, password} = req.body;
    if( !username || !password ) {
        return res.status(400).json({error: 'Username and password are requiered'});
    }
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1',[username]);
        if( userResult.rows.length === 0){
            return res.status(401).json({error: 'Invalid username or password'});
        }
        const user = userResult.rows[0];
        const isRight = await bcrypt.compare(password, user.password);
        if(!isRight){
            return res.status(401).json({error: 'Invalid username or password'});
        }
        const token = jwt.sign({id: user.id, username: user.username}, JWT_secret, {expiresIn: '1h'});
        res.json({message: 'Login successfully', token});
    } catch(err){
        console.error(err);
        return res.status(500).json({error: 'Failed to login'});
    }
};

const getAll = async(req,res)=>{
    const { productname, description} = req.query;
    const { page, perPage } = req.query || { page: 1, perPage: 15 };
    try{
        let result;

        if(description || productname){
            const condition = [];
            const values = [];
            if (description){
                condition.push('description ILIKE $'+(values.length + 1));
                values.push(`%${description}%`);
            }
            if(productname){
                condition.push('productname ILIKE $'+(values.length + 1));
                values.push(`%${productname}%`);
            }
            const query = `SELECT * FROM product WHERE ${condition.join(' AND ')}`;
            console.log('Search Query:', query, 'Values:', values);

            result = await pool.query(query,values);
            
            if(result.rows.length === 0){
                return res.status(404).json({error:'No product found'});
            }
        } else{
            result = await pool.query('SELECT * FROM product');
        }
        res.json(result.rows);
        
       
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to shod products'});
    }
};

const getByID = async(req,res)=>{
    const {id} = req.params;
    try{
        const result = await pool.query('SELECT * FROM product WHERE productid = $1',[id]);
        if(result.rows.length === 0){
            return res.status(404).json({error:'Product not found'});
        }
        res.json(result.rows);
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Failed to find product'});
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAll,
    getByID
}
