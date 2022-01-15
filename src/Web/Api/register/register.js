var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            nameTriggered: false,
            emailTriggered: false,
            name: "",
            email: ""
        }
        
        socket.on("verifiedEmail", (res)=>{
            setCookie("apiToken", res)
            open("/api/dashboard", "_SELF")
        })

        socket.on("registerResponse", (res)=>{
            switch (res.status){
                case "Created":
                    alert("Ok, mas agora verifique seu email!")
                    return
                case "EmailAlreadyUsed":
                    this.setState({emailTriggered: true})
                    alert("Este email já foi usado, que tal fazer login?")
                    return
                case "NameAlreadyUsed":
                    this.setState({nameTriggered: true})
                    alert("Nome já usado")
                    return
                default:
                    alert("Erro desconhecido, tente mais tarde!")
            }
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    async submit(){
        var name = this.state.name
        var email = this.state.email
        var ok = true

        if(!regEx.email.test(email)){
            this.setState({emailTriggered: true})
            ok = false
        }
        if(!regEx.username.test(name)){
            this.setState({nameTriggered: true})
            ok = false
        }

        if(ok){
            socket.emit("registerApi", {name, email})
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
            <div className="loginScreen">
                <header>
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin <span className="apiTag">API</span></h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <form>
                    <h1>OneLogin <span className="apiTag">API</span></h1>
                    <h2>Crie sua API!</h2>
                    <input
                        style={{borderColor: this.state.nameTriggered ? "#FA1133" : "#5603AD"}}
                        type="text"
                        id="name"
                        placeholder={"Nome da API"}
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                        type="email"
                        id="email"
                        placeholder="Email"
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>open("/api/login", "_SELF")}
                        value="Login"
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value="Registrar-se"
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}

ReactDOM.render(<App />,root)