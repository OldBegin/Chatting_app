const http = require('http');
const fs = require('fs');
const express = require('express');

// 웹서버와 소켓을 생성합니다.
const app = express();
const server = http.createServer(app);

// 라우팅
app.get('/', (req,res)=>{
  fs.readFile('headerTest.html', function (err,data) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(data);

  });
});
server.listen(3000, function () {
    console.log('https Server is running at https://localhost:3000');
});
