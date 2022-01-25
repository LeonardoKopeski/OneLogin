import {Component} from 'react'
import "./style.css"

export default class NotFound extends Component{
    render(){
        return (
        <div className="notFoundScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            <div id="title">
                <h1>:(</h1>
                <h2>Essa pagina... Não exite!</h2>
                <button onClick={() => window.open("/", "_SELF")}>Voltar para a homepage...</button>
            </div>
        </div>
        )
    }
}