var currentMatch;

$(document).ready(function(event) {
    // load game from local storage
    loadMatch();
    //currentMatch = new Match("Will", "James", 0, 0, "English", 5, 15, true);
    updateScore();
    $(".point-buttons__left").click(function() {
        currentMatch.point(true);
    });
    $(".point-buttons__right").click(function() {
        currentMatch.point(false);
    });
    $("#switchServingSideBtn").click(function() {
        switchServingSideModal();
    });
    $("#undoLastPointBtn").click(function() {
        currentMatch.undoLastPoint();
    });
});

function Match(p1Name, p2Name, p1Handicap, p2Handicap, gameType, bestOf, playTo, games) {
  this.p1Name = p1Name;
  this.p2Name = p2Name;
  this.p1Handicap = p1Handicap;
  this.p2Handicap = p2Handicap;
  this.p1MatchScore = this.p1Handicap;
  this.p2MatchScore = this.p2Handicap;
  this.gameType = gameType;
  this.bestOf = bestOf;
  this.playTo = playTo;
  this.games = games;
  selectServingPlayer(this);
  this.point = function(p1Win) {
    // PAR Scoring
    if(gameType === "PAR") {
        if(p1Win) {
            this.games[this.games.length-1].p1Score += 1;
        } else {
            this.games[this.games.length-1].p2Score += 1;
        }
        
    } else {
        // English Scoring
        if(p1Win) {
            if(this.games[this.games.length-1].p1Serve) {
                this.games[this.games.length-1].p1Score += 1;
            }
        } else {
            if(!this.games[this.games.length-1].p1Serve) {
                this.games[this.games.length-1].p2Score += 1;
            }
        }
    }


    updateScore();
    
    // Check for end of game
    var endOfGame = false;
    if ((this.games[this.games.length-1].p1Score >= this.playTo) || (this.games[this.games.length-1].p2Score >= this.playTo)) {
        // Check for 2 clear
        if (this.games[this.games.length-1].twoClear) {
            if (((this.games[this.games.length-1].p1Score - this.games[this.games.length-1].p2Score) >= 2) || ((this.games[this.games.length-1].p2Score - this.games[this.games.length-1].p1Score) >= 2)) {
                endOfGame = true;
            }
        } else {
            // end of game
            endOfGame = true;
        }
    }

    if (endOfGame) {

        if(this.games[this.games.length-1].p1Score > this.games[this.games.length-1].p2Score) {
            // Add new point
            this.games[this.games.length-1].points.push(new Point(p1Win, true));
        } else {
            // Add new point
            this.games[this.games.length-1].points.push(new Point(p1Win, false));
        }

        endOfGameFn();
        updateScore();
    } else {
        this.games[this.games.length-1].points.push(new Point(p1Win));

        // 2 Clear processing
        // If score is appropriate, ask about 2 clear
        if(currentMatch.gameType !== "PAR") {
            if((currentMatch.games[currentMatch.games.length-1].p1Score === currentMatch.games[currentMatch.games.length-1].p2Score) && (currentMatch.games[currentMatch.games.length-1].p1Score === (currentMatch.playTo - 1)) && !currentMatch.games[currentMatch.games.length-1].twoPointsChosen) {
                selectTwoPointsClear();
            }
        }

        // Check for handout
        if(this.gameType === "PAR") {
            // Hand Out?
            if ((p1Win && !this.games[this.games.length-1].p1Serve)) {
                this.games[this.games.length-1].p1Serve = true;
                displayHandOutModal(); 
            } else {
                if ((!p1Win && this.games[this.games.length-1].p1Serve)) {
                    this.games[this.games.length-1].p1Serve = false;
                    displayHandOutModal(); 
                } else {
                    switchServingSide();
                }
            }
        } else {
            // British
            if(p1Win) {
                if(this.games[this.games.length-1].p1Serve) {
                    // Swtich serving Sides
                    switchServingSide();
                } else {
                    // Handout
                    this.games[this.games.length-1].p1Serve = true;
                    displayHandOutModal();
                }
                this.games[this.games.length-1].p1Serve = true;
            } else {
                if(this.games[this.games.length-1].p1Serve) {
                    // Handout
                    this.games[this.games.length-1].p1Serve = false;
                    displayHandOutModal();
                } else {
                    switchServingSide();
                }
                this.games[this.games.length-1].p1Serve = false;
            }

        }
    }

    saveMatch();

    }

    this.undoLastPoint = function() {
        // First check that there is a point to undo
        if(this.games.length === 1 && this.games[this.games.length - 1].points.length === 1) {
            return false;
        }

        // Check if last point was end of game
        if(this.games[this.games.length - 1].points.length === 1) {
            // Revert game win
            // delete newly created game
            this.games.pop();
            // Amend match score
            if(this.games[this.games.length - 1].points[this.games[this.games.length - 1].points.length - 1].p1GameWin) {
                this.p1MatchScore -= 1;
            } else {
                this.p2MatchScore -= 1;
            }
        }

        // Set serving player/side
        this.games[this.games.length - 1].p1Serve = this.games[this.games.length - 1].points[this.games[this.games.length - 1].points.length - 1].p1Serve;
        this.games[this.games.length - 1].serveLeftRight = this.games[this.games.length - 1].points[this.games[this.games.length - 1].points.length - 1].serveLeftRight;

        if (this.games[this.games.length - 1].serveLeftRight === "L") {
            processHandoutSelection(true);
        } else {
            processHandoutSelection(false);
        }
    
        // Delete last point
        this.games[this.games.length - 1].points.pop();
        // Set score to prior to point
        this.games[this.games.length - 1].p1Score = this.games[this.games.length - 1].points[this.games[this.games.length - 1].points.length - 1].p1Score;
        this.games[this.games.length - 1].p2Score = this.games[this.games.length - 1].points[this.games[this.games.length - 1].points.length - 1].p2Score;

    
        updateScore();
        saveMatch();
    }


}

