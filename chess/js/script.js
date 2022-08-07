var colorP1 = 'W'; //Bottom player
var colorP2 = 'B'; //Top player

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
                str = (elt.getAttribute("class").slice("-1").localeCompare((color=='W') ? '1' : '2' )) ? "Ki" : "Q";
        }
    }
    let img = document.createElement("img");
    img.setAttribute("src", "../img/"+color+str+".png");
    img.setAttribute("alt", "image"+color+str);
    elt.appendChild(img);
}


document.addEventListener('DOMContentLoaded', (event) => {
    InitBoard();
});