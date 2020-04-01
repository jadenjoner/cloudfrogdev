function openPopup(id, opacity=1, t=true){
  var popup = $(id);
  popup.style.top = "calc(50vh - " + popup.offsetHeight/2 + "px)";
  popup.style.left = "calc(50vw - " + popup.offsetWidth/2 + "px)";
  $('popup-bg').style.opacity = opacity;
  

  if(screen.width <= 500){
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.borderRadius = 0;
    popup.style.top = 0;
    popup.style.left = 0;
    popup.style.overflow = "auto"
  }

  document.getElementsByTagName('html').overflow = "hidden"
  popup.style.display = "block";
  $('popup-bg').style.display = "block"

  if(t==true)openPopup(id,opacity,false)
}

function closePopup(id){
  var popup = $(id)
  document.getElementsByTagName('html').overflow = "auto"
  popup.style.display = "none";
  $('popup-bg').style.display = "none"
  popup.style.overflow = "hidden"
}





function login(type=1){
  if(location.protocol != 'https:')
		message("Unsecure connection! use https")

  if(type == 2 && location.protocol == 'https:'){
    socket.emit("login", {
      username: "",
      password: getCookie("login"),
      type: type,
    })
  }
  else {
    socket.emit("login", {
      username: $('input-login').value,
      password: $('input-password').value,
      type: type,
    })
  }
}

socket.on('login', (msg) => {
  if(msg.action){
    closePopup("login-popup");
    setCookie("login", msg.cookie);
  }
  else $('input-password').value = "";
  $('error-message').innerHTML = msg.message;
})


function clearError(){
  $('error-message').innerHTML = "";
}
