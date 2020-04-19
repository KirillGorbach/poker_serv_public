'use strict';

var gh = require('./gameholder.js');


class RoomHolder{
    constructor() {
        this.room1 = new Room('room1')
        this.room2 = new Room('room2')
        this.rooms = []
        this.rooms.push(this.room1)
        this.rooms.push(this.room2)
    }

    onPlayerLeave(player_name){
        this.rooms.forEach(function (item) {
            item.onPlayerLeaveInRoom(player_name)
        })
    }


    getAllRooms(){
        var res = []
        this.rooms.forEach(function (item, i, array) {
            res.push(item.getJSON())
        })
        return { rooms: res}
    }

    addToRoom(room_to_name, new_player){
        this.rooms.forEach(function (item, i, array) {
            if(room_to_name == item.getName())
                item.addPlayer(new_player)
        })
        var counter = 0
        this.rooms.forEach(function (item, i, array) {
            item.getPlayers().forEach(function (it, j, a) {
                if (new_player.name == it.name){
                    counter++
                }
            })
        })
        if (counter > 1)
            console.log("ACHTUNG! More than one player with name ", new_player.name, " in lobby\\room ", room_to_name)
    }

    getRoom(room_name){
        var result = null
        this.rooms.forEach(function (item, i, array) {
            if(room_name == item.getName())
                result = item.getJSON()
        })
        return result
    }

    updatePlayerMoney(player_name, new_money){
        this.rooms.forEach(function (item, i, array) {
            item.updatePlayerMoney(player_name, new_money)
        })
    }

    getPlayerMoney(player_name){
        var res = null
        this.rooms.forEach(function (item, i, array) {
            let b = item.getPlayerMoney(player_name)
            if (b != null)
                res = b
        })
        return res
    }

    removePlayer(player_id){
        this.rooms.forEach(function (item, i, array) {
            item.removePlayer(player_id);
        })
    }

    checkIfCanJoinRoom(room_name){
        var res = false
        this.rooms.forEach(function (item, i, array) {
            if(room_name == item.getName()) {
                if(item.getLength() < 5) {
                    res = true
                    //return true;
                }
            }
        })
        return res
        //return false;
    }

    checkIfGameStart(room_name){
        var res = false
        this.rooms.forEach(function (item) {
            if (item.getName() == room_name)
                res = item.checkIfGameStart()
        })
        return res
    }

    getCardsAfterGameStart(room_name){
        var res = null
        this.rooms.forEach(function (item) {
            if (item.getName() == room_name)
                res = item.getCardsAfterStart()
        })
        return res
    }

}

class Room{
    constructor(name) {
        this.name = name
        this.length = 0
        this.players = []
        this.game_holder = new gh.GameHolder([])
    }

    onPlayerLeaveInRoom(player_name){
        if(this.hasPlayer(player_name))
            this.game_holder.onPlayerLeaves(player_name)
    }

    getJSON(){
        return { name: this.name, length: this.length, players: this.players }
    }

    removePlayer(player_name){
        this.length--
        var index = -1
        this.players.forEach(function (item, i, array) {
            if(item.name == player_name)
                index = i
        })
        if(index != -1)
            this.players.splice(index, 1)
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item, i, array) {
            if(item.name == player_name)
                item.money = new_money
        })
    }

    addPlayer(player){
        if(!this.checkCanAdd())
            console.log("Can't add player ", player.name, " to room ", this.name, ", room already has ", this.length, " players")
        this.length++
        this.players.push(player)
        if(this.game_holder.checkIfCanStart())
            this.game_holder.start()

    }

    getPlayerMoney(player_name){
        var res = null
        this.players.forEach(function (item, i, array) {
            if(item.name == player_name)
                res = item.money
        })
        return res
    }

    getPlayers(){  return this.players  }

    getName(){  return this.name  }

    getLength(){ return this.length  }

    checkCanAdd(){
        if(this.length < 5)
            return true
        else
            return false
    }

    checkIfGameStart(){
        return this.game_holder.checkIfCanStart()
    }

    getCardsAfterStart(){
        return this.game_holder.getCardsAfterStart();
    }

    hasPlayer(player_name){
        let b = this.players.push(i=>i.name == player_name)
        if (b!=[])
            return true
        else
            return false
    }
}

module.exports = {RoomHolder}
