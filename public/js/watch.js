//Initializing socket.io
var socket = io({transports: ['websocket']}).connect();
const rgbaUint8 = new Uint8ClampedArray()
let someImageData;
socket.emit("watcher");

socket.on('broadcast', function (data) {
    console.log("Data Received:::");
    depict(data);
  });

  socket.on('rgba_broadcast', function (data) {
    console.log("RGBA Received:::");
    rgbaPic(Object.values(data))
    
  });

  const getContext = () => document.getElementById('BroadcastCanvas').getContext('2d');
  const getCanvas = () => document.getElementById('BroadcastCanvas');

  
  // Here, I created a function to draw image.
  const depict = image => {
    const ctx = getContext();
    var img = new Image;
    img.onload = function(){
      ctx.drawImage(img,0,0); // Or at whatever offset you like
    };
    img.src = image;
    return
  };

  const rgbaPic = imageData => {
    const ctx = getContext();
    someImageData = ctx.createImageData(480, 360);
    someImageData.data = Object.assign(someImageData.data, imageData)
    ctx.putImageData(someImageData, 0,0)
    return
  };

  