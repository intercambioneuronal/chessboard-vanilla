const bigPieces=["knight","bishop","rook","queen"]
const timeChoosePiece=3000;
let movements=[]
let gameStarted=true;
const fraccionTiempo=100;
let stopEvents=false;
//agregar evento de forma generica segun selector y manejar proporcionado
function addEvent(eventName, selector, callback, value) {
    try {
        const elements = document.querySelectorAll(selector);
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            let newcallback = callback.call(element, value)
            element.addEventListener(eventName, newcallback)
        }        
    } catch (error) {
        console.log("addevent",error)
    }
}
//quitar clases que dibujan pieza en una casilla
function deletePiece(elementHTML){
    let classes = elementHTML.className.split(" ")
    for (let index = 0; index < classes.length; index++) {
        const classname = classes[index];
        if (classname.includes("-piece")) {
            elementHTML.classList.toggle(classname)
        }
    }
}
function movePiece(valida,className,selectedPiece,target){
    let classes = selectedPiece.className.split(" ")
    let initPoint = getPoint(selectedPiece)
    let endPoint = getPoint(target)
    //si el movimiento no es valido deseleccionar casilla seleccionada
    if (!valida) {
        selectedPiece.classList.toggle(className)
        selectedPiece = null
        return;
    }
    //comer pieza cuando son de diferente color
    if(initPoint.color && endPoint.color && (initPoint.color!==endPoint.color)){
        deletePiece(target);
    }
    //mover pieza a casilla final y quitarla de casilla inicial
    for (let index = 0; index < classes.length; index++) {
        const element = classes[index];
        if (element.includes("-piece")) {
            selectedPiece.classList.toggle(element)
            target.classList.toggle(element)
        }
    }    
    //validar cambio de peon
    validatePawnEvolution(initPoint,endPoint);
    //guardar movimiento realizado
    saveMove(initPoint,endPoint)
}
//casilla relativa a la posicion de otra
function offsetTile(target,rowOffset,columnOffset){
    let point = getPoint(target)
    let row=parseInt(point.row)+rowOffset
    let column=nextColumn(point.column,columnOffset)
    let offset=getTile(row,column);
    return offset;
}
//manejador de cambio de clases
function toggleClass(className) {
    return function (event) {
        let target = event.target;
        //valida si ha sido seleccionada una casilla y guardada en selectedPiece 
        if (selectedPiece) {            
            //obtener casilla inicial del movimiento(donde esta la pieza)
            let initPoint = getPoint(selectedPiece)
            //casilla final del movimiento(a donde va la pieza)
            let endPoint = getPoint(target)
            //validar movimientos de la pieza
            let valida = validatePieceMove(initPoint, endPoint)
            let capturaPeon=validarCapturaPeon(initPoint, endPoint)
            let hayEnroque=validarEnroque(initPoint,endPoint)
            if(hayEnroque){
                let direction=endPoint.column>initPoint.column?1:-1
                //king
                movePiece(true,className,selectedPiece,offsetTile(selectedPiece,0,2*direction));
                //rook
                movePiece(true,className,target,offsetTile(selectedPiece,0,1*direction));
            }
            else if(capturaPeon){
                let verticalDirection=verticalPawnDiff(initPoint.color)
                let horizontalDirection=distanceColumns(initPoint.column,endPoint.column)
                deletePiece(target)
                movePiece(true,className,selectedPiece,
                    offsetTile(selectedPiece,verticalDirection,horizontalDirection))
                
            }
            else if(valida){
                movePiece(valida,className,selectedPiece,target);
            }
            //quitar seleccion casilla inicial
            selectedPiece.classList.toggle(className)
            selectedPiece = null
        }
        else {
            //seleccion de la casilla inicial con una pieza, se guarda en selectedPiece
            let initPoint = getPoint(target)
            if(initPoint.color){
                target.classList.toggle(className)
                selectedPiece = target                
            }
        }
        calculations();
    }
}
function resetMatch(par){
    return function (event) {
        let value=document.querySelector("#colorChanger").checked
        let colorSelected=value?"white":"black";
        movements=[];
        initTablero(colorSelected)
        let btnanima=document.querySelector("#btnAnima")
        if(colorSelected=="white"){
            btnanima.removeAttribute("disabled")
        }
        else if(colorSelected=="black"){
            btnanima.setAttribute("disabled",'')
        }
    }    
}
function wideMode(par){
    return function (event) {
        let board=document.querySelector("#chessboard")
         board.classList.toggle("widescreen");
         window.stopEvents=true;        
    }    
}

