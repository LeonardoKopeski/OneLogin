// Bibliotecas
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Functions
const {startDB, account, setSchema} = require("./Libraries/Accounts.js")
const socketFunctions = require("./Functions/Sockets.js")
const RouteFunctions = require("./Functions/Routes.js")

// Main
socketFunctions(io, account)//Start socket
RouteFunctions(express, app)//Start routes

// Passa a ouvir a porta 3000
http.listen(3000, async()=>{
    setSchema({
        username: String,
        email: String,
        password: String,
        token: String
    })

    await startDB("DB_URI")

    console.log('listening on localhost:3000');
})