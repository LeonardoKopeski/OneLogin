// Library
const mongoose = require("mongoose")
require("dotenv").config()

// Variables
var schema
var conn
var model

// Functions
function setSchema(obj){
    schema = new mongoose.Schema(obj)
}

async function startDB(dotEnvName){
    conn = mongoose.createConnection(process.env[dotEnvName], {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })

    model = conn.model("api", schema)
}

// Classes
class api{
    constructor(data){
        Object.keys(data).forEach(key=>{
            this[key] = data[key]
        })
    }

    update(update){
        model.updateOne(this, update, ()=>{})
    }

    static generateToken(len){
        var token = ""
        for(var c = 0; c < len/10;c++){
            token += Math.random().toString(36).substring(2)
        }
        return token.substring(0, len)
    }

    static createAPI(obj){
        var res = new model(obj)
        res.save()

        return new api(obj)
    }

    static getApi(query){
        return new Promise((resolve, reject) => {
            model.find(query, (err, response)=>{
                if(err){
                    reject(err)
                }else{
                    var res = []

                    response.forEach(elm=>{
                        var r = elm._doc
                        delete r.__v
                        delete r._id
                        res.push(new api(r))
                    })
    
                    resolve(res)
                }
            })
        })
    }
}

// Export
module.exports = {
    setSchema,
    startDB,
    api
}