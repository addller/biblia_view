class ViewEstudos extends JView{

    constructor(entity){
        super(entity).mount_()
    }

    _init(){

        A.div().a(
            A.p('txtEstudos').t('Estudos'),
            A.div('divComandosEstudos').a(
                A.inputText('inputAdicionarEstudo').p('Adicionar Estudo'),
                A.inputText('inputPesquisarEstudo').p("Pesquisar estudos"),
            ),
            A.p('txtErrorAdicionarEstudo').c('error'),
            A.div('divEstudos')
        )
        
    }

    showError(error){
        this.$txtErrorAdicionarEstudo.t(error)
    }

    updateNumeroEstudos(quantidade){
        this.$txtEstudos.t(`Estudos: (${quantidade})`)
    }

}