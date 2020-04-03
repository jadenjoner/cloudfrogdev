


socket.on('connected', ()=>{
  page('Home');
})

socket.on('message', (msg)=>{
  message(msg);
})

socket.on('loginPopup', ()=> {
  openPopup('login-popup', 0.7);
})

function message(msg){
  var timeout1;
  var timeout2;
  
  $('message').innerHTML = msg
  $('message').style.display = "block"
  $('message').style.opacity = "1"

  clearTimeout(timeout1)
  clearTimeout(timeout2)

  timeout1 = setTimeout(()=>{
    $('message').style.opacity = "0"

    timeout2 = setTimeout(()=>{
      $('message').style.display = "none"
    }, 1000)
  }, 5000)
}
