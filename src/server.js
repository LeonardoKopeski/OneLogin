// Bibliotecas
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const cookieParser = require('cookie-parser')

// Variables
var unverifiedEmails = {}

// Functions
const {startDB, account, setSchema} = require("./Libraries/Accounts.js")
const mailer = require("./Libraries/Mailer.js")
const validateRequest = require("./Functions/ValidateRequest.js")
const regEx = require("./Functions/regEx.js")

// Routes
app.use(express.static('Web'))
app.use(cookieParser())
app.get("/verifyEmail", (req, res)=>{
    console.log(req.query.randomId)
    res.send("Ok?")
})

// Main
io.on('connection', (socket) => {
    socket.on('login', async(obj) => {
        var validRequest = validateRequest(obj, {email: regEx.email, password: "string"})
        if(!validRequest){
            socket.emit("loginResponse", {status: "InvalidRequest"})
            return
        }

        var res = await account.getAccount(obj)

        if(res[0] == undefined){
            socket.emit("loginResponse", {status: "NotFound"})
        }else{
            socket.emit("loginResponse", {status: "Ok", token: res[0].token})
        }
    })
    socket.on('register', async(obj) => {
        var validRequest = validateRequest(obj, {username: regEx.username, email: regEx.email, password: "string"})
        if(!validRequest){
            socket.emit("registerResponse", {status: "InvalidRequest"})
            return
        }

        var usernameQuery = await account.getAccount({username: obj.username})
        var emailQuery = await account.getAccount({email: obj.email})

        if(emailQuery[0] != undefined){
            socket.emit("registerResponse", {status: "EmailAlreadyUsed"})
            return
        }
        if(usernameQuery[0] != undefined){
            socket.emit("registerResponse", {status: "UsernameAlreadyUsed"})
            return
        }

        var token = account.createAccount({
            username: obj.username,
            email: obj.email,
            password: obj.password,
            imageUrl: null,
            bio: "No bio yet",
            confirmed: false
        }).token

        var random = Math.floor(Math.random() * 100000000000)
        unverifiedEmails[random] = {token: token, email: obj.email, socket: socket}
        var email = mailer.generateEmail("VerifyEmail", `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`)
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
    socket.on('getUserInfoByToken', async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){
            socket.emit("userInfoResponseByToken", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            var response = {
                username: accounts[0].username,
                email: accounts[0].email,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio
            }
            socket.emit("userInfoResponseByToken", {status: "Ok", ...response})
        }else{
            socket.emit("userInfoResponseByToken", {status: "InvalidToken"})
        }
    })
    socket.on('getUserInfo', async(obj) => {
        var validRequest = validateRequest(obj, {})
        if(!validRequest){
            socket.emit("userInfoResponse", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({...obj})
        if(accounts[0]){
            var response = {
                username: accounts[0].username,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio
            }
            socket.emit("userInfoResponse", {status: "Ok", ...response})
        }else{
            socket.emit("userInfoResponse", {status: "InvalidQuery"})
        }
    })
})

// Passa a ouvir o servidor
var serverAddr
const PORT = process.env.PORT || 3000
http.listen(PORT, async()=>{
    setSchema({
        username: String,
        email: String,
        password: String,
        token: String,
        imageUrl: String,
        bio: String,
        confirmed: Boolean
    })

    await startDB("DB_URI")
    mailer.createTransporter()

    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        serverAddr = add
        console.log("Listening on "+serverAddr+":"+PORT)
    })
})