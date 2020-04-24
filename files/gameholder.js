class GameHolder{
    constructor(players) {
        this.bank = 0
        this.rate = 20
        this.players = players
        this.players_in_game = []
        this.isRunning = false
        this.cards_on_table = []
        this.players_cards = []
        this.ticker = new Ticker()
        this.isFinished = false
    }

    start(){
        this.bank = 0
        this.isRunning = true
        this.isFinishing = false
        for (let i=0; i<this.players.length; i++)
            this.players_in_game.push(this.players[i])

        this.ticker.reset()
        this.ticker.setPlayers(this.players_in_game)

        var deck = this.getTheDeck();
        var number_of_cards_need = this.players_in_game.length*2+5;
        var deck_made = [];
        while(deck_made.length < number_of_cards_need){
            let new_card = this.getRandomCard(deck);
            if(deck_made.indexOf(new_card) == -1){
                deck_made.push(new_card);
            }
        }
        for (let i=0; i<5; i++)
            this.cards_on_table.push(deck_made[i]);

        for (let i=0; i<this.players_in_game.length; i++)
            this.players_cards.push({ playername: this.players_in_game[i].name, cards: [ deck_made[5+2*i], deck_made[5+2*i+1] ] });
    }

    decreasePlayerMoney(player_name, val){
        if(val != -1) {
            var index_g = this.getPlayerIndexInGame(player_name)
            var index_a = this.getPlayerIndexInAll(player_name)
            //console.log("this.players_in_game[index_g].money", this.players_in_game[index_g].money)
            //this.players[index_a].money -= val

            this.players_in_game[index_g].money -= val

            //console.log("this.players_in_game[index_g].money", this.players_in_game[index_g].money)
            //console.log("this.players[index_g].money", this.players[index_a].money)
            if (this.players[index_a].money < 0 || this.players_in_game[index_g].money < 0)
                console.log("<----------ACHTUNG! Player gets mins money!", player_name)
        }else{
            var index_g = this.getPlayerIndexInGame(player_name)
            var index_a = this.getPlayerIndexInAll(player_name)
            this.players_in_game[index_g].money = 0
            if (this.players[index_a].money < 0 || this.players_in_game[index_g].money < 0)
                console.log("<----------ACHTUNG! Player gets mins money!", player_name)
        }
    }

    onAllIn(player_name){
        //console.log("in AllIn player_name", player_name)
        if(this.isRunning) {
            var index = this.getPlayerIndexInGame(player_name)
            if (index != null && player_name == this.ticker.getLeadPlayer()) {

                this.bank += this.players_in_game[index].money
                this.decreasePlayerMoney(player_name, -1) // -1 - код, забирающий все деньги

                this.ticker.setReadyToFinish(player_name)
                //console.log(this.ticker.players)
                if(this.ticker.tickIfEnd()){
                    this.endProcedure()
                    return false
                }else {
                    this.checkPlayerHasMoney(player_name)
                    if(this.ticker.wasNewRound()) this.deleteEmptyPlayers()
                    return this.checkPlayerMoneyRight(player_name)
                }
            }else
                return false
        }else
            return false
    }

    onCheck(player_name){
        if(this.isRunning) {
            if (player_name == this.ticker.getLeadPlayer()) {
                this.decreasePlayerMoney(player_name, this.rate)
                this.bank += this.rate
                if(this.players[this.getPlayerIndexInGame(player_name)].money == 0) this.ticker.setReadyToFinish(player_name)
                if (this.ticker.tickIfEnd()){
                    this.endProcedure()
                    return false
                }else {
                    if(this.ticker.wasNewRound()) this.deleteEmptyPlayers()
                    return this.checkPlayerMoneyRight(player_name)
                }
            }else
                return false
        }else
            return false
    }

    onFold(player_name){
        if(this.isRunning) {
            if (player_name == this.ticker.getLeadPlayer()) {
                this.ticker.setReadyToFinish(player_name)
                if (this.ticker.tickIfEnd()) {
                    this.endProcedure()
                    return false
                }else {
                    if(this.ticker.wasNewRound()) this.deleteEmptyPlayers()
                    return this.checkPlayerMoneyRight(player_name)
                }
            }else
                return false
        }else
            return false
    }

    onRaise(player_name, new_val){
        if(this.isRunning) {
            if(new_val != null && !isNaN(new_val)) this.rate = new_val
            else console.log("ACHTUNG! None or null new val in raise player", player_name)

            var index = this.getPlayerIndexInGame(player_name)
            if (index != null) {
                if(this.checkPlayerHasMoney(player_name)) {
                    this.decreasePlayerMoney(player_name, this.rate)
                    this.bank += this.rate
                    if(this.players[this.getPlayerIndexInGame(player_name)].money == 0) this.ticker.setReadyToFinish(player_name)
                }
                if (this.ticker.tickIfEnd()) {
                    this.endProcedure()
                    return false
                }else {
                    if(this.ticker.wasNewRound()) this.deleteEmptyPlayers()
                    return this.checkPlayerMoneyRight(player_name)
                }
            }else
                return false
        }else
            return false
    }

    getLead(){
        return this.ticker.getLeadPlayer()
    }

    onPlayerLeaves(player_name){
        if(this.isRunning) {
            this.ticker.removePlayerFromTicker(player_name)
            let index = this.getPlayerIndexInGame(player_name)
            if (index != null) this.players_in_game.splice(index, 1)
            let index1 = this.getPlayerIndexInAll(player_name)
            if (index1 != null) this.players.splice(index1, 1)
        }else{
            var index = this.getPlayerIndexInAll(player_name)
            if (index != null) this.players.splice(index, 1)
        }
    }

    addPlayer(new_player){
        if(!this.isRunning) this.players.push(new_player)
    }

    getCardsOnTable(){
        return this.cards_on_table;
    }

    getPlayerCards(player_name){
        var res = null;
        console.log(this.players_cards)
        res = this.players_cards.filter(i => i.playername == player_name)
        console.log(res)
        return res!=[]?res[0].cards:null

    }

    checkIfCanStart(){
        if(this.players.length > 1 && this.players.length <= 5)
            return true;
        else
            return false;
    }

    getCardsAfterStart(){
        return {deck:this.cards_on_table, players: this.players_cards}
    }

    getTheDeck(){
        var all_cards = [];
        var counter = 0;
        for (let i=1; i<=4; i++)
            for (let j=2; j<=14; j++){
                all_cards.push(i*100+j);
            }
        return all_cards;
    }

    getRandomCard(deck){
        var card_id = Math.floor(Math.random()*52);
        return deck[card_id];
    }

    getPlayerIndexInGame(player_name){
        var res = null
        this.players_in_game.forEach(function (item, i) {
            if(item.name == player_name){
                res = i
            }
        })
        return res
    }

    getPlayerIndexInAll(player_name){
        var res = null
        this.players.forEach(function(item, i) {
            if(item.name == player_name){
                res = i
            }
        })
        return res
    }

    checkPlayerHasMoney(player_name){
        var index = this.getPlayerIndexInGame(player_name)
        if(this.players_in_game[index].money <= 0 && this.ticker.wasNewRound()){
            if(index!=null) this.players_in_game.splice(index, 1)
            this.ticker.removePlayerFromTicker(player_name)
            return false
        }else{
            return true
        }
    }

    checkPlayerMoneyRight(player_name){
        var index = this.getPlayerIndexInGame(player_name)
        if (index != null) {
            if (this.players_in_game[index].money >= 0) {
                //console.log("money right",player_name, this.players_in_game[index].money);
                return true
            } else {
                //console.log("money not right",player_name, this.players_in_game[index].money);
                return false
            }
        }else{
            return true
        }
        return null
    }

    endProcedure(){
        this.isFinished = true
        let winners = []
        for (let i=0; i<this.players_in_game.length; i++){
            let buffer = this.players_in_game[i]
            winners.push(buffer)
        }
        console.log("Ending game! Winners:", winners)
    }
    getIsFinished(){ return this.isFinished }

    deleteEmptyPlayers(){
        var indexes_to_delete = []
        for(let i=0; i<this.players_in_game.length; i++){
            let isToDelete = true
            for(let j=0; j<this.ticker.players.length; j++){
                if(this.players_in_game[i].name == this.ticker.players[j])
                    isToDelete = false
            }
            if(isToDelete) {
                this.players_in_game.splice(i, 1)
                i--
            }
        }
    }

}

