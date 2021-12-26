const alternativePhoto = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Xdf9OyXn9BpWL30gb6cpyLnkiCCbSaH8wVB1007o9WpYBDgb6J1_afDQTdJuqwgE3xM&usqp=CAU"

class AccountScreen extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            accountInfo: {},
            infoRequested: false,
        }

        this.props.socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({accountInfo: {...res}})
            }else{
                this.setState({accountInfo: {}})
            }
            this.props.socket.off("userInfoResponse")
        })
    }
    componentDidMount(){
        if(!this.state.infoRequested){
            this.props.socket.emit("getUserInfo", {username: getScreen().args})
            this.setState({infoRequested: true})
        }
    }
    render(){
        var translationKey = this.props.translationKey
        var accountInfo = this.state.accountInfo

        return (
        <div className="accountScreen">
            <img src={accountInfo.imageUrl || alternativePhoto} alt="image"/>
            <h1 id="username">@{accountInfo.username || "User not found"}</h1>
            <button>Editar Perfil</button>
            <p id="bio">"{accountInfo.bio || "No bio yet"}"</p>
        </div>
        )
    }
}