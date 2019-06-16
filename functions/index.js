//Requirements
const fire = require('firebase');
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');

firebase.initializeApp({
    credential: firebase.credential.cert({
      "project_id":"continued-website",
      "client_email": "firebase-adminsdk-452f2@continued-website.iam.gserviceaccount.com",
      "private_key":"-----BEGIN PRIVATE KEY-/nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDB+9LsA0zE27sng3ZeHF5NmTm+SkwSR0EpzdxLZ0rfscvIA3rrAbBmP8Sv3+FJMLmz+6eHsUMVl0ssnDLW6E8hv2jMeQMBY3BnjEjpV1dcw5mkoGQ9HlgPGD4gEPF0JEh8LOqUb05p5KnTB7cLJLNZ7nZ6c9yuQDP9ukfdald+7Sohtq+Bfsi+OALNKZkhFXj48uspH+MIKNTntJ3cU8z5+xcrfbeLqmkHbg+QzCF++z6nNYi5ygHldOK0Pqw3MuBJKLRX2PsYdMonruXGvWN6OuIaZBBTL3gyMQAvs9mU8qmxwxposf23aQ9LBD1TtMEMbA6UN0vzDnnqzMgevT3AgMBAAECggEAU8J4LbFE4csAWGujTpudNJB22G2oTzQpNO3Is15UfCZnQUwPZS4DhwL94Jsg4cOCS+7btcGan9YGBW0vgx+y43WMwM13uLBMbmSqjubBuDJnVQzpmTeWuTEZBfQMT3vxTuBqE57bwp3Ht3kK0jME6GBjZW6JvpWXfjS1EHpzuTpWnz0DHsAKHyQ7tXwLW+CtZ24UDamX328p5YBb3eBg8+Rvbr96nhqFsjqkQBMJYWdanR7vWGyDwGP3kUxF4tGChv2QPW7zikVMWwtmHvWGBlrEQMZgVc3mplEmaoMvmAGnYMXrePEVLXXI9xQeC87jaXJYNFBJgAsdkmrAyuKMkQKBgQD0gLtiDLZWxHFa0gInDGCsfdltxc83Hj3madjkTqqhviHn9dqOuVGjY6tkk8FtaEgPbcNLGvBsCR+93fVPnk4CHpt5VijYHUXyH7Bf6pCtKtho1rHhNlbzwop+g9NxbStPBJuskDIwWH76yFX+nY5qWWzuDxKTV3pl+epQC1aCxQKBgQDLGwG0ynoJQqjSBlTlF7+40STv881NHwenoOwou9BxDYR55RABqwzKynVFjAIesxdTiz0J7YCMgWkvQ3aj61A51tWy6492khrnMPt5AFyLKfiwe+zRlCLHVV19R2A6IHxWf8WLPzogDp27Ujw8v+kEJF8La6KekMPnKYfBiolkiwKBgHMLo52JVHcaw3163EQyeg6yotKDVvQCO63w5u7YRVbjkiOtBnLbW4ryvLDmehes6vsgXD7j6XaHUZXFUOaKWsqzFDpkJSO9g6qu3m3B5vG5bw9omn1rEp56qx8qrbWFZ875cZ3lO7QDxWSYhCbjuBymyVcQMdVT1og6UYQKOVAoGBAINinEvZ6SsVjdNeoDpjrheuCrDVyyZqPiLEUlSS74iYu4a2RI29uKn9WPdfSDfLTnDUcQxakeRYZ3uwzZCEAF6QX6d9o3C8WbRD8FOFI40B2ybjA1MaRKArUUyEGxqfFnu2naHmMuH6Oy1w5WgpwEw7fKbSS6vIx8Ul3bm0FAoGAL3MFIQL8+1KC0K7k3gKcn0yVI0fndPauK5HPAMBhlQKKoBmssE9SwGUM9V6tOYEpZfgy+bHOAWhMgENqlcjETnxEWPV9Zc1P9DobcaqZgKiGOWXIxMUQxueJZTZ2bKsV5mKF5CCKnJexs3PfK3hMNnFNQvDLZvsDPmfyEnHkkVzWA=n-----END PRIVATE KEY-----\n",
    }),
    databaseURL: "https://continued-website.firebaseio.com"
},'admin');

//Initialization
const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const index = express();
index.engine('hbs', engines.handlebars);
index.set('views', './views');
index.set('view engine', 'hbs');


index.use(bodyParser.urlencoded({
    extended:true
}));

index.use(bodyParser.json())


//HTTPS GET requests
    //Index render at '/'
index.get('/',(request,response) => {
    response.render('index');
});

//HTTPS POST requests
    //Database interaction when recieving data
index.post('/',(request, response) => {
    addRecipe(request.body.name,request.body.id,request.body.user,request.body.cuisine,request.body.time,
        request.body.serving,request.body.ingredients,request.body.difficulty,request.body.procedure);
        response.send("200 OK");
})

index.post('/update',(req,res)=>{
    updateRating(req.body.key,req.body.value_rating)
    res.send("200 OK")
})

//Database
var database = firebase.database();
var db = firebase.firestore();
var recipeRef = db.collection('recipes');

function addRecipe(name, id, user, cuisine, time, serving, ingredients, difficulty, procedure){
    var addDoc = db.collection('recipes').add({
        name: name,
        id: id,
        user: user,
        cuisine: cuisine,
        time: time,
        serving: serving,
        ingredients: ingredients,
        difficulty: difficulty,
        procedure: procedure,
        num_rating: 0,
        total_rating: 0
      }).then(ref => {
        console.log('Added document with ID: ', ref.id);
        return 1;
      });
}

//Authentication

var provider = new fire.auth.GoogleAuthProvider();
function googleLogin(){
    firebase.auth().signInWithPopup(provider).then((result) => {
        var token = result.credential.accessToken;
        var user = result.user;
        return 1;
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
}




//Get Rating

function getRating(total_rating, num_rating){
    rating = total_rating/num_rating
    return rating
}

//Update Rating
function updateRating(key,value_rating){
    var recipeRating = db.collection('recipes').doc(key)
    var transaction = db.runTransaction(t => {
        return t.get(recipeRating)
          .then(doc => {
            var new_num_rating = doc.data().num_rating + 1;
            t.update(recipeRating, {num_rating:new_num_rating});
            var new_total_rating = doc.data().total_rating + value_rating;
            t.update(recipeRating, {total_rating:new_total_rating});
            return 1;
          });
      }).then(result => {
        console.log('Transaction success!');
        return 1;
      }).catch(err => {
        console.log('Transaction failure:', err);
      });
}

//Filter

function filterResults(ingredients){
    var recipes = db.collection('recipe');
    ingredients.forEach(element => {
        recipes = recipes.where('ingredients','array-contains',element)
    });
    return recipes
}

//Search

function searchResults(name){
    var recipes = db.collection('recipe').where('name','==', name)
    return recipes
}


//Exporting
exports.index = functions.https.onRequest(index);
