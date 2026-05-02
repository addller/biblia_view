class ViewMenu extends JView{

    constructor(){
        super().mount_()
    }

    _init(){
        A.div().a(
            A.p('txtMenu').t('Biblia').c('centerText')
        )
    }

}