var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            usernameTriggered: false,
            emailTriggered: false,
            passwordTriggered: false,
            username: "",
            email: "",
            password: ""
        }
        
        socket.on("verifiedEmail", (res)=>{
            setCookie("token", res, 365)
            open("/dashboard", "_SELF")
        })

        socket.on("registerResponse", (res)=>{
            switch (res.status){
                case "Created":
                    alert("Now, verify your email!")
                    return
                case "EmailAlreadyUsed":
                    this.setState({emailTriggered: true})
                    alert("Email Already Used!")
                    return
                case "UsernameAlreadyUsed":
                    this.setState({usernameTriggered: true})
                    alert("Username Already Used!")
                    return
                default:
                    alert(res.status)
            }
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    async submit(){
        var username = this.state.username
        var email = this.state.email
        var password = this.state.password
        var ok = true

        if(!regEx.email.test(email)){
            this.setState({emailTriggered: true})
            ok = false
        }
        if(!regEx.username.test(username)){
            this.setState({usernameTriggered: true})
            ok = false
        }
        if(password.length < 5){
            this.setState({passwordTriggered: true})
            ok = false
        }

        if(ok){
            password = await sha256(password)
            socket.emit("register", {username, email, password})
        }
    }
    setValue(ev){
        var obj = {}
        obj[ev.target.id] = ev.target.value
        obj[ev.target.id + "Triggered"] = false
        this.setState(obj)
    }
    render(){
        return(
            <form className="loginScreen">
                <h1>OneLogin</h1>
                <h2>{translation["RegisterSubtitle"]}</h2>
                <input
                    style={{borderColor: this.state.usernameTriggered ? "#FA1133" : "#5603AD"}}
                    type="text"
                    id="username"
                    placeholder={translation["Username"]}
                    onKeyUp={this.setValue}
                /><br/>
                <input
                    style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                    type="email"
                    id="email"
                    placeholder={translation["Email"]}
                    onKeyUp={this.setValue}
                /><br/>
                <input
                    style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                    type="password"
                    id="password"
                    placeholder={translation["Password"]}
                    onKeyUp={this.setValue}
                /><br/>
                <input
                    type="button"
                    id="btnBack"
                    onClick={()=>open("/login", "_SELF")}
                    value={translation["Login"]}
                />
                <input
                    type="button"
                    id="btnSubmit"
                    value={translation["Register"]}
                    onClick={this.submit}
                />
            </form>
        )
    }
}

ReactDOM.render(<App />,root)