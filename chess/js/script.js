/***************************************************************************************************
 ************************************VARIABLES******************************************************* 
 ****************************************************************************************************/

var colorP1 = 'W'; //Bottom player
var colorP2 = 'B'; //Top player
var numberTurns = 1; //Game starts with the turn 1
var canNextTurn;
var playerTurn; //who is playing currently | White starts

var matrix;

var state; //0 : select pieces | 1 : player chooses on which case he wants to go
var rgbColor1;
var rgbColor2;
var rgbColorCaseSelect;
var rgbColorPossibleMov;

var currentPiece; //case on which there is the piece (player clicks on)
var arrayMov; //cases where the piece can go | [elt, line, col]
var arraySpecialMov; //for rock or special movement of pawn | [line,col,nameMovement]

var p1CanRockLeft, p1CanRockRight; //the player hasn't moved its king or its rook yet || this doesn't check if the cases between king and rook are available
var p2CanRockLeft, p2CanRockRight;


/***************************************************************************************************
 ***********************************INIT FUNCTIONS*************************************************** 
 ****************************************************************************************************/

function InitVariables()
{   
    numberTurns=1;
    playerTurn = colorP1=='W' ? colorP1 : colorP2;
    rgbColor1=document.getElementById("case0-0").style.backgroundColor;
    rgbColor2=document.getElementById("case0-1").style.backgroundColor;
    rgbColorCaseSelect="rgb(255, 235, 0)";
    rgbColorPossibleMov="rgb(255, 0, 0)";
    currentPiece=null;
    arrayMov=[]; arraySpecialMov=[];
    p1CanRockLeft=true; p1CanRockRight=true;
    p2CanRockLeft=true; p2CanRockRight=true;
    canNextTurn=true;

    //Init matrix
    matrix = [
        [colorP2+"R",colorP2+"Kn",colorP2+"B",colorP2+(colorP2=='B'?'Q':'Ki'),colorP2+(colorP2=='B'?'Ki':'Q'),colorP2+"B",colorP2+"Kn",colorP2+"R"],
        [colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P"],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        [colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P"],
        [colorP1+"R",colorP1+"Kn",colorP1+"B",colorP1+(colorP1=='W'?'Q':'Ki'),colorP1+(colorP1=='W'?'Ki':'Q'),colorP1+"B",colorP1+"Kn",colorP1+"R"]
    ];

    console.log(matrix);
}


function InitBoard()
{   
    InitLine(colorP2, 0);
    InitLine(colorP2, 1);
    InitLine(colorP1, 6);
    InitLine(colorP1, 7);
}

/*** Insert all the pieces on the line with the associated color (the one of the player) */
function InitLine (color, line)
{
    for (let j=0; j<8; j++)
    {   
        InitCase(color, line, j);
    }
}

/*** Insert the piece image at line - col on board, with the associated color (the one of the player) */
function InitCase(color, line, col)
{   
    let elt = document.getElementById("case"+line.toString()+"-"+col.toString());
    let str;
    
    if (line==1 || line==6)
    {
        str="P";
    }
    else
    {
        switch (col)
        {
            case (0): //Rook
            case (7):
                str="R";
                break;
            
            case (1): //Knight
            case (6):
                str="Kn";
                break;
            
            case (2): //Bishop
            case (5):
                str="B";
                break;
            
            default :
                //if the color is the same as the argument, we place the queen | else it is the king
                str = (elt.getAttribute("class").slice("-1").localeCompare((color=='W') ? '1' : '2' )!=0) ? "Ki" : "Q";
        }
    }
    let img = document.createElement("img");
    img.setAttribute("src", "../img/"+color+str+".png");
    img.setAttribute("alt", "image"+color+str);
    elt.appendChild(img);
}


function InitCasesEvents()
{   
    //superficial copy
    Array.from(document.getElementsByClassName("case_color1")).forEach(elt => elt.addEventListener
        ("click", function(){
            ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
        })
    );
    Array.from(document.getElementsByClassName("case_color2")).forEach(elt => elt.addEventListener
        ("click", function(){
            ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
        })
    );
}

/***************************************************************************************************
 **************************************************************************************************** 
 ****************************************************************************************************/


