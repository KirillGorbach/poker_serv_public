'use strict';
var fs = require('fs')
var database = require('./querer')


class PlayersBaseHolder{
    constructor() {
        this.players = [];
        this.name = "";
        this.beginner_money = 100
    }

    setPlayers(pls){
        this.players = pls
        console.log(this.players)
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item) {
            if(item.name === player_name)
                item.money = new_money
        })
        this.save()
    }


    addPlayer(player){
        this.players.push(player);
        this.save()
    }

    authPlayer(player_name, player_password){
        var res = null
        //console.log(this.players)
        this.players.forEach(function (item) {
            if (player_name === item.name && player_password === item.password)
                res = item
        })
        return res;
    }

    authPlayerByToken(player_name, tocken_form_client, auth_token){
        if(auth_token === tocken_form_client) {
            var res = null
            //console.log(this.players)
            this.players.forEach(function (item) {
                if (player_name === item.name)
                    res = item
            })
            return res
        }else
            return null
    }

    getPayers(){
        return this.players;
    }

    save(){
        database.setter(this.players)
        //this.setBaseFile(this.players);
    }


    hasUser(user_name){
        var res = false
        this.players.forEach(function (item) {
            if(item.name === user_name)
                res = true
        })
        return res
    }

    getUserSafeInfo(user_name){
        var res = null
        this.players.forEach(function (item) {
            if(item.name === user_name) {
                res = {
                    id:item.id
                    ,name:item.name
                    ,money:item.money
                    ,picture:item.picture
                }
            }
        })
        return res
    }

    regUser(user_name, user_password, user_pic){
        var max_id = 0
        this.players.forEach(function (item) {
            if (item.id > max_id)
                max_id = item.id
        })
        let new_id = max_id + 1
        let new_user = {
            id: new_id,
            name: user_name,
            password: user_password,
            money: this.beginner_money,
            picture: user_pic
        }
        this.addPlayer(new_user)
        return new_user
    }

    setBaseFile(dt) {
        console.log("dt:",JSON.stringify({"players": dt} ))
        fs.writeFile (__dirname+'/players.json', JSON.stringify({"players": dt} ), function(err) {
            if (err) throw err;
        });
    }
    loadPlayersFromBase(){
        this.players = []
        var data = fs.readFileSync(__dirname+'/players.json', 'utf-8')
        data = JSON.parse(data)
        this.players = data
    }

}

module.exports = {PlayersBaseHolder}