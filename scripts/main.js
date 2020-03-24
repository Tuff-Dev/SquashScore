var currentMatch;

$(document).ready(function(event){
    $('form input').click(function(event){
      $('form > div').css('transform', 'translateX('+$(this).data('location')+')');
      $(this).parent().siblings().removeClass('selected');
      $(this).parent().addClass('selected');
      if($("#scoringTypeEnglish")[0].checked) {
          $("#playTo")[0].value = 9;
      } else {
        $("#playTo")[0].value = 15;
      }
    });

    $("#startMatch").click(function() {
      // ======= Validate =======
      var errText = $(".error-text");
      if(!$("#p1Name")[0].value || !$("#p2Name")[0].value) {
        // Invalid
        errText.text("Players names must be entered\n");
        errText.removeClass("hide");
        return false;
      } else {
        errText.addClass("hide");
      }

      if($("#playTo")[0].value < 1 ) {
        errText.text('"Play to" must be at least 1.');
        errText.removeClass("hide");
        return false;
      } else {
        errText.addClass("hide");
      }

      if($("#bestOf")[0].value < 1 ) {
        errText.text('"Best of" must be at least 1.');
        errText.removeClass("hide");
        return false;
      } else {
        errText.addClass("hide");
      }

      var scoringType;
      if($("#scoringTypePAR")[0].checked === true) {
        scoringType = "PAR";
      } else {
        scoringType = "English";
      }
      // Create Match Object
      currentMatch = new Match(
        $("#p1Name")[0].value, 
        $("#p2Name")[0].value, 
        0,
        0, 
        scoringType, 
        parseInt($("#bestOf")[0].value), 
        parseInt($("#playTo")[0].value));
      saveMatch();
    });

  });

function Match(p1Name, p2Name, p1Handicap, p2Handicap, gameType, bestOf, playTo) {
  this.p1Name = p1Name;
  this.p2Name = p2Name;
  this.p1Handicap = p1Handicap;
  this.p2Handicap = p2Handicap;
  this.p1MatchScore = this.p1Handicap;
  this.p2MatchScore = this.p2Handicap;
  this.gameType = gameType;
  this.bestOf = bestOf;
  this.playTo = playTo;
  this.matchOver = false;
  var gameArr = [];
  gameArr.push(new Game(1, gameType));
  this.games = gameArr;
};

  function saveMatch() {
    let match_ser = JSON.stringify(currentMatch)
    localStorage.setItem("savedMatch", match_ser);
}

function Game(gameNumber, type) {
  this.gameNumber = gameNumber;
  this.p1Score = 0;
  this.p2Score = 0;
  this.gameOver = false;
  this.p1Serve = true;
  this.serveLeftRight = "L";
  this.points = [];
  this.points.push(new Point());
  if(type === "PAR") {
    this.twoClear = true;
    this.twoPointsChosen = true;
  } else {
    this.twoClear = false;
    this.twoPointsChosen = false;
  }
}

function Point(winner) {
  this.p1Score = 0;
  this.p2Score = 0;
  this.p1Serve = null;
  this.left = null;
}




  



