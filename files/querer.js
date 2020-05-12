const { Pool } = require('pg')
let dburl = process.env.DATABASE_URL
let locl = "postgres://tuser:admin@127.0.0.1:5432/pldb"
//пул запросов (иначе - подключение к базе данных
const pool = new Pool({connectionString: dburl})
//шаблонная функция для краткости
function query (text, params, callback){
        return pool.query(text, params, (err, res) => {
            callback(err, res)
        })
}
/*

    В JavaScript есть такое поятие, как промисы - маленькие асинхронные
    функции, которые не могут ничего выводить, но по завершению могут вызвать
    другой код. Вернуть значение - результат промиса нельзя.

    Как правило, запрос к бд делается отдельно для каждого клиента,
    поэтому создатели библиотеки pg (официальной и единственной, насколько я знаю)
    сделали все запросы на промисах - это быстро и легковесно.
    Но в моей программе требуется последующая обработка результатов,
    поэтому я навесил на промис запросов к бд т.н. "колбэк" - вызав другой
    функции после исполнения (это нормальная практика).

    Поэтому index.js сначала вызывает loader(), который проверяет наличие необходимой таблицы,
    колбэком делает запрос на получения пользователей и колбэком вызывает основную
    функцию (запуск сервера).
    Запись в бд не требует возвращения результатов, поэтому setter() не вызывает колбэком другие функции.
    Запись производится в два этапа: удаление старой базы (до последнего чтения сервером бд)
    и добавления нового элемента. Функция setter() вызывается только из класса playerbaseholder.

    Можно, в последствии, заменить хранение всей базы в оперативной памяти на нормальное общение с бд,
    но это усложнит структуру кода.
    В настоящий момент база игроков фиксируется одной json-записью в таблице usrs.

 */

function loader(){
    query('create table if not exists usrs (dt json);', null, (err, res) => {
        if (err){
            console.log(err.stack)
        }
        query('select * from usrs;', null, (err, res) => {
            if (err) {
                console.log(err.stack)
            }
            //console.log("load: result:", res.rows)
            var main = require('./index')
            main.mainfunc(res.rows)
        })
    })
}
function setter(someJSON){
    query('delete from usrs;', (err, res) => {
        if (err){
            console.log(err.stack)
        }
        query('insert into usrs values ($1);', [JSON.stringify(someJSON)], (err, res) => {
            if (err){
                console.log(err.stack)
            }
        })
    })
}

module.exports = {loader, setter}

