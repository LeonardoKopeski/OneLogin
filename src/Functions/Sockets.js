var regEx = {
    email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    username: /^(.[a-z0-9_-]*)$/
}

function validateResponse(res, expected){
    if(res == null){return false}

    var ok = true
    if(typeof res != "object"){ok = false}

    Object.keys(expected).forEach(key => {
        if(res[key] == null){ok = false}
        if(typeof expected[key] == "string"){
            if(typeof res[key] != expected[key]){ok = false}
        }else{
            if(!expected[key].test(res[key])){ok = false}
        }
        
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
            var validRequest = validateResponse(obj, {username: regEx.username, email: regEx.email, password: regEx.username})
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
                password: obj.password,
                imageUrl: null,
                bio: "No bio yet"
            }).token

            socket.emit("registerResponse", {status: "Created", token})            
        })
        socket.on('getUserInfoByToken', async(obj) => {
            var validRequest = validateResponse(obj, {token: "string"})
            if(!validRequest){
                socket.emit("userInfoResponseByToken", {status: "InvalidRequest"})
                return
            }

            var account = await accountsClass.getAccount({token: obj.token})
            if(account[0]){
                var response = {
                    username: account[0].username,
                    email: account[0].email,
                    imageUrl: account[0].imageUrl,
                    bio: account[0].bio
                }
                socket.emit("userInfoResponseByToken", {status: "Ok", ...response})
            }else{
                socket.emit("userInfoResponseByToken", {status: "InvalidToken"})
            }
        })
        socket.on('getUserInfo', async(obj) => {
            var validRequest = validateResponse(obj, {})
            if(!validRequest){
                socket.emit("userInfoResponse", {status: "InvalidRequest"})
                return
            }

            var account = await accountsClass.getAccount({...obj})
            if(account[0]){
                var response = {
                    username: account[0].username,
                    imageUrl: account[0].imageUrl,
                    bio: account[0].bio
                }
                socket.emit("userInfoResponse", {status: "Ok", ...response})
            }else{
                socket.emit("userInfoResponse", {status: "InvalidQuery"})
            }
        })
    })
}