function getRandom(min,max){
    return Math.round(min+parseInt(Math.random()*(max-min)));
}
function parpadeo(tile,duracion,pausa,nroColor){
    if(window.stopEvents){
        return;
    }
        tile.classList.toggle("pintado");
        tile.classList.toggle("colored-equa-"+nroColor);
        setTimeout(()=>{
            tile.classList.toggle("pintado");
            tile.classList.toggle("colored-equa-"+nroColor);
            if(!window.stopEvents){
                setTimeout(()=>{                    
                    if(!window.stopEvents){
                       parpadeo(tile,duracion,pausa,nroColor) 
                    }            
                },fraccionTiempo*pausa);               
            }            
        },fraccionTiempo*duracion);
   
}
function asignaParpadeo(tile,duracion,pausa,nroColor){
    parpadeo(tile,duracion,pausa,nroColor)
}
function anima(par){    
    return function (event) {

        window.stopEvents=false;
        let colIni="A"
        let rowIni=1
        let stepRow=1
        let stepCol=1
        
        if(colorBottomBoard=="black"){
            colIni="H"
            rowIni=8
            stepRow=-1
            stepCol=-1
        }
        let min=2
        let med=8
        let max=9

    
        for (let indexCol = colIni; indexCol!=null;indexCol = nextColumn(indexCol, stepCol)) {
            let generado=getRandom(min,max)
            let altura=generado>6?getRandom(med,max):generado;
            let amplitud=(altura*2)-1
            for (let indexRow = rowIni; indexRow!=rowIni+(altura*stepRow); 
            indexRow=indexRow+stepRow) {
                let tile=getTile(indexRow,indexCol) 
                //let pausa=((indexRow-min)*2)+1        
                let duracion=((altura-indexRow)*2)+1  
                let pausa=(amplitud-duracion)  
                 
                setTimeout(()=>{           
                    asignaParpadeo(tile,duracion,pausa,indexRow);
                },fraccionTiempo*indexRow);            
            }             
        }     
    };    
}
//guardar movimiento de forma temporal
function saveMove(initPoint,endPoint){
    movements.push(
        {
            piece:initPoint.piece,
            color:initPoint.color,
            start:initPoint,end:endPoint
        }
    )
    console.log({movements})
}
//valida si el peon llega a zona de coronacion
function validatePawnEvolution(initPoint,endPoint){

    let {piece:pieceE,row:rowE,column:columnE,color:colorE}=endPoint
    let {piece:pieceI,row:rowI,column:columnI,color:colorI}=initPoint
    if(pieceI!=="pawn" || (pieceI=="pawn" && rowE>1 && rowE<8)){
        return;
    }
    //quitarle imagen de peon
    let tile = document.querySelector(`:not(.headers-tile)[column="${columnE}"][row="${rowE}"]`)
    //asignar opciones de pieza rotativa
    ///empezamos en la ultima pieza para que la siguiente sea la primera
    let lastPiece=bigPieces[bigPieces.length-1];
    ///bucle cambiador de piezas
    function bucleCambiarImagenes(){
        lastPiece=nextBigPiece(lastPiece)
        
        if(tile.className.includes("loadingTile")){
            tile.classList.remove("loadingTile");
        }    
        tile.classList.add("loadingTile");
        
        changePiece(tile,lastPiece,colorI)    
    }
    bucleCambiarImagenes();
    let idInterval= setInterval(bucleCambiarImagenes,timeChoosePiece,lastPiece)
    
    //asignar evento click para seleccionar pieza
    function detenerBucleImagenes(){
        ///detener bucle
        clearInterval(idInterval);
        ///quitar manejador del click   
        tile.removeEventListener("click",detenerBucleImagenes); 
        tile.classList.remove("loadingTile");       
    }
    //desasignar el evento
    tile.addEventListener("click",detenerBucleImagenes)
    
}

