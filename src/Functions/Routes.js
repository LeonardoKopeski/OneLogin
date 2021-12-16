var __globaldirname = __dirname.substring(0, __dirname.length-9)

module.exports = (express, app, cookieParser)=>{
    app.use(express.static('Web'))
    app.use(cookieParser())
    app.get("/translationApi/translate.js", (req, res)=>{
        res.sendFile(__globaldirname + "/Translations/translate.js")
    })
    app.get("/translationApi/translationKey", (req, res)=>{
        var lang = "ptbr"
        res.sendFile(__globaldirname + "/Translations/"+lang+".json")
    })
}