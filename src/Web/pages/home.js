class HomeScreen extends React.Component{
    render(){
        var translationKey = this.props.translationKey

        return (
        <div className="homeScreen">
            <div id="title">
                <h1>OneLogin</h1>
                <h2>{translationKey["Slogan"]}</h2>
            </div>
            <div id="menu">
                <button onClick={()=>this.props.changeScreen(this.props.logged ? "myAccount": "login")}>
                    {this.props.logged ? translationKey["MyAccount"] : translationKey["Login"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen(this.props.logged ? "connectedServices" : "register")}>
                    {this.props.logged ? translationKey["ConnectedServices"] : translationKey["Register"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen("aboutUs")}>
                    {translationKey["AboutUs"]}
                </button><br/>

                <button onClick={()=>this.props.changeScreen("logout")}>
                    {translationKey["Logout"]}
                </button>
            </div>
        </div>
        )
    }
}