//obtiene siguiente pieza de la lista de piezas canjeables por el peon
function nextBigPiece(piece){
    //buscar pieza en lista
    let index=bigPieces.findIndex(p=>p==piece);
    //siguiente pieza
    index+=1;
    //volver a la pieza inicial de la lista
    if(index==bigPieces.length){
        index=0;
    }
    return bigPieces[index];
}
//cambiar la clase que dibuja la pieza en una casilla
function changePiece(elementHTML,piece,color){
    let classes = elementHTML.className.split(" ")
    for (let index = 0; index < classes.length; index++) {
        let classPiece = classes[index];
        let parts = classPiece.split("-")
        //si existe una pieza en la casilla
        if (parts.length>0 && parts[parts.length-1] == "piece") {
            //quitar piezas de la casilla
            elementHTML.classList.remove(classPiece);
        }
    }
    //agregar nueva pieza
    elementHTML.classList.add(`${piece}-piece`);
    elementHTML.classList.add(`${piece}-${color}-piece`);
}
//obtener datos de ajedrez de la casilla como fila(1-8),columna(A-H),pieza y color
function getPoint(elementHTML) {
    let piece = null
    let colorPlayer = null
    let classes = elementHTML.className.split(" ")
    for (let index = 0; index < classes.length; index++) {
        let classPiece = classes[index];
        let parts = classPiece.split("-")
        if (parts.length == 2 && parts[1] == "piece") {
            piece = parts[0]
        }
        if (parts.length == 3 && parts[2] == "piece") {
            colorPlayer = parts[1];
        }
    }
    let column = elementHTML.getAttribute("column")
    let row = elementHTML.getAttribute("row")
    return { column, row, piece, color: colorPlayer }
}
//validar casilla destino bloqueada por pieza del mismo color
function validateBlockedDestination(initPoint, endPoint) {
    let valid = true
    if (initPoint.color === endPoint.color) {
        valid = false
    }    
    else if (initPoint.piece === "pawn" && endPoint.piece && validateVertical(initPoint, endPoint)) {
        valid = false
    }
    return valid;
}
//validar casillas no accesibles por tener piezas bloqueantes en medio
function validateBlockedPath(initPoint, endPoint) {
    let valid = false
    if (validateDiagonal(initPoint, endPoint)) {
        if (validateBlockedDiagonalPath(initPoint, endPoint)) {
            valid = true;
        }
    }
    else if (validateVertical(initPoint, endPoint)) {
        if (validateBlockedVerticalPath(initPoint, endPoint)) {
            valid = true;
        }
    }
    else if (validateHorizontal(initPoint, endPoint)) {
        if (validateBlockedHorizontalPath(initPoint, endPoint)) {
            valid = true;
        }
    }
    return valid;
}
//valida piezas bloqueantes en direccion diagonal
function validateBlockedDiagonalPath(initPoint, endPoint) {
    let valid = true;
    let verticalDistance = endPoint.row - initPoint.row;
    let horizontalDistance = distanceColumns(initPoint.column, endPoint.column);
    let stepVertical = verticalDistance > 0 ? 1 : -1;
    let stepHorizontal = horizontalDistance > 0 ? 1 : -1;
    let indexH = initPoint.column
    let indexVInitial = (parseInt(initPoint.row) + stepVertical)
    let indexVFinal = parseInt(endPoint.row)
    for (let indexV = indexVInitial; indexV != indexVFinal; indexV += stepVertical) {
        indexH = nextColumn(indexH, stepHorizontal)
        let tile = document.querySelector(`:not(.headers-tile)[class$="-piece"][column="${indexH}"][row="${indexV}"]`)
        if (tile) {
            valid = false
            break;
        }
    }
    return valid;
}
//valida piezas bloqueantes en direccion vertical
function validateBlockedVerticalPath(initPoint, endPoint) {
    let valid = true;
    let verticalDistance = endPoint.row - initPoint.row;
    let stepVertical = verticalDistance > 0 ? 1 : -1;
    let indexVInitial = (parseInt(initPoint.row) + stepVertical)
    let indexVFinal = parseInt(endPoint.row)
    let singleColumn = nextColumn(initPoint.column, 0)
    for (let indexV = indexVInitial; indexV != indexVFinal; indexV += stepVertical) {
        let tile = document.querySelector(`:not(.headers-tile)[class$="-piece"][column="${singleColumn}"][row="${indexV}"]`)
        if (tile) {
            valid = false
            break;
        }
    }
    return valid;
}
//valida piezas bloqueantes en direccion horizontal
function validateBlockedHorizontalPath(initPoint, endPoint) {
    let valid = true;
    let horizontalDistance = distanceColumns(initPoint.column, endPoint.column);

    let stepHorizontal = horizontalDistance > 0 ? 1 : -1;
    let indexH = initPoint.column
    let indexHFinal = endPoint.column

    for (indexH; indexH != indexHFinal; indexH = nextColumn(indexH, stepHorizontal)) {
  
        let tile = document.querySelector(`:not(.headers-tile)[class$="-piece"][column="${indexH}"][row="${initPoint.row}"]`)
        if (tile) {
            valid = false
            break;
        }
    }
    return valid;
}
//validar turno: el siguiente movimiento debe ser un color diferente al anterior
function validateTurn(initPoint){
    let valid=true;
    if(!gameStarted){
        return true;
    }
    //si existen movimientos anteriores
    if( movements.length>0){
        let lastColor=movements[movements.length-1].color;
        if(lastColor==initPoint.color){
            valid=false;
        }
    }
    else if(initPoint.color!=="white"){
        valid=false;
    }
    return valid;
}
//validar movimiento de cada pieza
function validatePieceMove(initPoint, endPoint) {
    let valid = false
    let piece = initPoint.piece
    if(!validateTurn(initPoint)){
        return false;
    }
    if(!validateBlockedDestination(initPoint, endPoint)){
        return false;
    }
    if (piece == "pawn") {
        if (validateDiagonal(initPoint, endPoint, 1)) {
            if (validatePawnDiagonal(initPoint, endPoint)) {
                valid = true;
            }
        }
        else if (validateVertical(initPoint, endPoint, 2) && (
            initPoint.row == 2 || initPoint.row == 7
        )
        ) {
            if (validatePawnVertical(initPoint, endPoint)) {
                valid = true;
            }
        }
        else if (validateVertical(initPoint, endPoint, 1)) {
            if (validatePawnVertical(initPoint, endPoint)) {
                valid = true;
            }
        }
    }
    else if (piece == "king") {
        if (validateDiagonal(initPoint, endPoint, 1)) {
            valid = true;
        }
        else if (validateVertical(initPoint, endPoint, 1)) {
            valid = true;
        }
        else if (validateHorizontal(initPoint, endPoint, 1)) {
            valid = true;
        }
    }
    else if (piece == "queen") {
        if (validateDiagonal(initPoint, endPoint)) {
            valid = true;
        }
        else if (validateVertical(initPoint, endPoint)) {
            valid = true;
        }
        else if (validateHorizontal(initPoint, endPoint)) {
            valid = true;
        }
    }
    else if (piece == "bishop") {
        if (validateDiagonal(initPoint, endPoint)) {
            valid = true;
        }
    }
    else if (piece == "rook") {
        if (validateVertical(initPoint, endPoint)) {
            valid = true;
        }
        else if (validateHorizontal(initPoint, endPoint)) {
            valid = true;
        }
    }
    else if (piece == "knight") {
        if (validateELLE(initPoint, endPoint)) {
            valid = true;
        }
    }
    if (valid) {
        valid = false;
        if (piece == "knight" || validateBlockedPath(initPoint, endPoint)) {
            valid = true;
        }
    }
    return valid;
}
//validar movimiento diagonal del peon
function validatePawnDiagonal(inicio, fin) {    
    let valid=true;
    let distanciaMax = 1
    let verticalDistance = fin.row - inicio.row;
    let horizontalDistance = distanceColumns(inicio.column, fin.column);
    //validar equidistancia vertical y horizontal
    if (Math.abs(verticalDistance) !== Math.abs(horizontalDistance)) {
        return false;
    }
    //validar distancia maxima 1
    if (Math.abs(verticalDistance) > distanciaMax) {
        return false;
    }
    //validar exista pieza de color contrario
    if(!fin.color || inicio.color==fin.color){
        return false;
    }
    //validar direccion correcta vertical segun color
    valid=validatePawnDirection(inicio.color, verticalDistance);
    return valid;
}
function verticalPawnDiff(color){
    return color==="white"?1:
        (color==="black"?-1:0);
}
//validar direccion correcta del peon(hacia arriba/abajo)
function validatePawnDirection(colorPlayer, verticalDistance) {
    return (verticalPawnDiff(colorPlayer)===verticalDistance)
    || (2*verticalPawnDiff(colorPlayer)===verticalDistance);
   
}
//validar movimiento vertical del peon
function validatePawnVertical(inicio, fin) {
    let verticalDistance = fin.row - inicio.row;
    return validatePawnDirection(inicio.color, verticalDistance);
}
//validar movimiento diagonal
function validateDiagonal(inicio, fin, distanciaMax = 0) {
    let valid = true;
    let verticalDistance = fin.row - inicio.row;
    let horizontalDistance = distanceColumns(inicio.column, fin.column);
    if (Math.abs(verticalDistance) !== Math.abs(horizontalDistance)) {
        valid = false;
    }
    else if(Math.abs(verticalDistance)==0){
        valid = false;
    }
    else if (distanciaMax > 0 && Math.abs(verticalDistance) > distanciaMax) {
        valid = false;
    }
    return valid;
}
//validar movimiento vertical
function validateVertical(inicio, fin, distanciaMax = 0) {
    let valid = true;
    let verticalDistance = fin.row - inicio.row;
    let horizontalDistance = distanceColumns(inicio.column, fin.column);
    if (Math.abs(horizontalDistance) > 0) {
        valid = false;
    }
    else if (distanciaMax > 0 && Math.abs(verticalDistance) > distanciaMax) {
        valid = false;
    }
    return valid;
}
//validar movimiento horizontal
function validateHorizontal(inicio, fin, distanciaMax = 0) {
    let valid = true;
    let horizontalDistance = distanceColumns(inicio.column, fin.column);
    let verticalDistance = fin.row - inicio.row;
    if (Math.abs(verticalDistance) > 0) {
        valid = false;
    }
    else if (distanciaMax > 0 && Math.abs(horizontalDistance) > distanciaMax) {
        valid = false;
    }
    return valid;
}
//validar movimiento en L (caballo)
function validateELLE(inicio, fin) {
    let valid = false;
    let horizontalDistance = distanceColumns(inicio.column, fin.column);
    let verticalDistance = fin.row - inicio.row;
    if (
        (Math.abs(verticalDistance) == 2 && Math.abs(horizontalDistance) == 1) ||
        (Math.abs(verticalDistance) == 1 && Math.abs(horizontalDistance) == 2)
    ) {
        valid = true;
    }
    return valid;
}
//calcular distancia entre columnas (A-H)
function distanceColumns(columnInit, columnEnd) {
    let init = columnas.findIndex(x => x == columnInit)
    let end = columnas.findIndex(x => x == columnEnd)
    return end - init;
}