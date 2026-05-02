class APIBiblia extends APIBase{

    static API_IDENTIFIER = 'com_biblia_'
    static NICK_NAME = 'nickname'
    static TEXT_SEARCH = 'textSearch'
    static IMG_PERFIL = 'imgPerfil'
    static CLIENT_ID = 'clientId'
    static ESTUDO = 'estudo'
    static FITILHO = 'fitilho'

    constructor(){super('http://localhost:22765/api')}

    getInfo = apiKey => localStorage.getItem(APIBiblia.API_IDENTIFIER+apiKey)
    setInfo = (apiKey, value) => localStorage.setItem(APIBiblia.API_IDENTIFIER+apiKey, value)
    removeInfo = apiKey => localStorage.removeItem(APIBiblia.API_IDENTIFIER+apiKey)

    getImagePerfil = () => JSON.parse(this.getInfo(APIBiblia.IMG_PERFIL))
    setImagePerfil = imagePerfil => this.setInfo(APIBiblia.IMG_PERFIL, JSON.stringify(imagePerfil))
    removeImagePerfil = () => this.removeInfo(APIBiblia.IMG_PERFIL)

    getFitilho = () => JSON.parse(this.getInfo(APIBiblia.FITILHO))
    setFitilho = fitilho => this.setInfo(APIBiblia.FITILHO, JSON.stringify(fitilho))
    removeFitilho = () => this.removeInfo(APIBiblia.FITILHO)

    getEstudo = () => JSON.parse(this.getInfo(APIBiblia.ESTUDO))
    setEstudo = estudo => this.setInfo(APIBiblia.ESTUDO, JSON.stringify(estudo))
    removeEstudo = () => this.removeInfo(APIBiblia.ESTUDO)

    getUserId = () => this.getUser().userId_

    getClientId = () => JSON.parse(this.getInfo(APIBiblia.CLIENT_ID))
    setClientId = clientId => this.setInfo(APIBiblia.CLIENT_ID, clientId)
    removeClientId = () => this.removeInfo(APIBiblia.CLIENT_ID)

    toAuth = fragment => this.toResource('auth', fragment)
    toUsers = fragment => this.toResource('users', fragment)
    toImgPerfil = fragment => this.toResource('img_perfil', fragment)
    toLivro = fragment => this.toResource('livros', fragment)
    toVersiculos = fragment => this.toResource('versiculos', fragment)
    toEstudos = fragment => this.toResource('estudos', fragment)
    toAnotacoes = fragment => this.toResource('anotacoes', fragment)
}

class APIViewBiblia extends APIBase{

    static API_IDENTIFIER = 'com_biblia_view_'

    constructor(){super('http://localhost:5500')}

    getInfo = apiKey => localStorage.getItem(APIViewBiblia.API_IDENTIFIER+apiKey)
    setInfo = (apiKey, value) => localStorage.setItem(APIViewBiblia.API_IDENTIFIER+apiKey, value)
    removeInfo = apiKey => localStorage.removeItem(APIViewBiblia.API_IDENTIFIER+apiKey)
    
}

const API_BIBLIA = new APIBiblia()
const API_VIEW_BIBLIA = new APIViewBiblia()
