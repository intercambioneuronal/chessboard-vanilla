const columnas=["A","B","C","D","E","F","G","H"]
let selectedPiece=null
let colorBottomBoard=null
function nextColumn(inicial,diferencia){
    let result=null
    let index= columnas.findIndex(col=>col==inicial)
    let next=index+diferencia
    if(next>=0 && next<8){
        result=columnas[index+diferencia]
    }
    return result;
}
function toggleColor(color){
    return color=="white"?"black":"white";
}
function generarCasillas(color){
    let colorTemporal
    let inicioCasillaColumna="A"
    let tiles=[]

    if(color=="white"){
        colorTemporal="black"
        for (let filaOrden = 10; filaOrden >0; filaOrden--) {
            let next=inicioCasillaColumna
            for (let colOrden = 0; colOrden < 10; colOrden++) {
                let classes=[]
                let properties={
                    color:colorTemporal,
                    row: (filaOrden!=10 && filaOrden!=1)?filaOrden-1:null,
                    column:next
                }
                if(colOrden<9 && colOrden>0){
                    next=nextColumn(inicioCasillaColumna,colOrden)
                    if(colOrden>7){

                    }
                    else if(colorTemporal=="white" ){
                        colorTemporal="black"
                    }
                    else{
                        colorTemporal="white"
                    }
                }
                else{
                    classes.push("headers-tile")
                }
                if(filaOrden==10 && colOrden!=9 && colOrden!=0){
                    classes.push("headers-tile") 
                    classes.push("column-headers-top")                   
                }
                if(filaOrden==1 && colOrden!=9 && colOrden!=0){
                    classes.push("headers-tile")
                    classes.push("column-headers-bottom")
                }
                if(colOrden==9 && filaOrden!=10 && filaOrden!=1){
                    classes.push("headers-tile")
                    classes.push("row-headers-left")
                }
                if(colOrden==0 && filaOrden!=10 && filaOrden!=1){
                    classes.push("headers-tile")
                    classes.push("row-headers-right")
                }
                properties.class=classes
                tiles.push(properties)               
            }
        }
    }
    else{   
        colorTemporal="black"
        inicioCasillaColumna="H"
        
        for (let filaOrden = 0; filaOrden <10; filaOrden++) {
            let next=inicioCasillaColumna
            for (let colOrden = 10; colOrden >0; colOrden--) {
                let classes=[]
                let properties={
                    color:colorTemporal,
                    row: (filaOrden!=9 && filaOrden!=0)?filaOrden:null,
                    column:next
                }
                if(colOrden<10 && colOrden>1){
                    next=nextColumn(inicioCasillaColumna,-1*(10-colOrden))
                    if(colOrden<3){

                    }
                    else if(colorTemporal=="white" ){
                        colorTemporal="black"
                    }
                    else{
                        colorTemporal="white"
                    }
                }
                else{
                    classes.push("headers-tile")
                }
                if(filaOrden==9 && colOrden!=10 && colOrden!=1){
                    classes.push("headers-tile")
                    classes.push("column-headers-top")                   
                }
                if(filaOrden==0 && colOrden!=10 && colOrden!=1){
                    classes.push("headers-tile")
                    classes.push("column-headers-bottom")
                }
                if(colOrden==10 && filaOrden!=9 && filaOrden!=0){
                    classes.push("headers-tile")
                    classes.push("row-headers-left")
                }
                if(colOrden==1 && filaOrden!=9 && filaOrden!=0){
                    classes.push("headers-tile")
                    classes.push("row-headers-right")
                }
                properties.class=classes
                tiles.push(properties) 
            }
        }
    }
    return tiles;
}
function dibujarTablero(color){
    let tablero= document.getElementById("chessboard")
    tablero.innerHTML=""
    let tiles=generarCasillas(color);    
    for (let index = 0; index < tiles.length; index++) {               
        let div=document.createElement("div")
        let classes=[] 
        if(tiles[index].class.length==0){
            let colorTile=tiles[index].color=="white"?"white-tile"
            :(tiles[index].color=="black"?"black-tile":"")
            if(colorTile){
                classes.push(colorTile) 
            } 
        }  
        if(tiles[index].header){
            classes.push("headers-tile")
        }   
        classes=[...classes,...tiles[index].class]        
        div.setAttribute("class",classes.join(" "))
        div.setAttribute("column",tiles[index].column)
        div.setAttribute("row",tiles[index].row)    
        tablero.append(div)
    }
}
function changeColors(par){
    return function (event) {
        event.preventDefault()
        let name=event.target.getAttribute("name").split("-")[1];
        let colores=colors.find(c=>c.name===name)
        for (color in colores) {
            if(color!=="name"){
                //document.documentElement.style.removeProperty('--'+color); 
                document.documentElement.style.setProperty('--'+color, colores[color]);  
                             
            }            
        }
    }
}
function colocarPiezas(){
    console.log(piezas)
    for (let index = 0; index < piezas.length; index++) {
        const element = piezas[index];
        let tile=document.querySelector(`:not(.headers-tile)[column="${element.column}"][row="${element.row}"]`)
        for (let indexClass = 0; indexClass < element.classes.length; indexClass++) {
            const newClass = element.classes[indexClass];
            tile.classList.toggle(newClass.class) 
        }        
    }    
}
function initTablero(P1Color){
    let selectedStyle="selected-tile"
    colorBottomBoard=P1Color
    dibujarTablero(colorBottomBoard)
    colocarPiezas()
    addEvent("click",".white-tile",toggleClass,selectedStyle)
    addEvent("click",".black-tile",toggleClass,selectedStyle)    
}
window.addEventListener("load",(event)=>{
    initTablero("white")
    addEvent("click","#btnReset",resetMatch,null)  
    addEvent("click","#btnWide",wideMode,null) 
    addEvent("click","#btnAnima",anima,null)
    addEvent("click",".color-board",changeColors,null)         
})