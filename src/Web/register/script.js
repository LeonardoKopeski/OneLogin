var socket = io()

socket.on("registerResponse", (res)=>{
    alert(res.status)
})

document.querySelector("input#btnSubmit").addEventListener("click", (ev)=>{
    ev.preventDefault()
    
    var username = document.querySelector("input#username").value
    var email = document.querySelector("input#email").value
    var password = document.querySelector("input#password").value

    socket.emit("register", {username, email, password})
})

document.querySelector("input#btnBack").addEventListener("click", ()=>{
    open("/login", "_SELF")
})