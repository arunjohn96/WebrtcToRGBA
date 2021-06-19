turnConfig = {
    iceServers: [
    {   
      urls: [ 
      "stun:stun.l.google.com:19302",        
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302" ]
    }, 
    {   
      username: "test",   
      credential: "test123",   
      urls: [       
        "turn:18.209.194.210:3478"   
       ]
     }
   ]
}