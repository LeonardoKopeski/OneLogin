function getScreen(){
    var pathname = window.location.pathname.split("/")

    var path = pathname[1] || "home"
    var args = pathname[2] || null
    
    var validPath = ["home", "login", "register", "account"]

    if(validPath.indexOf(path) == -1){
        path = "notFound"
        args = null
    }
    
    return {path, args}
}

function setCookie(name, value, days) {
    const d = new Date()
    d.setTime(d.getTime() + (days*24*60*60*1000))
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
}

function getCookie(name) {
    name += "="
    var decodedCookie = decodeURIComponent(document.cookie)
    var ca = decodedCookie.split(';')
    for(var i = 0; i < ca.length; i++){
        var c = ca[i]
        while(c.charAt(0) == ' '){
            c = c.substring(1)
        }
        if(c.indexOf(name) == 0){
            return c.substring(name.length, c.length)
        }
    }
    return ""
}