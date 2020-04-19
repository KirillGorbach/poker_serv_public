$(function () {
    var socket = io();
    var info = {
        name: 'Leshia',
        password: 'dodik',
        picture: 1
    };
    var me = { id:0, name:'Kirill', password:'admin', money:1000, picture:1 }
    socket.emit('enterlobby', { lobbyname: 'room1', player: me });
    socket.on('enteredlobby', (data) => {
        socket.emit('yess', data);
    });
    socket.emit('leavelobby', {lobbyname: 'room1', name: 'Kirill'})



    //var me = reg();
    //auth(me);
    function reg(){
        socket.emit('registration', info);
        socket.on('registration', function (data) {
            socket.emit('yess', data);
            //console.log("me:", data.player);
            if (data.is_reg) {
                socket.emit('yess', "not thanks!");
                return {};
            } else {
                me = data.player
                console.log("me in function:", me);
                socket.emit('yess', "thanks!");
                auth(me);
                return data.player;
            }
        });
    }

    //socket.emit('yess', $me);
    //console.log("me out function:", me);
    function auth(me) {
        socket.emit('authenticate', {name: me.name, password: me.password});
        socket.on('authentication', function (data) {
            if (data.flag) {
                socket.emit('yess', "i authed!");
            } else {
                socket.emit('yess', 'i did not authed(');
            }
        });
    }
});