function MovedPieceOnCase(eltInit, lineInit, colInit, eltDest, lineDest, colDest ) //move the node img and update Matrix | elt=html div
{   
    if (eltDest.firstChild!=null && eltDest.firstChild.tagName.localeCompare("img")!=0) //remove the existant image of piece
            eltDest.removeChild(eltDest.firstChild);
    eltDest.appendChild(eltInit.firstChild); //Node img automatically moved to the destination case
    
    matrix[lineDest][colDest]=matrix[lineInit][colInit];
    matrix[lineInit][colInit]="";
}

 function CheckMovementOnBoard(line,col) //Movement doesn't go over the board
{   
    return 0<=line && line<8 && 0<=col && col<8;
}


function ResetPieceSelection()
{   
    currentPiece[0].style.backgroundColor=null;
    Array.from(arrayMov).forEach(elt => document.getElementById("case"+elt[0]+"-"+elt[1]).style.backgroundColor = null);
    Array.from(arraySpecialMov).forEach(elt => document.getElementById("case"+elt[0]+"-"+elt[1]).style.backgroundColor = null);
    currentPiece=null;
    arrayMov=[];
    arraySpecialMov=[];
}

function UpdateRock(namePiece, line, col) //Check if the player still can do a rock after his movement with the piece namePiece from the case [line,col]
{   
    if (namePiece.localeCompare("Ki")==0) //the player has moved the king but he was able to do the rock before, so now he cannot
    {   
        if (playerTurn==colorP1 && (p1CanRockLeft || p1CanRockRight)) { p1CanRockLeft=false; p1CanRockRight=false; }
        else if (playerTurn==colorP2 && (p2CanRockLeft || p2CanRockRight)) { p2CanRockLeft=false; p2CanRockRight=false; }
    }
    else if (namePiece.localeCompare("R")==0 && ( (playerTurn==colorP1 && (p1CanRockLeft || p1CanRockRight)) || (playerTurn==colorP2 && (p2CanRockLeft || p2CanRockRight)) ) ) 
    {   //check if it concerns the left or right rook
        if ((line==0 && col==7) || (line==7 && col==0))//left
        {   
            if (playerTurn==colorP1 && p1CanRockLeft) p1CanRockLeft=false;
            if (playerTurn==colorP2 && p2CanRockLeft) p2CanRockLeft=false;
        }
        else if ((line==0 && col==0) || (line==7 && col==7)) //Right
        {
            if (playerTurn==colorP1 && p1CanRockRight) p1CanRockRight=false;
            if (playerTurn==colorP2 && p2CanRockRight) p2CanRockRight=false;
        }
    }
}

function NextTurn()
{   
    if (canNextTurn) playerTurn=(playerTurn==colorP1) ? colorP2 : colorP1;
}

function CheckMovInList(line, col, listMov) //Check if the array[line,col] is contained in listMov
{
    if (listMov.length!=0)
    {
        for (let i=0; i<listMov.length; i++)
        {   
            if (listMov[i][0]==line && listMov[i][1]==col)
                return true;
        }
    }
    return false;
}

function GetMovementsPawn(line, col)
{   
    let listMov = new Array();
    let k=playerTurn==colorP2 ? 1 : -1;
    if ( (line==6 || line==1) && CheckMovementOnBoard(line+2*k,col) && matrix[line+2*k][col]=="") //On its first line, the pawn is able to jump two cases
        listMov.push([line+2*k, col]);
    if (CheckMovementOnBoard(line+1*k,col) && matrix[line+1*k][col]=="") //there isn't another piece on the up case
        listMov.push([line+1*k, col]);
    if (CheckMovementOnBoard(line+1*k,col+1) && matrix[line+1*k][col+1]!="" && matrix[line+1*k][col+1].charAt(0)!=playerTurn )
        listMov.push([line+1*k,col+1]);
    if (CheckMovementOnBoard(line+1*k,col-1) && matrix[line+1*k][col-1]!="" && matrix[line+1*k][col-1].charAt(0)!=playerTurn)
        listMov.push([line+1*k,col-1]);
    return listMov;
}


//recursive function
function GetMovementsRook(line, col, kx, ky) //kx and ky are the coeff | first values are 1 and 0 (down)
{  
    let listMov = new Array();
    while (CheckMovementOnBoard(line+kx, col+ky))
    {   
        if (matrix[line+kx][col+ky]=="" || matrix[line+kx][col+ky].charAt(0)!=playerTurn)
            listMov.push([line+kx, col+ky]);

        if (matrix[line+kx][col+ky]!="")
            break;
        kx += kx>0 ? 1 : (kx<0 ? -1 : 0);
        ky += ky>0 ? 1 : (ky<0 ? -1 : 0);
    }

    if (kx>0) return listMov.concat(GetMovementsRook(line, col, -1, 0)); //up
    else if (kx<0) return listMov.concat(GetMovementsRook(line, col, 0, 1)) //right
    else if (ky>0) return listMov.concat(GetMovementsRook(line, col, 0, -1)) //left
    else return listMov;
}


