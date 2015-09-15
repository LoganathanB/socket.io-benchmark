var profile = require('v8-profiler');
var io = require('socket.io-client');

var message = "{t1p1:{x:152.34, y:243.54, s:3.5}, t2p1:{x:152.34, y:243.54, s:3.5}, t1p2:{x:152.34, y:243.54, s:3.5}, t2p2:{x:152.34, y:243.54, s:3.5}, t1p3:{x:152.34, y:243.54, s:3.5}, t2p3:{x:152.34, y:243.54, s:3.5}, t1g:18, t2g:23}";

function user(shouldBroadcast, host, port, namespace) {
  var socket = io.connect('http://' + host + ':' + port + namespace, {'force new connection': true});

  socket.on('connect', function() {

    // Start messaging loop
    if (shouldBroadcast) {
      // message will be broadcasted by server
      socket.emit('message', message);
    } else {
      // message will be echoed by server
      socket.send(message);
    }

    socket.on('message', function(message) {
      socket.send(message);
    });

    socket.on('broadcastOk', function() {
      socket.emit('broadcast', message);
    });
  });
};

var connect = function (ns) {
  return io.connect(ns, {
    query: 'ns='+ns,
    resource: "socket.io"
  });
}

var argvIndex = 2;

var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000; // in seconds
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '3000';
var namespace = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '';

for(var i=0; i<users; i++) {
  setTimeout(function() { user(shouldBroadcast, host, port, namespace); }, i * newUserTimeout);
};
