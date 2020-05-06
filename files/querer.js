var connparam = {
    user: 'tuser',
    host: '127.0.0.1',
    port: 5432,
    database: 'pldb',
    password: 'admin'
}
const { Pool } = require('pg')
const pool = new Pool({connectionString: "postgres://tuser:admin@127.0.0.1:5432/pldb"})//process.env.DATABASE_URL})
function query (text, params, callback){
        return pool.query(text, params, (err, res) => {
            callback(err, res)
        })
}


function loader(){
    query('create table if not exists usrs (dt json);', null, (err, res) => {
        if (err){
            console.log(err.stack)
        }
        load()
    })
}
function load(flag = true) {
    if (flag) {
        query('select * from usrs;', null, (err, res) => {
            if (err) {
                console.log(err.stack)
            }
            //console.log("load: result:", res.rows)
            var main = require('./index')
            main.mainfunc(res.rows)
        })
    }else
        query('select * from usrs;', null, (err, res) => {
            if (err) {
                console.log(err.stack)
            }
            //console.log("load: result:", res.rows)
        })
}

function setter(someJSON){
    query('delete from usrs;', (err, res) => {
        if (err){
            console.log(err.stack)
        }
        //load(false)
    })
    set(someJSON)
}
function set(someJSON){
    query('insert into usrs values ($1);', [JSON.stringify(someJSON)], (err, res) => {
        if (err){
            console.log(err.stack)
        }
        //load(false)
    })
}

module.exports = {loader, setter}

