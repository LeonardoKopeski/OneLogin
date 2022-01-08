/**
 * By: Leonardo Kopeski
 * Copyright: One Network - 2022
 * License: Creative Commons Zero Universal
 * Github: https://www.github.com/LeonardoKopeski/OneLogin
 */

// Import the libraries
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const cookieParser = require('cookie-parser')

// Create placeholder variables
var unverifiedEmails = {}

// Import functions
const {startDB, account, setSchema} = require("./Libraries/Accounts.js")
const mailer = require("./Libraries/Mailer.js")
const validateRequest = require("./Functions/ValidateRequest.js")
const regEx = require("./Functions/regEx.js")
const { response } = require('express')
const res = require('express/lib/response')

// Make the /Web public
app.use(express.static('Web'))
app.use(cookieParser())
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/Web/home/index.html")
})

// Route the /verifyEmail
app.get("/verifyEmail", async(req, res)=>{
    var randomId = req.query.randomId//Get id on querystring
    if(Object.keys(unverifiedEmails).indexOf(randomId) == -1){//if this querystring doesn't exists
        res.send("Invalid Email, sorry!")//return error
    }else{
        io.to(unverifiedEmails[randomId].socketId).emit("verifiedEmail", unverifiedEmails[randomId].token)//send a message

        account.createAccount(unverifiedEmails[randomId].data)//create acount

        delete unverifiedEmails[randomId]//remove from the list
        res.send("Ok :)")//and return
    }
})
// any url else, return /notFound
app.get("*",(req, res)=> res.redirect("/notFound"))

// Socket.io
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
            following: [],
            notifications: [],
            token: token,
            highlightColor: "#5603AD"
        }}

        //send email to verify
        var email = mailer.generateEmail("VerifyEmail", `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`)
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
    socket.on('getUserInfo', async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){
            socket.emit("userInfoResponse", {status: "InvalidRequest"})
            return
        }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            var friendList = []
            
            for(var following in accounts[0].following){// for each follow account
                var username = accounts[0].following[following]
                var friendAccount = await account.getAccount({username})// search for

                // and save on the list
                if(friendAccount[0] != undefined && friendAccount[0].following.indexOf(accounts[0].username) != -1){
                    friendList.push({
                        username: friendAccount[0].username,
                        imageUrl: friendAccount[0].imageUrl,
                        verified: friendAccount[0].verified,
                        bio: friendAccount[0].bio,
                    })
                }
            }

            var response = {
                username: accounts[0].username,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio,
                email: accounts[0].email,
                verified: accounts[0].verified,
                notifications: accounts[0].notifications,
                friendList: friendList,
                highlightColor: accounts[0].highlightColor
            }
            socket.emit("userInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("userInfoResponse", {status: "InvalidQuery"})
        }
    })
    socket.on("getBasicInfo", async(obj) => {
        var validRequest = validateRequest(obj, {username: "string"})
        if(!validRequest){
            socket.emit("basicInfoResponse", {status: "InvalidRequest"})
            return
        }

        //Get both accounts
        var accounts = await account.getAccount({...obj})
        var requester = await account.getAccount({token: obj.requester})

        if(accounts[0]){
            var response = {
                username: accounts[0].username,
                imageUrl: accounts[0].imageUrl,
                bio: accounts[0].bio,
                verified: accounts[0].verified,
                highlightColor: accounts[0].highlightColor,
                friendStatus: 0
            }

            if(requester[0]){
                var following = requester[0].following.indexOf(accounts[0].username) != -1
                var follower = accounts[0].following.indexOf(requester[0].username) != -1
                if(following && !follower){
                    response.friendStatus = 1
                }else if(!following && follower){
                    response.friendStatus = 2
                }else{
                    response.friendStatus = 3
                }
                if(requester[0].token == accounts[0].token){
                    response.friendStatus = 4
                }
            }

            socket.emit("basicInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("basicInfoResponse", {status: "InvalidQuery"})
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
    socket.on("updateHighlightColor", async(obj)=>{
        var validRequest = validateRequest(obj, {token: "string", color: regEx.color})
        if(!validRequest){ return }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            accounts[0].update({highlightColor: obj.color})
        }
    })
    socket.on("viewNotifications", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){ return }

        var accounts = await account.getAccount({token: obj.token})
        if(accounts[0]){
            // set all notification as viewed
            var notifications = accounts[0].notifications
            notifications = notifications.map(elm => {
                return {...elm, viewed: true}
            })
            accounts[0].update({notifications: notifications})
        }
    })
    socket.on("follow", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", follow: "string"})
        if(!validRequest){ return }

        // get both accounts
        var requester = await account.getAccount({token: obj.token})
        var followAccount = await account.getAccount({username: obj.follow})

        // if is the same person, don't do anything
        if(requester[0].token == followAccount[0].token){return}

        // else, add follow
        requester[0].update({
            following: [
                ...requester[0].following,
                followAccount[0].username
            ]
        })

        // and notify
        if(followAccount[0].following.indexOf(requester[0].username) == -1){
            followAccount[0].update({
                notifications: [
                    ...followAccount[0].notifications,
                    {
                        by: requester[0].username,
                        type: "friendRequest",
                        date: new Date,
                        viewed: false,
                        text: null
                    }
                ]
            })
        }
    })
})

// Listen
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
        following: Array,
        notifications: Array,
        highlightColor: String
    })

    // start the account database and email system
    await startDB("DB_ACCOUNTS")
    mailer.createTransporter()

    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
        serverAddr = addr
        console.log("Listening on "+serverAddr+":"+PORT)
    })
})