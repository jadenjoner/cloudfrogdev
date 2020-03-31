var loading = false;

function page(page="unknown"){

  globalPage = page;
  $('h1').innerHTML = page;
  $('content').innerHTML = "";

  loading = true;
  setTimeout(()=>{
    if(loading)$('load').style.display = "block";
  },100);


  loading = false
  $('load').style.display = "none";

  switch(globalPage){
    case "Home": 
      break;
    case "Tracking": 
      $("content").innerHTML = readTextFile('page/tracking.html');
      load_js("page/script/tracking.js");
      socket.emit('client data')
      break;
    case "Chat": 
      $("content").innerHTML = readTextFile('page/chat.html');
      load_js("page/script/chat.js");
      break;
  }

  $("tab-button0").className += " active";
}

function tab(number) {
  console.log("tab function")
  number = Number(number) + 1
  var tabcontent = document.getElementsByClassName("tab-content");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  var tablinks = document.getElementsByClassName("tablink");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementsByClassName("tab-content"+number)[0].style.display = "block";
  $("tab-button"+(number-1)).className += " active";
} 

function load_js(url)
   {
      var head= document.getElementsByTagName('head')[0];
      $('tab-script').outerHTML = ""
      var script= document.createElement('script');
      script.src= url;
      script.id="tab-script"
      head.appendChild(script);
   }