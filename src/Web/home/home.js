var root = document.querySelector("div#root")
const textToType = "OneLogin"

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            logoAnimationKey: -5
        }

        var interval = setInterval(() => {
            if(this.state.logoAnimationKey == textToType.length){
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
            <div id="logo">
                <h1>
                    {textToType.substring(0, logoAnimationKey)}
                </h1>
                <h2 style={subtitleStyle}>
                    By Leonardo Kopeski
                </h2>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)