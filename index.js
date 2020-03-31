var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var database = require('./db.js');

var db1 = new database('database.json')
var dbv = db1.data;
var staticData = new database('static.json')
var stat = staticData.data

var io = require('socket.io').listen(server);

var clients = [];

server.listen(process.env.PORT);


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});

io.on('connection', function (socket) {

  var username = false

  console.log("new connection: " + socket.id)
  socket.emit('connected')

  clients[socket.id] = {
    username: "",
  }
  var client = clients[socket.id];

  socket.on('disconnect', () => {
    clients.splice(socket.id, 1);
    console.log("client disconnected " + socket.id)
  })


  ///////////
  // LOGIN //
  ///////////

  socket.on('login', (request) => {
    if (request.type == 1) {
      var error = true;
      for (var i in dbv.users) {
        if (dbv.users[i].username == request.username) {
          if (dbv.users[i].password == request.password) {
            console.log(request.username + " has logged in of " + socket.id)
            error = false;

            socket.emit('login', {
              action: 1,
              message: "",
              cookie: dbv.users[i].cookie,
            })


            client.username = dbv.users[i].username;
            username = clients[socket.id].username
          }
        }
      }
      if (error) {
        socket.emit('login', {
          action: 0,
          message: "Incorect username or password",
          cookie: null,
        })
      }
    }
    else if (request.type == 0) {
      var uniq = true;
      for (var i in dbv.users) {
        if (dbv.users[i].username == request.username) {
          uniq = false;
          break;
        }
      }
      if (uniq) {
        if(request.username.length >= 5){
          if(scorePassword(request.password) > 30){
            dbv.users.push({
              username: request.username,
              password: request.password,
              cookie: Math.random(),
            })

            db1.write();

            console.log(request.username + " Registered")
            socket.emit('login', {
              action: 0,
              message: "Registerd; you can now login",
              cookie: null,
            })
          }
          else{
            socket.emit('login', {
              action: 0,
              message: "Passwrord is too weak",
              cookie: null,
            })
          }
        }
        else{
          socket.emit('login', {
            action: 0,
            message: "Username must be at least 5 letters",
            cookie: null,
          })
        }
        
      }
      else {
        socket.emit('login', {
          action: 0,
          message: "Username already exists",
          cookie: null,
        })
      }
    }
    else if (request.type == 2) {
      for (var i in dbv.users) {
        if (dbv.users[i].cookie == request.password) {
          console.log(request.username + " has logged in of " + socket.id)
          error = false;

          socket.emit('login', {
            action: 1,
            message: "",
            cookie: dbv.users[i].cookie,
          })


          client.username = dbv.users[i].username;
          username = clients[socket.id].username
          break;
        }
      }
    }

  })

  /////////////////////
  // CLIENT REQUESTS //
  /////////////////////

  socket.on('add client', (name) => {
    if(username){
      for(var i in dbv.clients){
        if(dbv.clients[i].name == name){
          message("Client allready exists", socket)
          return;
        }
        if(name.length < 5){
          message("Client name is less than 5 letters", socket)
          return
        }
      }
      console.log("New client added "+name);
      dbv.clients.push({
        name: name,
        owner: username,
        users:[
          {
            name: username,
            admin: true,
            chart: [],
          }
        ]
      });
      db1.write();
      sendClientData(socket, username);
    }
    else console.log("user tried to add client when not logged in")
  })

  socket.on('client data', (msg)=>{
    console.log("Got client data request")
    
    sendClientData(socket, username)
  })

  socket.on('add time', (msg)=>{
    console.log("recived time request");
    if(username){
      for(var i in dbv.clients){
        if(dbv.clients[i].name == msg.client)for(var b in dbv.clients[i].users){
          if(dbv.clients[i].users[b].name == username){
            dbv.clients[i].users[b].chart.push(msg)
            console.log(dbv.clients[i].users[b].chart)
            db1.write();
            message("time added", socket)
            break;
          }
        }
      }
    }
  })

  socket.on('leave client', (client)=>{
    console.log(username + " Left " + client)

    for(var i in dbv.clients){
      var name1 = dbv.clients[i].name
      var name2 = client
      if(name1 == name2){
        for(var b in dbv.clients[i].users){
          name1 = dbv.clients[i].users[b].name
          name2 = username
          if(name1 == name2){
            dbv.clients[i].users.splice(b, 1)
            db1.write()
            sendClientData(socket,username)
          }
          //break;
        }
        break;
      }
    }
  })


  // Remove Share 

  socket.on('remove share', (msg)=>{
    for(var i in dbv.clients){
      if(dbv.clients[i].name == msg.client){
        for(var b in dbv.clients[i].users){
          if(dbv.clients[i].users[b].name == username){
            if(dbv.clients[i].users[b].admin){              
              for(var b in dbv.clients[i].users){
                if(dbv.clients[i].users[b].name == msg.name){
                  dbv.clients[i].users.splice(b, 1)
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                  console.log("Client share removed")
                }
              }
            }
            else message("You are not admin", socket)
          }
        }
      }
    }
  })



  // Set Admin 

  socket.on('set admin', (msg)=>{
    for(var i in dbv.clients){
      if(dbv.clients[i].name == msg.client){
        for(var b in dbv.clients[i].users){
          if(dbv.clients[i].users[b].name == username){
            if(dbv.clients[i].users[b].admin){
              for(var b in dbv.clients[i].users){
                if(dbv.clients[i].users[b].name == msg.name){
                  dbv.clients[i].users[b].admin = msg.admin
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                }
              }
            }
            else message("You are not admin", socket)
          }
        }
      }
    }
  })

  // Add share

  socket.on('add share', (msg)=>{
    for(var i in dbv.clients){
      if(dbv.clients[i].name == msg.client){
        for(var b in dbv.clients[i].users){
          if(dbv.clients[i].users[b].name == username){
            if(dbv.clients[i].users[b].admin){
              for(var c in dbv.users){
                if(dbv.users[c].username == msg.username){
                    dbv.clients[i].users[dbv.clients[i].users.length] = {
                    name: msg.username,
                    admin: false,
                    chart: [],
                    self: false,
                    client: dbv.clients[i].name
                  }
                  console.log("written")
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                  break
                }
                else message("The user does not exist", socket)
              }
            }
          }
        }
      }
    }
  })


  // stop watch

  socket.on('stopwatch', (msg)=>{
    for(var i in dbv.users){
      if(dbv.users[i].username == username){
        dbv.users[i].stopwatch = {
            running: msg.running,
            startTime: msg.startTime,
            buffer: msg.timeBuffer
        }
      }
    }
    db1.write();
  })

  socket.on('stopwatch request', ()=>{
    for(var i in dbv.users){
      if(dbv.users[i].username == username){
        socket.emit("stopwatch", dbv.users[i].stopwatch)
      }
    }
  })

})






