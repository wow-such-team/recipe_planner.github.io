// firebase stuff
var config = {
  apiKey: "AIzaSyBxkFmVfv-fnZ-u8TOdXWB8WdIXEDzFNTI",
  authDomain: "recipesave-277cb.firebaseapp.com",
  databaseURL: "https://recipesave-277cb.firebaseio.com",
  storageBucket: "recipesave-277cb.appspot.com",
};

firebase.initializeApp(config);

var database = firebase.database();

// array to store each question w/ associated options
var quizQuestions = [{qID: "diet", question: "Do you have dietary restrictions?", options: ["Vegetarian", "Vegan", "Low Carb", "All the Carbs"], backImg: "background8.jpg", userAnswer: ""},
                    {qID: "food-veggie", question: "Pick your protein!", options: ["Tofu", "Tempeh", "Seitan", "Mushrooms", "Beans"], backImg: "vegetable-background.jpeg", userAnswer: ""},
                    {qID: "food-protein", question: "Pick your protein!", options: ["Turkey", "Beef", "Chicken", "Pork", "Lamb", "Duck", "Fish", "Shrimp", "Crab", "Lobster", "Clam", "Mussel"], backImg: "meat-protein.jpg", userAnswer: ""},
                    {qID: "food-carb", question: "Pick your carbohydrate of choice!", options: ["Pasta", "Bread", "Rice", "Potato", "Noodles"], backImg: "carbs.jpg", userAnswer: ""},
                    {qID: "exclude", question: "Ingredients to exclude (use commas to separate if multiple ingredients). Put 'nothing' if you don't want any ingredients excluded.", options: "free answer", backImg: "allergies.jpg", userAnswer: ""},
                    {qID: "calories", question: "What is your desire calorie (kcal) range per serving?", options: ["0-300", "300-500", "500-600", "600-700", "I don't care"], backImg: "calories.jpg", userAnswer: ""},
                    {qID: "quantity", question: "How many are we cooking for?", options: "free answer", backImg: "guests.jpg", userAnswer: ""},
                    {qID: "time", question: "How much time do you have?", options: ["30 minutes", "1 hour", "2 hours", "3 hours", "4 hours", "as much time as I need"], backImg: "time.jpg", userAnswer: ""}];
var question; // variable to store dynamically created element for questions
var options; // variable to store dynamically created element for the options for each question
// var optionsInput; // variable to store dynamically created element for input box for free answer questions
var submitButton; // button for submitting free answer
var questionNum; // tracks which question is being displayed
var resultRecipe; // to store the answer

$(document).ready(function() {
  console.log("document ready");

  // start quiz with the first object in question array
  questionNum = 0;
  console.log("question number: " + questionNum);

  displayQuestion(); // display first question

  // user clicks next button to move onto next question
  $("#next-button").on("click", function() {
    console.log("clicked next");

    // after last quiz question, display result
    if(questionNum===quizQuestions.length-1) {
      console.log("no more questions");
      console.log(quizQuestions);

      $("#next-button").removeAttr("data-toggle");
      $("#question-id").html("");
      $("#options-id").html("");

      increment();
      getResults();
    }
    // on result page, do not allow user to proceed any further
    else if (questionNum===quizQuestions.length) {
      $("#next-button").text("Next");
      $("#next-button").attr("data-toggle", "modal");
      $(".modal-body").text("There is nothing after this.");
    }
    else if (quizQuestions[questionNum].userAnswer==="") {
      console.log("User did not provide answer");
      $("#next-button").attr("data-toggle", "modal");
      $(".modal-body").text("Please select a response or enter an input.");
    }
    else {
      // increment questionNum so that next time displayQuestion is used, the next question object will be used
      increment();

      if(questionNum===quizQuestions.length-1) {
        $("#next-button").text("Get Result");
      }
      else {
        $("#next-button").text("Next");
      }

      $("#next-button").removeAttr("data-toggle");
      $("#question-id").html("");
      $("#options-id").html("");

      console.log("question number: " + questionNum);

      displayQuestion();
    };
  });

  $("#previous-button").on("click", function() {
    console.log("clicked previous");

    if(questionNum<=0) {
      console.log("You're already on the first question.");
      $("#previous-button").attr("data-toggle", "modal");
      $(".modal-body").text("This is the first question. There's nothing before this.");
    }
    else {
      decrement();

      if(questionNum===quizQuestions.length-1) {
        $("#next-button").text("Get Result");
      }
      else {
        $("#next-button").text("Next");
      };

      $("#previous-button").removeAttr("data-toggle");
      $("#question-id").html("");
      $("#options-id").html("");
      
      console.log("question number: " + questionNum);

      displayQuestion();
    }
  });
});


