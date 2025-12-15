require('dotenv').config();
const express = require('express');
const adminRoute = require('./components/admin/admin.routes');
const userRoute = require('./components/open/open.routes')
const back = express();
const bodyParser = require('body-parser')
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require('cors');
const cookieParser = require('cookie-parser');

back.use(bodyParser.json())
back.use(bodyParser.urlencoded({ extended: true }));
back.use(cookieParser());
back.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
back.use('/',userRoute)
back.use('/admin' , adminRoute)
back.use('/upload', express.static(path.join(__dirname, 'images')));

back.get('/test-cookie', (req, res) => {
    res.cookie('test', '123');
    res.send('ok');
  });
  

back.get('/',(req,res) => {
    res.send('Welcome');
});

back.listen(port, ()=>{
    console.log("Start")
})