var socket = io()

socket.on("loginResponse", (res)=>{
    alert(res.status)
})

document.querySelector("input#btnSubmit").addEventListener("click", (ev)=>{
    ev.preventDefault()
    
    var email = document.querySelector("input#email").value
    var password = document.querySelector("input#password").value

    socket.emit("login", {email, password})
})

document.querySelector("input#btnBack").addEventListener("click", ()=>{
    open("/register", "_SELF")
})