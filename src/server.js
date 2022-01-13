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
var uncompletedLogins = {}

// Import functions
const accounts = require("./Libraries/Accounts.js")
const APIs = require("./Libraries/APIs.js")
const mailer = require("./Libraries/Mailer.js")
const validateRequest = require("./Functions/ValidateRequest.js")
const regEx = require("./Functions/regEx.js")
const validateAPI = require("./Functions/ValidateApi.js")

// Simplify
const account = accounts.account
const API = APIs.api

// Middlewares
app.use(express.static('Web'))
app.use("/api", express.static('Api'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// Route the /verifyEmail
app.get("/verifyEmail", async(req, res)=>{
    var randomId = req.query.randomId//Get id on querystring
    if(Object.keys(unverifiedEmails).indexOf(randomId) == -1){//if this querystring doesn't exists
        res.send("Invalid Email, sorry!")//return error
        return
    }

    io.to(unverifiedEmails[randomId].socketId).emit("verifiedEmail", unverifiedEmails[randomId].token)//send a message

    if(unverifiedEmails[randomId].type == "ACCOUNT"){
        account.createAccount(unverifiedEmails[randomId].data)//create acount
    }else{
        API.createApi(unverifiedEmails[randomId].data)//create API
    }

    delete unverifiedEmails[randomId]//remove from the list
    res.send("Ok :)")//and return
})

// Route other pages
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/Web/home/index.html")
})
app.get("*", (req, res)=>{
    res.sendFile(__dirname + "/Web/notFound/index.html")
})

// API
app.post("/api/generateLoginToken", async(req, res)=>{
    var validRequest = validateRequest(req.body, {apiToken: "string", returnTo: regEx.url})
    if(!validRequest){
        res.send("BadRequest").status(400)
        return
    }

    var validApi = await validateAPI(req.body.apiToken, "LOGIN", API.getApi)
    if(validApi.code != 200){
        res.send(validApi.status).status(validApi.code)
        return
    }

    var token = API.generateToken(16)
    uncompletedLogins[token] = {
        apiToken: req.body.apiToken,
        returnTo: req.body.returnTo
    }

    setTimeout(() => {
        delete uncompletedLogins[token]
    }, 600000)

    res.send(token).status(200)
})

