class ViewPesquisa extends JView{

    constructor(){
        super().mount_()
    }

    _init(){
        A.div().a(
            A.div('divComandosLivro').a(
                A.p('txtPesquisa').t('Pesquisa'),
                A.div('divComandosLivroTitulo').a(
                    A.span('spanLivro').t('Livro'),
                    A.inputSelect('inputSelectLivros'),
                ),
                A.div('divComandosLivroCapitulo').a(
                    A.span('spanCapitulo').t('Capítulo'),
                    A.inputNumber('inputNumeroCapitulo'),
                    A.span('spanCapitulos')
                ),
                A.div('divFiltros').a(
                    A.span('spanFiltro1').t('Filtro 1'),
                    A.inputText('inputBuscarNoLivro').p('Buscar no livro'),
                    E.br(),
                    A.span('spanFiltro2').t('Filtro 2'),
                    A.inputText('inputBuscarEmTodosOsLivros').p('Buscar em todos os livros')
                ),
                A.p('txtTotalVersiculos').t('Total de versículos: 0'),
            ),
            A.div('divVersiculos')
        )
    }

    _limits(){
        this.$inputNumeroCapitulo.min = 1
        this.$inputNumeroCapitulo.value = 1
    }

    updateTotalVersiculos(total){
        this.$txtTotalVersiculos.t(`Total de versículos: ${total}`)
    }

}