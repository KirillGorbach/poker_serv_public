'use strict';
var fs = require('fs');

class PlayersBaseHolder{
    constructor() {
        //this.fs = fs; //require('fs');
        this.players = [];
        this.name = "";
        this.loadPlayersFromBase();
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item) {
            if(item.name === player_name)
                item.money = new_money
        })
    }

    loadPlayersFromBase(){
        this.players = []
        var data = fs.readFileSync(__dirname+'/players.json', 'utf-8');
        var words = JSON.parse(data);
        for (let i=0; i<words.players.length; i++)
            this.players.push(words.players[i]);
    }

    addPlayer(player){
        this.players.push(player);
    }

    authPlayer(player_name, player_password){
        var res = null
        this.players.forEach(function (item, i, array) {
            //console.log("item name & msg.name:", item.name, msg.name);
            if (player_name === item.name && player_password === item.password)
                res = item
        })
        return res;
    }

    getPayers(){
        return this.players;
    }

    save(){
        this.setBaseFile(this.players);
    }

    setBaseFile(dt) {
        console.log("dt:",JSON.stringify({"players": dt} ))
        fs.writeFile (__dirname+'/players.json', JSON.stringify({"players": dt} ), function(err) {
            if (err) throw err;
        });
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
        var res = {}
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
        let new_player = {
            id: new_id,
            name: user_name,
            password: user_password,
            money: beginner_money,
            picture: user_pic
        }
        return new_player
    }
}



/*
function gf() {
    var result = []
    result = fs.readFile(__dirname+'/files/players.json',function(err,content){
        var r = []
        var parseJson = JSON.parse(content);
        //console.log("parseJSON:", parseJson);
        for (let i=0; i<parseJson.players.length; i++){
            r.push(parseJson.players[i])
           // console.log("pareJSON:",parseJson.players[i])
        }
        console.log("in rf: ",r);
        return r;

    });
    console.log("result:", result);
    return result;
}*/


class A{
    constructor() {
        console.log("constr!");
    }
    say(){
        console.log("hello!");
    }

}
module.exports = {A, PlayersBaseHolder}