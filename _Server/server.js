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
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
// Create placeholder variables
var unverifiedEmails = {}
var uncompletedLogins = {}

// Import functions
const accounts = require("./Libraries/Accounts.js")
const APIs = require("./Libraries/APIs.js")
const mailer = require("./Libraries/Mailer.js")
const filesDB = require("./Libraries/FilesDB.js")
const {accountSchema, apiSchema, splitSchema} = require("./Libraries/Schemas.js")

const validateRequest = require("./Functions/ValidateRequest.js")
const regEx = require("./Functions/regEx.js")
const validateAPI = require("./Functions/ValidateApi.js")
const routeAllPages = require("./Functions/Routes.js")

// Simplify
const account = accounts.account
const API = APIs.api

// Routes
routeAllPages(__dirname, express, app, {
    getFile: filesDB.file.getFile,
    getUnverifiedEmails: ()=>unverifiedEmails,
    deleteUnverifiedEmail: (id)=> delete unverifiedEmails[id],
    createAccount: accounts.account.createAccount,
    createAPI: APIs.api.createAPI,
    io: io
})

// API
app.post("/api/generateLoginToken", async(req, res)=>{
    var validRequest = validateRequest(req.body, {apiToken: "string", returnTo: regEx.url})
    if(!validRequest){
        res.status(400).send("BadRequest")
        return
    }

    var validApi = await validateAPI(req.body.apiToken, "LOGIN", API.getApi)
    if(validApi.code != 200){
        res.status(validApi.code).send(validApi.status)
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

    res.status(200).send(token)
})

app.post("/api/getUserInfo", async(req, res)=>{
    var validRequest = validateRequest(req.body, {apiToken: "string", userToken: "string"})
    if(!validRequest){
        res.status(400).send("BadRequest")
        return
    }

    var validApi = await validateAPI(req.body.apiToken, "LOGIN", API.getApi)
    if(validApi.code != 200){
        res.status(validApi.code).send(validApi.status)
        return
    }

    var users = validApi.data.users
    var user = users[req.body.userToken]
    if(!user){
        res.status(404).send("UserNotFound")
        return
    }

    var accounts = await account.getAccount({token: user})
    var response = splitSchema(accountSchema, accounts[0], "basicInfo")
    response.imageUrl = response.imageUrl?`http://${serverAddr}:${PORT}/files?fileId=${response.imageUrl}`:null

    var canGetFriendList = await validateAPI(req.body.apiToken, "GETFRIENDLIST", API.getApi, accounts[0])
    if(canGetFriendList.code == 200){
        response.friendList = []
        for(var following in accounts[0].following){// for each follow account
            var username = accounts[0].following[following]
            var friendAccount = await account.getAccount({username})// search for

            // and save on the list
            if(friendAccount[0] != undefined && friendAccount[0].following.indexOf(accounts[0].username) != -1){
                var friend = splitSchema(accountSchema, friendAccount[0], "basicInfo")
                friend.imageUrl = friend.imageUrl?`http://${serverAddr}:${PORT}/files?fileId=${friend.imageUrl}`:null
    
                response.friendList.push(friend)
            }
        }
    }

    res.status(200).send(response)
})

app.post("/api/validateApiToken", async(req, res)=>{
    var validRequest = validateRequest(req.body, {apiToken: "string"})
    if(!validRequest){
        res.status(400).send("BadRequest")
        return
    }

    var validApi = await validateAPI(req.body.apiToken, null, API.getApi)
    if(validApi.code != 200){
        res.status(validApi.code).send(validApi.status)
    }else{
        res.status(200).send("Found")
    }
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
            services: {},
            accountTier: 0
        }}

        //send email to verify
        var email = mailer.generateEmail("verifyEmail", {link: `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`})
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
                    var res = splitSchema(accountSchema, friendAccount[0], "basicInfo")
                    res.imageUrl = res.imageUrl?`http://${serverAddr}:${PORT}/files?fileId=${res.imageUrl}`:null
                    friendList.push(res)
                }
            }

            var response = splitSchema(accountSchema, accounts[0], "visibleInfo")
            response.imageUrl = response.imageUrl?`http://${serverAddr}:${PORT}/files?fileId=${response.imageUrl}`:null
            response.friendList = friendList
            
            var apis = await API.getApi({vinculatedAccount: obj.token})
            response.hasApi = apis.length != 0

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
            var response = splitSchema(accountSchema, accounts[0], "basicInfo")
            response.imageUrl = response.imageUrl?`http://${serverAddr}:${PORT}/files?fileId=${response.imageUrl}`:null

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
            if(accounts[0].imageUrl){
                var oldImg = await filesDB.file.getFile(accounts[0].imageUrl)
                oldImg.delete()
            }
            var key = filesDB.file.createFile(obj.imageUrl).key
            accounts[0].update({imageUrl: key})
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

        if(requester[0].following.indexOf(followAccount[0].username) == -1){
            // else, add follow
            requester[0].update({
                following: [
                    ...requester[0].following,
                    followAccount[0].username
                ]
            })
        }else{
            // case already is following, unfollow
            var update = [...requester[0].following]
            var index = update.indexOf(followAccount[0].username)

            update.splice(index, 1);

            requester[0].update({
                following: [update]
            })
        }

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

        // If not logged
        if(accounts[0].services[loginInfo.apiToken] == undefined){
            subtoken = account.generateToken(32)
        }else{
            subtoken = accounts[0].services[loginInfo.apiToken].subtoken
        }

        // Update the Api
        var apis = await API.getApi({token: loginInfo.apiToken})

        var apiUpdate = {...apis[0].users}
        apiUpdate[subtoken] = accounts[0].token

        apis[0].update({users: apiUpdate})

        // And the account
        var accountUpdate = {...accounts[0].services}
        accountUpdate[loginInfo.apiToken] = {
            subtoken: subtoken,
            acceptedPermissions: apis[0].permissions
        }

        accounts[0].update({services: accountUpdate})

        socket.emit("loginResponse", {status: "Ok", token: subtoken, returnTo: uncompletedLogins[obj.loginToken].returnTo})

        delete uncompletedLogins[obj.loginToken]
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
    socket.on('getApiInfo', async(obj) => {
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){
            socket.emit("apiInfoResponse", {status: "InvalidRequest"})
            return
        }

        var apis = await API.getApi({vinculatedAccount: obj.token})
        if(apis[0]){
            var response = {
                name: apis[0].name,
                verified: apis[0].verified,
                termsUrl: apis[0].termsUrl,
                token: apis[0].token,
                users: Object.keys(apis[0].users || {}).length,
                permissions: apis[0].permissions,
                locked: apis[0].locked,
                token: apis[0].token
            }
            socket.emit("apiInfoResponse", {status: "Ok" ,...response})
        }else{
            socket.emit("apiInfoResponse", {status: "InvalidToken"})
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

        var apis = await API.getApi({vinculatedAccount: obj.token})
        if(apis[0]){
            apis[0].update({termsUrl: obj.termsUrl})
        }
    })
    socket.on("disconnectApiUsers", async(obj)=>{
        var validRequest = validateRequest(obj, {token: "string"})
        if(!validRequest){ return }

        var apis = await API.getApi({vinculatedAccount: obj.token})
        if(apis[0]){
            Object.keys(apis[0].users).forEach(async(key)=>{
                var accounts = await account.getAccount({token: apis[0].users[key]})
                var update = {...accounts[0].services}
                delete update[apis[0].token]
                accounts[0].update({services: update})
            })
            apis[0].update({users: {}})
        }
    })
    socket.on("toogleApiLock", async(obj)=>{
        var validRequest = validateRequest(obj, {token: "string", state: "boolean"})
        if(!validRequest){ return }

        var apis = await API.getApi({vinculatedAccount: obj.token})
        if(apis[0]){
            apis[0].update({locked: obj.state})
        }
    })
    socket.on('createAPI', async(obj) => {
        var validRequest = validateRequest(obj, {name: regEx.username, password: "string", token: "string"})
        if(!validRequest){
            socket.emit("createAPIResponse", {status: "InvalidRequest"})
            return
        }

        var apiQuery = await API.getApi({name: obj.name})
        var accountQuery = await account.getAccount({token: obj.token})
        var apiQuery2 = await API.getApi({vinculatedAccount: obj.token})

        if(apiQuery[0] != undefined){
            socket.emit("createAPIResponse", {status: "NameAlreadyUsed"})
            apiQuery2[0].update({name: obj.name})
            return
        }
        if(apiQuery2[0] != undefined){
            socket.emit("createAPIResponse", {status: "AccountAlreadyUsed"})
            return
        }
        if(accountQuery[0] == undefined){
            socket.emit("createAPIResponse", {status: "InvalidRequest"})
            return
        }

        if(accountQuery[0].password != obj.password){
            socket.emit("createAPIResponse", {status: "InvalidPassword"})
            return
        }

        API.createAPI({
            token: API.generateToken(64),
            name: obj.name,
            createdIn: new Date(),
            permissions: [],
            verified: true,
            locked: false,
            users: new Object(),
            termsUrl: "",
            email: obj.email,
            vinculatedAccount: obj.token
        })

        socket.emit("createAPIResponse", {status: "Created"})            
    })

    socket.on('forgotPassword', async(obj) => {
        var validRequest = validateRequest(obj, {email: regEx.email})
        if(!validRequest){return}

        var user = account.getAccount({email: obj.email})
        if(!user[0]){return}

        var random = account.generateToken(16)//Fake token
        uncompletedPasswordReset[random] = {token: user[0].token, socketId: socket.id}

        //send email to verify
        var email = mailer.generateEmail("verifyEmail", {link: `http://${serverAddr}:${PORT}/verifyEmail?randomId=${random}`})
        mailer.sendEmail(obj.email, email)

        socket.emit("registerResponse", {status: "Created"})            
    })
})

// Listen
console.log("Starting...")

var serverAddr
const PORT = process.env.PORT || 4000
http.listen(PORT, "0.0.0.0", async()=>{
    accounts.setSchema(splitSchema(accountSchema, "type"), { minimize: false })
    APIs.setSchema(splitSchema(apiSchema, "type"), { minimize: false })

    // start the databases and email system
    await accounts.startDB("DB_ACCOUNTS")
    await APIs.startDB("DB_API")
    await filesDB.startDB("DB_FILES")
    mailer.createTransporter()

    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
        serverAddr = "localhost"//addr
        console.log("Listening on http://"+serverAddr+":"+PORT)
    })
})