// function for displaying each question
function displayQuestion() {
  // dynamically create div to store question
  question = $("<div>", {text: quizQuestions[questionNum].question});

  if(quizQuestions[questionNum].options==="free answer") {
    console.log("option: " + quizQuestions[questionNum].options);
    options = $("<input>", {class: "options", id: "free-answer", type: "text", value: quizQuestions[questionNum].userAnswer});
    submitButton = $("<button>", {id: "input-submit", text: "Submit"})

    
    $("#options-id").append(options);
    $("#options-id").append(submitButton);
  }
  else {
    console.log("number of options: " + quizQuestions[questionNum].options.length);

    // loop through number of options in each question object
    for(var j=0; j<quizQuestions[questionNum].options.length; j++) {
      console.log("option: " + quizQuestions[questionNum].options[j]);

      // dynamically create a div for an option
      options = $("<div>", {class: "options", text: quizQuestions[questionNum].options[j]});

      // when clicking previous, chosen answer is highlighed in grey
      if(quizQuestions[questionNum].options[j].toLowerCase().trim().replace(/ /g, "-")===quizQuestions[questionNum].userAnswer) {
        options.attr("id", "selected");
      }

      // append the option to the question
      $("#options-id").append(options);
    };
  }

  if(questionNum===quizQuestions.lenght-1) {
    $("#next-question").text("Show Result");
  };

  // append the question (and all options) to the static div w/ id of question in quiz.html
  $("#question-id").append(question);

  //change background image depending on question
  $("html").css("background-image", "url('assets/images/" + quizQuestions[questionNum].backImg + "')");
  $("body").css("background-image", "url('assets/images/" + quizQuestions[questionNum].backImg + "')");

  // store the user's choice
  storeAnswers();
};


//function for storing the user's choice for each question
function storeAnswers() {
  if(quizQuestions[questionNum].options==="free answer") {
    $("#input-submit").on("click", function() {
      quizQuestions[questionNum].userAnswer = $("#free-answer").val().toLowerCase();

      console.log(quizQuestions[questionNum]);
    });
  }
    else {
    $(".options").on("click", function() {
      console.log("user clicked " + $(this).text());

      // adds id to selected option so that background color is different
      $(".options").removeAttr("id");
      $(this).attr("id", "selected");

      // store the user's chosen option into the quizQuestion array w/ key userAnswer
      quizQuestions[questionNum].userAnswer = $(this).text().toLowerCase().trim().replace(/ /g, "-");

      console.log(quizQuestions[questionNum]);
    });
  };
};

