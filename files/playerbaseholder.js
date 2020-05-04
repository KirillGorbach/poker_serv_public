    'use strict';
var fs = require('fs');
var postgres = require('pg')
var baseclient = new postgres.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})


class PlayersBaseHolder{
    constructor() {
        //this.fs = fs; //require('fs');
        this.players = [];
        this.name = "";
        this.loadPlayersFromBase();
        this.beginner_money = 100
        baseclient.connect()
        this.checkDBTable()
    }

    checkDBTable(){
        baseclient.query('create table if not exists u (dt jsonb);', (err, res) => {
            if (err){
                console.log("database error! init")
                throw err;
            }
        })
        console.log("successfully init table")
    }

    updatePlayerMoney(player_name, new_money){
        this.players.forEach(function (item) {
            if(item.name === player_name)
                item.money = new_money
        })
        this.save()
    }

    loadPlayersFromBase(){
        this.players = []
        //var data = fs.readFileSync(__dirname+'/players.json', 'utf-8');
        var data = {}
        baseclient.query('select dt from u;', (err, val)=>{
            if (err){
                console.log("database error! read")
                throw err;
            }
            for (let row in val.rows){
                data = JSON.parse(row)
            }
        })
        var words = data //JSON.parse(data);
        for (let i=0; i<words.players.length; i++)
            this.players.push(words.players[i]);
        console.log("successfully read table")
    }

    addPlayer(player){
        this.players.push(player);
        this.save()
    }

    authPlayer(player_name, player_password){
        var res = null
        this.players.forEach(function (item) {
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
        baseclient.query('update u set d = '+dt, (err, res)=>{
            if (err){
                console.log("database error! save")
                throw err;
            }
        })
        console.log("successfully save table")
        //console.log("dt:",JSON.stringify({"players": dt} ))
        //fs.writeFile (__dirname+'/players.json', JSON.stringify({"players": dt} ), function(err) {
        //    if (err) throw err;
        //});
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