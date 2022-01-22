module.exports = {
    splitSchema(schemaObj, splitKey, filter){
        var obj = {}
        Object.keys(schemaObj).forEach(key=>{
            if(schemaObj[key][filter] || filter == undefined){
                if(typeof splitKey == "string"){
                    obj[key] = schemaObj[key][splitKey]
                }else if(splitKey[key] != undefined){
                    obj[key] = splitKey[key]
                }
            }
        })
        return obj
    },
    accountSchema: {
        username: {
            type: String,
            basicInfo: true,
            visibleInfo: true
        },
        email: {
            type: String,
            basicInfo: false,
            visibleInfo: true
        },
        password: {
            type: String,
            basicInfo: false,
            visibleInfo: false
        },
        token: {
            type: String,
            basicInfo: false,
            visibleInfo: false
        },
        imageUrl: {
            type: String,
            basicInfo: true,
            visibleInfo: true
        },
        bio: {
            type: String,
            basicInfo: true,
            visibleInfo: true
        },
        verified: {
            type: Boolean,
            basicInfo: true,
            visibleInfo: true
        },
        following: {
            type: Array, 
            asicInfo: false,
            visibleInfo: false
        },
        notifications: {
            type: Array, 
            asicInfo: false,
            visibleInfo: true
        },
        highlightColor: {
            type: String,
            basicInfo: true,
            visibleInfo: true
        },
        services: {
            type: Object,
            basicInfo: false,
            visibleInfo: false
        },
        accountTier: {
            type: Number,
            basicInfo: false,
            visibleInfo: false
        }
    },
    apiSchema: {
        token: {type: String},
        name: {type: String},
        createdIn: {type: Date},
        permissions: {type: Array},
        verified: {type: Boolean},
        locked: {type: Boolean},
        users: {type: Object},
        termsUrl: {type: String},
        email: {type: String}
    }
}