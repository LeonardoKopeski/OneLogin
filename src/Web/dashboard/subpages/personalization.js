subpages["personalization"] = class extends React.Component{
    constructor(props){
        super(props)
        this.saveChanges = this.saveChanges.bind(this)
    }
    saveChanges(ev){
        console.log(ev.target.placeholder)
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
                <input className="value" onBlur={this.saveChanges} placeholder="username" defaultValue={this.props.userInfo.username}/>
            </li>
            <li>
                <span className="key">Bio</span>
                <input className="value" onBlur={this.saveChanges} placeholder="bio" defaultValue={this.props.userInfo.bio}/>
            </li>
            <li>
                <span className="key">Email</span>
                <span className="value">{this.props.userInfo.email}</span>
            </li>
            <li>
                <span className="key">Image</span>
                <input style={{display: "none"}} id="imageInput" name="imageInput" type="file"/>
                <label htmlFor="imageInput" className="value">
                    Change Profile Image
                </label>
            </li>
            <li>
                <span className="key">Highlight color</span>
                <input style={{display: "none"}} id="colorInput" name="colorInput" type="color"/>
                <label htmlFor="colorInput" className="value">
                    Change Highlight Color
                </label>
            </li>
        </ul>
        )
    }
}