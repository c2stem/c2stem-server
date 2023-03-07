require('dotenv').config();
require('./config/passport')
const express = require('express');
const server = express();
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const UserRoute = require('./routes/userRoute');
const StateRoute = require('./routes/stateRoute');

port = process.env.PORT || 8203;
mongo_uri = 'mongodb://localhost:27017/c2stem-class';

mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MONGO CONNECTION OPEN!")
}).catch(err => {
    console.log("MONGO CONNECTION ERROR!!")
    console.log(err)
});

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", () => {
//     console.log("Database connected");
// });

server.set('view engine', 'html');
server.use(express.static(path.join(__dirname, '../client/dist')))
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: false
}));
// server.use(cors());
server.use(passport.initialize());

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

server.use('/user', UserRoute);
server.use('/state', StateRoute);
server.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
})

server.listen(port, () => {
    console.log('Serving on port',port);
})