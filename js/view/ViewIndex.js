class ViewIndex extends JView{

    constructor(){
        super().mount_()
    }

    _init(){
        A.div().a(
            A.div('divMenu').a(
                A.p('txtBiblia').t('Bíblia')
            ),
            A.div('divPesquisa'),
            A.div('divVersiculos'),
            A.div('divEstudos')
        )
        
    }

    _limits(){
        
    }

}