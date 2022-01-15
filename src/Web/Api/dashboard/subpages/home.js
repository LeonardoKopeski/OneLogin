subpages["home"] = class extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
        <nav className="homeSubpage">
            <div className="block" data-size="half">
                <h1>Estatisticas</h1>
                <p>Aqui você pode ver algumas estatisticas da sua API</p>
                <a onClick={()=>alert("wip")}>Ver estatisticas</a>
            </div>
            <div className="block" data-size="half">
                <h1>Configurações</h1>
                <p>Aqui você configura e personaliza, os dados da sua API</p>
                <a onClick={()=>this.props.changeScreen("configs")}>Abrir configurações</a>
            </div>
            <div className="block" data-size="full">
                <h1>Privacidade e Segurança</h1>
                <p>Aqui você pode controlar seu token de API, gerar outro token, bloquear, ou pedir permissões extras</p>
                <a onClick={()=>alert("wip")}>Abrir painel de segurança e privacidade</a>
            </div>
        </nav>
        )
    }
}