app.post("/api/getUserInfo", async(req, res)=>{
    var validRequest = validateRequest(req.body, {apiToken: "string", userToken: "string"})
    if(!validRequest){
        res.send("BadRequest").status(400)
        return
    }

    var validApi = await validateAPI(req.body.apiToken, "LOGIN", API.getApi)
    if(validApi.code != 200){
        res.send(validApi.status).status(validApi.code)
        return
    }

    var users = validApi.data.users
    var user = users[req.body.userToken]
    if(!user){
        res.send("UserNotFound").status(404)
        return
    }

    var accounts = await account.getAccount({token: user})
    var response = {
        username: accounts[0].username,
        imageUrl: accounts[0].imageUrl,
        verified: accounts[0].verified,
        highlightColor: accounts[0].highlightColor
    }

    if(validApi.data.permissions.indexOf("GETFRIENDLIST") != -1){
        response.friendList = []
        for(var following in accounts[0].following){// for each follow account
            var username = accounts[0].following[following]
            var friendAccount = await account.getAccount({username})// search for

            // and save on the list
            if(friendAccount[0] != undefined && friendAccount[0].following.indexOf(accounts[0].username) != -1){
                response.friendList.push({
                    username: friendAccount[0].username,
                    imageUrl: friendAccount[0].imageUrl,
                    verified: friendAccount[0].verified,
                    bio: friendAccount[0].bio,
                    highlightColor: friendAccount[0].highlightColor
                })
            }
        }
    }

    res.send(response).status(200)
})

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
        
        var random = account.generateToken(16)//Fake token
        unverifiedEmails[random] = {token: token, socketId: socket.id, type:"ACCOUNT", data:{
            username: obj.username,
            email: obj.email,
            password: obj.password,
            imageUrl: null,
            bio: "No bio yet",
            verified: false,
            following: [],
            notifications: [],
            token: token,
            highlightColor: "#5603AD",
            services: {}
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
        if(followAccount[0].following.indexOf(requester[0].username) != -1){
            return
        }

        var newNotification = {
            by: requester[0].username,
            type: "friendRequest",
            date: new Date,
            viewed: false,
            text: null
        }

        followAccount[0].update({
            notifications: [
                ...followAccount[0].notifications,
                newNotification
            ]
        })
    })
    socket.on("getLoginApiInfo", async(obj) => {
        var validRequest = validateRequest(obj, {loginToken: "string"})
        if(!validRequest){
            socket.emit("apiInfoResponse", {status: "InvalidRequest"})
            return
        }
    
        var loginInfo = uncompletedLogins[obj.loginToken]
        if(!loginInfo){
            socket.emit("apiInfoResponse", {status: "InvalidLoginToken"})
            return
        }
        var apis = await API.getApi({token: loginInfo.apiToken})

        const onLoginPermissions = {
            "LOGIN": "GetBasicData",
            "GETFRIENDLIST": "GetFriendList"   
        }

        var permissions = []
        apis[0].permissions.forEach(elm => {
            if(onLoginPermissions[elm] != undefined){
                permissions.push(onLoginPermissions[elm])
            }
        })
        
        socket.emit("apiInfoResponse", {
            status: "Ok",
            name: apis[0].name,
            permissions: permissions,
            termsUrl: apis[0].termsUrl
        })
    })
    socket.on("fastLogin", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", loginToken: "string"})
        if(!validRequest){
            socket.emit("loginResponse", {status: "InvalidRequest"})
            return
        }

        var loginInfo = uncompletedLogins[obj.loginToken]
        if(!loginInfo){
            socket.emit("loginResponse", {status: "InvalidLoginToken"})
            return
        }
        
        var accounts = await account.getAccount({token: obj.token})
        if(!accounts[0]){
            socket.emit("loginResponse", {status: "invalidAccount"})
            return
        }

        var subtoken

        if(accounts[0].services[loginInfo.apiToken] == undefined){
            var update = {...accounts[0].services}
            subtoken = account.generateToken(32)
            update[loginInfo.apiToken] = {subtoken}

            accounts[0].update({services: update})

            var apis = await API.getApi({token: loginInfo.apiToken})

            var update2 = {...apis[0].users}
            update2[subtoken] = accounts[0].token

            apis[0].update({users: update2})
        }else{
            subtoken = accounts[0].services[loginInfo.apiToken].subtoken
        }

        socket.emit("loginResponse", {status: "Ok", token: subtoken, returnTo: uncompletedLogins[obj.loginToken].returnTo})

        delete uncompletedLogins[obj.loginToken]
    })
    socket.on('loginApi', async(obj) => {
        var validRequest = validateRequest(obj, {apiToken: "string"})
        if(!validRequest){
            socket.emit("loginResponse", {status: "InvalidRequest"})
            return
        }

        var res = await API.getApi({apiToken: obj.apiToken})

        if(res[0] == undefined){
            socket.emit("loginResponse", {status: "NotFound"})
        }else{
            socket.emit("loginResponse", {status: "Ok", token: res[0].token})
        }
    })
    socket.on('registerApi', async(obj) => {
        var validRequest = validateRequest(obj, {name: regEx.username, email: regEx.email})
        if(!validRequest){
            socket.emit("registerResponse", {status: "InvalidRequest"})
            return
        }

        var nameQuery = await API.getApi({name: obj.name})
        var emailQuery = await API.getApi({email: obj.email})

        if(emailQuery[0] != undefined){
            socket.emit("registerResponse", {status: "EmailAlreadyUsed"})
            return
        }
        if(nameQuery[0] != undefined){
            socket.emit("registerResponse", {status: "NameAlreadyUsed"})
            return
        }

        var token = account.generateToken(64)//Real token
        
        var random = account.generateToken(16)//Fake token
        unverifiedEmails[random] = {token: token, socketId: socket.id, type:"API", data:{
            token: token,
            name: obj.name,
            createdIn: new Date(),
            permissions: [],
            verified: true,
            locked: false,
            users: {},
            termsUrl: "",
            email: obj.email
        }}

        //send email to verify
        var email = mailer.generateEmail("VerifyEmail", `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`)
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
    socket.on('getApiInfo', async(obj) => {
        var validRequest = validateRequest(obj, {apiToken: "string"})
        if(!validRequest){
            socket.emit("apiInfoResponse", {status: "InvalidRequest"})
            return
        }

        var apis = await API.getApi({token: obj.apiToken})
        if(apis[0]){
            var response = {
                name: apis[0].name,
                email: apis[0].email,
                verified: apis[0].verified,
                termsUrl: apis[0].termsUrl,
                token: apis[0].token
            }
            socket.emit("apiInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("apiInfoResponse", {status: "InvalidApiToken"})
        }
    })
    socket.on("updateApiName", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", name: regEx.username})
        if(!validRequest){ return }

        var nameQuery = await API.getApi({name: obj.name})
        if(nameQuery[0]){
            socket.emit("updateApiNameResponse", {status: "NameAlreadyUsed"})
            return
        }

        var apis = await API.getApi({token: obj.token})
        if(apis[0]){
            apis[0].update({name: obj.name})
            socket.emit("updateApiNameResponse", {status: "updated"})
        }
    })
    socket.on("updateTermsUrl", async(obj) => {
        var validRequest = validateRequest(obj, {token: "string", termsUrl: regEx.url})
        if(!validRequest){ return }

        var apis = await API.getApi({token: obj.token})
        if(apis[0]){
            apis[0].update({termsUrl: obj.termsUrl})
        }
    })
})

// Listen
var serverAddr
const PORT = process.env.PORT || 3000
http.listen(PORT, async()=>{
    console.log("Starting...")

    accounts.setSchema({
        username: String,
        email: String,
        password: String,
        token: String,
        imageUrl: String,
        bio: String,
        verified: Boolean,
        following: Array,
        notifications: Array,
        highlightColor: String,
        services: Object,
    })
    
    APIs.setSchema({
        token: String,
        name: String,
        createdIn: Date,
        permissions: Array,
        verified: Boolean,
        locked: Boolean,
        users: Object,
        termsUrl: String,
        email: String
    })

    // start the databases and email system
    await accounts.startDB("DB_ACCOUNTS")
    await APIs.startDB("DB_API")
    mailer.createTransporter()

    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
        serverAddr = addr
        console.log("Listening on "+serverAddr+":"+PORT)
    })
})