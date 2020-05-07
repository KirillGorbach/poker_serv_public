'use strict';

var gh = require('./gameholder.js');

//класс хранит все лобби
//передаёт игровые события в необходимые комнаты
class RoomHolder{
    constructor() {
        this.room1 = new Room('room1')
        this.room1.setRate(10)
        this.room2 = new Room('room2')
        this.room2.setRate(50)
        this.rooms = []
        this.rooms.push(this.room1)
        this.rooms.push(this.room2)
    }

    startGame(room_name){
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].getName() === room_name) {
                //console.log("rh: found lobby")
                this.rooms[i].startGame()
            }
    }


    onPlayerLeave(player_name){
        var res = false
        this.rooms.forEach(function (item) {
            if(item.onPlayerLeaveInRoom(player_name))
                res = true
        })
        return res
    }


    getAllRooms(){
        var res = []
        this.rooms.forEach(function (item, i, array) {
            res.push(item.getShortJSON())
        })
        return { rooms: res}
    }

    addToRoom(room_to_name, new_player){
        this.rooms.forEach(function (item, i, array) {
            if(room_to_name === item.getName()) {
                item.addPlayer(new_player)
            }
        })
        var counter = 0
        this.rooms.forEach(function (item, i, array) {
            item.getPlayers().forEach(function (it, j, a) {
                if (new_player.name === it.name){
                    counter++
                }
            })
        })
        if (counter > 1)
            ("ACHTUNG! More than one player with name ", new_player.name, " in lobby\\room ", room_to_name)
    }

    getRoom(room_name) {
        var result = null
        this.rooms.forEach(function (item, i, array) {
            if (room_name === item.getName())
                result = item.getShortJSON()
        })
        return result
    }

    getRoomPlayersForSave(room_name){
        var result = null
        this.rooms.forEach(function (item, i, array) {
            if (room_name === item.getName())
                result = item.getPlayers()
        })
        return result
    }

    getFullRoomParams(room_name){
        var result = null
        this.rooms.forEach(function (item, i, array) {
            if (room_name === item.getName())
                result = item.getFullJSON()
        })
        return result
    }

    //Пофикшено: теперь игрок в комнате не имеет поля "пароль"
    /*getRoomNoPsw(room_name){
        var result = null
        this.rooms.forEach(function (item, i, array) {
            if (room_name == item.getName()) {
                result = item.getShortJSON()
                result.players.forEach(function (ite) {
                    ite.password = ""
                })
            }
        })
        return result
    }*/


    //на мой взгляд, это не нужно - только игра может обновлять деньги
    /*updatePlayerMoney(player_name, new_money){
        this.rooms.forEach(function (item, i, array) {
            item.updatePlayerMoney(player_name, new_money)
        })
    }*/

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
            if(room_name === item.getName())
                res = item.checkCanAdd()
        })
        return res
    }

    checkIfGameCanStart(room_name){
        var res = false
        this.rooms.forEach(function (item) {
            if (item.getName() === room_name)
                res = item.checkIfGameCanStart()
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

    onCheck(player_name){
        var res = false
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].hasPlayer(player_name))
                res = this.rooms[i].onCheck(player_name)
        //this.rooms.forEach(function (item) {
        //    if(item.hasPlayer(player_name))
        //        res = item.onCheck(player_name)
        //})
        return res
    }

    onFold(player_name){
        var res = false
        this.rooms.forEach(function (item) {
            if(item.hasPlayer(player_name))
                res = item.onFold(player_name)
        })
        return res
    }

    onRaise(player_name, new_rate){
        var res = false
        this.rooms.forEach(function (item) {
            if(item.hasPlayer(player_name))
                res = item.onRaise(player_name, new_rate)
        })
        return res
    }

    onAllIn(player_name){
        var res = false
        this.rooms.forEach(function (item) {
            if(item.hasPlayer(player_name))
                res = item.onAllIn(player_name)
        })
        //console.log("rh:", res)
        return res
    }

    getRoomLead(room_name){
        var res = null
        this.rooms.forEach(function (item) {
            if(item.name === room_name)
                res = item.getLead()
        })
        return res
    }

    initPlayerHand( player_name, hand_power = 0){
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].hasPlayer(player_name)){
                this.rooms[i].initPlayerHandPower(player_name, hand_power)
                break
            }
    }

    getRoomRate(room_name){
        let res = null
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].getName() === room_name)
                res = this.rooms[i].getRate()
        return res
    }

    checkGameEnd(room_name){
        let res = null
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].getName() === room_name)
                res = this.rooms[i].checkEndGame()
        return res
    }
    getWinners(room_name){
        let res = null
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].getName() === room_name)
                res = this.rooms[i].getWinners()
        return res
    }

    getRoomBank(room_name){
        let res = null
        for(let i=0; i<this.rooms.length; i++)
            if(this.rooms[i].getName() === room_name)
                res = this.rooms[i].getBank()
        return res
    }
}
//класс-обёртка для игры
//отвечает за:
//вывод информации о состоянии игры и игроках
//передачу игровых событий в GameHolder
//проверяет наличие игрока в комнате
class Room{
    constructor(name) {
        this.name = name
        this.length = 0
        this.players = []
        this.game_holder = new gh.GameHolder()
    }

