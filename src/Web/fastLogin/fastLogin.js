var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            infoRequested: false,
            userInfo: {},
        }

        const urlParams = new URLSearchParams(window.location.search)
        const loginToken = urlParams.get('loginToken')
        if(loginToken.length < 50||!loginToken){
            open("/login", "_SELF")
        }
        
        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({userInfo: {...res}})
            }else{
                open("/login?loginToken="+loginToken, "_SELF")
            }
        })

        socket.on("loginResponse", (res)=>{
            if(res.status == "ok"){
                postData(res.returnTo, {token: res.token})
            }
        })

        this.login = this.login.bind(this)
    }
    login(){
        const urlParams = new URLSearchParams(window.location.search)
        const loginToken = urlParams.get('loginToken')
        socket.emit("fastLogin", {token: getCookie("token"), loginToken: loginToken})
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const userInfo = this.state.userInfo
        
        if(userInfo.username == undefined){
            return <Spinner/>
        }else{
            return(
            <div className="fastLoginScreen">
                <header>
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <div id="account">
                    <h1>Entrar rapimente com OneLogin</h1>
                    <img src={userInfo.imageUrl || alternativePhoto} style={{borderColor: userInfo.highlightColor}} alt="image"/>
                    <h1 id="username">
                        @{userInfo.username}
                    </h1>
                    <button onClick={this.login}>{translation["Login"]}</button>
                </div>
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)