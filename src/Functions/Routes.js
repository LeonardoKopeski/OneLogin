const cookieParser = require('cookie-parser')

module.exports = (dirname, express, app, sharedVariables)=>{
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(cookieParser())

    app.use("/", express.static(dirname + '/Web'))
    app.use("/", express.static(dirname + '/Web/Main'))
    app.use("/api", express.static(dirname + '/Web/Api'))
    app.use("/admin", express.static(dirname + '/Web/Admin'))

    app.get("/files", async(req, res)=>{
        if(!req.query.fileId){
            res.send()
            return
        }
        
        var fileQuery = await sharedVariables.getFile(req.query.fileId)
        if(fileQuery == undefined){
            res.send()
            return
        }
    
        var file = fileQuery.value
        if(file){
            var type = file.substring(5, file.length).split(";")[0]
            var base64 = file.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
            var img = Buffer.from(base64, 'base64')
    
            res.writeHead(200, {
                'Content-Type': type,
                'Content-Length': img.length
            })
    
            res.end(img)
        }else{
            res.send("")
        }
    })

    app.get("/verifyEmail", async(req, res)=>{
        var randomId = req.query.randomId//Get id on querystring
        var unverifiedEmails = sharedVariables.getUnverifiedEmails()
        if(Object.keys(unverifiedEmails).indexOf(randomId) == -1){//if this querystring doesn't exists
            res.send("Invalid Email, sorry!")//return error
            return
        }
    
        sharedVariables.io.to(unverifiedEmails[randomId].socketId).emit("verifiedEmail", unverifiedEmails[randomId].token)//send a message
    
        if(unverifiedEmails[randomId].type == "ACCOUNT"){
            sharedVariables.createAccount(unverifiedEmails[randomId].data)//create acount
        }else{
            sharedVariables.createApi(unverifiedEmails[randomId].data)//create API
        }
    
        sharedVariables.deleteUnverifiedEmail(randomId)//remove from the list
        res.send("Ok :)")//and return
    })

    app.get("/", (req, res)=>{
        res.sendFile(dirname + "/Web/Main/home/index.html")
    })
    app.get("/api", (req, res)=>{
        res.redirect("/api/login")
    })

    app.get("*", (req, res)=>{
        res.sendFile(dirname + "/Web/_notFound/index.html")
    })
}