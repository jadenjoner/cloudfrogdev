// Stop watch

var stopwatchRunning = false;
var timing;
var startTime = 0;
var timeBuffer = 0;
var minutes = 0;
var minutesWas = 0;
function stopwatchStart(){
  var stopwatch = document.getElementById('stopwatch-time'); 
  var stopwatchStart = document.getElementById('stopwatch-start');

  if(stopwatchRunning){
    stopwatchStart.innerHTML = "Start"
    stopwatchStart.style.background = "green";
    timeBuffer = Date.now();
    clearTimeout(timing);
    $('title')[0].innerHTML = "Cloud Frog Dev"

    socket.emit('stopwatch', {
      running: false,
      startTime: startTime,
      timeBuffer: timeBuffer
    })
  }
  else{
    stopwatchStart.innerHTML = "Stop"
    stopwatchStart.style.background = "red";

    if(timeBuffer == 0)startTime = Date.now();
    else startTime += Date.now()-timeBuffer;
    timing = setInterval(() => {
      minutes = Math.floor((Date.now()-startTime) / 60000)
      stopwatch.innerHTML = minutes + ":" + Math.floor((Date.now()-startTime) % 60000 / 1000);
      $('title')[0].innerHTML = stopwatch.innerHTML
  
      if(minutesWas != minutes)$('stopwatch-minutes').value = minutes
      minutesWas = minutes

      
    },1000);

    socket.emit('stopwatch', {
      running: true,
      startTime: startTime,
      timeBuffer: timeBuffer
    })
  }
  stopwatchRunning = !stopwatchRunning;
}

function stopwatchReset(){
  var stopwatch = document.getElementById('stopwatch-time'); 
  var stopwatchStart = document.getElementById('stopwatch-start');

  var stopwatch = document.getElementById('stopwatch-time'); 
  stopwatch.innerHTML = "0:0";
  stopwatchStart.innerHTML = "Start"
  stopwatchStart.style.background = "green";
  timeBuffer = 0;
  clearTimeout(timing);
  stopwatchRunning = false;
  $('title')[0].innerHTML = "Cloud Frog Dev"

  startTime = 0;

  socket.emit('stopwatch', {
    running: false,
    startTime: startTime,
    timeBuffer: timeBuffer
  })
}

socket.emit("stopwatch request")

socket.on("stopwatch", (msg)=>{
  stopwatchRunning = msg.running
  startTime = msg.startTime
  timeBuffer = msg.buffer

  if(msg.running){
    minutes = Math.floor((Date.now()-startTime) / 60000)
    $('stopwatch-time').innerHTML = minutes + ":" + Math.floor((Date.now()-startTime) % 60000 / 1000);
    $('title')[0].innerHTML = $('stopwatch-time').innerHTML

    $('stopwatch-minutes').value = minutes
    minutesWas = minutes

    stopwatchRunning = true
    stopwatchStart();
    stopwatchStart();
  }
  else{
    var startTimeB = startTime + (Date.now() - timeBuffer)
    minutes = Math.floor((Date.now()-startTimeB) / 60000)
    $('stopwatch-time').innerHTML = minutes + ":" + Math.floor((Date.now()-startTimeB) % 60000 / 1000);
    $('stopwatch-minutes').value = minutes
  }
})


function addTime() {
  dateObj = new Date();
  var date = dateObj.getUTCDate() + "/" + (dateObj.getUTCMonth()+1) + "/" + dateObj.getUTCFullYear();
  socket.emit('add time', {
    client: $('stopwatch-client').options[$('stopwatch-client').selectedIndex].value,
    type: $('stopwatch-type').value,
    notes: $('stopwatch-notes').value,
    date: date,
    minutes: $('stopwatch-minutes').value 
  })
}

// Chart

