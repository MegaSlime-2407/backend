require('dotenv').config();
const express = require('express');
const adminRoute = require('./components/admin/admin.routes');
const userRoute = require('./components/open/open.routes')
const back = express();
const bodyParser = require('body-parser')
const path = require('path');
const port = process.env.PORT || 3000;

back.use(bodyParser.json())
back.use(bodyParser.urlencoded({ extended: true }));

back.use('/',userRoute)
back.use('/admin' , adminRoute)
back.use('/upload', express.static(path.join(__dirname, 'images')));


back.get('/',(req,res) => {
    res.send('Welcome');
});

back.listen(port, ()=>{
    console.log("Start")
})