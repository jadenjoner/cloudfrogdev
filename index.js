// Libraries
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var database = require('./db.js');

// Initalize
var db1 = new database('database.json') // Create Database
var dbv = db1.data;

server.listen(process.env.PORT);

var clients = []; // Create list of connected clients

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});


// Console log colors

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Blink = "\x1b[5m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgWhite = "\x1b[37m"
FgCyan = "\x1b[36m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgWhite = "\x1b[47m"

console.log(BgGreen + " Server Started " + Reset)

// New Socket Connection
io.on('connection', function(socket) {

  var username = false

  console.log(FgGreen + "new connection: " + FgCyan + socket.id + Reset)
  //socket.emit('connected')

  clients[socket.id] = {
    username: false,
    socket: socket,
  }
  var client = clients[socket.id];

  socket.on('disconnect', () => {
    clients.splice(socket.id, 1);
    console.log(FgYellow + "client disconnect: " + FgCyan + socket.id + Reset)
  })


  ///////////
  // LOGIN //
  ///////////

  socket.on('login', (request) => {
    if (request.type == 1) { // if user tried to log in with popup
      var error = true;
      for (var i in dbv.users) {
        if (dbv.users[i].username == request.username) {
          if (dbv.users[i].password == request.password) {
            console.log(FgGreen + "new login: " + FgCyan + request.username + " : " + socket.id + Reset)
            error = false;

            socket.emit('login', {
              action: 1,
              message: "",
              cookie: dbv.users[i].cookie,
              username: dbv.users[i].username,
            })


            client.username = dbv.users[i].username;
            username = client.username
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
    } else if (request.type == 0) { // if user tried to register with popup
      var uniq = true;
      for (var i in dbv.users) {
        if (dbv.users[i].username == request.username) {
          uniq = false;
          break;
        }
      }
      if (uniq) {
        if (request.username.length >= 5) {
          if (scorePassword(request.password) > 30) {
            dbv.users.push({
              username: request.username,
              password: request.password,
              cookie: Math.random(),
            })

            db1.write();

            console.log(FgGreen + "new register: " + FgCyan + request.username + " : " + socket.id + Reset)
            socket.emit('login', {
              action: 0,
              message: "Registerd; you can now login",
              cookie: null,
            })
          } else {
            socket.emit('login', {
              action: 0,
              message: "Passwrord is too weak",
              cookie: null,
            })
          }
        } else {
          socket.emit('login', {
            action: 0,
            message: "Username must be at least 5 letters",
            cookie: null,
          })
        }

      } else {
        socket.emit('login', {
          action: 0,
          message: "Username already exists",
          cookie: null,
        })
      }
    } else if (request.type == 2) { // if user auto cookie login
      for (var i in dbv.users) {
        if (dbv.users[i].cookie == request.password) {
          error = false;

          socket.emit('login', {
            action: 1,
            message: "",
            cookie: dbv.users[i].cookie,
            username: dbv.users[i].username
          })


          client.username = dbv.users[i].username;
          username = client.username

          console.log(FgGreen + "new login (cookie): " + FgCyan + username + " : " + socket.id + Reset)
          break;
        }
      }
    }

  })

  /////////////////////
  // CLIENT REQUESTS //
  /////////////////////

  socket.on('add client', (name) => {
    if (username) {
      for (var i in dbv.clients) {
        if (dbv.clients[i].name == name) {
          message("Client allready exists", socket)
          return;
        }
        if (name.length < 5) {
          message("Client name is less than 5 letters", socket)
          return
        }
      }
      console.log(FgGreen + "new client: " + FgCyan + name + " : " + username)
      dbv.clients.push({
        name: name,
        owner: username,
        users: [{
          name: username,
          admin: true,
          chart: [],
        }]
      });
      db1.write();
      sendClientData(socket, username);
    } else loginPopup(socket);
  })

  socket.on('client data', (msg) => {
    sendClientData(socket, username)
  })

  socket.on('add time', (msg) => {
    if (username) {
      for (var i in dbv.clients) {
        if (dbv.clients[i].name == msg.client)
          for (var b in dbv.clients[i].users) {
            if (dbv.clients[i].users[b].name == username) {
              dbv.clients[i].users[b].chart.push(msg)
              db1.write();
              message("time added", socket)
              break;
            }
          }
      }
    } else loginPopup(socket);
  })

  socket.on('leave client', (client) => {
    console.log(FgYellow + "user update: " + FgCyan + username + Reset + " left client " + FgCyan + client + Reset)

    for (var i in dbv.clients) {
      var name1 = dbv.clients[i].name
      var name2 = client
      if (name1 == name2) {
        for (var b in dbv.clients[i].users) {
          name1 = dbv.clients[i].users[b].name
          name2 = username
          if (name1 == name2) {
            dbv.clients[i].users.splice(b, 1)
            db1.write()
            sendClientData(socket, username)
          }
          //break;
        }
        break;
      }
    }
  })


  // Remove Share

  socket.on('remove share', (msg) => {
    for (var i in dbv.clients) {
      if (dbv.clients[i].name == msg.client) {
        for (var b in dbv.clients[i].users) {
          if (dbv.clients[i].users[b].name == username) {
            if (dbv.clients[i].users[b].admin) {
              for (var b in dbv.clients[i].users) {
                if (dbv.clients[i].users[b].name == msg.name) {
                  dbv.clients[i].users.splice(b, 1)
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                  console.log(FgYellow + "user update: " + FgCyan + username + Reset + " share removed of client " + FgCyan + msg.client + Reset)
                }
              }
            } else message("It seems that you are not admin", socket)
          }
        }
      }
    }
  })



  // Set Admin

  socket.on('set admin', (msg) => {
    for (var i in dbv.clients) {
      if (dbv.clients[i].name == msg.client) {
        for (var b in dbv.clients[i].users) {
          if (dbv.clients[i].users[b].name == username) {
            if (dbv.clients[i].users[b].admin) {
              for (var b in dbv.clients[i].users) {
                if (dbv.clients[i].users[b].name == msg.name) {
                  dbv.clients[i].users[b].admin = msg.admin
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                }
              }
            } else message("You are not admin", socket)
          }
        }
      }
    }
  })

  // Add client share

  socket.on('add share', (msg) => {
    for (var i in dbv.clients) {
      if (dbv.clients[i].name == msg.client) {
        for (var b in dbv.clients[i].users) {
          if (dbv.clients[i].users[b].name == username) {
            if (dbv.clients[i].users[b].admin) {
              for (var c in dbv.users) {
                if (dbv.users[c].username == msg.username) {
                  dbv.clients[i].users[dbv.clients[i].users.length] = {
                    name: msg.username,
                    admin: false,
                    chart: [],
                    self: false,
                    client: dbv.clients[i].name
                  }
                  db1.write();
                  sendClientData(socket, username)
                  socket.emit('share popup', dbv.clients[i].name)
                  break
                } else message("The user does not exist", socket)
              }
            }
          }
        }
      }
    }
  })


  // stop watch

  socket.on('stopwatch', (msg) => {
    for (var i in dbv.users) {
      if (dbv.users[i].username == username) {
        dbv.users[i].stopwatch = {
          running: msg.running,
          startTime: msg.startTime,
          buffer: msg.timeBuffer
        }
      }
    }
    db1.write();

    for (var b in clients) {
      if (clients[b].username == username && b != socket.id) {
        for (var i in dbv.users) {
          if (dbv.users[i].username == username) {
            clients[b].socket.emit("stopwatch", dbv.users[i].stopwatch)
          }
        }
      }
    }
  })

  socket.on('stopwatch request', () => {
    for (var i in dbv.users) {
      if (dbv.users[i].username == username) {
        socket.emit("stopwatch", dbv.users[i].stopwatch)
      }
    }
  })



  // Account Requests


  socket.on("account data", () => {
    if (username) {
      socket.emit("account data", {
        username: username
      })
    } else
      loginPopup(socket);
  })

  socket.on("chat list", () => {
    sendChatData(socket, username);
  })


  socket.on("chat add", (msg) => {
    if(username){
      for(var i in dbv.chat){
        if(dbv.chat[i].name == msg){
          message("Chat allready exists", socket)
          return;
        }
      }
      dbv.chat.push({
        name: msg,
        owner: username,
        users: [username],
        messages: [],
        time: new Date(),
        new: []
      })
      db1.write();
      sendChatData(socket, username);
    }else loginPopup(socket)
  });


  // Chat


  socket.on("chat share remove", (msg) => {
    for (var i in dbv.chat)
      if (dbv.chat[i].name == msg.chat && dbv.chat[i].owner == username)
        for (var b in dbv.chat[i].users)
          if (dbv.chat[i].users[b] == msg.user){
            dbv.chat[i].users.splice(b, 1)
            if(msg.user == dbv.chat[i].owner){
              console.log("Changed owner from "+dbv.chat[i].owner+" to "+dbv.chat[i].users[0])
              dbv.chat[i].owner = dbv.chat[i].users[0]
            }
            sendChatData(socket, username);
            db1.write();
            break;
          }
  })


  socket.on("chat share add", (msg) => {
    var foundUser = false
    for (var i in dbv.chat)
      if (dbv.chat[i].name == msg.chat && dbv.chat[i].owner == username)
        for (var b in dbv.users)
          if (dbv.users[b].username == msg.user) {
            for(var c in dbv.chat[i].users){
              if(dbv.chat[i].users[c] == msg.user){
                message("User is allready added", socket)
                return;
              }
            }
            dbv.chat[i].users.push(msg.user)
            sendChatData(socket, username);
            db1.write();
            foundUser = true
            break;
          }
    if (!foundUser) message("username not found", socket)
  })

  socket.on("chat exit", (chat) => {
    for (var i in dbv.chat)
      if (dbv.chat[i].name == chat)
        for (var b in dbv.chat[i].users)
          if (dbv.chat[i].users[b] == username) {
            dbv.chat[i].users.splice(b, 1)
            sendChatData(socket, username);
            db1.write();
            break;
          }
  })

  socket.on("chat del", (chat) => {
    for (var i in dbv.chat)
    if (dbv.chat[i].name == chat && dbv.chat[i].owner == username){
      dbv.chat.splice(i, 1)
      sendChatData(socket, username);
      db1.write();
    }
  })


  socket.on("get messages", (name) => {
    for (var i in dbv.chat) {
      if (dbv.chat[i].name == name) {
        for (var b in dbv.chat[i].users)
        if (dbv.chat[i].users[b] == username) {
          var toSend = {
            a: dbv.chat[i].messages,
            b: name // The name of the chat
          }
          socket.emit("messages", toSend)

          // remove notify for chat

          for(var c in dbv.chat[i].new){
            if(dbv.chat[i].new[c] == username){
              dbv.chat[i].new.splice(c, 1)
              db1.write();
              console.log("removed notify")
              break;
            }
          }

          break;
        }
        break;
      }
    }
  });


  socket.on("add message", (msg) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (var i in dbv.chat)
      if (dbv.chat[i].name == msg.chat) {
        for (var b in dbv.chat[i].users)
          if (dbv.chat[i].users[b] == username) {
            // Set new list of the users
            dbv.chat[i].new = []
            for(var c in dbv.chat[i].users){
              if(dbv.chat[i].users[c] != username){
                dbv.chat[i].new.push(dbv.chat[i].users[c])
              }
            }

            now = new Date()
            date = monthNames[now.getMonth()] + " " + now.getDate()
            dbv.chat[i].messages.push({
              user: username,
              date: date,
              time: now,
              message: msg.message
            });
            db1.write();
            for (var c in clients)
              for (var b in dbv.chat[i].users) {
                var toSend = {
                  a: dbv.chat[i].messages,
                  b: dbv.chat[i].name
                }

                if (dbv.chat[i].users[b] == clients[c].username) clients[c].socket.emit("messages", toSend)
              }
            break;
          }
        break;
      }
  });

}); // End //



function sendChatData(socket, username) {
  if (username) {
    var toSend = []
    for (var i in dbv.chat) {
      for (var b in dbv.chat[i].users) {
        if (dbv.chat[i].users[b] == username) {
          var date = ""
          if(dbv.chat[i].messages.length)
            date = dbv.chat[i].messages[dbv.chat[i].messages.length-1].date

          var msg = ""
          if(dbv.chat[i].messages.length){
            msg = '('+dbv.chat[i].messages[dbv.chat[i].messages.length-1].user+') '+
            dbv.chat[i].messages[dbv.chat[i].messages.length-1].message;
            if(msg.length>30){
              console.log("cut1")
              msg=msg.substring(0, 27)
              msg += "..."
            }
            if(dbv.chat[i].messages.length > 1){

              var toWrite='('+dbv.chat[i].messages[dbv.chat[i].messages.length-2].user+') '+
              dbv.chat[i].messages[dbv.chat[i].messages.length-2].message;

              if(toWrite.length>30){
                console.log("cut2");
                toWrite=toWrite.substring(0, 27)
                toWrite += "..."
              }
              msg = toWrite + '<br>' + msg
            }
          }

          var time = dbv.chat[i].time
          if(dbv.chat[i].messages.length)
            time = dbv.chat[i].messages[dbv.chat[i].messages.length-1].time

          // Detect if chat is New
          var isNew = false
          for(var c in dbv.chat[i].new){
            if(dbv.chat[i].new[c] == username){
              isNew = true
              break;
            }
          }

          toSend[toSend.length] = {
            title: dbv.chat[i].name,
            msg: msg,
            date: date,
            admin: dbv.chat[i].owner == username,
            users: dbv.chat[i].users,
            time: time,
            isNew: isNew,
          }
        }
      }
    }

    toSend.sort(function(a,b){
      return new Date(b.time) - new Date(a.time);
    });


    socket.emit("chat list", toSend);

  } else loginPopup(socket)
}






function sendClientData(socket, username) {

  if (!username) {
    loginPopup(socket);
    return;
  }


  var toSend = [];
  var t = 0;
  for (var i in dbv.clients) {
    var admin = false
    var name
    for (var b in dbv.clients[i].users) {
      name = dbv.clients[i].users[b].name
      if (name == username) {
        toSend[t] = dbv.clients[i].users[b]
        toSend[t].client = dbv.clients[i].name;
        toSend[t].self = true;
        t++;
        if (dbv.clients[i].users[b].admin)
          admin = true;

        break
      }
    }

    if (admin) {
      for (var b in dbv.clients[i].users) {
        name2 = dbv.clients[i].users[b].name
        if (name2 != name) {
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

if (dbv.config.logoutAll == true) logoutAll();

if (dbv.config.clearData == 2) {
  dbv.config.clearData = false;
  dbv.users = [];
  dbv.clients = [];
  dbv.chat = [];
  db1.write();
}

function logoutAll() {
  for (var i in dbv.users) {
    dbv.users[i].cookie = Math.random();
  }
}


function message(msg, socket) {
  socket.emit("message", msg)
}


function scorePassword(pass) {
  var score = 0;
  if (!pass)
    return score;

  // award every unique letter until 5 repetitions
  var letters = new Object();
  for (var i = 0; i < pass.length; i++) {
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


function loginPopup(socket) {
  socket.emit("loginPopup");
  console.log("yep");
}
