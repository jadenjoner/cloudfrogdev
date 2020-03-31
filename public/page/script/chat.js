var chatResp = 0;

console.log("yop")

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
