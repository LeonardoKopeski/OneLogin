var root = document.querySelector("div#root")

class App extends React.Component{
    constructor(){
        super()

    }
    render(){
        return(
        <div className="homeScreen">
            <header>
                <div id="logo">
                    <h1>OneLogin <span className="adminTag">Administrator</span></h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            <div id="content">
                <h2>O que você quer ver?</h2>
                <button onClick={()=>open("/admin/accountSearch", "_SELF")}>Contas</button><br/>
                <button onClick={()=>open("/admin/apiSearch", "_SELF")}>APIs</button><br/>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)