function getNewToken(){
    let result = ""
    let b
    //for (let i=20; i<175; i++)
    //    console.debug(i, String.fromCharCode(i))
    for (let i=0; i<5; i++){
        b = Math.floor(Math.random()*42+48)
        if ((b>47&&b<91)||(b>96&&b<124))
            result += String.fromCharCode(Math.floor(Math.random()*42+48))
    }
    //console.debug(result)
    return result
}
module.exports = {getNewToken}