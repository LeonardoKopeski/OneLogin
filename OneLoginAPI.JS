const axios = require('axios')

const urlRegEx = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
const serverUrl = "http://192.168.0.105:3000"

var apiToken

module.exports = {
    connect: async(token)=>{
        if(typeof token != "string" || token.length != 64){
            throw "Invalid API token" 
        }

        try{
            var res = await axios.post(serverUrl + '/api/validateApiToken', { apiToken: token })
            apiToken = token
            return "Ok"
        }catch(err){
            throw err.response.data
        }
    },
    generateFastLogin: async(returnTo)=>{
        if(typeof returnTo != "string" || !urlRegEx.test(returnTo)){
            throw "BadRequest" 
        }

        try{
            var res = await axios.post(serverUrl + '/api/generateLoginToken', { apiToken, returnTo })
            return {
                loginToken: res.data,
                url: serverUrl + "/fastLogin?loginToken="+res.data,
                returnMethod: "POST",
                returnUrl: returnTo
            }
        }catch(err){
            throw err.response.data
        }
    },
    getUserInfo: async(userToken)=>{
        if(typeof userToken != "string" || userToken.length != 32){
            throw "BadRequest" 
        }

        try{
            var res = await axios.post(serverUrl + '/api/getUserInfo', { apiToken, userToken })
            return res.data
        }catch(err){
            throw err.response.data
        }
    }
}