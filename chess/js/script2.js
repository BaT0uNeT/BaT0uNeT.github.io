/***************************************************************************************************
 ************************************GAME MANAGER****************************************************
 ****************************************************************************************************/

import {Board} from "./classObj.js";

const rgbColor1=document.getElementById("case0-0").style.backgroundColor;
const rgbColor2=document.getElementById("case0-1").style.backgroundColor;
const rgbColorCaseSelect="rgb(255, 235, 0)";
const rgbColorPossibleMov="rgb(255, 0, 0)";


class GameManager
{
    #numberTurns = 1; //Game starts with the turn 1
    #canNextTurn;
    #playerTurn; //who is playing currently | White starts

    #state; //0 : select pieces | 1 : player chooses on which case he wants to go
    
    #currentPiece; //cases where the piece can go | [elt, line, col]
    #pawnMovedOn2Cases; //contains the last pawn which moved 2 cases forward, in order to check PassantCapture | [elt, line, col]
    #pawnReachingEnd; //contains the pawn who reached the last line (for the current player) | [elt, line, col]
    #arrayMov; //case on which there is the piece (player clicks on)
    #arraySpecialMov; //for castling or special movement of pawn | [line,col,nameMovement]

    #board;
    #colorP1;
    #colorP2;

    constructor (cP1, cP2) 
    {   
        this.#board=new Board(cP1, cP2);
        this.#InitGame(cP1, cP2);
    }    

    #InitGame(cP1, cP2)
    {
        this.#numberTurns=1;
        this.#canNextTurn=true;
        this.#colorP1=cP1;
        this.#colorP2=cP2;
        this.#playerTurn = cP1=='B' ? cP1 : cP2;
        this.#currentPiece=null;
        this.#pawnMovedOn2Cases=null;
        this.#pawnReachingEnd=null;
        this.#arrayMov=[]; 
        this.#arraySpecialMov=[];
        this.#InitBoard();
    }

    #ResetGame() //colors are inverted
    {     
        this.#InitGame(this.#colorP1=='W' ? 'B' : 'W', this.#colorP2=='W' ? 'B' : 'W' );
    }

    #CheckMovInList(line, col, listMov) //Check if the array[line,col] is contained in listMov
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

    /***************************************************************************************************
     **************************************************************************************************** 
    ****************************************************************************************************/

    #InitBoard()
    {   
        this.#InitButton(this.#colorP2, 1);
        this.#InitLine(this.#colorP2, 0);
        this.#InitLine(this.#colorP2, 1);
        this.#InitLine(this.#colorP1, 6);
        this.#InitLine(this.#colorP1, 7);
        this.#InitButton(this.#colorP1, 0);
    }
    
    /*** Insert all the pieces on the line with the associated color (the one of the player) */
    #InitLine (color, line)
    {
        for (let j=0; j<8; j++)
        {   
            this.#InitCase(color, line, j);
        }
    }
    