    setRate(val){ this.game_holder.setRate(val) }

    getCardsOnTable(){ return this.game_holder.getCardsOnTable() }

    onRaise(player_name, new_rate){
        if(this.hasPlayer(player_name))
            return this.game_holder.onRaise(player_name, new_rate)
        else
            return null
    }

    onFold(player_name){
        if(this.hasPlayer(player_name))
            return  this.game_holder.onFold(player_name)
        else
            return null
    }

    onCheck(player_name){
        //console.log("room has?", this.hasPlayer(player_name))
        if(this.hasPlayer(player_name)) {
            //console.log("in room still", this.game_holder.onCheck(player_name))
            return this.game_holder.onCheck(player_name)
        }else
            return null
    }

    onPlayerLeaveInRoom(player_name){
        if(this.hasPlayer(player_name)) {
            let res = this.game_holder.onPlayerLeaves(player_name)
            this.updatePlayers()
            return res
            //this.players.splice(this.getPlayerIndex(player_name), 1)
        }
        return false
    }

    getShortJSON(){  return { name: this.name, length: this.length, rate:this.game_holder.base_rate }   }
    getFullJSON(){
        let g_pl = []
        for(let i=0; i<this.game_holder.players_in_game.length; i++)
            g_pl.push({ name: this.game_holder.players_in_game[i].name
                        ,money: this.game_holder.players_in_game[i].money
                        ,picture: this.game_holder.players_in_game[i].picture
                        })
        let a_pl = []
        for(let i=0; i<this.game_holder.players.length; i++)
            a_pl.push({ name: this.game_holder.players[i].name
                        ,money: this.game_holder.players[i].money
                        ,picture: this.game_holder.players[i].picture
                        })
        return {
			bank: this.game_holder.bank
            ,rate:this.game_holder.base_rate
            ,isgamerunning:this.game_holder.isRunning
            ,name:this.name
            ,cards: this.getCardsAfterStart()
            ,playersingame:g_pl
            ,allplayers:a_pl
        }
    }

    removePlayer(player_name){
        this.length--
        var index = -1
        for(let i=0; i<this.players.length; i++)
            if(this.players[i].name === player_name)
                index = i
        if(index !== -1)
            this.players.splice(index, 1)
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item, i, array) {
            if(item.name === player_name)
                item.money = new_money
        })
    }

    addPlayer(player){
        if(!this.checkCanAdd())
            console.log("Can't add player ", player.name, " to room ", this.name, ", room already has ", this.length, " players")
        else {
            this.length++
            this.players.push({name: player.name, money:player.money } )
            this.game_holder.addPlayer(player)
           //if (this.game_holder.checkIfCanStart()&&!this.game_holder.isRunning)
           //    this.game_holder.start()
        }

    }

    updatePlayers(){
        this.players = []
        for(let i=0; i<this.game_holder.players.length; i++)
            this.players.push({name:this.game_holder.players[i].name, money:this.game_holder.players[i].money})

    }

    onAllIn(player_name){
        if(this.hasPlayer(player_name)) {
            let res =this.game_holder.onAllIn(player_name)
            //console.log("room:", res)
            return res
        }
        else
            return false
    }

    getPlayerMoney(player_name){
        let res = null
        let b = this.game_holder.players
        for(let i=0; i<b.length; i++){
            if(b[i].name === player_name)
                res = b[i].money
        }
        return res
    }

    getPlayers(){  return this.game_holder.players  }

    getName(){  return this.name  }

    getLength(){ return this.length  }

    checkCanAdd(){ return this.length < 5 }

    checkIfGameCanStart(){ return this.game_holder.checkIfCanStart() && !this.game_holder.isRunning }

    startGame(){
        if(this.game_holder.checkIfCanStart()){
            //console.log("rm can start")
            this.game_holder.start()
        }
    }

    getCardsAfterStart(){
        return this.game_holder.getCardsAfterStart();
    }

    hasPlayer(player_name){
        let res = false
        for(let i=0; i<this.players.length; i++)
            if(this.players[i].name === player_name)
                res = true
        return res
        //return this.players.filter(i=>i.name === player_name)!==[]
        //let b = this.players.filter(i=>i.name === player_name)
        //if (b!==[])
        //    return true
        //else
        //    return false
    }

    getLead(){
        return this.game_holder.getLead()
    }

    getPlayerIndex(player_name){
        var res = null
        this.players.forEach(function (item, i) {
            if(item.name === player_name)
                res = i
        })
        return res
    }

    getRate(){ return this.game_holder.rate }
    getBank(){ return this.game_holder.bank }
    checkEndGame(){ return this.game_holder.getIsFinished() }
    getWinners(){ return this.game_holder.getWinners() }
    initPlayerHandPower(player_name, hand_power){ return this.game_holder.initPlayerHandPower(player_name, hand_power) }
}

module.exports = {RoomHolder, Room}
