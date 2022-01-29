import {Component} from 'react'
import {editApi1} from './images'
import "./style.css"

const pages = {
    "Introdução": 0,
    "Instalação": 1,
    "Criar sua API": 2,
    "Conectar a API": 3,
    "Criar tela de login": 4,
    "Obter dados do usuário": 5
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
                    className={(hasSubItems?"hasSubItems": "") + (pages[key] === this.state.page? "selected": "")}
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
                {pageHtml[this.state.page]}
            </div>
        </div>
        )
    }
}

var pageHtml = [
    (<div>
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
    </div>),
    (<div>
        <h1>Instalação</h1>
        <p>Para usar uma API do OneLogin, você deve primeiro baixar uma biblioteca, em javascript, da qual terá todos os comandos que você precisa, de forma completamente assincrona para usar o OneLogin!</p>
        <p>Para baixar, use o link abaixo!</p>
        <a href="/downloadApiLibrary">Baixar!</a>
        <br/>
        <br/>
        <p>É uma biblioteca bem simples ainda, mas irá receber atualizações o mais frequente o possivel(não esqueça que esse, é um projeto independente)</p>
        <p>A biblioteca apenas intemedia você, e a real API, para evitar erros(vai por mim, é bem util!), usando metodos post, para o servidor da API</p>
    </div>),
    (<div>
        <h1>Criar sua API</h1>
        <p>Para editar os dados da sua API, você deve ir para a <a href="/dashboard">dashboard</a> e depois clicar em "Abrir painel do desenvolvedor", como na imagem abaixo:</p>
        <img src={editApi1} alt="docImage"/>
        <br/>
        <br/>
        <p>Após isso, você irá aparecer um painel onde você verá informações editaveis, como o nome da sua API, ou a url da pagina dos termos de uso, por exemplo</p>
        <p>Nessa pagina, você controla tudo o que você quer, na maneira que você quiser</p>
        <p>Lembrando que essa pagina tem auto-save, por isso todas as informações serão editadas em tempo real!</p>
    </div>),
    (<div>
        <h1>Conectar a API</h1>
        <p>Antes de usar sua API, você deve se conectar...</p>
        <p>Para você se conectar ao nosso servidor, você deve usar o seguinte comando(antes de qualquer coisa):</p>
        <div className='code'>
            <span className='comment'>{"//"}Use esse comando para se conectar ao servidor</span><br/>
            oneLoginAPI.connect(*ApiToken*).then((res)={">{"}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;if(res === "Ok"){"{"}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log("Conectado!")<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{"}"}else{"{"}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log("Error: "+res)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
            {"}"})
        </div>
        <p>Quando a conexão acabar, se for validada, irá retornar "Ok"!</p>
        <br/>
        <br/>
        <p>Lembrando que você deve substituir o "apiToken", pelo seu próprio token(mas recomendamos que use variaveis de desenvolvimento, especialmente com arquivos .env)</p>
        <p>Caso não lembre seu token, vá para a aba "Criar sua API" antes, seu token está lá!</p>
    </div>),
    (<div>
        <h1>Criar tela de login</h1>
        <p>Para gerar uma pagina de login, use a seguinte sintaxe:</p>
        <div className='code'>
            <span className='comment'>{"//"}e use esse comando para gerar uma pagina para login</span><br/>
            oneLoginAPI.generateFastLogin(*Link*).then((res)={">{"}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;console.log(res)<br/>
            {"}"})
        </div>
        <p>Alí onde diz "Link", você deve por o link, pelo qual, irá receber os dados logo após o login(via metodo POST)</p>
        <br/>
        <br/>
        <p>O retorno dessa função vai ser loginToken, url, returnMethod e returnUrl</p> 
        <p>Você apenas precisa redirecionar o usuário para a url que foi retornada!</p>
        <p className="obs">Lembrando: para isso, você deve antes, se conectar à sua API, e deve ter a permissão LOGIN</p>
        <br/>
        <br/>
        <p>Você receberá no link que você passou anteriormente, via metodo POST, um objeto, contendo o token de acesso para a conta, para obter os dados, como nome, email(e outros), você deve seguir o tutorial entrando na aba "Obter dados do usuário"!</p>
    </div>),
    (<div>
        <h1>Obter dados do usuário</h1>
        <p>Após fazer login, você obtem um token do usuário, e é ele que você deve por no comando logo abaixo:</p>
        <div className='code'>
            <span className='comment'>{"//"}Esse comando, por sua vez, serve para obter dados do usuário</span><br/>
            oneLoginAPI.getUserInfo(*token*).then((res)={">{"}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;console.log(res)<br/>
            {"}"})
        </div>
        <p>Aqui, você terá um objeto como retorno, nele você verá todos os dados do usuário(que você tem acesso)</p>
        <p>Caso o retorno seja uma string, significa que houve um erro, seja ele por permissão, ou por bloqueio</p>
        <br/>
        <br/>
        <p className='obs'>Lembrando: caso sua API tenha a permissão GETFRIENDLIST, você receberá as informações(basicas) dos amigos também!</p>
    </div>)
]