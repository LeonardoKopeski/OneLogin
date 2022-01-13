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
                <a onClick={()=>this.props.changeScreen("statistics")}>
                    Ver estatisticas
                </a>
            </div>
            <div className="block" data-size="half">
                <h1>Configurações</h1>
                <p>Aqui você configura e personaliza, os dados da sua API</p>
                <a onClick={()=>this.props.changeScreen("configs")}>
                    {translation["PersonalizeMyAccount"]}
                </a>
            </div>
            <div className="block" data-size="full">
                <h1>{translation["Security"]}</h1>
                <p>Aqui você pode controlar seu token de API, gerar outro token, bloquear, ou pedir permissões extras</p>
                <a onClick={()=>alert("wip")}>
                    {translation["OpenSecurityPanel"]}
                </a>
            </div>
        </nav>
        )
    }
}