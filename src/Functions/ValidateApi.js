module.exports = async (api, permission, getApi)=>{
    if(typeof api != "string"){return false}
    
    var apis = await getApi({token: api})

    if(apis[0].permissions.indexOf(permission) == -1) {return false}

    return apis[0]
}