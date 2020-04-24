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

app.use(express.static(path.join(__dirname, 'public')));

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
    playersBaseHolder.save()
    socks.updateUserMoney(player_name, his_money)
}


io.sockets.on('connection', function (socket) {
        var ID = (socket.id).toString()

        console.log("ID:", ID)

        //data = { name: , password: }
        socket.on('auth', function (data) {
            var user = playersBaseHolder.authPlayer(data.name, data.password);
            if (user!=null) {
                socket.emit('auth', {flag: true, item: user});
                socks.addUser(user.name)
            }else
                socket.emit('auth', {flag: false, item: {}})
        })

        //data = { name: , password: , picture: }
        socket.on('registration', function (data) {
            if(playersBaseHolder.hasUser(data.name))
                socket.emit('registration', {is_reg: true, player: {}})
            else{
                let new_user = playersBaseHolder.regUser(data.name, data.password, data.picture)
                //console.log(new_player)
                playersBaseHolder.addPlayer(new_user)
                socket.emit('registration', {is_reg: false, player: new_user})
                socks.addUser(new_user)
            }
        })


        socket.on('getlobbies', function () {
            socket.emit('lobbies', rooms.getAllRooms())
        })

        //data = { lobbyname: , name: }
        socket.on('enterlobby', (data) => {
            var user = playersBaseHolder.getUserSafeInfo(data.name);
            var lobby_to = data.lobbyname
            if (rooms.checkIfCanJoinRoom(lobby_to) && user!=null) {
                if (rooms.checkIfCanJoinRoom(lobby_to)){
                    socks.addRoomToUser(user.name, lobby_to)
                    rooms.addToRoom(user.name, lobby_to)

                    socket.join(lobby_to)

                    console.log("new player joined ", lobby_to)
                    socket.emit('enteredlobby', {didenter:true, lobbyinfo:rooms.getFullRommParams(lobby_to)})


                    socket.broadcast.to(lobby_to).emit('newplayerjoinedlobby', user)
                    if (rooms.checkIfGameCanStart(lobby_to)) {
                        socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                        socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                    }
                }
            }else
                socket.emit('enteredlobby', {didenter:false, lobbyinfo: {}})
        })

        //data = {lobbyname: , name:}
        //TODO: сделать проверочку на конец игры в игровых листенерах
        socket.on('leavelobby', (data) => {
            let user_n = data.name
            let lobby_to = data.lobbyname
            savePlayerMoney(user_n)
            socket.broadcast.to(lobby_to).emit('playerleft', {name:user_n, newlead:rooms.getRoomLead(lobby_to)} )
            socket.emit('youleft', {money: rooms.getPlayerMoney(user_n)})
            console.log("Player left", lobby_to, user_n)
            rooms.onPlayerLeave(user_n)
            if(rooms.checkGameEnd(lobby_to)){
                socket.broadcast.to(lobby_to).emit('endgame', rooms.getWinners(lobby_to))
            }
            if (rooms.checkIfGameCanStart(lobby_to)) {
                socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
            }
        })
        //data = { name: , power: }
        socket.on('myhandpower',(data) => {
            rooms.initPlayerHand(data.name, data.power)
        })

        //data = { name: , lobbyname: }
        socket.on('check', (data)=>{
            if (rooms.onCheck(data.name)) {
                savePlayerMoney(data.name)
                socket.broadcast.to(data.lobbyname).emit('playercheck', {name:data.name, newlead:rooms.getRoomLead(lobby_to)} )
                socket.emit('youcheck', {flag:true, newlead:rooms.getRoomLead(lobby_to)})

                if(rooms.checkGameEnd(lobby_to)){
                    socket.broadcast.to(lobby_to).emit('endgame', rooms.getWinners(lobby_to))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                    for(let i=0; i<playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                    socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            }else{
                socket.emit('youcheck', {flag:false, newlead: {}})
            }
        })
        //data = { name: , lobbyname: }
       socket.on('fold', (data)=>{
           if(rooms.onFold(data.name)) {
               savePlayerMoney(data.name)
               socket.broadcast.to(data.lobbyname).emit('playerfold',  {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
               socket.emit('youcfold', {flag:true, newlead:rooms.getRoomLead(lobby_to)})

               if(rooms.checkGameEnd(lobby_to)){
                   socket.broadcast.to(lobby_to).emit('endgame', rooms.getWinners(lobby_to))
                   let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                   for(let i=0; i<playersInFinishedGame.length; i++)
                       savePlayerMoney(playersInFinishedGame[i].name)
               }
               if (rooms.checkIfGameCanStart(lobby_to)) {
                   socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                   socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
               }

           }else{
               socket.emit('youfold', {flag:false, newlead: {}})
           }
       })
        //data = { name: , lobbyname: , rate: }
       socket.on('raise', (data)=>{
           if(rooms.onRaise(data.name, data.rate)) {
               savePlayerMoney(data.name)
               socket.broadcast.to(data.lobbyname).emit('playerraise', {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
               socket.emit('youraise', {flag:true, newlead:rooms.getRoomLead(lobby_to)})

               if(rooms.checkGameEnd(lobby_to)){
                   socket.broadcast.to(lobby_to).emit('endgame', rooms.getWinners(lobby_to))
                   let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                   for(let i=0; i<playersInFinishedGame.length; i++)
                       savePlayerMoney(playersInFinishedGame[i].name)
               }
               if (rooms.checkIfGameCanStart(lobby_to)) {
                   socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                   socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
               }
           }else{
               socket.emit('youraise', {flag:false, newlead: {}})
           }
       })
        //data = { lobbyname: , name: }
        socket.on('allin', (data) => {
            if(this.rooms.onAllIn(data.name)) {
                savePlayerMoney(data.name)
                socket.broadcast.to(data.lobbyname).emit('playerallin',  {name:data.name, newlead:rooms.getRoomLead(lobby_to)})
                socket.emit('youallin', {flag:true, newlead:rooms.getRoomLead(lobby_to)})

                rooms.onRaise(data.name, data.rate)

                if(rooms.checkGameEnd(lobby_to)){
                    socket.broadcast.to(lobby_to).emit('endgame', rooms.getWinners(lobby_to))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                    for(let i=0; i<playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    socket.broadcast.to(lobby_to).emit('gamestarts', {players:rooms.getFullRommParams(lobby_to), lead:rooms.getRoomLead(lobby_to)})
                    socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            }else{
                socket.emit('youallin', {flag:false, newlead: {}})
            }
        })

        socket.on('yess', (msg) => {
            console.log("Got from client:",msg);
        })
})

