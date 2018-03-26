function sgn(x)
{
	if(x == 0)
		return 0;
	else 
        if(x>0)
		return 1;
	else
		return -1;
}

function libre(e, x0, y0, x, y)
{
	var nbCases = Math.max(Math.abs(x - x0), Math.abs(y - y0));
    var dirX = sgn(x - x0);
	var dirY = sgn(y - y0);
	for(var k = 1; k<nbCases; k++)
	{
		if(e.cell(y0 + k*dirY, x0 + k*dirX).piece != undefined)
			return false;
	}
	return true;
}

function memeCouleur(e, x0, y0, x, y)
{
	var dest = e.cell(y, x).piece;
	if(dest == undefined)
		return false; // la case d'arrivée est libre !
	return dest.couleur == e.cell(y0, x0).piece.couleur;
}

function deplacementTour(e, x0, y0, x, y)
{
	return (x == x0 || y == y0) && libre(e, x0, y0, x, y) && !memeCouleur(e, x0, y0, x, y);
}

function deplacementFou(e, x0, y0, x, y)
{
	return Math.abs(x - x0) == Math.abs(y - y0) && libre(e, x0, y0, x, y) && !memeCouleur(e, x0, y0, x, y);
}

function deplacementRoi(e, x0, y0, x, y)
{
	return Math.max(Math.abs(x - x0), Math.abs(y - y0)) <= 1 && !memeCouleur(e, x0, y0, x, y);
}

function deplacementDame(e, x0, y0, x, y)
{
	return deplacementTour(e, x0, y0, x, y) || deplacementFou(e, x0, y0, x, y);
}

function deplacementCavalier(e, x0, y0, x, y)
{
	var dX = Math.abs(x - x0);
	var dY = Math.abs(y - y0);
	var maxD = Math.max(dX, dY);
	var minD = Math.min(dX, dY);
	return maxD == 2 && minD == 1  && !memeCouleur(e, x0, y0, x, y);
}

/* Les règles de déplacement d'un pion sont les plus compliquées
**
*/
function deplacementPion(e, x0, y0, x, y)
{
	var dirY = this.couleur == 'N' ? 1 : -1;
	if((this.couleur=='N' && y0 == 1) || (this.couleur=='B' && y0 == 6))
		dirY *= 2;
	var deplVertAbs = (y - y0)/dirY;
	if(e.cell(y, x).piece == undefined) /* Si case d'arrivée vide, */
		return x == x0 && deplVertAbs <= 1 && deplVertAbs>0 && libre(e, x0, y0, x, y);
	/* Sinon, on est peut-être dans le cas d'une prise : */
	return deplVertAbs == 1 && Math.abs(x - x0) == 1 && !memeCouleur(e, x0, y0, x, y);
	// N.B.: ne prend pas encore en compte la prise en passant...
}

function Piece(t, couleur)
{
	this.type = t;
	this.couleur = couleur;
	switch(t)
	{
		case 'C':
			this.depl = deplacementCavalier;
			break;
		case 'D':
			this.depl = deplacementDame;
			break;
		case 'F':
			this.depl = deplacementFou;
			break;
		case 'P':
			this.depl = deplacementPion;
			break;
		case 'R':
			this.depl = deplacementRoi;
			break;
		case 'T':
			this.depl = deplacementTour;
			break;
	}
}

// Constructeur d'échiquiers
// L'objet "echiquier", avec la e minuscule, est créé dans la page HTML

function Echiquier()
{
	this.cases = new Array(64);
	for(var i = 0; i<64; i++)
		this.cases[i] = new Object();

	/* Tours */	
	this.cases[0].piece = new Piece('T', 'N');
	this.cases[7].piece = new Piece('T', 'N');
	this.cases[56].piece = new Piece('T', 'B');
	this.cases[63].piece = new Piece('T', 'B');
	
	/* Cavaliers */
	this.cases[1].piece = new Piece('C', 'N');
	this.cases[6].piece = new Piece('C', 'N');
	this.cases[57].piece = new Piece('C', 'B');
	this.cases[62].piece = new Piece('C', 'B');
	
	/* Fous */
	this.cases[2].piece = new Piece('F', 'N');
	this.cases[5].piece = new Piece('F', 'N');
	this.cases[58].piece = new Piece('F', 'B');
	this.cases[61].piece = new Piece('F', 'B');
	
	/* Rois et Dames */
	this.cases[3].piece = new Piece('D', 'N');
	this.cases[4].piece = new Piece('R', 'N');
	this.cases[59].piece = new Piece('D', 'B');
	this.cases[60].piece = new Piece('R', 'B');
	
	/* Pions */
	for(i = 0; i<8; i++)
	{
        this.cases[8 + i].piece = new Piece('P', 'N');
        this.cases[48 + i].piece = new Piece('P', 'B');
	}
}
Echiquier.prototype.masqueClique = false;

// Accesseur de la case avec coordonnées (i, j) :

Echiquier.prototype.cell = function(i, j)
{
    return this.cases[i*8 + j];
}
// Méthode qui affiche un échiquier dans la table HTML
// avec identifiant donné

Echiquier.prototype.afficher = function(id)
{
	// document.write("<p>Afficher " + id + "</p>");
	var table = document.getElementById(id);
	table.innerHTML = ""; /* Effaçons l'éventuel contenu précédent de la table */
	for(var row = 0; row<8; row++)
	{
        var tr = document.createElement("TR");
		tr.style.height = "3em";
		for(var col = 0; col<8; col++)
		{
			var td = document.createElement("TD");
			/* Cf. Exercice 3.2 : */
			td.setAttribute("onclick", "cliqueCase(" + row + ", " + col + ")");
			var c = this.cell(row, col);
			td.style.width = "3em";
			td.style.textAlign = "center";
			c.td = td;
			if(c.piece != undefined)
			{
				var couleur = c.piece.couleur == 'B' ? "green" : "blue";
				var txt = document.createTextNode(c.piece.type);
				td.style = "width: 3em; text-align: center; font-family: sans-serif; color: " + couleur;
				td.appendChild(txt);
			}
			else 
				td.appendChild(document.createTextNode(" ")); // sinon les cellules ne s'affichent pas correctement...
				
			td.style.backgroundColor = (row + col)%2 == 0 ? "black" : "white";
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	// document.write("Test = " + this.cell(0, 0).piece.depl(this, 0, 0, 1, 0));
}

// Fonction de gestion des événements "clique" dans les cases (cf. Exercice 3.2),
// avec mise en évidence de l'ensemble accessible (cf. Exercice 5) :

function cliqueCase(i, j)
{
	// document.write("Click reçu dans la case " + i + ", " + j);
	// Pour remettre à blanc toutes les cases avant de gérer le nouveau événement (Cf. Exercice 5.2) :
	echiquier.afficher("échiquier");
	var p = echiquier.cell(i, j).piece;
	if(p != undefined)
	{
		// document.write("Piece: " + p.type);
		for(var row = 0; row<8; row++)
            for(var col = 0; col<8; col++)
			{
				var c = echiquier.cell(row, col);
				if(p.depl(echiquier, j, i, col, row))
                    c.td.style.backgroundColor = "red";
			}
	}
    echiquier.masqueClique = true; // Pour masquer le clique reçu par BODY (Cf. Exercice 5.3)
}
// Désélectionner l'ensemble accessible, si mis en évidence (Cf. Exercice 5.3) :

function deselect()
{
	// document.write("Échiquier = " + echiquier.masqueClique);
	if(echiquier.masqueClique)
        echiquier.masqueClique = false;
	else
		echiquier.afficher("échiquier");
}