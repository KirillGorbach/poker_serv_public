var socket = io();
socket.on('getlobbies', (data)=>{
    console.log(data)
    let buf = "Fuck you! We encode our information!"
    document.getElementById("server_responce").innerHTML = buf
})
$(function () {

    socket.emit('getlobbies')
});