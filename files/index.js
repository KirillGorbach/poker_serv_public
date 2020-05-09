'use strict';

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var fs = require('fs');
var playersHolder = require('./playerbaseholder');
var roomsHolder = require('./roomholder.js');
var sock_holder = require('./socketholder.js')

var reqEncoder = require('./encoder/encoder')
const encodeJSON = function (some_JSON) {
    return reqEncoder.Encoder.encodeJSON(some_JSON)
}
const decodeToJSON = function (str) {
    return reqEncoder.Encoder.decodeToJSON(str)
}


//см. комментарий в ./querer.js
var databse = require('./querer')
databse.loader()

//let baseHodl = new playersHolder.PlayersBaseHolder()
//baseHodl.loadPlayersFromBase()
//mainfunc([{dt:baseHodl.getPayers().players}])


function mainfunc(players) {
    console.debug(players)

    var playersBaseHolder = new playersHolder.PlayersBaseHolder(fs)
    playersBaseHolder.setPlayers(players[0].dt)
    var rooms = new roomsHolder.RoomHolder()
    //вот это я бы убрал
    //функционал класса перекрывается io.sockets.to(lobby_to).emit(...)
    var socks = new sock_holder.SocketHolder()

    var playersOfflineMap = new Map()


    server.listen(port, () => {
        console.log("Listening to %d", port)
    });

    //выдача html-страницы
    app.use(express.static(path.join(__dirname, 'public')))

    //с хранением базы юзеров всё весело - данные:
    //1) хранятся в оперативке
    //2) дублируются в классах ниже
    //          VVV
    function savePlayerMoney(player_name) {
        let his_money = rooms.getPlayerMoney(player_name)
        playersBaseHolder.updatePlayerMoney(player_name, his_money)
        socks.updateUserMoney(player_name, his_money)
    }

    io.sockets.on('connection', function (socket) {
        var ID = (socket.id).toString()
        var id = socket.name
        //console.log("connected")
        //console.log(id)
        //console.log("ID:", ID)

        //data = { name: , password: }
        socket.on("auth", function (data) {
            //console.log(data, typeof data, typeof {name: 'Kirill'})
            data = decodeToJSON(data)
            console.debug("Connected:", data.name)
            var user = playersBaseHolder.authPlayer(data.name, data.password);
            if (user != null) {
                socket.emit("auth", encodeJSON({flag: true, item: user}));
                socks.addUser(user.name)
            } else
                socket.emit("auth", encodeJSON({flag: false, item: {}}))
        })

        //data = { name: , password: , picture: }
        socket.on("registration", function (data) {
            data = decodeToJSON(data)
            if (playersBaseHolder.hasUser(data.name)) {
                console.debug("already registered", data.name)
                socket.emit("registration", encodeJSON({is_reg: true, player: {}}))
            } else {
                let new_user = playersBaseHolder.regUser(data.name, data.password, data.picture)
                console.log(new_user)
                socks.addUser(new_user)
                socket.emit("registration", encodeJSON({is_reg: false, player: new_user}))
            }
        })


        socket.on("getlobbies", () => {
            socket.emit("getlobbies", encodeJSON(rooms.getAllRooms()))
        })

        //data = { lobbyname: , name: }
        socket.on("enterlobby", (data) => {
            data = decodeToJSON(data)
            var user = playersBaseHolder.getUserSafeInfo(data.name);
            var lobby_to = data.lobbyname
            if (rooms.checkIfCanJoinRoom(lobby_to) && user != null) {
                if (rooms.checkIfCanJoinRoom(lobby_to)) {
                    socks.addRoomToUser(user.name, lobby_to)
                    rooms.addToRoom(lobby_to, user)

                    socket.join(lobby_to)

                    //console.log("player",data.name,"joined", lobby_to)
                    //console.log(rooms.rooms[0].game_holder.players)
                    socket.emit("enterlobby", encodeJSON({didenter: true, lobbyinfo: rooms.getFullRoomParams(lobby_to)}))


                    io.sockets.to(lobby_to).emit("newplayerjoinedlobby", encodeJSON(user))
                    if (rooms.checkIfGameCanStart(lobby_to)) {
                        rooms.startGame(lobby_to)
                        io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                            roomparams: rooms.getFullRoomParams(lobby_to),
                            lead: rooms.getRoomLead(lobby_to)
                        }))
                        //socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                        console.log("game starts!", lobby_to)
                    }
                }
            } else
                socket.emit("enterlobby", encodeJSON({didenter: false, lobbyinfo: {}}))
        })

        //data = { name: , lobbyname: }
        socket.on("stop", (data) => {
            data = decodeToJSON(data)
            let playerExcludeFromLobbyTimeout = setTimeout(excludePlayer, 20000, data)
            io.sockets.to(data.lobbyname).emit("playerstops", encodeJSON({name:data.name}))
            playersOfflineMap.set(data.name, playerExcludeFromLobbyTimeout)
        })

        //data = { name: , password: , lobbyname: }
        socket.on("restore", (data) => {
            data = decodeToJSON(data)
            var user = playersBaseHolder.authPlayer(data.name, data.password)
            let lobby_to = data.lobbyname
            if (user){
                socket.join(data.lobbyname)
                io.sockets.to(data.lobbyname).emit("plauerrestores", encodeJSON({name:data.name}))
                clearTimeout(playersOfflineMap.get(data.name))
                playersOfflineMap.delete(data.name)
                socket.emit("restore", encodeJSON({didrestore: true, roomparams: {
                        players: rooms.getFullRoomParams(lobby_to),
                        lead: rooms.getRoomLead(lobby_to)
                    }
                }))
            }else
                socket.emit("restore", encodeJSON({didrestore: false, roomparams: {}}))
        })

        //data = {lobbyname: , name:}
        socket.on("leavelobby", (data) => {
            data = decodeToJSON(data)
            excludePlayer(data)
        })

        //data = {lobbyname: , name:}
        function excludePlayer(data){
            let user_n = data.name
            let lobby_to = data.lobbyname
            savePlayerMoney(user_n)
            socket.emit("youleft", encodeJSON({money: rooms.getPlayerMoney(user_n)}))
            rooms.onPlayerLeave(user_n)
            io.sockets.to(lobby_to).emit("playerleft", encodeJSON({name: user_n, newlead: rooms.getRoomLead(lobby_to)}))
            if (rooms.checkGameEnd(lobby_to)) {
                console.debug("endgame!")
                io.sockets.to(lobby_to).emit("endgame", encodeJSON(rooms.getWinners(lobby_to)))
            }
            if (rooms.checkIfGameCanStart(lobby_to)) {
                rooms.startGame(lobby_to)
                console.debug("game starts!", lobby_to)
                io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                    players: rooms.getFullRoomParams(lobby_to),
                    lead: rooms.getRoomLead(lobby_to)
                }))
            }
        }

        //data = { name: , power: }
        socket.on("myhandpower", (data) => {
            data = decodeToJSON(data)
            console.debug("power:", data)
            rooms.initPlayerHand(data.name, data.power)
        })
        //data = { name: , lobbyname: }
        socket.on("check", (data) => {
            data = decodeToJSON(data)
            var lobby_to = data.lobbyname
            if (rooms.onCheck(data.name)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playercheck", encodeJSON({name: data.name, newlead: rooms.getRoomLead(lobby_to)}))
                socket.emit("youcheck", encodeJSON({flag: true, newlead: rooms.getRoomLead(lobby_to)}))

                if (rooms.checkGameEnd(lobby_to)) {
                    console.debug("endgame!")
                    io.sockets.to(lobby_to).emit("endgame", encodeJSON(rooms.getWinners(lobby_to)))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                    for (let i = 0; i < playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    rooms.startGame(lobby_to)
                    io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                        players: rooms.getFullRoomParams(lobby_to),
                        lead: rooms.getRoomLead(lobby_to)
                    }))
                    //socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            } else {
                socket.emit("youcheck", encodeJSON({flag: false, newlead: {}}))
            }
        })
        //data = { name: , lobbyname: }
        socket.on("fold", (data) => {
            data = decodeToJSON(data)
            var lobby_to = data.lobbyname
            if (rooms.onFold(data.name)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playerfold", encodeJSON({
                    name: data.name,
                    newlead: rooms.getRoomLead(lobby_to)
                }))
                socket.emit("youfold", encodeJSON({flag: true, newlead: rooms.getRoomLead(lobby_to)}))

                if (rooms.checkGameEnd(lobby_to)) {
                    io.sockets.to(lobby_to).emit("endgame", encodeJSON(rooms.getWinners(lobby_to)))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(data.lobbyname)
                    for (let i = 0; i < playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                        players: rooms.getFullRoomParams(lobby_to),
                        lead: rooms.getRoomLead(lobby_to)
                    }))
                    //socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }

            } else {
                socket.emit("youfold", encodeJSON({flag: false, newlead: {}}))
            }
        })
        //data = { name: , lobbyname: , rate: }
        socket.on("raise", (data) => {
            data = decodeToJSON(data)
            var lobby_to = data.lobbyname
            if (rooms.onRaise(data.name, data.rate)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playerraise", encodeJSON(
                    {
                                    name: data.name
                                    ,newlead: rooms.getRoomLead(lobby_to)
                                    ,rate: data.rate
                                }))
                socket.emit("youraise", encodeJSON({flag: true, newlead: rooms.getRoomLead(lobby_to)}))


                if (rooms.checkGameEnd(lobby_to)) {
                    console.debug("endgame!")
                    io.sockets.to(lobby_to).emit("endgame", encodeJSON(rooms.getWinners(lobby_to)))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                    for (let i = 0; i < playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    rooms.startGame(lobby_to)
                    io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                        players: rooms.getFullRoomParams(lobby_to),
                        lead: rooms.getRoomLead(lobby_to)
                    }))
                    //socks.sendToRoomCards(lobby_to, rooms.getCardsAfterGameStart(lobby_to))
                }
            } else {
                socket.emit("youraise", encodeJSON({flag: false, newlead: {}}))
            }
        })
        //data = { lobbyname: , name: }
        socket.on("allin", (data) => {
            data = decodeToJSON(data)
            //console.log("in allin", data)
            var lobby_to = data.lobbyname
            if (rooms.onAllIn(data.name)) {
                savePlayerMoney(data.name)
                io.sockets.to(lobby_to).emit("playerallin", encodeJSON({name: data.name, newlead: rooms.getRoomLead(lobby_to)}))
                socket.emit("youallin", encodeJSON({flag: true, newlead: rooms.getRoomLead(lobby_to)}))

                rooms.onRaise(data.name, data.rate)

                if (rooms.checkGameEnd(lobby_to)) {
                    console.debug("endgame!")
                    io.sockets.to(lobby_to).emit("endgame", encodeJSON(rooms.getWinners(lobby_to)))
                    let playersInFinishedGame = rooms.getRoomPlayersForSave(lobby_to)
                    for (let i = 0; i < playersInFinishedGame.length; i++)
                        savePlayerMoney(playersInFinishedGame[i].name)
                }
                if (rooms.checkIfGameCanStart(lobby_to)) {
                    rooms.startGame(lobby_to)
                    io.sockets.to(lobby_to).emit("gamestarts", encodeJSON({
                        players: rooms.getFullRoomParams(lobby_to),
                        lead: rooms.getRoomLead(lobby_to)
                    }))
                }
            } else {
                socket.emit("youallin", encodeJSON({flag: false, newlead: {}}))
            }
        })


        socket.on("yess", (msg) => {
            msg = reqEncoder.Encoder.decode(msg)
            console.debug("Got from client:", msg);
            socket.emit("yess", reqEncoder.Encoder.encode(msg))
        })

        socket.on("testdb", () => {
            console.debug("all players:", playersBaseHolder.players);
            socket.emit("testdb", encodeJSON(playersBaseHolder.players))
        })
    })

}

module.exports = {mainfunc}