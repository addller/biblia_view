class ViewVersiculos extends JView{

    constructor(){
        super().mount_()
    }

    _init(){

        A.div().a(
            A.p('txtVersiculosLinkados').t('Versículos linkados'),
            A.div('divVersiculosLinkados'),
            A.p('txtVersiculosSelecionados').t('Versículos selecionados'),
            A.div('divVersiculosSelecionados')
        )
        
    }


}
