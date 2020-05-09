class Encoder{
    static encodeJSON(someJSON){
        return this.encode(JSON.stringify(someJSON))
    }
    static decodeToJSON(str){
        return JSON.parse(this.decode(str))
    }
    static encode(str){
        let strArray = str.split('')
        let b = 0
        let bstr = ""
        return strArray.map(value => {
            bstr = ""
            b = value.charCodeAt(0)+113
            for (let j=0; j<4-this.countDigits(b); j++)
                bstr += 0
            return bstr += b
        }).join('')
    }
    static decode(str){
        if (str.length%4 !== 0)
            console.error("string is brioken! can't decode!")
        let strArr = []
        for (let i=0; i<str.length; i+=4)
            strArr.push(parseInt(str.slice(i, i+4)))
        return strArr.map(value => String.fromCharCode(value-113)).join('')
    }
    static countDigits(n) {
        for(var i = 0; n > 1; i++) {
            n /= 10;
        }
        return i;
    }
}
module.exports = {Encoder}