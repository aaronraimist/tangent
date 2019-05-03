// tangent web client v0.5
// https://github.com/bahlox/tangent

var server = "https://matrix.org/_matrix/client/r0/";
var room = "!LhfrRGIDedAUZMTeeK:matrix.org";
var tan_out = document.getElementById("tan_out");
var tan_in = document.getElementById("tan_in");
var token;

// don't change stuff behind this line if you don't know what you're doing

// login with data from user and pass field
function login() {
  var user = document.getElementById("user").value;
  var pass = document.getElementById("pass").value;
  var auth = "{\"identifier\":{\"type\":\"m.id.user\",\"user\":\"" + user + "\"},\"initial_device_display_name\":\"Tangent\",\"password\":\"" + pass + "\",\"type\":\"m.login.password\"}";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", server + "login", true);
  xhr.onload = function() {
    if(xhr.status == 200) {
      var obj = JSON.parse(xhr.responseText);
      token = obj["access_token"];
      print("<b>Connected as: " + obj["user_id"] + "</b>");
      join();
    }else{
      print("<b>Login failed.</b>");
    }
  };
  xhr.send(auth);
}

// joining the predefined room
function join() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", server + "rooms/" + encodeURI(room) + "/join?access_token=" + token, true);
  xhr.send("{}");
  print("<b>Joined room: " + room + "</b>");
  sync();
}

// syncing room data from server
function sync(batch) {
  if(token) {
    if(batch) {
      var since = "&since=" + batch;
    }else{
      var since = "";
    }
    var filter = "{\"event_fields\":[\"content\",\"origin_server_ts\",\"sender\",\"type\"],\"room\":{\"rooms\":[\"" + room + "\"],\"timeline\":{\"types\":[\"m.room.message\"]}}}";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", server + "sync?filter=" + filter + "&access_token=" + token + "&timeout=60000" + since, true);
    xhr.onload = function () {
      var res = JSON.parse(xhr.responseText);
      if(res["rooms"]["join"][room]) {
        var events = res["rooms"]["join"][room]["timeline"]["events"];
        for (var i = 0; i < events.length; i++) {
          print("<b>[" + time(events[i]["origin_server_ts"]) + "] " + "<" + events[i]["sender"]+ "></b> " + events[i]["content"]["body"]);
        }
      }
      sync(res["next_batch"]);
    };
    xhr.send();
  }else{
    print("<b>Not logged in.</b>");
  }
}

// send a message to the room
function send() {
  if(token) {
    var txnid = Date.now();
    var text = tan_in.value;
    tan_in.value = "";
    var sendtext = "{\"body\":\"" + text + "\",\"msgtype\":\"m.text\"}";
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", server + "rooms/" + room + "/send/m.room.message/" + txnid + "?access_token=" + token, true);
    xhr.send(sendtext);
  }else{
    print("<b>Not logged in.</b>");
  }
}

// print to client and scroll down
function print(output) {
  tan_out.innerHTML += output + "<hr>\n";
  tan_out.scrollTop = tan_out.scrollHeight;
}

// format timestamp to readable time
function time(stamp) {
  var timestamp = new Date(stamp);
  var hour = timestamp.getHours();
  var minute = timestamp.getMinutes();
  if (hour < 10) {hour = "0" + hour;}
  if (minute < 10) {minute = "0" + minute;}
  return hour + ":" + minute;
}
