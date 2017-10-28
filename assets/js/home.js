var ws = new WebSocket("wss://scorelive.herokuapp.com/websocket", ["protocolOne", "protocolTwo"]);
var el = document.querySelector('#whoami');

el.addEventListener('click', function(){
    var whoami = el.getAttribute('data-type');
    ws.send(whoami+": 1");
});