var chatResp = 0;
var chatData = false;
var selectedChat = false; // Selected chat name when share popup

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
  chatData = msg;
  console.log(msg)
  var toWrite = "";

  for(var i in msg){
    var shareText = msg[i].admin 
    if(msg[i].admin){
      shareText = '<div class="mb-share" onclick="chatShare(\''+msg[i].title+'\')"><i>share</i></div>'
      shareText += '<div class="mb-share red"><i>delete</i></div>'
    }
    else{
      shareText = '<div class="mb-share red"><i>exit_to_app</i></div>'
    }
    toWrite += ' \
    <div class="message-box"> \
      <div> \
        <h4>'+msg[i].title+'</h4> \
        '+shareText+'\
        <div class="mb-date">'+msg[i].date+'</div> \
      </div> \
      <div class="mb-bottom"> \
        ' + msg[i].msg + ' \
      </div> \
    </div> \
    ';
  }

  $('chat-list').innerHTML = toWrite
  
  refreshShare();

});

function addChat(){
  socket.emit("chat add", $('chat-add-input').value )
  $('chat-add-input').value = "";
}

function chatShare(name){
  selectedChat = name

  var toWrite = "";


  for(var i in chatData){
    if(chatData[i].title == name){
      for(var b in chatData[i].users){
        var deleteButton = ""; 
        if(chatData[i].owner != chatData[i].users[b])deleteButton = '<div class="chat-popup-remove" onclick="chatRemove(\''+i+'\', \''+b+'\')">X</div>' 
        toWrite += '\
        <div class="chat-popup-item">\
          <div class="chat-popup-name">'+chatData[i].users[b]+'</div>\
           '+deleteButton+'\
        </div>\
        '
      }
    }
  }
  $('chat-popup-outer').innerHTML = toWrite;


  openPopup("chat-popup", 0.3)
}

function refreshShare(){
  if(selectedChat)chatShare(selectedChat) 
}


function chatRemove(i, b){
  socket.emit('chat share remove', {
    chat: chatData[i].title,
    user: chatData[i].users[b]
  })
}

function chatShareAdd(){
  socket.emit('chat share add', {
    chat: selectedChat,
    user: $('chat-client-input').value 
  })
}
