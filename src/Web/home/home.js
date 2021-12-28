var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            logged: false,
            infoRequested: false,
            userInfo: {}
        }

        socket.on("userInfoResponseByToken", (res)=>{
            if(res.status == "Ok"){
                this.setState({logged: true, userInfo: {...res}})
            }else{
                this.setState({logged: false})
            }
            socket.off("userInfoResponseByToken")
        })
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfoByToken", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const logged = getCookie("token") != ""
        var setScreen = (screen) => {
            if(screen == "myAccount"){
                screen = "account?user="+this.state.userInfo.username
            }
            open("/"+screen, "_SELF")
        }

        if(this.state.userInfo.username == undefined){
            return <Spinner/>
        }

        return (
        <div className="homeScreen">
            <div id="title">
                <h1>OneLogin</h1>
                <h2>{translation["Slogan"]}</h2>
            </div>
            <div id="menu">
                <button onClick={()=>setScreen(logged ? "myAccount": "login")}>
                    {logged ? translation["MyAccount"] : translation["Login"]}
                </button><br/>

                <button onClick={()=>setScreen(logged ? "connectedServices" : "register")}>
                    {logged ? translation["ConnectedServices"] : translation["Register"]}
                </button><br/>

                <button onClick={()=>setScreen("aboutUs")}>
                    {translation["AboutUs"]}
                </button><br/>

                <button onClick={()=>setScreen("logout")}>
                    {translation["Logout"]}
                </button>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)