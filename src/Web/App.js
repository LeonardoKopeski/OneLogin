var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            screen: getScreen().path,
            logged: false,
            infoRequested: false,
            userInfo: {}
        }

        this.setScene = (screen) => {
            if(screen == "myAccount"){
                screen = "account/"+this.state.userInfo.username
            }
            open(screen, "_SELF")
        }

        socket.on("userInfoResponseByToken", (res)=>{
            if(res.status == "Ok"){
                this.setState({logged: true, userInfo: {...res}})
            }else{
                this.setState({logged: false})
            }
            socket.off("userInfoResponseByToken")
        })

        document.title = "OneLogin - "+this.state.screen
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfoByToken", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        switch (this.state.screen) {
            case "home":
                return <HomeScreen
                    changeScreen={this.setScene}
                    translationKey={translation}
                    logged={this.state.logged}
                    userInfo={this.state.userInfo}
                />
            case "login":
                return <LoginScreen
                    changeScreen={this.setScene}
                    translationKey={translation}
                    socket={socket}
                />
            case "register":
                return <RegisterScreen
                    changeScreen={this.setScene}
                    translationKey={translation}
                    socket={socket}
                />
            case "account":
                return <AccountScreen
                    changeScreen={this.setScene}
                    translationKey={translation}
                    socket={socket}
                    username={getScreen().args}
                />
            default:
                return <h1>{this.state.screen}</h1>
        }
    }
}

ReactDOM.render(<App />,root)