import {Component} from 'react'
import {editApi1, editApi2} from './images'
import "./style.css"

const pages = {
    "Introdução": 0,
    "Instalação": 1,
    "Criar uma API": 2,
    "Editar sua API": 3,
    "Conectar a API": 4,
    "Criar tela de login": 5,
    "Obter dados do usuário": 6
}

export default class Docs extends Component{
    constructor(){
        super()

        this.state = {
            page: 0
        }

        this.generateSideBar = this.generateSideBar.bind(this)
        this.changeSelected = this.changeSelected.bind(this)
    }
    changeSelected(id){
        document.querySelector("li#item"+this.state.page).classList.remove("selected")
        document.querySelector("li#item"+id).classList.add("selected")
        this.setState({page: id})
    }
    generateSideBar(){
        var items = []

        Object.keys(pages).forEach(key => {
            var subpages = []
            if(typeof pages[key] !== "number"){
                Object.keys(pages[key]).forEach(subKey=>{
                    var keyProp = "item" + pages[key][subKey]
                    subpages.push(
                        <li
                            key={keyProp}
                            id={keyProp}
                            onClick={()=>this.changeSelected(pages[key][subKey])}
                        >
                            {subKey}
                        </li>) 
                })
            }

            var hasSubItems = subpages.length !== 0
            var keyProp = "item"+pages[key]
            subpages = <ul>{subpages}</ul>

            items.push(
                <li
                    className={(hasSubItems?"hasSubItems": "") + (pages[key] === 0? "selected": "")}
                    key={keyProp}
                    id={keyProp}
                    onClick={hasSubItems?null: ()=>this.changeSelected(pages[key])}
                >
                    {key}{hasSubItems?subpages: null}
                </li>)  
        })

        return <ul>{items}</ul>
    }
    render(){
        return (
        <div className="docsScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            <nav>
                {this.generateSideBar()}
            </nav>
            <div id="content">
                <div className={this.state.page === 0? "show": ""} id="download">
                    <h1>Introdução</h1>
                    <h2>O que é a OneLogin?</h2>
                    <p>A OneLogin, é uma plataforma, onde você faz login uma unica vez, em um unico lugar, e que vincula à diversos sites, dos quais usam nossa API!</p>
                    <p>~&gt; Com ele, você não precisa preencher login e senha, toda vez...</p>
                    <p>~&gt; Não precisa decorar varias contas...</p>
                    <p>~&gt; Não precisa toda vez, configurar suas preferencias...</p>
                    <p>~&gt; E mais que tudo, você pode controlar o que se conecta na sua conta!</p>
                    <br/>
                    <br/>
                    <p>Caso você esteja enteressado, crie sua conta já usando <a href="/register">esse</a> link!</p>
                    <br/>
                    <br/>
                    <p>Mas... caso você seja um desenvolvedor, e queira usar nossa API, você apenas precisa baixar uma biblioteca, em javascript, e anexar ao seu condigo!</p>
                    <p>Essa biblioteca pode ser encontrada bem <a href="/downloadApiLibrary">aqui</a>!</p>
                    <br/>
                    <br/>
                    <p>Para mais informações, como exemplos de codigo, você encontra navegando pelo menu so lado esquerdo da tela, ou ao topo da pagina, em dispositivos moveis!</p>

                    <h2>Quanto custa?</h2>
                    <p>A OneLogin, por ser um projeto independente, tem o codigo aberto, e APIs completamente gratuita, para o publico geral!</p>
                    <p>Lembrando que, para usar uma API, ela deve ser verificada manualmente, mas mesmo assim, não custa nada!</p>
                </div>
                <div className={this.state.page === 1? "show": ""} id="download">
                    <h1>Instalação</h1>
                    <p>Para usar uma API do OneLogin, você deve primeiro baixar uma biblioteca, em javascript, da qual terá todos os comandos que você precisa, de forma completamente assincrona para usar o OneLogin!</p>
                    <p>Para baixar, use o link abaixo!</p>
                    <a href="/downloadApiLibrary">Baixar!</a>
                    <br/>
                    <br/>
                    <p>É uma biblioteca bem simples ainda, mas irá receber atualizações o mais frequente o possivel(não esqueça que esse, é um projeto independente)</p>
                    <p>A biblioteca apenas intemedia você, e a real API, para evitar erros(vai por mim, é bem util!), usando metodos post, para o servidor da API</p>
                </div>
                <div className={this.state.page === 2? "show": ""} id="download">
                    <h1>Criar uma API</h1>
                    <p>WIP</p>
                </div>
                <div className={this.state.page === 3? "show": ""} id="download">
                    <h1>Editar sua API</h1>
                    <p>Para editar os dados da sua API, você deve ir para a <a href="/dashboard">dashboard</a> e depois clicar em "Abrir painel do desenvolvedor", como na imagem abaixo:</p>
                    <img src={editApi1} alt="docImage"/>
                    <br/>
                    <br/>
                    <p>Após isso, você irá aparecer um painel onde você verá informações editaveis, como o nome da sua API, ou a url da pagina dos termos de uso, por exemplo</p>
                    <p>Nessa pagina, você controla tudo o que você quer, na maneira que você quiser</p>
                    <p>Lembrando que essa pagina tem auto-save, por isso todas as informações serão editadas em tempo real!</p>
                </div>
                <div className={this.state.page === 4? "show": ""} id="download">
                    <h1>Conectar a API</h1>
                    <p>WIP</p>
                </div>
                <div className={this.state.page === 5? "show": ""} id="download">
                    <h1>Criar tela de login</h1>
                    <p>WIP</p>
                </div>
                <div className={this.state.page === 6? "show": ""} id="download">
                    <h1>Obter dados do usuário</h1>
                    <p>WIP</p>
                </div>
            </div>
        </div>
        )
    }
}