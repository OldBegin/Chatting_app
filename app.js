const http = require('http');
const https = require('https');
const fs = require('fs');
const socketio = require('socket.io');
const express = require('express');

//// 서버용 인증서 ///
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/www.unitedin.kr/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/www.unitedin.kr/cert.pem')
// };

///// 테스트용 로컬 인증서 //////////
const options = {
  key: fs.readFileSync(__dirname + '/openSSLcert/file.pem'),
  cert: fs.readFileSync(__dirname + '/openSSLcert/file.crt')
};

// 웹서버와 소켓을 생성합니다.
const app = express();                        // 웹서버 생성
const io = socketio();                        // 웹소켓 생성
const server = http.createServer(app);
const serverSSL = https.createServer(options,app);

io.attach(serverSSL);                      // 웹서버와 웹소켓 연결

// 라우팅
app.get('/', (req,res)=>{
  fs.readFile('htmlPage.html', function (err,data) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(data);
  });
});

// let clientId = 0;
// let roomName = null;
io.sockets.on('connection',(socket)=>{
  // clientId = socket.id;
  // socket.on('join',(data)=>{         // 클라이언트가 룸생성해서 이벤트 발송
  //   roomName = data;
  //   socket.join(roomName);           // 클라이언트를 방에 집어넣는 메소드
  //   //console.log('join roomName: ' + roomName);
  // });

////////////////////////////////////////////////////////////////
// clengMsg이벤트(커스텀이벤트)를 통해 클라이언트로부터 메시지를 받으면
// 받은 메세지를 emit으로 커스텀이벤트를 생성해 받은 메시지 해당 클라이언트에 보내는데
// 보내는 방식에 따라서, 특정개인에게(Private), 모두에게(public), 메시지를보낸사람을
// 제외한 모두에게(broadcast), 특정 방에있는 클라이언트에게( to room) 보내는 방식이 있고
// 그 외에 namespace 를 지정하여 보내는 방식도 있다.
////////////////////////////////////////////////////////////////
  socket.on('clientMsg',(data)=>{
    // 클라이언트로부터 받은 메세지를 해당 룸에 있는 클라이언트들에게 전송
    // io.sockets.in(roomName).emit('serverMsg', data); //room 지정하여 전송
     io.sockets.emit('serverMsg',data);              //Public 전송
    // io.sockets.to(clientId).emit('serverMsg',data); //private 전송
    // socket.broadcast.emit('serverMsg',data);        //broadcast 전송
  });
});
 
// 서버실행
// server.listen(80, function () {
//     console.log('Server is running at http://localhost:80');
// });
serverSSL.listen(443, function () {
    console.log('https Server is running at https://localhost:443');
});
