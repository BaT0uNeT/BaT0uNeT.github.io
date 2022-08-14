/***************************************************************************************************
 ************************************CLASSES********************************************************
 ****************************************************************************************************/

/********************************************PLAYER********************************************************/

class Player
{   
    #color; //'W' for white | 'B' for black
    #canRockLeft;
    #canRockRight;

    GetCanRockLeft() { return this.#canRockLeft; }
    GetCanRockRight() { return this.#canRockRight; }
    GetColor() { return this.#color; }
    SetCanRockLeft(val) { this.#canRockLeft=val; }
    SetCanRockRight(val) { this.#canRockRight=val; }
    CheckCanRock() { return this.#canRockLeft || this.#canRockRight; }

    InitPlayer(color)
    {
        this.#canRockLeft=true;
        this.#canRockRight=true;
        this.#color=color;
    }
}


/********************************************BOARD********************************************************/

export class Board
{   
    #player1; //Bottom player
    #player2; //Top player
    #matrix;

    //which color has the first player | 'W' or 'B' 
    constructor (colorP1, colorP2) 
    { 
        this.#player1=new Player();
        this.#player2=new Player();

        this.InitBoard(colorP1, colorP2);
    }

    InitBoard(colorP1, colorP2)
    {
        this.#player1.InitPlayer(colorP1);
        this.#player2.InitPlayer(colorP2);

        //Init matrix
        this.#matrix = [
            [colorP2+"R",colorP2+"Kn",colorP2+"B",colorP2+(colorP2=='B'?'Q':'Ki'),colorP2+(colorP2=='B'?'Ki':'Q'),colorP2+"B",colorP2+"Kn",colorP2+"R"],
            [colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P",colorP2+"P"],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            [colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P",colorP1+"P"],
            [colorP1+"R",colorP1+"Kn",colorP1+"B",colorP1+(colorP1=='W'?'Q':'Ki'),colorP1+(colorP1=='W'?'Ki':'Q'),colorP1+"B",colorP1+"Kn",colorP1+"R"]
        ]; 
    }

    GetPlayer1() { return this.#player1; }
    GetPlayer2() { return this.#player2; }
    GetCaseMatrix(line,col) { return this.#matrix[line][col]; }


    MovedPieceOnCase(lineInit, colInit, lineDest, colDest )
    {   
        this.#matrix[lineDest][colDest]=this.#matrix[lineInit][colInit];
        this.#matrix[lineInit][colInit]="";
    }

    CheckMovementOnBoard(line,col) //Movement doesn't go over the board
    {   
        return 0<=line && line<8 && 0<=col && col<8;
    }


    UpdateRock(namePiece, line, col, currentPlayer) //Check if the player still can do a rock after his movement with the piece namePiece from the case [line,col]
    {   
        if (namePiece.localeCompare("Ki")==0) //the player has moved the king but he was able to do the rock before, so now he cannot
        {   
            if (currentPlayer==this.#player1.GetColor() && (this.#player1.CheckCanRock())) 
            { 
                this.#player1.SetCanRockLeft(false); 
                this.#player1.SetCanRockRight(false) 
            }
            else if (currentPlayer==this.#player2.GetColor() && (this.#player2.CheckCanRock())) 
            { 
                this.#player2.SetCanRockLeft(false); 
                this.#player2.SetCanRockRight(false) 
            }
        }
        else if (namePiece.localeCompare("R")==0 && ( (currentPlayer==this.#player1.GetColor() && this.#player1.CheckCanRock()) || 
            (currentPlayer==this.#player2.GetColor() && this.#player2.CheckCanRock()) ) ) 
        {   //check if it concerns the left or right rook
            if ((line==0 && col==7) || (line==7 && col==0))//left
            {   
                if (currentPlayer==this.#player1.GetColor() && this.#player1.GetCanRockLeft()) this.#player1.SetCanRockLeft(false);
                if (currentPlayer==this.#player2.GetColor() && this.#player2.GetCanRockLeft()) this.#player2.SetCanRockLeft(false);
            }
            else if ((line==0 && col==0) || (line==7 && col==7)) //Right
            {
                if (currentPlayer==this.#player1.GetColor() && this.#player1.GetCanRockRight()) this.#player1.SetCanRockRight(false);
                if (currentPlayer==this.#player2.GetColor() && this.#player2.GetCanRockRight()) this.#player2.SetCanRockRight(false);
            }
        }
    }

    GetMovementsPawn(line, col, currentPlayer)
    {   
        let listMov = new Array();
        let k=currentPlayer==this.#player2.GetColor() ? 1 : -1;
        if ( (line==6 || line==1) && this.CheckMovementOnBoard(line+2*k,col) && this.#matrix[line+2*k][col]=="") //On its first line, the pawn is able to jump two cases
            listMov.push([line+2*k, col]);
        if (this.CheckMovementOnBoard(line+1*k,col) && this.#matrix[line+1*k][col]=="") //there isn't another piece on the up case
            listMov.push([line+1*k, col]);
        if (this.CheckMovementOnBoard(line+1*k,col+1) && this.#matrix[line+1*k][col+1]!="" && this.#matrix[line+1*k][col+1].charAt(0)!=currentPlayer )
            listMov.push([line+1*k,col+1]);
        if (this.CheckMovementOnBoard(line+1*k,col-1) && this.#matrix[line+1*k][col-1]!="" && this.#matrix[line+1*k][col-1].charAt(0)!=currentPlayer)
            listMov.push([line+1*k,col-1]);
        return listMov;
    }


    //recursive function
    GetMovementsRook(line, col, kx, ky, currentPlayer) //kx and ky are the coeff | first values are 1 and 0 (down)
    {  
        let listMov = new Array();
        while (this.CheckMovementOnBoard(line+kx, col+ky))
        {   
            if (this.#matrix[line+kx][col+ky]=="" || this.#matrix[line+kx][col+ky].charAt(0)!=currentPlayer)
                listMov.push([line+kx, col+ky]);

            if (this.#matrix[line+kx][col+ky]!="")
                break;
            kx += kx>0 ? 1 : (kx<0 ? -1 : 0);
            ky += ky>0 ? 1 : (ky<0 ? -1 : 0);
        }

        if (kx>0) return listMov.concat(this.GetMovementsRook(line, col, -1, 0, currentPlayer)); //up
        else if (kx<0) return listMov.concat(this.GetMovementsRook(line, col, 0, 1, currentPlayer)) //right
        else if (ky>0) return listMov.concat(this.GetMovementsRook(line, col, 0, -1, currentPlayer)) //left
        else return listMov;
    }


    GetMovementsKnight(line, col, currentPlayer)
    {
        let listMov = new Array();
        if (this.CheckMovementOnBoard(line-2, col+1) && (this.#matrix[line-2][col+1]=="" || this.#matrix[line-2][col+1].charAt(0)!=currentPlayer)) listMov.push([line-2,col+1]);
        if (this.CheckMovementOnBoard(line-2, col-1) && (this.#matrix[line-2][col-1]=="" || this.#matrix[line-2][col-1].charAt(0)!=currentPlayer)) listMov.push([line-2,col-1]);
        if (this.CheckMovementOnBoard(line-1, col+2) && (this.#matrix[line-1][col+2]=="" || this.#matrix[line-1][col+2].charAt(0)!=currentPlayer)) listMov.push([line-1,col+2]);
        if (this.CheckMovementOnBoard(line-1, col-2) && (this.#matrix[line-1][col-2]=="" || this.#matrix[line-1][col-2].charAt(0)!=currentPlayer)) listMov.push([line-1,col-2]);
        if (this.CheckMovementOnBoard(line+1, col+2) && (this.#matrix[line+1][col+2]=="" || this.#matrix[line+1][col+2].charAt(0)!=currentPlayer)) listMov.push([line+1,col+2]);
        if (this.CheckMovementOnBoard(line+1, col-2) && (this.#matrix[line+1][col-2]=="" || this.#matrix[line+1][col-2].charAt(0)!=currentPlayer)) listMov.push([line+1,col-2]);
        if (this.CheckMovementOnBoard(line+2, col+1) && (this.#matrix[line+2][col+1]=="" || this.#matrix[line+2][col+1].charAt(0)!=currentPlayer)) listMov.push([line+2,col+1]);
        if (this.CheckMovementOnBoard(line+2, col-1) && (this.#matrix[line+2][col-1]=="" || this.#matrix[line+2][col-1].charAt(0)!=currentPlayer)) listMov.push([line+2,col-1]);
        return listMov;
    }

    //recursive function
    GetMovementsBishop(line, col, kx, ky, currentPlayer) //kx and ky are coeffs | calling first with 1 and 1 (down right)
    {
        let listMov = new Array();
        while (this.CheckMovementOnBoard(line+kx, col+ky))
        {   
            if (this.#matrix[line+kx][col+ky]=="" || this.#matrix[line+kx][col+ky].charAt(0)!=currentPlayer)
                listMov.push([line+kx, col+ky]);

            if (this.#matrix[line+kx][col+ky]!="")
                break;
            kx += kx>0 ? 1 : -1;
            ky += ky>0 ? 1 : -1;
        }

        if (kx>0 && ky>0) return listMov.concat(this.GetMovementsBishop(line, col, -1, 1, currentPlayer)); //up right
        else if (kx<0 && ky>0) return listMov.concat(this.GetMovementsBishop(line, col, -1, -1, currentPlayer)) //up left
        else if (kx<0 && ky<0) return listMov.concat(this.GetMovementsBishop(line, col, 1, -1, currentPlayer)) //down left
        else return listMov;
    }


    GetMovementsQueen(line, col, currentPlayer)
    {
        return (this.GetMovementsRook(line,col,1,0, currentPlayer).concat(this.GetMovementsBishop(line,col,1,1,currentPlayer)));
    }

    GetMovementsKing(line,col,currentPlayer)
    {
        let listMov = new Array();
        for (let i=line-1; i<line+2; i++)
        {
            for (let j=col-1; j<col+2; j++)
            {
                if ( (i!=line || j!=col) && this.CheckMovementOnBoard(i,j) && (this.#matrix[i][j]=="" || this.#matrix[i][j].charAt(0)!=currentPlayer))
                    listMov.push([i,j]);
            }
        }
        return listMov;
    }

    GetMovementsRock(line,col,currentPlayer) //only when player selects the king
    {   
        let listMov = new Array();
        //Check if the cases on the left or right are availables (no piece)
        //Situation changes if queen is on the side of the rock

        if ( ((currentPlayer==this.#player1.GetColor() && this.#player1.GetCanRockLeft()) || (currentPlayer==this.#player2.GetColor() && this.#player2.GetCanRockLeft())) //current player can rock on the left
            && ( (line==0 && this.#matrix[line][5]=="" && this.#matrix[line][6]=="" && (col==4 ? true : this.#matrix[line][4]=="") ) 
                || (line==7 && this.#matrix[line][2]=="" && this.#matrix[line][1]=="" && (col==4 ? this.#matrix[line][3]=="" : true)  ) ) ) 
        {   
            listMov.push( [line, (line==0 ? (col==4 ?  6 : 5) : (col==4 ?  2 : 1)), "RockLeft"]);
        }   
        if ( ((currentPlayer==this.#player1.GetColor() && this.#player1.GetCanRockRight()) || (currentPlayer==this.#player2.GetColor() && this.#player2.GetCanRockRight())) //current player can rock on the right
            && ( (line==0 && this.#matrix[line][2]=="" && this.#matrix[line][1]=="" && (col==4 ? this.#matrix[line][3]=="" : true) ) 
                || (line==7 && this.#matrix[line][5]=="" && this.#matrix[line][6]=="" && (col==4 ? true : this.#matrix[line][4]=="") ) ) ) 
        {   
            listMov.push( [line, (line==0 ? (col==4 ?  2 : 1) : (col==4 ?  6 : 5)), "RockRight"]);
        }
        return listMov;
    }

}
