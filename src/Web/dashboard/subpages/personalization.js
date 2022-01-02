subpages["personalization"] = class extends React.Component{
    constructor(props){
        super(props)
        this.saveChanges = this.saveChanges.bind(this)
        this.fileToBase64 = this.fileToBase64.bind(this)
    }
    async saveChanges(ev){
        var value = ev.target.type == "file" ? await this.fileToBase64(ev.target.files[0]) : ev.target.value

        switch (ev.target.id){
            case "bio":
                socket.emit("updateBio", {token: getCookie("token"), bio: value})
                break
            case "imageUrl":
                socket.emit("updateImage", {token: getCookie("token"), imageUrl: value})
                break
            default:
                break
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
                <span className="key">Username</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="username"
                    id="username"
                    defaultValue={this.props.userInfo.username}
                />
            </li>
            <li>
                <span className="key">Bio</span>
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
                <span className="key">Image</span>
                <input
                    style={{display: "none"}}
                    onChange={this.saveChanges}
                    id="imageUrl"
                    type="file"
                />
                <label htmlFor="imageUrl" className="value">
                    Change Profile Image
                </label>
            </li>
            <li>
                <span className="key">Highlight color</span>
                <input
                    style={{display: "none"}}
                    onChange={this.saveChanges}
                    id="highlightColor"
                    type="color"
                />
                <label htmlFor="highlightColor" className="value">
                    Change Highlight Color
                </label>
            </li>
        </ul>
        )
    }
}