module.exports = async (api, permission, getApi)=>{
    if(typeof api != "string"){
        return {status: "BadRequest", code: 400}
    }
    
    var apis = await getApi({token: api})

    if(!apis[0]){
        return {status: "InvalidApiToken", code: 401}
    }

    if(apis[0].permissions.indexOf(permission) == -1) {
        return {status: "InsufficientPermissions", code: 403}
    }

    if(apis[0].locked){
        return {status: "TemporarilyLockedApi", code: 403}
    }
    
    if(!apis[0].verified){
        return {status: "UnverifiedApi", code: 403}
    }

    return {status: "Ok", code: 200, data: apis[0]}
}