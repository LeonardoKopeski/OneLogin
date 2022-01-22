subpages["personalization"] = class extends React.Component{
    constructor(props){
        super(props)

        this.props.socket.on("updateUsernameResponse", ({status})=>{
            var input = document.querySelector("input#username")
            if(status == "updated"){
                this.props.userInfo.username = input.value
                this.props.forceUpdate()
            }else{
                input.value = this.props.userInfo.username
                input.focus()
                alert("Este nome de usuário já existe!")
            }
        })

        this.saveChanges = this.saveChanges.bind(this)
        this.fileToBase64 = this.fileToBase64.bind(this)
    }
    componentDidMount(){
        document.querySelector("#highlightColor").addEventListener("change", this.saveChanges, false)
    }
    async saveChanges(ev){
        var value = ev.target.type == "file" ? await this.fileToBase64(ev.target.files[0]) : ev.target.value

        if(this.props.userInfo[ev.target.id] == value){ return }

        switch (ev.target.id){
            case "bio":
                socket.emit("updateBio", {token: getCookie("token"), bio: value})
                break
            case "imageUrl":
                socket.emit("updateImage", {token: getCookie("token"), imageUrl: value})
                break
            case "username":
                socket.emit("updateUsername", {token: getCookie("token"), username: value})
                break
            case "highlightColor":
                socket.emit("updateHighlightColor", {token: getCookie("token"), color: value})
                break
            default:
                return
        }

        this.props.userInfo[ev.target.id] = value
        this.props.forceUpdate()
    }
    fileToBase64(file){
        return new Promise((resolve)=>{
            reduceFileSize(file, 500*1024, 750, 750, 3, async blob => {
                getBase64(blob).then(resolve)
            })
        })
    }
    render(){
        return (
        <ul className="personalizationSubpage">
            <li id="header">
                <div onClick={()=>this.props.changeScreen("home")}>
                    {this.props.returnSVG}
                </div>
                <h2>
                    Personalização
                </h2>
            </li>
            <li>
                <span className="key">Nome de usuário</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="username"
                    id="username"
                    defaultValue={this.props.userInfo.username}
                />
            </li>
            <li>
                <span className="key">Biografia</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="bio"
                    id="bio"
                    defaultValue={this.props.userInfo.bio}
                />
            </li>
            <li>
                <span className="key">Email</span>
                <span className="value">{this.props.userInfo.email}</span>
            </li>
            <li>
                <span className="key">Foto de perfil</span>
                <input
                    style={{display: "none"}}
                    onChange={this.saveChanges}
                    id="imageUrl"
                    type="file"
                />
                <label htmlFor="imageUrl" className="value">
                    Trocar foto de perfil
                </label>
            </li>
            <li>
                <span className="key">Cor de destaque</span>
                <input
                    style={{display: "none"}}
                    id="highlightColor"
                    type="color"
                    defaultValue={this.props.userInfo.highlightColor}
                />
                <label htmlFor="highlightColor" className="value">
                     Mudar minha cor de destaque
                </label>
            </li>
        </ul>
        )
    }
}