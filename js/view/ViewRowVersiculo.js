class ViewRowVersiculo extends JView{

    constructor(versiculo){
        super(versiculo).mount_()
    }

    _init(){
        let aberviacaoLivro = this.livro?.abreviacao || '';

        if(aberviacaoLivro){
            aberviacaoLivro = `${aberviacaoLivro} ${this.capitulo}:`
        }
        A.div().a(
            A.span('spanExcluir').c('sprite', 'delete'),
            A.span('spanSelecionar').c('sprite', 'selectVersiculo'),
            A.span('txtVersiculo').t(`${aberviacaoLivro} ${this.verso}. ${this.texto}`)
        )
        
    }

}