class Ticker{
    constructor() {
        this.players = []
        this.lead_player = -1
        this.round_counter = 0
        this.round_changed = false
    }
    reset(){
        this.players = []
        this.lead_player = -1
        this.round_counter = 0
    }

    setPlayers(players_in_g){
        for (let i=0; i<players_in_g.length; i++)
            this.players.push({ name:players_in_g[i].name, done:false, ready_to_finish: false })
        this.lead_player = Math.floor(Math.random()*(this.players.length))
    }
    getLeadPlayer(){
        //console.log("<----------------------------", this.lead_player)
        if(this.hasPlayers())
            return this.players[this.lead_player].name
        else
            return null
    }
    removePlayerFromTicker(player_name){
        var index = this.getPlayerIndex(player_name)
        //console.log("    removing", player_name)
        //console.log("           Removing: Old lead", this.players[this.lead_player].name)
        if(index != null) {
            //console.log("<-----lead now", this.players[this.lead_player].name, "removing", this.players[index].name)
            if(index < this.lead_player)
                this.lead_player--
            if(index == this.lead_player && index == this.players.length-1)
                this.lead_player--
            this.players.splice(index, 1)
            if(this.checkIfRoundDone())
                this.newRound()
        }
        //console.log("           Removing: New lead", this.players[this.lead_player].name)
    }
    changeLeadPlayer(){
        this.lead_player ++

        if (this.lead_player >= this.players.length) {
            this.lead_player = 0
        }
    }
    newRound(){
        this.players.forEach(function (item) {
            item.done = false
        })
        for(let i=0; i<this.players.length; i++)
            if(this.players[i].ready_to_finish) {
                if(this.lead_player>i)
                    this.lead_player--

                //console.log(this.players)
                //console.log("removing", this.players[i], i, "lead", this.players[this.lead_player].name)
                this.players.splice(i, 1)
                i--
                //console.log("lead", this.lead_player)
                //console.log(this.players)
            }
        this.round_counter++
    }
    tickIfEnd(){
        if(this.hasPlayers()) {
            if(this.round_changed)
                this.round_changed = false
            var res = false
            this.players[this.lead_player].done = true
           // console.log("      Old lead", this.players[this.lead_player])
            this.changeLeadPlayer()
            //console.log("      New lead", this.players[this.lead_player])
            if (this.countReadToFinish() >= this.players.length || this.players.length == 1)
                res = true
            if (this.checkIfRoundDone() && !res) {
                this.newRound()
                this.round_changed = true
            }
            //console.log("tickdone")
            return res
        }else
            return false
    }

    getPlayerIndex(player_name){
        var res = null
        this.players.forEach(function (item, i) {
            if(item.name == player_name)
                res = i
        })
        return res
    }
    checkIfRoundDone(){
        var res = true
        this.players.forEach(function (item) {
            if(!item.done)
                res = false
        })
        return res
    }
    setReadyToFinish(player_name){
        let index = this.getPlayerIndex(player_name)
        if(index != null) this.players[index].ready_to_finish = true
    }
    countReadToFinish(){
        return this.players.filter(i=>i.ready_to_finish).length
    }

    hasPlayers(){
        return this.players.length > 0;
    }
    wasNewRound(){ return this.round_changed }
    getPlayerOrder(){
        let order = []
        for(let i=0; i<this.players.length; i++){
            order.push({name:this.players[i].name, number: i})
        }
        return {order: order}
    }
}

module.exports = {GameHolder, Ticker}