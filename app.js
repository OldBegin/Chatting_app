const http = require('http');
const https = require('https');
const fs = require('fs');
const socketio = require('socket.io');
const express = require('express');

const PORT_HTTP= 80;
const PORT_HTTPS= 443;

/////  서버용 인증서   ////////////////////////////////////////////////////////
const OPTIONS = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.unitedin.kr/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.unitedin.kr/cert.pem')
};/////////////////////////////////////////////////////////////////////////

// ///  테스트용 로컬 인증서  ////////////////////////////////////////////
// const OPTIONS = {                                             ///
//   key: fs.readFileSync(__dirname + '/openSSLcert/file.pem'),  ///
//   cert: fs.readFileSync(__dirname + '/openSSLcert/file.crt')  ///
// };///////////////////////////////////////////////////////////////

/////  웹서버를 생성합니다.   ///////////////////////////
const app = express();
const server = http.createServer(app);
const serverSSL = https.createServer(OPTIONS,app);

/////   http => https 리디렉션 //////////////////////////////////////////
app.use(function(request, response, next){
  if(request.secure){
    next();
  }else{
    response.redirect("https://" + request.headers.host + request.url);
    console.log('in else');
  }
});

/////  GET 요청에 대한 라우팅  ////////////////////////////////////////////
app.get('/', (req,res)=>{
  fs.readFile('htmlPage.html', function (err,data) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(data);    // http 문서를가져와 그대로 응답할 경우 사용
    //res.send(data); //data가 문자열이면: html, 배열이나 객체면: json 형태로 응답.
    //res.json(data); // data 를 json 형태로 응답.
  });
});

///////  소켓 접속관련 코드 시작  ////////////////////////////////////////////

const io = socketio();        // 소켓을 생성
io.attach(serverSSL);         // 웹서버와 웹소켓 연결

  // var clientId = 0;                    // private 접속시 활성화활 부분
  // var roomName = null;                 // 룸 생성시 활성화 할 부분
io.sockets.on('connection',(socket)=>{
  // clientId = socket.id;                // private 접속시 활성화할 부분
  // socket.on('join',(data)=>{           // 룸생성시 활성화 할 부분
  //   roomName = data;                   // 룸생성시 활성화 할 부분
  //   socket.join(roomName);             // 룸생성시 활성화 할 부분()클라이언트를 방에 집어넣는 메소드)
  // });
//----------------------------------------------------------------
// clengMsg이벤트(커스텀이벤트)를 통해 클라이언트로부터 메시지를 받으면
// 받은 메세지를 emit으로 커스텀이벤트를 생성해 받은 메시지 해당 클라이언트에 보내는데
// 보내는 방식에 따라서, 특정개인에게(Private), 모두에게(public), 메시지를보낸사람을
// 제외한 모두에게(broadcast), 특정 방에있는 클라이언트에게( to room) 보내는 방식이 있고
// 그 외에 namespace 를 지정하여 보내는 방식도 있다.
//----------------------------------------------------------------
  socket.on('clientMsg',(data)=>{
    // io.sockets.in(roomName).emit('serverMsg', data); //room 지정하여 전송
    // io.sockets.emit('serverMsg',data);               //Public 전송
    // io.sockets.to(clientId).emit('serverMsg',data);  //private 전송
    socket.broadcast.emit('serverMsg',data);            //broadcast 전송
  });
});
///////   소켓관련 코드 끝 ////////////////////////////////////////////////


// 서버실행
serverSSL.listen(443, function () {
    console.log('https Server is running at https://localhost', PORT_HTTPS);
});
