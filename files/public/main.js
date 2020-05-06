var socket = io();
socket.on('getlobbies', (data)=>{
    console.log(data)
    let buf = "Lobbies available: "+data.rooms[0].name+ " with rate "+data.rooms[0].rate+" and "+data.rooms[1].name+ " with rate "+data.rooms[1].rate
    document.getElementById("server_responce").innerHTML = buf
})
$(function () {

    socket.emit('getlobbies')

    function sendReg() {
        let inp_val;
        inp_val = {
            name: document.getElementById("nameinp").value
            ,password: document.getElementById("pswinp").value
            ,picture: document.getElementById("picinp").value
        }
        socket.emit('registration', inp_val)
        //var a = document.getElementById("nameinp").value
        //s_responce.innerHTML = a
        console.log("sent:",inp_val)
    }

    /*socket.emit('getlobbies', {name:'Kirill', lobbyname: 'room1', password:'admin', picture: 1})


    $(document).on('click', 'button', function(){
        send()
    })

    var inp_val
    var button = document.getElementById("regbtn")
    button.addEventListener("click", () => {
        inp_val = {
            name: document.getElementById("nameinp").value
            ,password: document.getElementById("pswinp").value
            ,picture: document.getElementById("picinp").value
        }
        socket.emit('registration', inp_val)
        //var a = document.getElementById("nameinp").value
        //s_responce.innerHTML = a
        console.log("sent:",inp_val)
    })

    socket.on('registration', (data) => {
        console.log("got resp")
        console.log(data)
        document.getElementById("server_responce").innerHTML = data.toString()
        //if(!data.is_reg)
        //    console.log(data)
        //else
        //    console.log("didn't reg!")
    })

    document.getElementById("getlobbybtn").addEventListener("click", () => {
        socket.emit('getlobbies', {})
        socket.on('lobbies', (data) => {
            console.log("got responce")
            console.log("data:", data)
        })
    })
    //console.log("asdasd")





    //var me = { id:0, name:'Kirill', password:'admin', money:1000, picture:1 }
    //socket.emit('enterlobby', { lobbyname: 'room1', player: me });
    socket.on('enteredlobby', (data) => {
        socket.emit('yess', data);
    });
    //socket.emit('leavelobby', {lobbyname: 'room1', name: 'Kirill'})



    //var me = reg();
    //auth(me);
    function reg(){
        socket.emit('registration', info);
        socket.on('registration', function (data) {
            //socket.emit('yess', data);
            console.log("me:", data.player);
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
    }*/
});