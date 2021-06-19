'use strict';

//Loading dependencies & initializing express
var os = require('os');
var express = require('express');
var app = express();
var http = require('http');
//For signalling in WebRTC
var socketIO = require('socket.io');
const { rgbaToI420 , i420ToRgba} = require('wrtc').nonstandard;
const { createCanvas, createImageData, Image } = require('canvas');
const stream = require('stream');
app.use(express.static('public'))

app.get("/", function(req, res){
	res.render("index.ejs");
});

app.get("/watch", function(req, res){
	res.render("watch.ejs");
});


const width = 480, height = 360;

var canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
var image = new Image()

image.onload = function() {
	ctx.drawImage(image, 0, 0);
};

let ImageDataObj;

var server = http.createServer(app);

server.listen(process.env.PORT || 8000);

var io = socketIO(server);

let broadcaster = null
io.sockets.on('connection', function(socket) {
	const readable = new stream.Readable({
		// The read logic is omitted since the data is pushed to the socket
		// outside of the script's control. However, the read() function 
		// must be defined.
		read(){}
	  });


	  const i420readable = new stream.Readable({
		  objectMode:true,
		// The read logic is omitted since the data is pushed to the socket
		// outside of the script's control. However, the read() function 
		// must be defined.
		read(){}
	  });
	// Convenience function to log server messages on the client.
	// Arguments is an array like object which contains all the arguments of log(). 
	// To push all the arguments of log() in array, we have to use apply().
	function log() {
	  var array = ['Message from server:'];
	  array.push.apply(array, arguments);
	  socket.emit('log', array);
	}

	socket.on('watcher', () =>{
		broadcaster = socket.id;
	});



    //Defining Socket Connections
    socket.on('message', function(message, room) {
	  log('Client said: ', message);
	  // for a real app, would be room-only (not broadcast)
	  socket.in(room).emit('message', message, room);
	});

  
	socket.on('create or join', function(room) {
	  log('Received request to create or join room ' + room);
  
	  var clientsInRoom = io.sockets.adapter.rooms[room];
	  var numClients = clientsInRoom ? Object.keys(clientsInRoom).length : 0;
	  log('Room ' + room + ' now has ' + numClients + ' client(s)');
  
	  if (numClients === 0) {
		socket.join(room);
		log('Client ID ' + socket.id + ' created room ' + room);
		socket.emit('created', room, socket.id);
  
	  } else if (numClients === 1) {
		log('Client ID ' + socket.id + ' joined room ' + room);
		io.sockets.in(room).emit('join', room);
		socket.join(room);
		socket.emit('joined', room, socket.id);
		io.sockets.in(room).emit('ready');
	  } else { // max two clients
		socket.emit('full', room);
	  }
	});
  
	socket.on('ipaddr', function() {
	  var ifaces = os.networkInterfaces();
	  for (var dev in ifaces) {
		ifaces[dev].forEach(function(details) {
		  if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
			socket.emit('ipaddr', details.address);
		  }
		});
	  }
	});

	socket.on('libyuv', function (imageData, room) {
		// log("Data received on server")
		// readable.push( imageData );

		image.src = imageData
		ImageDataObj = Object.assign({}, ctx.getImageData(0,0, image.width, image.height))
		if (broadcaster != null){
			try {
				i420readable.push(ImageDataObj)
			} catch (error) {
				log(error)				
			}
		}

	});

	socket.on('rgba', function (imageData, room) {

		if (broadcaster != null){
			socket.to(broadcaster).emit('rgba_broadcast', imageData);
		}

	});
  
	socket.on('bye', function(){
	  console.log('received bye');
	});
  

	readable.on('data', (chunk) => {
		image.src = chunk
		const pixels8BitsRGBA = context.getImageData(0, 0, width, height).data
		const UnpackedRGBAFrame = {
			width,
			height,
			data: pixels8BitsRGBA
		  };
		const i420Frame = {
			width,
			height,
			data: new Uint8ClampedArray(1.5 * width * height)
		  };

		rgbaToI420(UnpackedRGBAFrame, i420Frame);
		// log(i420Frame)
		i420readable.push(i420Frame);
	});

	i420readable.on('data', (chunk) => {
		// log(chunk)
		// const i420FrameConverted = chunk
		// const rgbaFrame = {
		// 	width,
		// 	height,
		// 	data: new Uint8ClampedArray(4 * width * height)
		//   };
		// i420ToRgba(i420FrameConverted, rgbaFrame);
		
		// // const pixCount = (rgbaFrame.width * rgbaFrame.height *4)
		// // const receivedFrame = new Uint8ClampedArray(pixCount);
		// // for( var i = 0; i < pixCount;i+=4){
		// // 	receivedFrame[i+0]=rgbaFrame.data[i+3]
		// // 	receivedFrame[i+1]=rgbaFrame.data[i+0]
		// // 	receivedFrame[i+2]=rgbaFrame.data[i+1]
		// // 	receivedFrame[i+3]=rgbaFrame.data[i+2]
		// // }
		// const yuvImg =  createImageData(rgbaFrame.data, rgbaFrame.width, rgbaFrame.height) 
		// var yuv_canvas = createCanvas(width, height);
		// var yuv_context = yuv_canvas.getContext('2d');
		// yuv_context.putImageData(yuvImg, 0,0)

		// socket.emit('broadcaster', yuv_canvas.toDataURL());



		// ##############################################
	
		if (broadcaster != null){
			socket.to(broadcaster).emit('rgba_broadcast',chunk.data );

		}
	});
  });


  