'use strict';
var fs = require('fs');

class PlayersBaseHolder{
    constructor() {
        //this.fs = fs; //require('fs');
        this.players = [];
        this.name = "";
        this.setPlayers();
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item) {
            if(item.name == player_name)
                item.money = new_money
        })
    }

    setPlayers(){
        var data = fs.readFileSync(__dirname+'/players.json', 'utf-8');
        var words = JSON.parse(data);
        for (let i=0; i<words.players.length; i++)
            this.players.push(words.players[i]);
    }

    addPlayer(player){
        this.players.push(player);
    }

    authPlayer(player_name, player_password){
        var res = null;
        this.players.forEach(function (item, i, array) {
            //console.log("item name & msg.name:", item.name, msg.name);
            if (player_name == item.name && player_password== item.password) {
                res = item;
            }
        });
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