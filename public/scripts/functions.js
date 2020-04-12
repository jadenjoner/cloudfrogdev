
function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    var tosend;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                tosend = allText;
            }
        }
    }
    rawFile.send(null);

    return tosend;
}


function $(value){
  element = document.getElementById(value)
  elements = document.getElementsByClassName(value)
  tags = document.getElementsByTagName(value)
  if(element != null)return element;
  else if(tags.length > 0){
    console.log("Warning: "+value+" is both a tag and a class name, the tag will be used")
    return tags;
  }
  else if(elements.length > 0) return elements;
  else console.log("Error: "+value+" is not a id, class or tag name")
  return false;
}

function selectValue(text){
  return $(text).options[$(text).selectedIndex].value;
}


function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" style="color:inherit" href="' + url + '">' + url + '</a>';
    });
}

function imgify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])*(.png|.jpg|.gif|.jpeg|.svg)/ig;
    return text.replace(urlRegex, function(url) {
        return '<img style="width:100%;height: auto;background:#eee;border-radius: 10px" src="' + url + '"/>';
    });
}


function textConvert(text){
  return imgify(linkify(text))
}