// gets recipe from API based on quiz results
function getResults() {
  // API Key
  var id = 'dbfb23e8'; 
  var key = '3bf57d5b8152429180eac42017ed81f9';

  // results from quiz stored in variables
  var diet;
  var protein;
  var excludedArr;
  var excludedItems = "";
  var calorieRange;
  var numOfPeople;
  var cookingTime;

  // diet protein type
  if(quizQuestions[0].userAnswer==="vegetarian" || quizQuestions[0].userAnswer==="vegan") {
    diet = "&health=" + quizQuestions[0].userAnswer;
    console.log(diet);
    protein = quizQuestions[1].userAnswer;
  }
  else if(quizQuestions[0].userAnswer==="low-carb") {
    diet = "&diet=" + quizQuestions[0].userAnswer;
    console.log(diet);
    console.log("user chose low carb");
    protein = quizQuestions[2].userAnswer;
  }
  else { // all the carbs
    console.log("no diet");
    diet = "";
    protein = quizQuestions[3].userAnswer;
  };
  console.log(protein);

  // ingredients to exclude
  if(quizQuestions[4].userAnswer==="nothing") {
    excludedItems = "";
    console.log("no excluded items");
  }
  else {
    excludedArr = quizQuestions[4].userAnswer.split(",");
    
    for(var i=0; i<excludedArr.length; i++) {
      excludedItems += "&exclude=" + excludedArr[i].trim();
    };
    console.log(excludedItems);
  };

  // calorie range
  if(quizQuestions[5].userAnswer==="i-don't-care") {
    calorieRange = "";
    console.log("no calorie range");
  }
  else {
    calorieRange = "&calories=" + quizQuestions[5].userAnswer;
    console.log(calorieRange);
  }

  // number of people to cook for
  numOfPeople = parseInt(quizQuestions[6].userAnswer);
  console.log(numOfPeople);

  // cooking time
  switch (quizQuestions[7].userAnswer) {
    case quizQuestions[7].options[0].toLowerCase().replace(/ /g, "-"):
      cookingTime = "&time=0-30";
      break;
    case quizQuestions[7].options[1].toLowerCase().replace(/ /g, "-"):
      cookingTime = "&time=0-60";
      break;
    case quizQuestions[7].options[2].toLowerCase().replace(/ /g, "-"):
      cookingTime = "&time=0-120";
      break;
    case quizQuestions[7].options[3].toLowerCase().replace(/ /g, "-"):
      cookingTime = "&time=0-180";
      break;
    case quizQuestions[7].options[4].toLowerCase().replace(/ /g, "-"):
      cookingTime = "&time=0-240";
      break;
    case quizQuestions[7].options[5].toLowerCase().replace(/ /g, "-"):
      cookingTime = "";
      break;
    default:
      cookingTime = "";
  };
  console.log(cookingTime);  

  // clear html of question & options
  $("#question-id").html("Here is Your Quiz Result!");
  $("#options-id").html("");

  // change background
  $("html").css("background-image", "url('assets/images/result-background.jpg')");
  $("body").css("background-image", "url('assets/images/result-background.jpg')");

  // append a favorite button
  var favoriteButton = $("<button>", {id: "favorite-button", text: "❤ Save to Favorites"});
  $("#question-id").append(favoriteButton);

  var queryURL = "https://api.edamam.com/search?q=" + protein + "&app_id=" + id + "&app_key=" + key + diet + excludedItems + cookingTime + calorieRange;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);

    if(response.hits.length===0) {
      $("#options-id").text("No recipes matched your parameters.");
    }
    else {
      // randomly choose recipe
      var randomRecipe = Math.floor(Math.random()*response.hits.length);
      console.log(randomRecipe);
      console.log(response.hits[randomRecipe].recipe);

      // display recipe
      var recipeImage = $("<img>", {src: response.hits[randomRecipe].recipe.image});
      var recipeTitle = $("<h1>", {text: response.hits[randomRecipe].recipe.label});
      var recipeLink = $("<a>", {href: response.hits[randomRecipe].recipe.url, text: response.hits[randomRecipe].recipe.url});
      var recipeServings = $("<p>", {text: "This recipe yields " + response.hits[randomRecipe].recipe.yield + " servings. You are cooking for " + numOfPeople + " people. You will need to multiply the ingredients by " + numOfPeople/response.hits[randomRecipe].recipe.yield + "."});

      $("#options-id").append(recipeImage, recipeTitle, recipeLink, recipeServings);

      // store chosen recipe
      resultRecipe = response.hits[randomRecipe].recipe;
    };
  });

  $("#favorite-button").on("click", function() {
    pushToFirebase();
    location.href = "favorites.html";
  });
};

// push latest quiz result to firebase
function pushToFirebase() {
  console.log("firebase temporary push")
  database.ref('temporary').update({
    label: resultRecipe.label,
    url: resultRecipe.url,
    image: resultRecipe.image
  });
};

// increments questionNum so that the next question displays
function increment() {
  if(questionNum<=quizQuestions.length && questionNum>=0){
    // if one of the protein questions, skips to next non-protein question
    if(questionNum===1 || questionNum===2 || questionNum===3) {
      questionNum = 4;
    }
    // if question is asking type of diet, skips to appropriate protein question
    else if(questionNum===0) {
      if(quizQuestions[0].userAnswer==="vegetarian" || quizQuestions[0].userAnswer==="vegan") {
        console.log("increment veggie or vegan");
        questionNum = 1;
      }
      else if(quizQuestions[0].userAnswer==="low-carb") {
        console.log("increment low carb");
        questionNum = 2;
      }
      else {
        console.log("increment anything");
        questionNum = 3;
      };
    }
    // for all other questions, just increment
    else {
      questionNum++;
    };
  };
};

// decrements question tracker so that previous question displays
function decrement() {
  if(questionNum<=quizQuestions.length && questionNum>=0){
    console.log(questionNum);
    // if question is right before protein questions, skip to appropriate protein question based on response to diet question
    if(questionNum===4) {
      console.log(quizQuestions[0]);
      if(quizQuestions[0].userAnswer==="vegetarian" || quizQuestions[0].userAnswer==="vegan") {
        console.log("decrement veggie or vegan");
        questionNum = 1;
      }
      else if(quizQuestions[0].userAnswer==="low-carb") {
        console.log("decrement low carb");
        questionNum = 2;
      }
      else {
        console.log("decrement anything");
        questionNum = 3;
      };
    }
    // if on first question (diet question), skip to appropriate protein question based on diet
    else if(questionNum===1 || questionNum===2 || questionNum===3) {
      questionNum = 0;
    }
    // for all other questions, just decrement
    else {
      questionNum--;
    };
  };
};