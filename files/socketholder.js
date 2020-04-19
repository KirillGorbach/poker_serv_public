var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


class SocketHolder{
    constructor() {
        this.sockids = []
    }

    userLeaveRoom(player_name){
        this.sockids.forEach(function (item) {
            if (item.name == player_name)
                item.room = ""
        })
    }

    addUser(sock_id, user){
        this.sockids.push({sock_id: sock_id, name: user.name, user: user})
    }

    addUser(sock_id, user, room){
        this.sockids.push({sock_id: sock_id, name: user.name, user: user, room: room})
    }

    addRoomToUser(user_name, room){
        this.sockids.forEach(function (item) {
            if(item.name == user_name)
                item.room = room
        })
    }

    sendToRoomCards(room_name, all_cards){
        let socks_to = this.sockids.filter(item => item.room == room_name)
        var deck = all_cards.deck
        socks_to.forEach(function (item) {
            let this_player_cards = all_cards.players.filter(i => i.playername == item.name)
            io.sockets.socket(item.sock_id).emit('gamestarted', { deck: deck, your_cards: this_player_cards })
        })
    }
}

module.exports = {SocketHolder}