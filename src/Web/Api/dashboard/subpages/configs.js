subpages["configs"] = class extends React.Component{
    constructor(props){
        super(props)

        this.props.socket.on("updateApiNameResponse", ({status})=>{
            var input = document.querySelector("input#name")
            if(status == "updated"){
                this.props.apiInfo.name = input.value
                this.props.forceUpdate()
            }else{
                input.value = this.props.apiInfo.name
                input.focus()
                alert("Este nome de usuário já existe!")
            }
        })

        this.saveChanges = this.saveChanges.bind(this)
    }
    async saveChanges(ev){
        var value = ev.target.value

        if(this.props.apiInfo[ev.target.id] == value){ return }

        switch (ev.target.id){
            case "name":
                socket.emit("updateApiName", {token: getCookie("apiToken"), name: value})
                break
            case "termsUrl":
                socket.emit("updateTermsUrl", {token: getCookie("apiToken"), termsUrl: value})
                break
            default:
                return
        }

        this.props.apiInfo[ev.target.id] = value
        this.props.forceUpdate()
    }
    render(){
        return (
        <ul className="configsSubpage">
            <li id="header">
                <div onClick={()=>this.props.changeScreen("home")}>
                    {this.props.returnSVG}
                </div>
                <h2>
                    Configurações
                </h2>
            </li>
            <li>
                <span className="key">Nome da API</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="name"
                    id="name"
                    defaultValue={this.props.apiInfo.name}
                />
            </li>
            <li>
                <span className="key">URL para os termos de uso</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="termsUrl"
                    id="termsUrl"
                    defaultValue={this.props.apiInfo.termsUrl}
                />
            </li>
            <li>
                <span className="key">Email</span>
                <span className="value">{this.props.apiInfo.email}</span>
            </li>
            <li>
                <span className="key">Token de API</span>
                <button
                    className="value" 
                    onClick={()=>{
                        copy(this.props.apiInfo.token)
                        alert("Copiado!")
                    }}
                >Copiar</button>
            </li>
        </ul>
        )
    }
}