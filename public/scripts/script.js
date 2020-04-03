var widthWas;

setInterval(() => {
  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  //if(width != widthWas) window.scrollTo(0,1);
  widthWas = width

  if(width < 600){
    $('search-form').style.display = "none";
    $('box').style.width = "100%";
    $('box').style.borderRadius = "0";
  }
  else{
    $('search-form').style.display = "";
    $('box').style.width = "70%";
    $('box').style.borderRadius = "17px";
  }

  if(width < 1000){
    $('box').style.width = "100%";
    $('box').style.borderRadius = "0";
  }
  else{
    $('box').style.width = "70%";
    $('box').style.borderRadius = "17px";
  }


  var scroll = (window.pageYOffset || document.scrollTop)  - (document.clientTop || 0);
  
  topper = document.getElementsByClassName('topper')
  if(scroll < 0){
    for(var i in topper){
      topper[i].style.position = "fixed"
    }
  }
  else{
    for(var i = 0; i < 2; i++){
      topper[i].style.position = ""
    }
  }
}, 1000/60)

function toggleNotify(){
  if($('notify-box').style.display == "none"){
    $('notify-box').style.display = "block"
    $('account-box').style.display = "none"
    $('notify-img').style.background = "#ddd"
    $('account-img').style.background = ""
  }
  else{
    $('notify-box').style.display = "none"
    $('notify-img').style.background = "#ffffff00"
  }
}


function toggleAccount(){
  if($('account-box').style.display == "none"){
    $('account-box').style.display = "block"
    $('notify-box').style.display = "none"
    $('account-img').style.background = "#65b"
    $('notify-img').style.background = "#ffffff00"
    
    socket.emit("account data") // Ask for accound data from server
  }
  else{
    $('account-box').style.display = "none"
    $('account-img').style.background = ""
  }
}

socket.on("account data", (msg) => {
  console.log("Got accout data: " + msg.username);
  document.getElementById("account-username").innerHTML = "Hello, " + msg.username;

})


document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, false);

var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  var now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);









function logout(){
  setCookie("login", "")
  window.location.reload(false);
}