function GetMovementsKnight(line, col)
{
    let listMov = new Array();
    if (CheckMovementOnBoard(line-2, col+1) && (matrix[line-2][col+1]=="" || matrix[line-2][col+1].charAt(0)!=playerTurn)) listMov.push([line-2,col+1]);
    if (CheckMovementOnBoard(line-2, col-1) && (matrix[line-2][col-1]=="" || matrix[line-2][col-1].charAt(0)!=playerTurn)) listMov.push([line-2,col-1]);
    if (CheckMovementOnBoard(line-1, col+2) && (matrix[line-1][col+2]=="" || matrix[line-1][col+2].charAt(0)!=playerTurn)) listMov.push([line-1,col+2]);
    if (CheckMovementOnBoard(line-1, col-2) && (matrix[line-1][col-2]=="" || matrix[line-1][col-2].charAt(0)!=playerTurn)) listMov.push([line-1,col-2]);
    if (CheckMovementOnBoard(line+1, col+2) && (matrix[line+1][col+2]=="" || matrix[line+1][col+2].charAt(0)!=playerTurn)) listMov.push([line+1,col+2]);
    if (CheckMovementOnBoard(line+1, col-2) && (matrix[line+1][col-2]=="" || matrix[line+1][col-2].charAt(0)!=playerTurn)) listMov.push([line+1,col-2]);
    if (CheckMovementOnBoard(line+2, col+1) && (matrix[line+2][col+1]=="" || matrix[line+2][col+1].charAt(0)!=playerTurn)) listMov.push([line+2,col+1]);
    if (CheckMovementOnBoard(line+2, col-1) && (matrix[line+2][col-1]=="" || matrix[line+2][col-1].charAt(0)!=playerTurn)) listMov.push([line+2,col-1]);
    return listMov;
}

//recursive function
function GetMovementsBishop(line, col, kx, ky) //kx and ky are coeffs | calling first with 1 and 1 (down right)
{
    let listMov = new Array();
    while (CheckMovementOnBoard(line+kx, col+ky))
    {   
        if (matrix[line+kx][col+ky]=="" || matrix[line+kx][col+ky].charAt(0)!=playerTurn)
            listMov.push([line+kx, col+ky]);

        if (matrix[line+kx][col+ky]!="")
            break;
        kx += kx>0 ? 1 : -1;
        ky += ky>0 ? 1 : -1;
    }

    if (kx>0 && ky>0) return listMov.concat(GetMovementsBishop(line, col, -1, 1)); //up right
    else if (kx<0 && ky>0) return listMov.concat(GetMovementsBishop(line, col, -1, -1)) //up left
    else if (kx<0 && ky<0) return listMov.concat(GetMovementsBishop(line, col, 1, -1)) //down left
    else return listMov;
}


function GetMovementsQueen(line, col)
{
    return (GetMovementsRook(line,col,1,0).concat(GetMovementsBishop(line,col,1,1)));
}

function GetMovementsKing(line,col)
{
    let listMov = new Array();
    for (let i=line-1; i<line+2; i++)
    {
        for (let j=col-1; j<col+2; j++)
        {
            if ( (i!=line || j!=col) && CheckMovementOnBoard(i,j) && (matrix[i][j]=="" || matrix[i][j].charAt(0)!=playerTurn))
                listMov.push([i,j]);
        }
    }
    return listMov;
}

function GetMovementsRock(line,col) //only when player selects the king
{   
    let listMov = new Array();
    //Check if the cases on the left or right are availables (no piece)
    //Situation changes if queen is on the side of the rock

    if ( ((playerTurn==colorP1 && p1CanRockLeft) || (playerTurn==colorP2 && p2CanRockLeft)) //current player can rock on the left
        && ( (line==0 && matrix[line][5]=="" && matrix[line][6]=="" && (col==4 ? true : matrix[line][4]=="") ) 
            || (line==7 && matrix[line][2]=="" && matrix[line][1]=="" && (col==4 ? matrix[line][3]=="" : true)  ) ) ) 
    {   
        listMov.push( [line, (line==0 ? (col==4 ?  6 : 5) : (col==4 ?  2 : 1)), "RockLeft"]);
    }   
    else if ( ((playerTurn==colorP1 && p1CanRockRight) || (playerTurn==colorP2 && p2CanRockRight)) //current player can rock on the right
        && ( (line==0 && matrix[line][2]=="" && matrix[line][1]=="" && (col==4 ? matrix[line][3]=="" : true) ) 
            || (line==7 && matrix[line][5]=="" && matrix[line][6]=="" && (col==4 ? true : matrix[line][4]=="") ) ) ) 
    {   
        listMov.push( [line, (line==0 ? (col==4 ?  2 : 1) : (col==4 ?  6 : 5)), "RockRight"]);
    }
    return listMov;
}