function Game(gameNumber, type) {
  this.gameNumber = gameNumber;
  this.p1Score = 0;
  this.p2Score = 0;
  this.gameOver = false;
  this.p1Serve = true;
  this.serveLeftRight = "L";
  if(type === "PAR") {
    this.twoClear = true;
  } else {
    this.twoClear = false;
  }
  this.points = [];
  this.points.push(new Point());
  this.points[0].p1Score = 0;
  this.points[0].p2Score = 0;

}


function Point(p1winner, p1GameWin) {
    this.p1winner = p1winner;
    this.p1Score = currentMatch.games[currentMatch.games.length-1].p1Score;
    this.p2Score = currentMatch.games[currentMatch.games.length-1].p2Score;
    this.p1Serve = currentMatch.games[currentMatch.games.length-1].p1Serve;
    this.serveLeftRight = currentMatch.games[currentMatch.games.length-1].serveLeftRight;
    this.p1GameWin = p1GameWin;
}

function displayHandOutModal() {
    $(".content").addClass("blur");
    $("#handOutTxt").show();
    $("#handoutSelect").show();
    $("#serveSelect").hide();
    $("#modal").fadeIn();

    $("#handoutSelect .options .left").click(function() {
        hideModal();
        processHandoutSelection(true);
    });

    $("#handoutSelect .options .right").click(function() {
        hideModal();
        processHandoutSelection(false);
    });
   
}

function hideModal() {
    $("#modal").hide();
    $(".content").removeClass("blur");
}

function switchServingSideModal() {
  $(".content").addClass("blur");
  $("#handOutTxt").hide();
  $("#handoutSelect").show();
  $("#serveSelect").hide();
  $("#modal").fadeIn();

  $("#handoutSelect .options .left").click(function() {
    hideModal();
    processHandoutSelection(true); 
    });

    $("#handoutSelect .options .right").click(function() {
        hideModal();
        processHandoutSelection(false);
    });

  
}

function selectServingPlayer(m) {
    $(".content").addClass("blur");
    $("#handoutSelect").hide();
    $("#serveSelect").show();
    $("#selectP1Name").text(m.p1Name);
    $("#selectP2Name").text(m.p2Name);
    $("#modal").fadeIn();

    $("#serveSelect .options .left").click(function() {
        hideModal();
        currentMatch.games[currentMatch.games.length-1].p1Serve = true;
        setTimeout(displayHandOutModal(), 2000);
    });
    $("#serveSelect .options .right").click(function() {
        hideModal();
        currentMatch.games[currentMatch.games.length-1].p1Serve = false;
        setTimeout(displayHandOutModal(), 2000);
    });
};

