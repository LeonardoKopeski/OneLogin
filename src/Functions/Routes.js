var __globaldirname = __dirname.substring(0, __dirname.length-9)

module.exports = (express, app, cookieParser)=>{
    app.use(express.static('Web'))
    app.use(cookieParser())
    app.get("*", (req, res)=>{
        res.sendFile(__globaldirname + "/Web/index.html")
    })
}