var testGame = require('./files/gameholder.js');
var roomsHolder = require('./files/roomholder.js');
var roomHolder = new roomsHolder.RoomHolder();
var room = new roomsHolder.Room('room1');
var sock_holder = require('./files/socketholder.js')
var socks = new sock_holder.SocketHolder()

testRoom()
//testGH()

function testRoom() {
    const actions = {
        check: "check"
        ,raise:"raise"
        ,fold:"fold"
        ,allin:"all in"
        ,leave:"leave"
    }
    room.addPlayer({name:'Kirill0', money:100})
    room.addPlayer({name:'Kirill1', money:100})
    console.log(room.game_holder.players)
    testRoomPlayerActs(actions.allin, "", 100)
    testRoomPlayerActs(actions.raise, "", 100)
    /*room.addPlayer({name:'Kirill2', money:100})
    room.addPlayer({name:'Kirill3', money:100})
    room.addPlayer({name:'Kirill4', money:100})*/

}

function testRoomPlayerActs(action, le_n="", val=-1) {
    console.log('\n')
    switch (action) {
        case "all in":
            console.log("lead all in", room.getLead())
            room.onAllIn(room.getLead())
            break
        case "check":
            console.log("lead check", room.getLead())
            room.onCheck(room.getLead())
            break
        case "raise":
            console.log("lead raise", room.getLead())
            room.onRaise(room.getLead(), val)
            break
        case "fold":
            console.log("lead fold", room.getLead())
            room.onFold(room.getLead())
            break
        case "leave":
            console.log("leaves", room.getLead())
            room.onPlayerLeaveInRoom(le_n)
            break
    }

    console.log(room.game_holder.players_in_game)
    console.log("bamk", room.game_holder.bank)
    console.log("EndGame?",room.checkEndGame())
}
function testTicker() {
    var ticker = new testGame.Ticker()
    let ticker_players = [
        {name:'Kirill0'},
        {name:'Kirill1'},
        {name:'Kirill2'},
        {name:'Kirill3'},
        {name:'Kirill4'}
    ]
    ticker.setPlayers(ticker_players)
    for(let i=0; i<20; i++){
        console.log("lead", ticker.getLeadPlayer())
        console.log("round", ticker.round_counter)
        console.log("tick", ticker.tickIfEnd())
        console.log("players:\n", ticker.players)
        if (i%6==0&&i!=0) ticker.removePlayerFromTicker("Kirill" + i/6)
        console.log("\n\n\n")
    }

    /*console.log("lead", ticker.getLeadPlayer())
    console.log("tick", ticker.tickIfEnd())
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:\n", ticker.players)
    console.log("tick", ticker.tickIfEnd())
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:\n", ticker.players)
    console.log("tick", ticker.tickIfEnd())
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:\n", ticker.players)
    console.log("tick", ticker.tickIfEnd())
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:\n", ticker.players)
    /*ticker.removePlayerFromTicker('Kirill1')
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:", ticker.players)
    ticker.removePlayerFromTicker('Kirill2')
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:", ticker.players)
    ticker.removePlayerFromTicker('Kirill3')
    console.log("lead", ticker.getLeadPlayer())
    console.log("players:", ticker.players)
    ticker.setReadyToFinish('Kirill0')
    console.log('who ready?', ticker.countReadToFinish())
    ticker.setReadyToFinish('Kirill4')
    console.log('who ready', ticker.countReadToFinish())
    console.log('all ready?', ticker.tickIfEnd())*/
}
function testRoomHolder() {
    //console.log(rooms.checkIfCanJoinRoom('room1'));
    //console.log(rooms.getAllRooms())
}
function testGH() {
    let gh_players = [
        {name:'Kirill0', money:100},
        {name:'Kirill1', money:100},
        {name:'Kirill2', money:100},
        {name:'Kirill3', money:100},
        {name:'Kirill4', money:100}
    ]
    const actions = {
        check: "check"
        ,raise:"raise"
        ,fold:"fold"
        ,allin:"all in"
        ,leave:"leave"
    }
    var gameHolder = new testGame.GameHolder(gh_players);

    if(gameHolder.checkIfCanStart()) gameHolder.start()
    //console.log(gameHolder.getCardsAfterStart())
    deck = gameHolder.getCardsAfterStart()
    console.log("deck", deck.deck)
    deck.players.forEach(function (item) {
        console.log(item)
    })

    console.log("Game: bank", gameHolder.bank, "rate", gameHolder.rate, "leading player", gameHolder.getLead())
    console.log("Order in what players act\n", gameHolder.ticker.getPlayerOrder())

    testGHPlayerActs(gameHolder, actions.check)
    testGHPlayerActs(gameHolder, actions.raise, gameHolder.rate+10)
    testGHPlayerActs(gameHolder, actions.leave, 0, gameHolder.getLead())
    testGHPlayerActs(gameHolder, actions.check)
    testGHPlayerActs(gameHolder, actions.fold)
    testGHPlayerActs(gameHolder, actions.check)
    testGHPlayerActs(gameHolder, actions.fold)
    testGHPlayerActs(gameHolder, actions.allin)
    testGHPlayerActs(gameHolder, actions.allin)

    /*console.log("\n\nRaise", gameHolder.getLead(), gameHolder.rate + 10)
    while (gameHolder.players_in_game.length > 3) {
        ///console.log(gameHolder.players_in_game)
        ///console.log("bank", gameHolder.bank, "rate", gameHolder.rate, "lead", gameHolder.getLead())
        ///console.log("\n\nCheck", gameHolder.getLead())
        if(!gameHolder.onCheck(gameHolder.getLead())) break
    }
    console.log('\n')
    console.log("leader log", gameHolder.getLead())
    console.log("in test:",gameHolder.players_in_game)
    console.log("in test:",gameHolder.ticker.players)

    console.log('\n')
    console.log("leader allin", gameHolder.getLead())
    if(!gameHolder.onAllIn(gameHolder.getLead())) console.log("GAME OVER!!!!!")
    console.log("in test:",gameHolder.players_in_game)
    console.log("in test:",gameHolder.ticker.players)

    console.log('\n')
    console.log("leader fold", gameHolder.getLead())
    if(!gameHolder.onFold(gameHolder.getLead())) console.log("GAME OVER!!!!!")
    console.log("in test:",gameHolder.players_in_game)
    console.log("in test:",gameHolder.ticker.players)

    console.log('\n')
    console.log("leader fold", gameHolder.getLead())
    if(!gameHolder.onFold(gameHolder.getLead())) console.log("GAME OVER!!!!!")
    console.log(gameHolder.players_in_game)
    console.log(gameHolder.ticker.players)*/
    /*console.log("Raise",gameHolder.getLead(), gameHolder.rate+10)
    gameHolder.onRaise(gameHolder.getLead(), gameHolder.rate+10)
    console.log(gameHolder.players_in_game)
    console.log("bank", gameHolder.bank, "rate", gameHolder.rate, "lead", gameHolder.getLead())

    console.log("Check",gameHolder.getLead(), gameHolder.rate)
    gameHolder.onCheck(gameHolder.getLead())
    console.log(gameHolder.players_in_game)
    console.log("bank", gameHolder.bank, "rate", gameHolder.rate, "lead", gameHolder.getLead())

    console.log("Fold",gameHolder.getLead())
    gameHolder.onFold(gameHolder.getLead())
    console.log(gameHolder.players_in_game)
    console.log("bank", gameHolder.bank, "rate", gameHolder.rate, "lead", gameHolder.getLead())*/
}
function testGHPlayerActs(gameHolder, action, val=null, name=null) {
    console.log('\n')
    switch (action) {
        case "all in":
            console.log("leader all in", gameHolder.getLead())
            if(!gameHolder.onAllIn(gameHolder.getLead())) console.log("GAME OVER!!!!!")
            break
        case "check":
            console.log("leader check", gameHolder.getLead())
            if(!gameHolder.onCheck(gameHolder.getLead())) console.log("GAME OVER!!!!!")
            break
        case "raise":
            console.log("leader raises", gameHolder.getLead(), "val", val)
            if(!gameHolder.onRaise(gameHolder.getLead(), val)) console.log("GAME OVER!!!!!")
            break
        case "fold":
            console.log("leader fold", gameHolder.getLead())
            if(!gameHolder.onFold(gameHolder.getLead())) console.log("GAME OVER!!!!!")
            break
        case "leave":
            console.log("who leaves", name)
            gameHolder.onPlayerLeaves(name)
            break
    }
    console.log("players in game:\n",gameHolder.players_in_game)
    console.log("players in ticker:\n",gameHolder.ticker.players)

}

//console.log(rooms.checkIfCanJoinRoom('room1'));
//console.log(rooms.getAllRooms())

