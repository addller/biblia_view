class Language{

    static setCodLang(codLang, redirectTo){
        localStorage.setItem('cod_lang', codLang)
        redirectTo && redirect(redirectTo)
    }

    static defineLang(){
        let codLang =  localStorage.getItem('cod_lang') || "PT_BR",
            registredLangs = ['PT_BR', 'EN_US'];

        keysOf(LANG).forEach(key =>{ 
            registredLangs.forEach(lang => {
                if(!LANG[key][lang])
                    throw `BASE_LANG incomplet for key ${key}, lang ${lang}`
            })
            LANG[key] = LANG[key][codLang]
        })
    }
}

const LANG = {
    cod_lang:{
        PT_BR:'PT_BR',
        EN_US:'EN_US'
    },
    yes:{
        PT_BR:'Sim',
        EN_US:'Yes'
    },
    not:{
        PT_BR:'Não',
        EN_US:'Not'
    }
}