function sendClientData(socket, username){
  var toSend = [];
    var t = 0;
    for(var i in dbv.clients){
      var admin = false
      var name
      for(var b in dbv.clients[i].users){
        name = dbv.clients[i].users[b].name
        if(name == username){
          toSend[t] = dbv.clients[i].users[b]
          toSend[t].client = dbv.clients[i].name;
          toSend[t].self = true;
          t++;
          if(dbv.clients[i].users[b].admin)
            admin = true;

          break
        }
      }
      console.log(admin)
      
      if(admin){
          for(var b in dbv.clients[i].users){
          name2 = dbv.clients[i].users[b].name
          if(name2 != name){
            toSend[t] = dbv.clients[i].users[b]
            toSend[t].client = dbv.clients[i].name;
            toSend[t].self = false;
            t++;
          }
        }
      }
    }
    toSend[toSend.length] = username

    socket.emit('client data', toSend)
}

if(dbv.config.logoutAll == true)logoutAll();

if(dbv.config.clearData == 2){
  dbv.config.clearData = false;
  dbv.users = [];
  dbv.clients = [];
  db1.write();
}

function logoutAll() {
  for (var i in dbv.users) {
    dbv.users[i].cookie = Math.random();
  }
}


function message(msg, socket){
  socket.emit("message", msg)
}


function scorePassword(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
}

console.log("Server Started")

console.log(stat.tabs.dashboard);
