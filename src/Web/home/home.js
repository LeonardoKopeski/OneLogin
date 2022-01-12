var root = document.querySelector("div#root")
const textToType = "OneLogin"

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            logoAnimationKey: -15,
            reduce: false,
            showContent: false
        }

        var interval = setInterval(() => {
            if(this.state.logoAnimationKey == textToType.length){
                setTimeout(() => {
                    this.setState({reduce: true})
                }, 2000)
                setTimeout(() => {
                    this.setState({showContent: true})
                }, 3000)

                clearInterval(interval)
                return
            }
            this.setState({logoAnimationKey: this.state.logoAnimationKey + 1})
        }, 150)
    }
    render(){
        const logoAnimationKey = this.state.logoAnimationKey
        var subtitleStyle = {
            opacity: logoAnimationKey == textToType.length? 1: 0,
            display: logoAnimationKey > 5? "": "none"
        }

        return(
        <div className="homeScreen">
            <div id="logo" data-reduce={this.state.reduce}>
                <h1>
                    {textToType.substring(0, logoAnimationKey)}
                </h1>
                <h2 style={subtitleStyle}>
                    By Leonardo Kopeski
                </h2>
            </div>
            <div id="content" style={{display: this.state.showContent? "": "none"}}>
                <h2>O que você precisa?</h2>
                <button onClick={()=>open("/dashboard", "_SELF")}>Acessar minha conta</button><br/>
                <button onClick={()=>open("/register", "_SELF")}>Criar uma conta</button><br/>
                <button onClick={()=>open("/development", "_SELF")}>Criar e editar uma API</button><br/>
                <button onClick={()=>open("#", "_SELF")}>Ler a documentação</button><br/>
                <button onClick={()=>open("#", "_SELF")}>Enviar feedback</button><br/>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)