function chartChange(num){
  var client = selectValue('chart-client');
  if(num){
    var admin = false;
    var i;

    var toWrite = '<tr> \
      <th>Date</th> \
      <th>Minutes</th> \
      <th>Type</th>\
      <th>Notes</th>\
    </tr>'

    var foundTime = false
    
    for(i in clientData){
      if(clientData[i].client == selectValue('chart-client')){
        if(clientData[i].admin){
          admin = true;
        }
        break;
      }
    }

    if(admin){
      $('chart-user').selectedIndex = 0;
      $('chart-user').style.display = "inline-block"

      var options = '<option value="" disabled="disabled" selected="selected">User</option>'

      for(var b in clientData){
        if(clientData[b].client == client)options += '<option value="'+clientData[b].name+'">'+clientData[b].name+'</option>'
        console.log(clientData[b].name)
      }

      $('chart-user').innerHTML = options
    }
    else {
      $('chart-user').style.display = "none"
    
      for(var b in clientData[i].chart){
        toWrite += ' \
        <tr>\
          <td>'+clientData[i].chart[b].date+'</td>\
          <td>'+clientData[i].chart[b].minutes+'</td>\
          <td>'+clientData[i].chart[b].type+'</td>\
          <td>'+clientData[i].chart[b].notes+'</td>\
        <tr>'
      }

      if(clientData[i].chart.length)$('chart-table').innerHTML = toWrite; 
      else $('chart-table').innerHTML = ""; 
    }
  }
  else{
    var i;
    var toWrite = '<tr> \
      <th>Date</th> \
      <th>Minutes</th> \
      <th>Type</th>\
      <th>Notes</th>\
    </tr>'
    
    for(i in clientData){
      if(clientData[i].client == selectValue('chart-client') && clientData[i].name == selectValue('chart-user')){
        break;
      }
    }

    for(var b in clientData[i].chart){
        toWrite += ' \
        <tr>\
          <td>'+clientData[i].chart[b].date+'</td>\
          <td>'+clientData[i].chart[b].minutes+'</td>\
          <td>'+clientData[i].chart[b].type+'</td>\
          <td>'+clientData[i].chart[b].notes+'</td>\
        <tr>'
      }

      if(clientData[i].chart.length)$('chart-table').innerHTML = toWrite; 
      else $('chart-table').innerHTML = ""; 
  }
}

// Clients

var clientData;

function addClient() {
  socket.emit('add client', $('client-input-name').value)
  $('client-input-name').value = ""
}

socket.on('client data', (msg) => {
  console.log(msg)
  clientData = msg;

  var toWrite = ''
  var options = '<option value="" disabled="disabled" selected="selected">Client</option>'
  
  for(var i in msg){
    if(msg[i].self){
    toWrite += '<section class="client-box">'
    toWrite += '<div class="client-name">'+msg[i].client+'</div>'
    if(msg[i].admin == true){
      toWrite += '<div class="client-edit">edit</div>'
      toWrite += '<div class="client-share" onclick="sharePopup(\''+msg[i].client+'\',true)">share</div>'
    }
    else{
      toWrite += '<div class="client-share" style="background:#d33" onclick="sharePopup(\''+msg[i].client+'\',false)">Leave</div>'
    }
    toWrite += '</section>'

    options += '<option value="'+msg[i].client+'">'+msg[i].client+'</option>'
    }
  }

  $('client-outer').innerHTML = toWrite
  $('chart-client').innerHTML = options
  $('stopwatch-client').innerHTML = options
})

var globalClient = ""

function sharePopup(client, admin){
  globalClient = client
  if(admin){
    openPopup("share-popup", 0.3)
    
    var toWrite = "";

    for(var i in clientData){
      if(clientData[i].client == client){
        var style = ""
        if(clientData[i].admin){
          style = "background: #1e3e94ff"
        }
        toWrite += '\
        <div class="share-popup-item">\
          <div class="share-popup-name">'+clientData[i].name+'</div>\
          <div class="share-popup-remove" onclick="shareRemove(\''+i+'\')">X</div> \
          <div class="share-popup-admin" style="'+style+'" onclick="shareAdmin(\''+i+'\')">admin</div> \
        </div>\
        '
      }
    }
    $('share-popup-outer').innerHTML = toWrite;
  }
  else{
    socket.emit("leave client", client)
  }
}
socket.on('share popup', (msg)=>{
  sharePopup(msg, true)
})

function shareRemove(i){
  socket.emit("remove share", {
    client: clientData[i].client,
    name: clientData[i].name,
  })
}
function shareAdmin(i){
  socket.emit("set admin", {
    client: clientData[i].client,
    name: clientData[i].name,
    admin: !clientData[i].admin,
  })
}

function submitShare(){
  var username = $('share-client-input').value
  socket.emit("add share", {
    username: username,
    client: globalClient,
  })
}

/*
<div class="share-popup-item">
    <div class="share-popup-name">John Doe</div>
    <div class="share-popup-remove" onclick="sharePopup(0)">X</div> 
    <div class="share-popup-admin" onclick="sharePopup(1)">admin</div> 
  </div>
*/