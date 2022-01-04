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
app.get("/verifyEmail", async(req, res)=>{
    var randomId = req.query.randomId
    if(Object.keys(unverifiedEmails).indexOf(randomId) == -1){
        res.send("Invalid Email, sorry!")
    }else{
        io.to(unverifiedEmails[randomId].socketId).emit("verifiedEmail", unverifiedEmails[randomId].token)

        account.createAccount(unverifiedEmails[randomId].data)

        delete unverifiedEmails[randomId]
        res.send("Ok :)")
    }
})
app.get("*",(req, res)=> res.redirect("/notFound") )

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

        var token = account.generateToken(32)//Real token
        
        var random = account.generateToken(20)//Fake token
        unverifiedEmails[random] = {token: token, socketId: socket.id, data:{
            username: obj.username,
            email: obj.email,
            password: obj.password,
            imageUrl: null,
            bio: "No bio yet",
            verified: false,
            friendList: [],
            notifications: [],
            token: token
        }}

        var email = mailer.generateEmail("VerifyEmail", `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`)
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
    socket.on('getUserInfo', async(obj) => {
        var validRequest = validateRequest(obj, {})
        if(!validRequest){
            socket.emit("userInfoResponse", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({...obj})
        if(accounts[0]){
            var friendList = []
            
            for(var friend in accounts[0].friendList){
                var username = accounts[0].friendList[friend]
                var friendAccount = await account.getAccount({username})
                
                friendList.push({
                    username: friendAccount[0].username,
                    imageUrl: friendAccount[0].imageUrl,
                    verified: friendAccount[0].verified,
                    bio: friendAccount[0].bio,
                })
            }

            var response = {
                username: accounts[0].username,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio,
                email: accounts[0].email,
                verified: accounts[0].verified,
                notifications: accounts[0].notifications,
                friendList: friendList
            }
            socket.emit("userInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("userInfoResponse", {status: "InvalidQuery"})
        }
    })
    socket.on("updateBio", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", bio: "string"})
        if(!validRequest){ return }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            accounts[0].update({bio: obj.bio})
        }
    })
    socket.on("updateUsername", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", username: regEx.username})
        if(!validRequest){ return }

        var usernameQuery = await account.getAccount({username: obj.username})
        if(usernameQuery[0]){
            socket.emit("updateUsernameResponse", {status: "UsernameAlreadyUsed"})
            return
        }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            accounts[0].update({username: obj.username})
            socket.emit("updateUsernameResponse", {status: "updated"})
        }
    })
    socket.on("updateImage", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", imageUrl: "string"})
        if(!validRequest){ return }

        var imageBytes = encodeURI(obj.imageUrl).split(/%..|./).length - 1
        if(imageBytes > 500*1024){ return }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            accounts[0].update({imageUrl: obj.imageUrl})
        }
    })
    socket.on("viewedNotifications", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){ return }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            var notifications = accounts[0].notifications
            notifications = notifications.map(elm => {
                return {...elm, viewed: true}
            })
            accounts[0].update({notifications: notifications})
        }
    })
})

// Passa a ouvir o servidor
var serverAddr
const PORT = process.env.PORT || 3000
http.listen(PORT, async()=>{
    console.log("Starting...")

    setSchema({
        username: String,
        email: String,
        password: String,
        token: String,
        imageUrl: String,
        bio: String,
        verified: Boolean,
        friendList: Array,
        notifications: Array,
    })

    await startDB("DB_URI")
    mailer.createTransporter()
    
    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
        serverAddr = addr
        console.log("Listening on "+serverAddr+":"+PORT)
    })
})