var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            apiTokenTriggered: false,
            apiToken: ""
        }

        socket.on("loginResponse", (res)=>{
            console.log(res)
            if(res.status == "Ok"){
                setCookie("apiToken", res.token)
                open("/api/dashboard", "_SELF")
            }else{
                alert(translation[res.status] || translation["UnknownError"])
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
        var apiToken = this.state.apiToken

        if(apiToken.length == 50){
            socket.emit("loginApi", {apiToken})
        }else{
            this.setState({apiTokenTriggered: true})
        }
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
                    <h2>Digite seu token de API</h2>
                    <input
                        style={{borderColor: this.state.apiTokenTriggered ? "#FA1133" : "#5603AD"}}
                        type="password"
                        id="apiToken"
                        placeholder={"Token de API"}
                        onKeyUp={this.setValue}
                    /><br/>
                    <a>Esqueci meu token de API</a><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>open("/api/register", "_SELF")}
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