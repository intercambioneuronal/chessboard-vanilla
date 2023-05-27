let posibleMovs=[];
let attackedTiles=[];
let rows=[1,2,3,4,5,6,7,8];
let columns=["A","B","C","D","E","F","G","H"];

//obtener casilla
function getTile(row,column){
    let tile= document.querySelector(`:not(.headers-tile)[column="${column}"][row="${row}"]`)
    return tile;
}
function getAnyTile(row,column){
    let tile= document.querySelector(`[column="${column}"][row="${row}"]`)
    return tile;
}
function getRowLimit(stepRow){
    if(stepRow==1){
        return 8;
    }
    else if(stepRow==-1){
        return 1;
    }
    return null;
}
function getColumnLimit(stepColumn){
    if(stepColumn==1){
        return "H";
    }
    else if(stepColumn==-1){
        return "A";
    }
    return null;
}
function diagonalSpecificSearch(infoStart,distance,stepRow,stepColumn){
    let {row,column,color,piece}=infoStart;
    let indexRow
    let indexColumn=column
    let movements=[]
    let curDistance=1

    for (indexRow = parseInt(row); indexRow!== getRowLimit(stepRow)+stepRow; 
    indexRow+=stepRow) {
        if(distance>0 && curDistance>distance){
            break;
        }        
        if(indexRow !== parseInt(row) && indexColumn!==column){
            let tile=getTile(indexRow,indexColumn)
            let infoNext=getPoint(tile)
            if(infoNext.color && color===infoNext.color){
                break;
            }
            else if(infoNext.color && color!==infoNext.color){
                movements.push({
                    row:indexRow,column:indexColumn
                })
                break;
            }
            else{
                if(piece!=="pawn"){
                    movements.push({
                        row:indexRow,column:indexColumn
                    })                    
                }
            }
            curDistance++  
        }  
        indexColumn = nextColumn(indexColumn, stepColumn) 
        if(!indexColumn){
            break;
        }  
                   
    }
    return movements;
}
function verticalSpecificSearch(infoStart,distance,stepRow){
    let {row,column,color,piece}=infoStart;
    let indexRow
    let indexColumn=column
    let movements=[]
    let curDistance=1

    for (indexRow = parseInt(row); indexRow!== getRowLimit(stepRow)+stepRow; 
    indexRow+=stepRow) {
        if(distance>0 && curDistance>distance){
            break;
        }        
        if(indexRow !== parseInt(row)){
            let tile=getTile(indexRow,indexColumn)
            let infoNext=getPoint(tile)
            if(infoNext.color && color===infoNext.color){
                break;
            }
            else if(infoNext.color && color!==infoNext.color){
                movements.push({
                    row:indexRow,column:indexColumn
                })
                break;
            }
            else{               
                movements.push({
                    row:indexRow,column:indexColumn
                })  
            }
            curDistance++  
        }                     
    }
    return movements;
}
function horizontalSpecificSearch(infoStart,distance,stepColumn){
    let {row,column,color,piece}=infoStart;
    let indexRow=parseInt(row)
    let indexColumn
    let movements=[]
    let curDistance=1
    for (indexColumn=column; indexColumn!== getColumnLimit(stepColumn)+stepColumn; 
    indexColumn = nextColumn(indexColumn, stepColumn)) {
        if(distance>0 && curDistance>distance){
            break;
        }   
        if(!indexColumn){
            break;
        }      
        if(indexColumn!==column){
            let tile=getTile(indexRow,indexColumn)
            let infoNext=getPoint(tile)
            if(infoNext.color && color===infoNext.color){
                break;
            }
            else if(infoNext.color && color!==infoNext.color){
                movements.push({
                    row:indexRow,column:indexColumn
                })
                break;
            }
            else{                
                movements.push({
                    row:indexRow,column:indexColumn
                }) 
            }
            curDistance++  
        } 
                   
    }
    return movements;
}
function diagonalSearch(infoStart,move,oriented){
    let movements=[]
    if(oriented && infoStart.piece=="pawn"){
        if(validatePawnDirection(infoStart.color,1)){
            movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,1,1)]
            movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,1,-1)]            
        }
        if(validatePawnDirection(infoStart.color,-1)){
            movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,-1,1)]
            movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,-1,-1)]            
        }
    }
    else {
        movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,1,1)]
        movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,1,-1)]
        movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,-1,1)]
        movements=[...movements,...diagonalSpecificSearch(infoStart,move.distance,-1,-1)]
    }
    posibleMovs.push(
        { 
            info:infoStart,
            type:move.type,
            movements
        }
    )
}
function initialRowByColor(color){
    let initialRow=null
    if(color==="white"){
        initialRow=2;
    }
    else if(color==="black"){
        initialRow=7;
    }
    return initialRow;
}
function verticalSearch(infoStart,move,oriented){
    let movements=[];
    let {distance}=move;
    if(oriented && infoStart.piece=="pawn"){
        let initialRow=initialRowByColor(infoStart.color);
        //condition movement 2 tiles long for first movement
        if(distance==2 && initialRow!==parseInt(infoStart.row)){
            distance=1;
        }        
        if(validatePawnDirection(infoStart.color,1)){

            movements=[...movements,...verticalSpecificSearch(infoStart,distance,1)]           
        }
        if(validatePawnDirection(infoStart.color,-1)){
            movements=[...movements,...verticalSpecificSearch(infoStart,distance,-1)]                      
        }
    }
    else {
        movements=[...movements,...verticalSpecificSearch(infoStart,move.distance,1)]
        movements=[...movements,...verticalSpecificSearch(infoStart,move.distance,-1)]
    }
    posibleMovs.push(
        { 
            info:infoStart,
            type:move.type,
            movements
        }
    )
}
function horizontalSearch(infoStart,move){
    let movements=[];
    movements=[...movements,...horizontalSpecificSearch(infoStart,move.distance,1)]
    movements=[...movements,...horizontalSpecificSearch(infoStart,move.distance,-1)]

    posibleMovs.push(
        { 
            info:infoStart,
            type:move.type,
            movements
        }
    )
}
function ELLESpecificSearch(infostart){
    let {row:rowIni,column:columnIni,color}=infostart;
    let stepRows=[-2,-1,1,2]
    let stepColumns=[-1,-2,1,2]
    let movements=[]
    for (let indexRow = 0; indexRow < stepRows.length; indexRow++) {
        for (let indexColumn = 0; indexColumn < stepColumns.length; indexColumn++) {
            if(Math.abs(stepRows[indexRow])!==Math.abs(stepColumns[indexColumn])){   

                const column =nextColumn(columnIni, stepColumns[indexColumn]);
                const row =parseInt(rowIni)+ stepRows[indexRow];
                if(row<1 || row>8 || !column){
                    continue;
                }
                let tile=getTile(row,column)
                let infoNext=getPoint(tile)
                if(infoNext.color && color===infoNext.color){
                    continue;
                }
                else if(infoNext.color && color!==infoNext.color){
                    movements.push({
                        row,column
                    })
                    continue;
                }
                else{                
                    movements.push({
                        row,column
                    }) 
                }
            }
        }
    }
    return movements;
}
function ELLESearch(infoStart,move){
    let movements=[];
    movements=[...movements,...ELLESpecificSearch(infoStart)]
    posibleMovs.push(
        { 
            info:infoStart,
            type:move.type,
            movements
        }
    )
}
function validateEmptyNotAttackedPath(initPoint,endPoint){
    let valid = true;
    let horizontalDistance = distanceColumns(initPoint.column, endPoint.column);

    let stepHorizontal = horizontalDistance > 0 ? 1 : -1;
    let indexH = initPoint.column
    let indexHFinal = endPoint.column
    let counterTwoTiles=1;
    for (indexH; indexH != indexHFinal; indexH = nextColumn(indexH, stepHorizontal)) {  
        let tile = getTile(initPoint.row,indexH)
        if(indexH === initPoint.column){
            continue;
        }
        //if not empty
        if (tile) {
            let point=getPoint(tile)
            if(point.piece){
                valid = false
                break;                
            }
        }
        //if attacked tiles
        if(counterTwoTiles<=2 && isAttacked(indexH,initPoint.row,initPoint.color)){
            valid = false
            break;
        }
        counterTwoTiles++;
    }
    return valid;
}
function isAttacked(column,row,color){
    row=parseInt(row);
    return posibleMovs.find(p=>p.movements.find(m=>m.column===column 
        && m.row===row && p.info.color!==color));
}
function validarCapturaPeon(initPoint,endPoint){
    if(initPoint.piece!=="pawn"){
        return false;
    }
    if(endPoint.piece!=="pawn"){
        return false;
    } 
    if(endPoint.color===initPoint.color){
        return false;
    } 
    if(movements.length===0){
        return false;
    }
    let lastMove=movements[movements.length-1]
    if(lastMove.piece!=="pawn"){
        return false;
    }    
    //validar peon se movio 2 casillas en el ultimo movimiento
    if(Math.abs(parseInt(lastMove.end.row)-parseInt(lastMove.start.row))!==2){
        return false;
    }
    //validar columnas contiguas
    if(Math.abs(distanceColumns(initPoint.column,endPoint.column))!==1){
        return false;
    }
    return true;
}
function validarEnroque(initPoint,endPoint){
    let valid=true
    if(initPoint.piece!=="king"){
        return false;
    }
    if(endPoint.piece!=="rook"){
        return false;
    }
    //rey no se movio
    let index=movements.findIndex(p=>p.color===initPoint.color && p.piece==="king")
    if(index!==-1){
        return false;
    }
    //torre no se movio
    index=movements.findIndex(p=>p.color===initPoint.color && p.piece==="rook"
    && p.end["column"]===endPoint.column && p.end["row"]===endPoint.row)
    if(index!==-1){
        return false;
    }
    //El rey no está en jaque
    if(isAttacked(initPoint.column,initPoint.row,initPoint.color)){
        return false;
    }
    //Ninguno de los escaques por los que el rey pasará o quedará, está bajo ataque.​
    //Los escaques entre el rey y la torre estén desocupados
    //El rey no termina en jaque (válido para cualquier movimiento legal)
    if(!validateEmptyNotAttackedPath(initPoint,endPoint)){
        return false;
    }
    return valid;
}
//calcular movimiento posibles
function calcPosibleMovs(info){
    if(info.piece){
        let index=PieceMovs.findIndex(p=>p.piece==info.piece)
        if(index!==-1){
            let {moves,oriented}=PieceMovs[index];
            for (let indexMoves = 0; indexMoves < moves.length; indexMoves++) {
                const move = moves[indexMoves];
                if(move.type=="diagonal"){
                    diagonalSearch(info,move,oriented)
                }
                else if(move.type=="vertical"){
                    verticalSearch(info,move,oriented)
                }
                else if(move.type=="horizontal"){
                    horizontalSearch(info,move)
                }
                else if(move.type=="ELLE"){
                    ELLESearch(info,move)
                }
            }
        }
    }        
}
//calculations
function calculations(){
    posibleMovs=[]
    for (let indexRow = 0; indexRow < rows.length; indexRow++) {
        const row = rows[indexRow];
        for (let indexColumn = 0; indexColumn < columns.length; indexColumn++) {
            const column = columns[indexColumn];
            let tile=getTile(row,column);
            let info=getPoint(tile);
            calcPosibleMovs(info);
        }
    }
    console.log("posibleMovs",posibleMovs)
}