class GameHolder{
    constructor(players) {
        this.rate = 100
        this.players = players
        this.players_in_game = []
        this.isRunning = false
        this.cards_on_table = []
        this.players_cards = []
        this.lead = -1
        this.start = this.start.bind(this)
    }

    start(){
        this.isRunning = true;
        this.players_in_game = this.players

        this.lead = Math.floor(Math.random()*(this.players_in_game.length))

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
        var index_g = this.getPlayerIndexInGame(player_name)
        var index_a = this.getPlayerIndexInAll(player_name)
        this.players[index_a].money -= val
        this.players_in_game[index_g].money -= val
        if (this.players[index_a].money < 0 || this.players_in_game[index_g].money < 0)
            console.log("Player gets mins money!", player_name)
    }

    onCheck(player_name){
        var index = this.getPlayerIndexInGame(player_name)
        if(index != null && index == this.lead) {
            this.decreasePlayerMoney(player_name, this.rate)
            this.checkPlayerHasMoney(player_name)
        }
        this.changeLead()
    }

    onFold(player_name){
        var index = this.getPlayerIndexInGame(player_name)
        if(index != null && index == this.lead) this.players_in_game.splice(index, 1)
        this.changeLead()
    }

    onRaise(player_name, new_val){
        this.rate = val
        var index = this.getPlayerIndexInGame(player_name)
        if(index != null && index == this.lead) {
            this.decreasePlayerMoney(player_name, this.rate)
            this.checkPlayerHasMoney(player_name)
        }
        this.changeLead()
    }

    getLead(){
        return this.lead
    }

    onPlayerLeaves(player_name){
        if(this.isRunning) {
            var index = -1
            this.players_in_game.forEach(function (item, i) {
                if (item.playername == player_name)
                    index = i
            })
            if (index == this.lead)
                this.changeLead()
            this.players_in_game.splice(index, 1)

            this.players.forEach(function (item, i) {
                if (item.playername == player_name)
                    index = i
            })
            this.players.splice(index, 1)
        }else{
            this.players.forEach(function (item, i) {
                if (item.playername == player_name)
                    index = i
            })
            this.players.splice(index, 1)
        }
    }

    addPlayer(new_player){
        this.players.push(new_player)
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

    changeLead(){
        this.lead++
        if (this.lead >= this.players_in_game.length)
            this.lead = 0
    }

    getPlayerIndexInGame(player_name){
        var res = null
        this.players_in_game.forEach(function (item, i) {
            if(item.name.equals(player_name)){
                res = i
            }
        })
        return res
    }

    getPlayerIndexInAll(player_name){
        var res = null
        this.players.forEach(function (item, i) {
            if(item.name.equals(player_name)){
                res = i
            }
        })
        return res
    }

    checkPlayerHasMoney(player_name){
        var index = this.getPlayerIndexInGame(player_name)
        if(this.players_in_game[index].money <= 0 ){
            if(index!=null) this.players_in_game.splice(index, 1)
            return false
        }else{
            return true
        }
    }
}

module.exports = {GameHolder}