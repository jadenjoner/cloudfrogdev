var fs = require('fs');
var path = require('path');

function jsonRead(relPath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, relPath)));
}

function catFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath));
}

function fwrite(file, data){
  data = JSON.stringify(data, null, 2)
  fs.writeFile(file,data,
      function(err) { 
        if (err) throw err;
        error = err
  });
}

class db {

  constructor(path, pass="") {
    if(catFile(path) == "")fwrite(path, {})
    this.data = jsonRead(path)
    this.path = path
    if(pass!=""){
      this.data = decrypt(this.data, pass)
      this.password = pass
    }
  }
  read(path=this.path) {
    this.data = jsonRead(path)
    return this.data;
  }
  write(path=this.path) {
    return fwrite(path, this.data)
  }
}

module.exports = db 