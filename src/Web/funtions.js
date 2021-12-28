const alternativePhoto = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Xdf9OyXn9BpWL30gb6cpyLnkiCCbSaH8wVB1007o9WpYBDgb6J1_afDQTdJuqwgE3xM&usqp=CAU"
const regEx = {
    email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    username: /^(.[a-z0-9_-]*)$/
}

async function sha256(message){
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))              
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/"
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