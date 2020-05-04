var express = require('express');
var app = express();
var http = require('http').createServer(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// const express = require('express');
// const path = require('path');
//
// const app = express();
//
// const port = process.env.PORT || 3000;
//
// app.use(express.static(path.join(__dirname, 'dist')));
//
// app.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// });
