var __globaldirname = __dirname.substring(0, __dirname.length-9)

module.exports = (express, app)=>{
    app.use(express.static('Web'))
    app.get("/translationApi/translate.js", (req, res)=>{
        res.sendFile(__globaldirname + "/Translations/translate.js")
    })
}