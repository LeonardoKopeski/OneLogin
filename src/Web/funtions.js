const alternativePhoto = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Xdf9OyXn9BpWL30gb6cpyLnkiCCbSaH8wVB1007o9WpYBDgb6J1_afDQTdJuqwgE3xM&usqp=CAU"

const regEx = {
    email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    username: /^(.[a-zA-Z0-9_]{4,18})$/
}

function postData(url, obj){
    var form = document.createElement("form")
    form.name = "PostDataForm"
    form.method = "POST"
    form.action = url
    Object.keys(obj).forEach(key=>{
        var input = document.createElement("input")
        input.name = key
        input.value = obj[key]
        input.type = "hidden"
        form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
}

function copy(text){
    // DevNote: ExecCommand is deprecated, but works on unsecure sites...
    var content = document.createElement('textarea')
    document.body.appendChild(content)
    content.value = text
    content.select()
    document.execCommand('copy')
    document.body.removeChild(content)
}

async function sha256(ascii){
    function rightRotate(value, amount){
        return (value>>>amount) | (value<<(32 - amount))
    }
    var mathPow = Math.pow
    var maxWord = mathPow(2, 32)
    var lengthProperty = 'length'
    var i, j
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;
    
    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
            k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
        }
    }
    
    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j>>8) return; // ASCII check: only accept characters in range 0-255
        words[i>>2] |= j << ((3 - i)%4)*8;
    }
    words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
    words[words[lengthProperty]] = (asciiBitLength)
    
    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e&hash[5])^((~e)&hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
                    )|0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
            
            hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1)|0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i])|0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i]>>(j*8))&255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

function deleteCookie(name){
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/"
}

function setCookie(name, value, days){
    const d = new Date()
    d.setTime(d.getTime() + (days*24*60*60*1000))
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
}

function getCookie(name){
    name += "="
    var decodedCookie = decodeURIComponent(document.cookie)
    var ca = decodedCookie.split(';')
    for(var i = 0; i < ca.length; i++){
        var c = ca[i]
        while(c.charAt(0) == ' '){
            c = c.substring(1)
        }
        if(c.indexOf(name) == 0){
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

if(!HTMLCanvasElement.prototype.toBlob){
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function(callback, type, quality){

            var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len)

            for(var i = 0;i < len;i++){
                arr[i] = binStr.charCodeAt(i)
            }

            callback(new Blob([arr], {type: type || 'image/png'}))
        }
    })
}

window.URL = window.URL || window.webkitURL

function getExifOrientation(file, callback){
    if(file.slice){
        file = file.slice(0, 131072)
    }else if(file.webkitSlice){
        file = file.webkitSlice(0, 131072)
    }

    var reader = new FileReader()
    reader.onload = function(e){
        var view = new DataView(e.target.result)
        if(view.getUint16(0, false) != 0xFFD8){
            callback(-2)
            return
        }
        var length = view.byteLength, offset = 2
        while(offset < length){
            var marker = view.getUint16(offset, false)
            offset += 2
            if(marker == 0xFFE1){
                if(view.getUint32(offset += 2, false) != 0x45786966){
                    callback(-1)
                    return
                }
                var little = view.getUint16(offset += 6, false) == 0x4949
                offset += view.getUint32(offset + 4, little)
                var tags = view.getUint16(offset, little)
                offset += 2
                for(var i = 0;i < tags;i++)
                    if(view.getUint16(offset +(i * 12), little) == 0x0112){
                        callback(view.getUint16(offset +(i * 12) + 8, little))
                        return
                    }
            }
            else if((marker & 0xFF00) != 0xFF00) break
            else offset += view.getUint16(offset, false)
        }
        callback(-1)
    }
    reader.readAsArrayBuffer(file)
}

function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation){
    var canvas = document.createElement('canvas')
    if(orientation > 4){
        canvas.width = rawHeight
        canvas.height = rawWidth
    }else {
        canvas.width = rawWidth
        canvas.height = rawHeight
    }

    if(orientation > 1){
        console.log("EXIF orientation = " + orientation + ", rotating picture")
    }

    var ctx = canvas.getContext('2d')
    switch(orientation){
        case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
    }
    ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
    return canvas;
}

function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality, callback){
    if(file.size <= acceptFileSize){
        callback(file)
        return
    }
    var img = new Image()
    img.onerror = function(){
        URL.revokeObjectURL(this.src)
        callback(file)
    }
    img.onload = function(){
        URL.revokeObjectURL(this.src)
        getExifOrientation(file, function(orientation){
            var w = img.width, h = img.height
            var scale =(orientation > 4 ?
                Math.min(maxHeight / w, maxWidth / h, 1) :
                Math.min(maxWidth / w, maxHeight / h, 1))
            h = Math.round(h * scale)
            w = Math.round(w * scale)

            var canvas = imgToCanvasWithOrientation(img, w, h, orientation)
            canvas.toBlob(function(blob){
                console.log("Resized image to " + w + "x" + h + ", " +(blob.size >> 10) + "kB")
                callback(blob)
            }, 'image/jpeg', quality)
        })
    }
    img.src = URL.createObjectURL(file)
}

function getBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}