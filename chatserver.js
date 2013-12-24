// importing modules
var http = require('http'),
url = require('url'),
fs = require('fs'),
less = require('less');

// web server
var server = http.createServer(function (req, res) {

  // parsing path
  var path = url.parse(req.url).pathname; 
  
  switch (path){

    case '/':
      fs.readFile(__dirname + '/chatclient.html', function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data, 'utf8');
        res.end();
      });
      fs.readFile(__dirname + '/style/styles.less',function(err,data){
        if (err) return send404(res);
        data = data.toString();
        less.render(data, function (e, css) {
          fs.writeFile('style/style.css', css, function(err){
            console.log('less compiled to css at ~/style/style.css done');
          });
        });
      });
    break;

    case '/style/style.css':
    fs.readFile(__dirname + '/style/style.css', function(err, data){
        if (err) return send404(res);
        console.log('css file found and served fresh.')
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(data, 'utf8');
      });
    break;
                 
    default: send404(res);
  }

});


// 404 return function
send404 = function(res) {
  res.writeHead(404); 
  res.write('404'); 
  res.end();  
};


server.listen(8080, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8080/');

var io = require('socket.io').listen(server);



//on a 'connection' event
io.sockets.on('connection', function(socket){

  console.log("Connection " + socket.id + " accepted.");

  //upon receiving a connected 'socket' object, define event handlers
  socket.on('disconnect', function(){
    console.log("Connection " + socket.id + " terminated.");
  });

  //upon receiving a message, send it to all connected clients
  socket.on('message', function(message){
    console.log("Received message: " + message + " - from client " + socket.id);
    //relay message to all connected clients
    io.sockets.emit('chat', socket.id, message);
  });

});//end on a 'connection' event

