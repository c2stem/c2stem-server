const express = require('express');
const server = express();
const path = require('path');
const bodyParser = require('body-parser');
port = 3000;

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: false
}));

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

server.listen(port, () => {
    console.log('Serving on port',port);
})