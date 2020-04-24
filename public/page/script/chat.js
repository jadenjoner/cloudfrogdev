var chatResp = 0;
var chatData = false;
var selectedChat = false; // Selected chat name when share popup
var chat = false; // Chat selected when viewing messages

$('chat-messages-outer').scrollTop = $('chat-messages-outer').scrollHeight;


var width = $("content").offsetWidth;

socket.emit("chat list")
socket.on("chat list", (msg) => {
  chatData = msg;
  console.log(msg)
  var toWrite = "";

  for(var i in msg){
    var shareText = msg[i].admin
    if(msg[i].admin){
      shareText = '<div class="mb-share" onclick="chatShare(\''+msg[i].title+'\')"><i>share</i></div>'
      shareText += '<div class="mb-share red" onclick="chatDel(\''+msg[i].title+'\')"><i>delete</i></div>'
    }
    else{
      shareText = '<div class="mb-share red" onclick="chatExit(\''+msg[i].title+'\')"><i>exit_to_app</i></div>'
    }
    var notify = ''
    if(msg[i].isNew){
      notify = '<div class="mb-notify '+msg[i].title+'"></div>'
    }
    toWrite += ' \
    <div class="message-box" onclick="selectChat(\''+msg[i].title+'\')"> \
      <div> \
        <h4>'+msg[i].title+'</h4> \
        '+shareText+'\
        <div class="mb-date">'+msg[i].date+'</div>' + notify +' \
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

function chatBack(){
  $('chat-right').style.display = "none"
  $('chat-left').style.display = "block"
}

function selectChat(name){
  $('chat-h3').innerHTML = name
  if($('mb-notify '+name)[0] != undefined)
    $('mb-notify '+name)[0].style.display = "none"
  chat = name
  if(width<1000){
    $('chat-right').style.display = "block"
    $('chat-left').style.display = "none"
  }
  socket.emit("get messages", name);
}

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

function chatExit(name){
  socket.emit("chat exit", name)
}

function chatDel(name){
  socket.emit("chat del", name)
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


socket.on('messages', (msgB) => { // When messages are recived
  if(msgB.b == chat){
    msg = msgB.a

    var toWrite = ""

    for(var i in msg){
      var isSelf = '';
      if(msg[i].user == username){
        isSelf = ' message-self'
        toWrite += '<div class="message-name right"><div>'+msg[i].date+'</div>'+msg[i].user+'</div>'
      }
      else toWrite += '<div class="message-name left">'+msg[i].user+'<div>'+msg[i].date+'</div></div>'
      toWrite += '<div class="message'+isSelf+'">'+textConvert(msg[i].message)+'</div>'

    }
    console.log(msg)

    $('chat-messages').innerHTML = toWrite

    setTimeout(()=>{
      $('chat-messages-outer').scrollTop = $('chat-messages-outer').scrollHeight;
    }, 40)

  }
})


$('message-input').addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    submitMessage();
  }
});

function submitMessage(){
  console.log("submit message")
  socket.emit("add message", {
    message: $('message-input').value,
    chat: chat,
  });
  $('message-input').value = '';
}
