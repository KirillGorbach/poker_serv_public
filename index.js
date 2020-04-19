'use strict';

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var fs = require('fs');

var playersHolder = require('./files/playerbaseholder');
var playersBaseHolder = new playersHolder.PlayersBaseHolder(fs);

var roomsHolder = require('./files/roomholder.js');
var rooms = new roomsHolder.RoomHolder();
//console.log(rooms.checkIfCanJoinRoom('room1'));
//console.log(rooms.getAllRooms())


var testGame = require('./files/gameholder.js');
var gameHolder = new testGame.GameHolder([ { id:0, name:'Kirill', password:'admin', money:1000, picture:1 },{ id:1, name:'Kirill', password:'admin', money:1000, picture:1 }]);
gameHolder.start();
console.log(gameHolder.getCardsOnTable());
console.log(gameHolder.getPlayerCards('Kirill'));
console.log(gameHolder.lead);
gameHolder.changeLead()
console.log(gameHolder.lead);


var sock_holder = require('./files/socketholder.js')
var socks = new sock_holder.SocketHolder()


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



io.sockets.on('connection', function (socket) {
        var ID = (socket.id).toString();
        console.log("ID:", ID);

        socket.on('authenticate', function (msg) {
            var user = playersBaseHolder.authPlayer(msg.name, msg.password);

            if (user!=null) {
                socket.emit('authentication', {flag: true, item: user});
                socks.addUser(user)
            }else
                socket.emit('authentication', {flag: false, item: {}})
        });

        socket.on('registration', function (data) {
            var is_already_registered = false;

            playersBaseHolder.getPayers().forEach(function (item, i, array) {
                if (item.name == data.name) {
                    is_already_registered = true
                    //если уже зареган, то посылаем отказ регистрации
                    socket.emit('registration', {is_reg: is_already_registered, player: {}})
                }
            });
            if (!is_already_registered) {
                var max_id = 0
                playersBaseHolder.getPayers().forEach(function (item, i, array) {
                    if (item.id > max_id)
                        max_id = item.id
                })
                let new_id = max_id + 1
                let new_player = {
                    id: new_id,
                    name: data.name,
                    password: data.password,
                    money: beginner_money,
                    picture: data.picture
                }
                //console.log(new_player)
                playersBaseHolder.addPlayer(new_player)
                socket.emit('registration', {is_reg: is_already_registered, player: new_player})

                socks.addUser(new_player)
            }
        });

        socket.on('getlobbies', function (data) {
            socket.emit('lobbies', rooms.getAllRooms());
        });

        socket.on('enterlobby', (data) => {
            if (rooms.checkIfCanJoinRoom(data.lobbyname)) {
                rooms.addToRoom(data.lobbyname, data.player)

                socket.join(data.lobbyname)
                socks.addRoomToUser(data.player.name, data.lobbyname)

                console.log("new player joined ", rooms.getRoom(data.lobbyname))
                socket.emit('enteredlobby', true)

                let info_to_others = {
                    id: data.player.id,
                    name: data.player.name,
                    money: data.player.money,
                    picture: data.player.picture
                }
                socket.broadcast.to(data.lobbyname).emit('newplayerjoinedlobby', info_to_others)
                if (rooms.checkIfGameStart(data.lobbyname))
                    socks.sendToRoomCards(data.lobbyname, rooms.getCardsAfterGameStart(data.lobbyname))
            }else{
                socket.emit('enteredlobby', false)
            }
        });

        //data = {lobbyname: , name:}
        socket.on('leavelobby', (data) => {
            socket.broadcast.to(data.lobbyname).emit('playerleft', data.name)
            socket.emit('youleavedlobby', {money: rooms.getPlayerMoney(data.name)})
            playersBaseHolder.updatePlayerMoney(data.name, rooms.getPlayerMoney(data.name))
            rooms.onPlayerLeave(data.name)
            console.log("Player left", data.lobbyname, data.name)
            /////
        });

        socket.on('yess', (msg) => {
            console.log("Got from client:",msg);
        });
    });

