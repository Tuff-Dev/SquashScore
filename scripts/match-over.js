var currentMatch;
$(document).ready(function(event) {
    // load game from local storage
    loadMatch();
});

function loadMatch() {
    const matchStr = localStorage.getItem("savedMatch");
    if(matchStr === null) {
        // Redirect back to new game page
        window.location.href = 'new-match.html';
    }

    this.currentMatch = JSON.parse(matchStr);

    $("#player1Name").text(this.currentMatch.p1Name);
    $("#player2Name").text(this.currentMatch.p2Name);
    $("#p1MatchScore").text(this.currentMatch.p1MatchScore);
    $("#p2MatchScore").text(this.currentMatch.p2MatchScore);

    // Display Games
    displayGames();
}

function displayGames() {
    // Loop through all games
    var gameSection = document.createElement("div");
    gameSection.classList.add("game-container");
    for(var i=0; i<this.currentMatch.games.length; i++) {
        var game = document.createElement("div");
        game.classList.add("game");

        var gameNumber = document.createElement("span");
        gameNumber.classList.add("game-number");
        gameNumber.innerHTML = "Game ".concat((i+1));

        var gameScore = document.createElement("span");
        gameScore.classList.add("game-score");
        gameScore.innerHTML = this.currentMatch.games[i].p1Score.toString().concat(" - ").concat(this.currentMatch.games[i].p2Score.toString());

        game.appendChild(gameNumber);
        game.appendChild(gameScore);

        gameSection.appendChild(game);
    }

    // Add games to page
    $(".game-scores").append(gameSection);

    // localStorage.removeItem("savedMatch");
}