    /*** Insert the piece image at line - col on board, with the associated color (the one of the player) */
    #InitCase(color, line, col)
    {   
        let elt = document.getElementById("case"+line.toString()+"-"+col.toString());
        if (elt.firstChild!=null && elt.firstChild.tagName.localeCompare("img")!=0) //remove the existant image of piece
            elt.removeChild(elt.firstChild);
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
    
    #InitButton(color, line)
    {   
        let elt;
        for (let i=0; i<4; i++)
        {   
            elt = document.getElementById("button"+line+"-"+i);
            switch (i)
            {
                case (0): //Queen
                    elt.setAttribute("src", "../img/"+color+"Q.png");
                    break;
                case (1): //bishop
                    elt.setAttribute("src", "../img/"+color+"B.png");
                    break;
                case (2): //knight
                    elt.setAttribute("src", "../img/"+color+"Kn.png");
                    break;
                case (3): //rook
                    elt.setAttribute("src", "../img/"+color+"R.png");
                    break;
            }
        }
    }
    
    InitCasesEvents()
    {   
        let gm=this;
        //superficial copy
        Array.from(document.getElementsByClassName("case_color1")).forEach(elt => elt.addEventListener
            ("click", function(){
                gm.#ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
            })
        );
        Array.from(document.getElementsByClassName("case_color2")).forEach(elt => elt.addEventListener
            ("click", function(){
                gm.#ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
            })
        );
    }

    InitCasesEvents()
    {   
        let gm=this;
        //superficial copy
        Array.from(document.getElementsByClassName("case_color1")).forEach(elt => elt.addEventListener
            ("click", function(){
                gm.#ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
            })
        );
        Array.from(document.getElementsByClassName("case_color2")).forEach(elt => elt.addEventListener
            ("click", function(){
                gm.#ClickOnCase(elt, elt.getAttribute("id").substr(4, 1), elt.getAttribute("id").slice(-1));
            })
        );
    }

    InitButtonsEvents() //give to every buttons the function event "click" when a pawn reaches the end
    {
        let gm=this;
        Array.from(document.getElementsByClassName("button_pawn_end")).forEach(elt => elt.addEventListener
            ("click", function(){
                if (gm.#pawnReachingEnd!=null)
                {   
                    document.getElementsByClassName("pawn_end")[gm.#playerTurn==gm.#colorP2 ? 1 : 0].style.visibility="hidden";
                    gm.#pawnReachingEnd[0].firstChild.setAttribute("src", elt.getAttribute("src"));
                    let str=elt.getAttribute("src").split("/")[2].split(".")[0];
                    console.log(str);
                    gm.#board.SetPieceOnCase(str, gm.#pawnReachingEnd[1], gm.#pawnReachingEnd[2]);
                    console.log(gm.#board.GetCaseMatrix(gm.#pawnReachingEnd[1], gm.#pawnReachingEnd[2]))
                    gm.#pawnReachingEnd=null;
                    gm.#NextTurn();
                }
            })
        );
    }

    /***************************************************************************************************
     ****************************************GAME FEATURES********************************************** 
    ****************************************************************************************************/

    #NextTurn()
    {
        if (this.#canNextTurn)
        {   
            this.#numberTurns++;
            this.#playerTurn=(this.#playerTurn==this.#colorP1) ? this.#colorP2 : this.#colorP1;
        }
    }

    #MovedPiece(eltInit, lineInit, colInit, eltDest, lineDest, colDest ) //move the node img and update Matrix | elt=html div
    {   
        if (eltDest.firstChild!=null && eltDest.firstChild.tagName.localeCompare("img")!=0) //remove the existant image of piece
                eltDest.removeChild(eltDest.firstChild);
        eltDest.appendChild(eltInit.firstChild); //Node img automatically moved to the destination case
        
        this.#board.MovedPieceOnCase(lineInit, colInit, lineDest, colDest)
    }

    #ResetPieceSelection()
    {   
        if (this.#currentPiece!=null)
        {
            this.#currentPiece[0].style.backgroundColor=null;
            Array.from(this.#arrayMov).forEach(elt => document.getElementById("case"+elt[0]+"-"+elt[1]).style.backgroundColor = null);
            Array.from(this.#arraySpecialMov).forEach(elt => document.getElementById("case"+elt[0]+"-"+elt[1]).style.backgroundColor = null);
            this.#currentPiece=null;
            this.#arraySpecialMov=[];
            this.#arrayMov=[]
        }
    }


    #DoingSpecialMov(line, col) //line and col represents where the piece goes
    {   
        let nameMov; //We need to know what's the special mov that the player wants to do
        let futurCol, initCol;
        for (let i=0; i<this.#arraySpecialMov.length; i++) //Execute movement according to nameMov
        {
            if (this.#arraySpecialMov[i][0]==line && this.#arraySpecialMov[i][1]==col) 
            {
                
                switch (this.#arraySpecialMov[i][2])
                {
                    case ("CastlingLeft"): //the tower on the left of the king
                        futurCol= (line==0 ? col-1 : col+1);
                        initCol=(line==0 ? 7 : 0); 
                        this.#MovedPiece(document.getElementById("case"+line+"-"+initCol), line, initCol, document.getElementById("case"+line+"-"+futurCol), line, futurCol);
                        break;

                    case ("CastlingRight"):
                        initCol=(line==0 ? 0 : 7); 
                        futurCol= (line==0 ? col+1 : col-1);
                        this.#MovedPiece(document.getElementById("case"+line+"-"+initCol), line, initCol, document.getElementById("case"+line+"-"+futurCol), line, futurCol);
                        break;

                    case ("PassantCapture"):
                        if (this.#pawnMovedOn2Cases[0].firstChild!=null)
                            this.#pawnMovedOn2Cases[0].removeChild(this.#pawnMovedOn2Cases[0].firstChild);
                        break;
                    
                    default:
                        break;
                }
                break;
            }
        }
        
    }

    #UpdatePawnMoved2Cases(elt, line, col) //Check if the pawn has moved forward on 2 cases (from the beginning line)
    {
        if (this.#board.GetCaseMatrix(line,col).slice(1)=="P" && Math.abs(line-this.#currentPiece[1])==2)
            this.#pawnMovedOn2Cases=[elt, line, col];
        else
            this.#pawnMovedOn2Cases=null;
        // console.log(this.#currentPiece);
        // console.log(Math.abs(line-this.#currentPiece[1]));
    }

    #CheckPawnReachedEnd(elt, line, col, currentPlayer)
    {
        if (this.#board.GetCaseMatrix(line,col).slice(1)=="P" && (line==0 || line==7))
        {
            this.#pawnReachingEnd=[elt, line, col];
            document.getElementsByClassName("pawn_end")[currentPlayer==this.#colorP2 ? 1 : 0].style.visibility="visible";
            return true;
        }
        return false;
    }

    /***************************************************************************************************
     *****************************************GAME INTERACTIONS***************************************** 
    ****************************************************************************************************/

    #ClickOnCase(elt, line, col)
    {   
        if (this.#pawnReachingEnd!=null) //Impossible to click on a case when a pawn hasreached the end (he has to select the replacement piece)
            return;

        line=parseInt(line);
        col=parseInt(col);

        if (this.#board.GetCaseMatrix(line,col)!="" && this.#board.GetCaseMatrix(line,col).charAt(0)==this.#playerTurn) //the current player has select one of his piece
        {   
            console.log("select");
            this.#ResetPieceSelection();
            this.#currentPiece=[elt,line,col];

            elt.style.backgroundColor = rgbColorCaseSelect;
            switch (this.#board.GetCaseMatrix(line,col).slice(1))
            {
                case ("P"):
                    this.#arrayMov=this.#board.GetMovementsPawn(line, col, this.#playerTurn);
                    if (this.#pawnMovedOn2Cases!=null)
                        this.#arraySpecialMov=this.#board.GetMovementsPassantCapture(line, col, this.#pawnMovedOn2Cases[1], this.#pawnMovedOn2Cases[2], this.#playerTurn);
                    
                    break;

                case ("R"):
                    this.#arrayMov=this.#board.GetMovementsRook(line,col, 1, 0, this.#playerTurn);
                    break;

                case ("Kn"):
                    this.#arrayMov=this.#board.GetMovementsKnight(line,col, this.#playerTurn);
                    break;

                case ("B"):
                    this.#arrayMov=this.#board.GetMovementsBishop(line,col,1,1, this.#playerTurn);
                    break;

                case ("Q"):
                    this.#arrayMov=this.#board.GetMovementsQueen(line,col, this.#playerTurn);
                    break;

                case ("Ki"):
                    this.#arrayMov=this.#board.GetMovementsKing(line,col, this.#playerTurn);
                    this.#arraySpecialMov=this.#board.GetMovementsCastling(line,col, this.#playerTurn);
                    break;
            }
            if (this.#arrayMov.length!=0) //if there is at least one movement
            {   
                // console.log(arrayMov.length);
                Array.from(this.#arrayMov).forEach(val => document.getElementById("case"+val[0]+"-"+val[1]).style.backgroundColor= rgbColorPossibleMov);
            }
            if (this.#arraySpecialMov.length!=0)
                Array.from(this.#arraySpecialMov).forEach(val => document.getElementById("case"+val[0]+"-"+val[1]).style.backgroundColor= rgbColorPossibleMov);
            // NextTurn();
        }

        else if (this.#currentPiece!=null && (this.#CheckMovInList(line, col, this.#arrayMov) || this.#CheckMovInList(line, col, this.#arraySpecialMov)) ) //The player has clicked on a case on which the piece he has selected can go
        {   
                                 //Init................................................................Dest
            this.#MovedPiece(this.#currentPiece[0], this.#currentPiece[1], this.#currentPiece[2], elt, line, col);

            if (this.#CheckMovInList(line, col, this.#arraySpecialMov))
                this.#DoingSpecialMov(line,col);
            
            console.log("dest :"+this.#board.GetCaseMatrix(line,col));
            console.log("init :"+this.#board.GetCaseMatrix(this.#currentPiece[1],this.#currentPiece[2]));
            
            this.#UpdatePawnMoved2Cases(elt,line,col);
            this.#board.UpdateCastling(this.#board.GetCaseMatrix(line,col).slice(1), this.#currentPiece[1], this.#currentPiece[2], this.#playerTurn);
            this.#ResetPieceSelection();
            
            if (!this.#CheckPawnReachedEnd(elt, line, col, this.#playerTurn))
                // this.#NextTurn();
                return;
        }
    }

}


document.addEventListener('DOMContentLoaded', (event) => {  
    let gm = new GameManager('W','B');
    gm.InitCasesEvents();
    gm.InitButtonsEvents();
});