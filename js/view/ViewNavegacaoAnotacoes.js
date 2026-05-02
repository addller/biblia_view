class ViewNavegacaoAnotacoes extends JView{

    constructor(){
        super().mount_()
    }

    _init(){
        A.div().a(
            A.form('formAdicionarAnotacao').a(
                A.inputText('inputTitulo').p('Título'),
                A.inputSubmit('btnAdicionarAnotacao').v('Adicionar anotação'),
                A.inputButton('btnVoltar').v('Voltar')
            ),
            A.p('txtInfo').c('error'),
            A.p('txtAnotacoes').t('Anotações'),
            A.div('divNavegacaoAnotacoes')
        )
    }

    _limits(){
        this.$inputTitulo.maxLength = 100;
    }

}