var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            accountInfo: {},
            myUsername: null,
            infoRequested: false,
        }

        socket.on("userInfoResponse", (res)=>{
            socket.off("userInfoResponse")
            this.setState({accountInfo: {...res}})
        })
        socket.on("userInfoResponseByToken", (res)=>{
            socket.off("userInfoResponseByToken")
            this.setState({myUsername: res.username})
        })
    }
    componentDidMount(){
        if(!this.state.infoRequested){
            const urlParams = new URLSearchParams(window.location.search)
            const user = urlParams.get('user')
            socket.emit("getUserInfoByToken", {token: getCookie("token")})//Get my data
            socket.emit("getUserInfo", {username: user})//Get user data
            this.setState({infoRequested: true})
        }
    }
    render(){
        var accountInfo = this.state.accountInfo

        var me = this.state.myUsername == this.state.accountInfo.username

        if(accountInfo.status != "Ok"){
            return <h1>User not found</h1>
        }

        return (
        <div className="accountScreen">
            <img src={accountInfo.imageUrl || alternativePhoto} alt="image"/>
            <h1 id="username">@{accountInfo.username}</h1>
            <button className={!me ? "colored": ""}>
                {me ? translation["EditProfile"] : translation["AddAsFriend"]}
            </button>
            <p id="bio">"{accountInfo.bio}"</p>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)