class HomeScreen extends React.Component{
    constructor(props){
        super(props)

        this.props.socket.emit("getUserInfo", {token: getCookie("token")})
        this.props.socket.on("userInfoResponse", (data)=>{
            console.log(data)
        })
    }
    render(){
        var translationKey = this.props.translationKey

        return (
        <div className="homeScreen">
            <div id="title">
                <h1>OneLogin</h1>
                <h2>{translationKey["Slogan"]}</h2>
            </div>
            <div id="menu">
                <button onClick={()=>this.props.changeScreen("myAccount")} id="button1">
                    {translationKey["MyAccount"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen("connectedServices")} id="button2">
                    {translationKey["ConnectedServices"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen("aboutUs")} id="button3">
                    {translationKey["AboutUs"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen("logout")} id="button4">
                    {translationKey["Logout"]}
                </button>
            </div>
        </div>
        )
    }
}