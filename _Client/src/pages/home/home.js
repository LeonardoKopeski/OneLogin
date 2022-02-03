import {Component} from 'react'
import "./style.css"

export default class Home extends Component{
    constructor() {
        super()
        
        this.state = {
            highlightAnimated: false
        }

        setTimeout(() => {
            this.setState({highlightAnimated: true})
        }, 1000);
    }
    
    render(){
        return(
            <div className="homeScreen">
                <div className={"highlight " + (this.state.highlightAnimated?"show": "")}>
                    <div className='information'>
                        <h1>OneLogin</h1>
                        <h2>Um login, todos os nossos serviços!</h2>
                    </div>
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
                    </svg>
                </div>
                <div className='details'>
                    <div className="content">
                        <div className='accounts'>
                            <h2>Para contas</h2>
                            <button onClick={()=>window.open("/register", "_SELF")}>Crie já sua conta!</button>
                            <button onClick={()=>window.open("/login", "_SELF")}>Já tenho uma conta...</button>
                        </div>
                        <div className='apis'>
                            <h2>Para desenvolvedores</h2>
                            <button onClick={()=>window.open("/docs", "_SELF")}>Consultar documentação</button>
                            <button onClick={()=>window.open("/downloadApiLibrary", "_SELF")}>Baixar biblioteca</button>
                        </div>
                    </div>
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
                    </svg>
                </div>
                <div className='bottom'>
                    <a href="https://www.github.com/LeonardoKopeski/OneLogin">GitHub</a><br/>
                    <a href="https://twitter.com/leogueimipreis">Twitter</a><br/>
                    <a href="https://github.com/LeonardoKopeski/OneLogin/blob/master/LICENSE">Termos de uso</a>
                    <p>Leonardo Kopeski&copy;2022</p>
                </div>
            </div>
        )
    }
}