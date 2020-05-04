'use strict';



var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var fs = require('fs');
var playersHolder = require('./files/playerbaseholder');
var roomsHolder = require('./files/roomholder.js');
var sock_holder = require('./files/socketholder.js')


var playersBaseHolder = new playersHolder.PlayersBaseHolder(fs)
var rooms = new roomsHolder.RoomHolder()
var socks = new sock_holder.SocketHolder()

playersBaseHolder.loadPlayersFromBase()

server.listen(port, () => {
    console.log("Listening to %d", port)
});

app.use(express.static(path.join(__dirname, 'public')))

var beginner_money = 200;
/*var data = []
for (let i=0; i < 5 ; i++){
    var obj = { id: i, name: 'Kirill', password: 'admin', money: 1000, picture: 1}
    data.push(obj);
}
*/
/*function onEnterLobby(player, lobby_name){
    socks.addRoomToUser(player.name, lobby_name)
    rooms.addToRoom(player, lobby_name)
}*/

function savePlayerMoney(player_name){
    let his_money = rooms.getPlayerMoney(player_name)
    playersBaseHolder.updatePlayerMoney(player_name, his_money)
    socks.updateUserMoney(player_name, his_money)
}


io.sockets.on('connection', function (socket) {
        var ID = (socket.id).toString()
        var id = socket.name
        //console.log(id)
        //console.log("ID:", ID)

        //data = { name: , password: }
        socket.on("auth", function (data) {
            console.log(data, typeof data, typeof {name:'Kirill'})
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            console.log(data, typeof data)
            var user = playersBaseHolder.authPlayer(data.name, data.password);
            if (user!=null) {
                socket.emit("auth", {flag: true, item: user});
                socks.addUser(user.name)
            }else
                socket.emit("auth", {flag: false, item: {}})
        })

        //data = { name: , password: , picture: }
        socket.on("registration", function (data) {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            if(playersBaseHolder.hasUser(data.name)) {
                console.log("already registered", data.name)
                socket.emit("registration", {is_reg: true, player: {}})
            }
            else{
                let new_user = playersBaseHolder.regUser(data.name, data.password, data.picture)
                console.log(new_user)
                socks.addUser(new_user)
                socket.emit("registration",{is_reg: false, player: new_user})
            }
        })


        socket.on("getlobbies", function (data) {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            console.log(rooms.getAllRooms())
            socket.emit("getlobbies", rooms.getAllRooms())
        })

        //data = { lobbyname: , name: }
        socket.on("enterlobby", (data) => {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            var user = playersBaseHolder.getUserSafeInfo(data.name);
            var lobby_to = data.lobbyname
            if (rooms.checkIfCanJoinRoom(lobby_to) && user!=null) {
                if (rooms.checkIfCanJoinRoom(lobby_to)){
                    socks.addRoomToUser(user.name, lobby_to)
                    rooms.addToRoom(lobby_to, user)

                    socket.join(lobby_to)

                    //console.log("player",data.name,"joined", lobby_to)
                    //console.log(rooms.rooms[0].game_holder.players)
                    socket.emit("enterlobby", {didenter:true, lobbyinfo:rooms.getFullRoomParams(lobby_to)})


                    io.sockets.to(lobby_to).emit("newplayerjoinedlobby", user)
                    if (rooms.checkIfGameCanStart(lobby_to)) {
                        rooms.startGame(lobby_to)
                        console.log("game starts!", lobby_to)
                        io.sockets.to(lobby_to).emit("gamestarts", {roomparams:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                        socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                    }
                }
            }else
                socket.emit("enterlobby", {didenter:false, lobbyinfo: {}})
        })

        //data = {lobbyname: , name:}
        //TOD_O: сделать проверочку на конец игры в игровых листенерах
        socket.on("leavelobby", (data) => {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            let user_n = data.name
            let lobby_to = data.lobbyname
            savePlayerMoney(user_n)
            socket.broadcast.to(lobby_to).emit("playerleft", {name:user_n, newlead:rooms.getRoomLead(lobby_to)} )
            socket.emit("youleft", {money: rooms.getPlayerMoney(user_n)})
            //console.log("Player left", lobby_to, user_n)
            rooms.onPlayerLeave(user_n)
            if(rooms.checkGameEnd(lobby_to)){
                console.log("endgame!")
                io.sockets.to(lobby_to).emit("endgame", rooms.getWinners(lobby_to))
            }
            if (rooms.checkIfGameCanStart(lobby_to)) {
                rooms.startGame(lobby_to)
                console.log("game starts!", lobby_to)
                io.sockets.to(lobby_to).emit("gamestarts", {players:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                //socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
            }
        })
        //data = { name: , power: }
        socket.on("myhandpower",(data) => {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            //console.log("power:", data)
            rooms.initPlayerHand(data.name, data.power)
        })

        //data = { name: , lobbyname: }
        socket.on("check", (data)=>{
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            //console.log("check data:",data)
            var lobby_to = data.lobbyname
            if (rooms.onCheck(data.name)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playercheck", {name:data.name, newlead:rooms.getRoomLead(lobby_to)} )
                socket.emit("youcheck", {flag:true, newlead:rooms.getRoomLead(lobby_to)})
                //console.log(rooms.rooms[0].game_holder.players_in_game)

                if(rooms.checkGameEnd(lobby_to)){
                    console.log("endgame!")
                    io.sockets.to(lobby_to).emit("endgame", rooms.getWinners(lobby_to))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                    for(let i=0; i<playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    rooms.startGame(lobby_to)
                    io.sockets.to(lobby_to).emit("gamestarts", {players:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                    socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            }else{
                socket.emit("youcheck", {flag:false, newlead: {}})
            }
        })
        //data = { name: , lobbyname: }
       socket.on("fold", (data)=>{
           if (typeof data !== 'object') {
               data = JSON.parse(data);
           }
           var lobby_to = data.lobbyname
           if(rooms.onFold(data.name)) {
               savePlayerMoney(data.name)
               socket.broadcast.to(lobby_to).emit("playerfold",  {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
               socket.emit("youfold", {flag:true, newlead:rooms.getRoomLead(lobby_to)})

               if(rooms.checkGameEnd(lobby_to)){
                   socket.broadcast.to(lobby_to).emit("endgame", rooms.getWinners(lobby_to))
                   let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                   for(let i=0; i<playersInFinishedGame.length; i++)
                       savePlayerMoney(playersInFinishedGame[i].name)
               }
               if (rooms.checkIfGameCanStart(lobby_to)) {
                   io.sockets.to(lobby_to).emit("gamestarts", {players:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                   socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
               }

           }else{
               socket.emit("youfold", {flag:false, newlead: {}})
           }
       })
        //data = { name: , lobbyname: , rate: }
       socket.on("raise", (data)=>{
           if (typeof data !== 'object') {
               data = JSON.parse(data);
           }
           var lobby_to = data.lobbyname
           if(rooms.onRaise(data.name, data.rate)) {
               savePlayerMoney(data.name)
               io.sockets.to(lobby_to).emit("playerraise", {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
               socket.emit("youraise", {flag:true, newlead:rooms.getRoomLead(lobby_to)})

               //console.log("in raise", rooms.rooms[0].game_holder.players_in_game)

               if(rooms.checkGameEnd(lobby_to)){
                   console.log("endgame!")
                   io.sockets.to(lobby_to).emit("endgame", rooms.getWinners(lobby_to))
                   let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                   for(let i=0; i<playersInFinishedGame.length; i++)
                       savePlayerMoney(playersInFinishedGame[i].name)
               }
               if (rooms.checkIfGameCanStart(lobby_to)) {
                   rooms.startGame(lobby_to)
                   io.sockets.to(lobby_to).emit("gamestarts", {players:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                   socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
               }
           }else{
               socket.emit("youraise", {flag:false, newlead: {}})
           }
       })
        //data = { lobbyname: , name: }
        socket.on('allin', (data) => {
            if (typeof data !== 'object') {
                data = JSON.parse(data);
            }
            //console.log("in allin", data)
            var lobby_to = data.lobbyname
            if(rooms.onAllIn(data.name)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playerallin",  {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
                socket.emit("youallin", {flag:true, newlead:rooms.getRoomLead(lobby_to)})

                rooms.onRaise(data.name, data.rate)

                if(rooms.checkGameEnd(lobby_to)){
                    console.log("endgame!")
                    io.sockets.to(lobby_to).emit("endgame", rooms.getWinners(lobby_to))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                    for(let i=0; i<playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    rooms.startGame(lobby_to)
                    io.sockets.to(lobby_to).emit("gamestarts", {players:rooms.getFullRoomParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                    socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            }else{
                socket.emit("youallin", {flag:false, newlead: {}})
            }
        })

        socket.on("yess", (msg) => {
            if (typeof data !== 'object') {
                msg = JSON.parse(msg);
            }
            console.log("Got from client:",msg);
            socket.emit("yess", msg)
        })
    socket.on("testdb", () => {
        console.log("all players:", playersBaseHolder.players);
        socket.emit("testdb", playersBaseHolder.players)
    })
})

