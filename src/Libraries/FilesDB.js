// Library
const mongoose = require("mongoose")
require("dotenv").config()

// Variables
var schema = new mongoose.Schema({key: String, value: String})
var model
var conn

async function startDB(dotEnvName){
    conn = mongoose.createConnection(process.env[dotEnvName], {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })

    model = conn.model("files", schema)
}

// Classes
class file{
    constructor(data){
        Object.keys(data).forEach(key=>{
            this[key] = data[key]
        })
    }

    update(update){
        model.updateOne(this, update, ()=>{})
    }

    delete(){
        model.bulkWrite([{ deleteOne:{ filter: this} }])
        //</document>model.find(this).remove().exec()
    }

    static createFile(value){
        var token = ""
        for(var c = 0; c < 4;c++){
            token += Math.random().toString(36).substring(2)
        }
        var key = token.substring(0, 32)
        var res = new model({key, value})
        res.save()

        return new file({key, value})
    }

    static getFile(key){
        return new Promise((resolve, reject) => {
            model.find({key}, (err, response)=>{
                if(err){
                    reject(err)
                }else{
                    var res = []

                    response.forEach(elm=>{
                        var r = elm._doc
                        delete r.__v
                        delete r._id
                        res.push(new file(r))
                    })

                    resolve(res[0])
                }
            })
        })
    }
}

// Export
module.exports = {
    startDB,
    file
}