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
app.get("*",(req, res)=> res.redirect("/notFound") )
app.get("/verifyEmail", async(req, res)=>{
    var randomId = req.query.randomId
    if(Object.keys(unverifiedEmails).indexOf(randomId) == -1){
        res.send("Invalid Email, sorry!")
    }else{
        io.to(unverifiedEmails[randomId].socketId).emit("verifiedEmail", unverifiedEmails[randomId].token)

        var accounts = await account.getAccount({token: unverifiedEmails[randomId].token})
        accounts[0].update({confirmed: true})

        delete unverifiedEmails[randomId]
        res.send("Ok :)")
    }
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
            confirmed: false,
            verified: false
        }).token

        var random = Math.floor(Math.random() * 100000000000)
        unverifiedEmails[random] = {token: token, email: obj.email, socketId: socket.id}
        var email = mailer.generateEmail("VerifyEmail", `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`)
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
    socket.on('getUserInfo', async(obj, query) => {
        var validRequest = validateRequest(obj, {})
        if(!validRequest){
            socket.emit("userInfoResponse", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({...obj, confirmed: obj.confirmed || true})
        if(accounts[0]){
            var response = {
                username: accounts[0].username,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio,
                verified: accounts[0].verified
            }
            socket.emit("userInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("userInfoResponse", {status: "InvalidQuery"})
        }
    })
    socket.on("updateUserInfo", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){
            socket.emit("userInfoResponseByToken", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            var data = {
                username: obj.username || accounts[0].username,
                imageUrl: obj.imageUrl || accounts[0].imageUrl,
                bio: obj.bio || accounts[0].bio,
                verified: accounts[0].verified
            }

            accounts[0].update(data)
        }
    })
})

// Passa a ouvir o servidor
var serverAddr
const PORT = process.env.PORT || 3000
http.listen(PORT, async()=>{
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        serverAddr = add
        console.log("Listening on "+serverAddr+":"+PORT)
    })

    setSchema({
        username: String,
        email: String,
        password: String,
        token: String,
        imageUrl: String,
        bio: String,
        confirmed: Boolean,
        verified: Boolean
    })

    await startDB("DB_URI")
    mailer.createTransporter()
})