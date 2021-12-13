function validateResponse(res, expected){
    if(res == null){return false}

    var ok = true
    if(typeof res != "object"){ok = false}

    Object.keys(expected).forEach(key => {
        if(res[key] == null){ok = false}
        if(typeof res[key] != expected[key]){ok = false}
    })
    
    return ok
}

module.exports = (io, accountsClass)=>{
    io.on('connection', (socket) => {
        socket.on('login', async(obj) => {
            var validRequest = validateResponse(obj, {email: "string", password: "string"})
            if(!validRequest){
                socket.emit("loginResponse", {status: "InvalidRequest"})
                return
            }

            var res = await accountsClass.getAccount(obj)

            if(res[0] == undefined){
                socket.emit("loginResponse", {status: "NotFound"})
            }else{
                socket.emit("loginResponse", {status: "Ok", token: res[0].token})
            }
        })
        socket.on('register', async(obj) => {
            var validRequest = validateResponse(obj, {username: "string", email: "string", password: "string"})
            if(!validRequest){
                socket.emit("registerResponse", {status: "InvalidRequest"})
                return
            }

            var usernameQuery = await accountsClass.getAccount({username: obj.username})
            var emailQuery = await accountsClass.getAccount({email: obj.email})

            if(emailQuery[0] != undefined){
                socket.emit("registerResponse", {status: "EmailAlreadyUsed"})
                return
            }
            if(usernameQuery[0] != undefined){
                socket.emit("registerResponse", {status: "UsernameAlreadyUsed"})
                return
            }

            var token = accountsClass.createAccount({
                username: obj.username,
                email: obj.email,
                password: obj.password
            })

            socket.emit("registerResponse", {status: "Created", token})            
        })
    })
}