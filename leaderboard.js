console.log("Hello World!!!");

PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {
  //console.log("Hello Client.");
}

if (Meteor.isServer) {
  //console.log("Hey there Server.");
}

Template.leaderboard.helpers({
  'player': function(){
    return "Some other text";
  }
});