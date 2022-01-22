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
                const returnTo = new URLSearchParams(window.location.search).get('returnTo')
                open(location.origin + (returnTo || "/dashboard"), "_SELF")
            }else{
                alert("Email e/ou senha invalidos!")
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
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <form>
                    <h1>OneLogin</h1>
                    <h2>Faça login na sua conta!</h2>
                    <input
                        style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                        type="email"
                        id="email"
                        placeholder="Email"
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                        type="password"
                        id="password"
                        placeholder="Senha"
                        onKeyUp={this.setValue}
                    /><br/>
                    <a>Esqueci minha senha!</a><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>open("/register", "_SELF")}
                        value="Registrar-se"
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value="Login"
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}

ReactDOM.render(<App />,root)