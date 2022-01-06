var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            emailTriggered: false,
            passwordTriggered: false,
            email: "",
            password: ""
        }

        socket.on("loginResponse", (res)=>{
            if(res.status == "Ok"){
                setCookie("token", res.token, 365)
                open("/dashboard", "_SELF")
            }else{
                alert(translation[res.status + "Account"] || translation["UnknownError"])
            }
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    setValue(ev){
        var obj = {}
        obj[ev.target.id] = ev.target.value
        obj[ev.target.id + "Triggered"] = false
        this.setState(obj)
    }
    async submit(){
        var email = this.state.email
        var password = this.state.password
        var ok = true

        if(!regEx.email.test(email)){
            this.setState({emailTriggered: true})
            ok = false
        }
        if(password.length < 5){
            this.setState({passwordTriggered: true})
            ok = false
        }

        if(ok){
            password = await sha256(password)
            socket.emit("login", {email, password})
        }
    }
    render(){
        return(
            <div className="loginScreen">
                <header>
                    <div id="logo">
                        <h1>OneLogin</h1>
                        <h2>By One Network</h2>
                    </div>
                </header>
                <form>
                    <h1>OneLogin</h1>
                    <h2>{translation["LoginSubtitle"]}</h2>
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
                    <a>{translation["ForgotenPassword"]}</a><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>open("/register", "_SELF")}
                        value={translation["Register"]}
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value={translation["Login"]}
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}

ReactDOM.render(<App />,root)