function selectTwoPointsClear() {
    $(".content").addClass("blur");
    $("#two-clear-modal").fadeIn();

    $("#twoClearSelect .options .left").click(function() {
        $("#two-clear-modal").hide();
        $(".content").removeClass("blur");
        currentMatch.games[currentMatch.games.length-1].twoPointsChosen = true;
        currentMatch.games[currentMatch.games.length-1].twoClear = true;
    });
    $("#twoClearSelect .options .right").click(function() {
        $("#two-clear-modal").hide();
        $(".content").removeClass("blur");
        currentMatch.games[currentMatch.games.length-1].twoPointsChosen = true;
        currentMatch.games[currentMatch.games.length-1].twoClear = false;
    });
};

function updateScore() {
    $("#p1GameScore").text(currentMatch.games[currentMatch.games.length-1].p1Score);
    $("#p2GameScore").text(currentMatch.games[currentMatch.games.length-1].p2Score);
    $("#p1MatchScore").text(currentMatch.p1MatchScore);
    $("#p2MatchScore").text(currentMatch.p2MatchScore);

}

function endOfGameFn() {
    // Increment match Score
    p1WinLastGame = false;
    if(currentMatch.games[currentMatch.games.length-1].p1Score >= currentMatch.games[currentMatch.games.length-1].p2Score) {
        p1WinLastGame = true;
        // P1 won game
        currentMatch.p1MatchScore += 1;
    } else {
        // P2 Won game
        currentMatch.p2MatchScore += 1;
    }
    saveMatch();
    updateScore();
    // Check for end of Match
    if (currentMatch.p1MatchScore > (currentMatch.bestOf / 2)) {       
        // P1 won match
        currentMatch.matchOver = true;
        saveMatch();
        window.location.href = 'match-over.html';

        
    } else if (currentMatch.p2MatchScore > (currentMatch.bestOf / 2)) {
        // P2 won match
        currentMatch.matchOver = true;
        saveMatch();
        window.location.href = 'match-over.html';
    } else {
        // Generate new game
        const numOfGames = currentMatch.games.length;
        currentMatch.games.push(new Game(numOfGames + 1));
        if(p1WinLastGame) {
            currentMatch.games[currentMatch.games.length-1].p1Serve = true;
        } else {
            currentMatch.games[currentMatch.games.length-1].p1Serve = false;
        }

        if (currentMatch.gameType === "PAR") {
            currentMatch.games[currentMatch.games.length-1].twoClear = true;
        } else {

        }

        displayHandOutModal();
    }
}

function processHandoutSelection(left) {
    $("#p1Left").addClass("hide");
    $("#p2Left").addClass("hide");
    $("#p1Right").addClass("hide");
    $("#p2Right").addClass("hide");
    if(left) {
        currentMatch.games[currentMatch.games.length-1].serveLeftRight = "L"
        if(currentMatch.games[currentMatch.games.length-1].p1Serve === true) {
            $("#p1Left").removeClass("hide");
        } else {
            $("#p2Left").removeClass("hide");
        }
        
    } else {
        currentMatch.games[currentMatch.games.length-1].serveLeftRight = "R"
        if(currentMatch.games[currentMatch.games.length-1].p1Serve === true) {
            $("#p1Right").removeClass("hide");
        } else {
            $("#p2Right").removeClass("hide");
        }
    }
}



function switchServingSide() {
    if(currentMatch.games[currentMatch.games.length-1].serveLeftRight === "R") {
        currentMatch.games[currentMatch.games.length-1].serveLeftRight = "L";
        processHandoutSelection(true);
    } else {
        currentMatch.games[currentMatch.games.length-1].serveLeftRight = "R";
        processHandoutSelection(false);
    }
}

function saveMatch() {
    let match_ser = JSON.stringify(currentMatch)
    localStorage.setItem("savedMatch", match_ser);
}

function loadMatch() {
    const matchStr = localStorage.getItem("savedMatch");
    if(matchStr === null) {
        // Redirect back to new game page
        window.location.href = 'new-match.html';
    }
    const matchDummy = JSON.parse(matchStr);

    if (matchDummy.matchOver) {
        // Redirect to match over page
        window.location.href = 'match-over.html';
    }

    this.currentMatch = new Match(matchDummy.p1Name,
        matchDummy.p2Name, 
        matchDummy.p1Handicap,
        matchDummy.p2Handicap,
        matchDummy.gameType,
        matchDummy.bestOf,
        matchDummy.playTo,
        matchDummy.games);
    this.currentMatch.p1MatchScore = matchDummy.p1MatchScore;
    this.currentMatch.p2MatchScore = matchDummy.p2MatchScore;

    $("#player1Name").text(this.currentMatch.p1Name);
    $("#player2Name").text(this.currentMatch.p2Name);
}