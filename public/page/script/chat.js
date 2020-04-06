var chatResp = 0;

$('chat-messages-outer').scrollTop = $('chat-messages-outer').scrollHeight;


var width = $("content").offsetWidth;
if(width < 800){
  chatResp = 1
  $("chat-left").style.width = "100%";
  $("chat-right").style.width = "100%";
  $("chat-right").style.display = "none"
}
else{
  chatResp = 0
  $("chat-left").style.width = "40%";
  $("chat-right").style.width = "60%";
  $("chat-right").style.display = "block"
}

socket.emit("chat list")
socket.on("chat list", (msg) => {
  var toWrite = "";
  
  for(var i in msg)
    toWrite += ' \
    <div class="message-box"> \
      <div> \
        <h4>'+msg[i].title+'</h4> \
        <div class="mb-date">'+msg[i].date+'</div> \
      </div> \
      <div class="mb-bottom"> \
        ' + msg[i].msg + ' \
      </div> \
    </div> \
    ';

  $('chat-list').innerHTML = toWrite

  console.log(msg)
});

function addChat(){
  socket.emit("chat add", $('chat-add-input').value )
}

/*
          <div class="message-box">
            <div>
              <h4>The Chat Test</h4>
              <div class="mb-date">Yesterday</div>
            </div>
            <div class="mb-bottom">
              (Joe) Hello this is a text message test that has been sent to this chat app
            </div>
          </div>

*/
