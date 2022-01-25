export function deleteCookie(name){
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/"
}

export function setCookie(name, value, days){
    const d = new Date()
    d.setTime(d.getTime() + (days*24*60*60*1000))
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
}

export function getCookie(name){
    name += "="
    var decodedCookie = decodeURIComponent(document.cookie)
    var ca = decodedCookie.split(';')
    for(var i = 0; i < ca.length; i++){
        var c = ca[i]
        while(c.charAt(0) === ' '){
            c = c.substring(1)
        }
        if(c.indexOf(name) === 0){
            return c.substring(name.length, c.length)
        }
    }
    return ""
}