function DoingSpecialMov(line, col) //line and col represents where the piece goes
{   
    let nameMov; //We need to know what's the special mov that the player wants to do
    let futurCol, initCol;
    for (let i=0; i<arraySpecialMov.length; i++)
    {
        if (arraySpecialMov[i][0]==line && arraySpecialMov[i][1]==col) {nameMov=arraySpecialMov[i][2]; break;}
    }
    switch (nameMov)
    {
        case ("RockLeft"): //the tower on the left of the king
            futurCol= (line==0 ? col-1 : col+1);
            initCol=(line==0 ? 7 : 0); 
            MovedPieceOnCase(document.getElementById("case"+line+"-"+initCol), line, initCol, document.getElementById("case"+line+"-"+futurCol), line, futurCol);
            break;
        case ("RockRight"):
            initCol=(line==0 ? 0 : 7); 
            futurCol= (line==0 ? col+1 : col-1);
            MovedPieceOnCase(document.getElementById("case"+line+"-"+initCol), line, initCol, document.getElementById("case"+line+"-"+futurCol), line, futurCol);
            break;
        
        default:
            break;
    }
}


/***************************************************************************************************
 **************************************************************************************************** 
 ****************************************************************************************************/

function ClickOnCase(elt, line, col)
{   
    line=parseInt(line);
    col=parseInt(col);

    if (matrix[line][col]!="" && matrix[line][col].charAt(0)==playerTurn) //the current player has select one of his piece
    {   
        console.log("select");
        if (currentPiece!=null)
            ResetPieceSelection();
        currentPiece=[elt,line,col];

        elt.style.backgroundColor = rgbColorCaseSelect;
        switch (matrix[line][col].slice(1))
        {
            case ("P"):
                arrayMov=GetMovementsPawn(line, col);
                break;

            case ("R"):
                arrayMov=GetMovementsRook(line,col, 1, 0);
                break;

            case ("Kn"):
                arrayMov=GetMovementsKnight(line,col);
                break;

            case ("B"):
                arrayMov=GetMovementsBishop(line,col,1,1);
                break;

            case ("Q"):
                arrayMov=GetMovementsQueen(line,col);
                break;

            case ("Ki"):
                arrayMov=GetMovementsKing(line,col);
                arraySpecialMov=GetMovementsRock(line,col);
                break;
        }
        if (arrayMov.length!=0) //if there is at least one movement
        {   
            // console.log(arrayMov.length);
            Array.from(arrayMov).forEach(val => document.getElementById("case"+val[0]+"-"+val[1]).style.backgroundColor= rgbColorPossibleMov);
        }
        if (arraySpecialMov.length!=0)
            Array.from(arraySpecialMov).forEach(val => document.getElementById("case"+val[0]+"-"+val[1]).style.backgroundColor= rgbColorPossibleMov);
        // NextTurn();
    }

    else if (currentPiece!=null && (CheckMovInList(line, col, arrayMov) || CheckMovInList(line, col, arraySpecialMov)) ) //The player has clicked on a case on which the piece he has selected can go
    {   
                        //Init..............................................Dest
        MovedPieceOnCase(currentPiece[0], currentPiece[1], currentPiece[2], elt, line, col);

        if (CheckMovInList(line, col, arraySpecialMov))
            DoingSpecialMov(line,col);
        
        console.log("dest :"+matrix[line][col]);
        console.log("init :"+matrix[currentPiece[1]][currentPiece[2]]);

        UpdateRock(matrix[line][col].slice(1), currentPiece[1], currentPiece[2]);
        ResetPieceSelection();
        
        NextTurn();
    }
}

function draw()
{
    var canvas = document.getElementById('circle');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d'); 
        var X = canvas.width / 2;
        var Y = canvas.height / 2;
        var R = 45;
        ctx.beginPath();
        ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFF00';
        ctx.stroke();
    }
}




document.addEventListener('DOMContentLoaded', (event) => {
    InitVariables();
    InitBoard();
    InitCasesEvents();
    draw();
});