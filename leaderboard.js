console.log("Hello World!");

PlayersList = new Mongo.Collection('players');

// This code only runs on the CLIENT. (on the other hand, Meteor.isServer returns true for the Server side only)
if (Meteor.isClient) {

  /*
  Template Notes:
  We can create a group of "helper" functions for a SPECIFIC template, with the following syntax:
    Template.templateName.helpers({
      'function1Name': function() {
        ...
      },
      'function2Name': function() {
        ...
      }
    });
   */

  Meteor.subscribe('thePlayers');

  Template.leaderboard.helpers({
    'player': function(){
      var currentUserId = Meteor.userId();
      return PlayersList.find({}, {sort: {score: -1, name: 1} });  // {sort: {...} } uses the sort operator, sorting by ...
        // more on the above: 1st arg {} means that all of the data in the collection is to be retrieved.
        // 2nd arg also has another sorting algorithm "name: 1", which sorts by alphabetical name IF there are tie scores.
    },
    'otherHelperFunction': function(){
      return "Some other function";
    },
    'countPlayers': function() {
      return PlayersList.find().count();
    },
    'numArray': function() {
      return [1, 2, 3, 4];
    },
    'selectedClass': function(){
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if (playerId === selectedPlayer) {
        return "selected";
      }
      //return this._id;
    },
    'showSelectedPlayer': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne(selectedPlayer);
    }
  });

  //EVENTS can be created for a specific template.  Events allow us to trigger the execution of code when a user clicks
  // on a button, taps a key on their keyboard, or completes a range of other actions.
  Template.leaderboard.events({
    // events go here... we next attach an event that determines what happens when the user 'click's in  leaderboard:
    //'click': function() {
      // code for 'click' function goes here
      //console.log("Nice click baby!");  // NOTE that without specifying, this event happens with ANY click.
    //},
    'click .player': function() {
      //console.log("Nice .player click baby!");
      var playerId = this._id;
      // First SESSION: A session stores small pieces of data that is NOT saved to the database, but CAN be used in the app...
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    },
    'click .decrement': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      PlayersList.update(selectedPlayer, {$inc: {score: -5} })
    },
    'click .remove': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      //PlayersList.remove(selectedPlayer);  // Use remove() with an arg that passes through the unique ID of a document
        // as the only argument. That document will then be removed from the collection.
      Meteor.call('removePlayerData', selectedPlayer);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(event) {
      event.preventDefault();  // this function prevents the default behavior of the event from occurring (good!)
      var playerNameVar = event.target.playerName.value;
      var scoreVar = event.target.playerScore.value;
      //console.log(playerNameVar);
      //var currentUserId = Meteor.userId();  // Meteor.userId() function returns the value of the current user's id.
      //PlayersList.insert({
      //  name: playerNameVar,
      //  score: scoreVar,
      //  createdBy: currentUserId  // when a player is added to the leaderboard, we note ID of the logged in user.
      //});
      Meteor.call('insertPlayerData', playerNameVar, scoreVar);
      event.target.playerName.value = "";
      event.target.playerScore.value = "";
    }
  });

}  // close  if (Meteor.isClient) code block.

// This code only runs on the SERVER.
if (Meteor.isServer) {
  //console.log("Hey there Server.");
  //console.log( PlayersList.find().fetch() );
  Meteor.publish( 'thePlayers', function() {
    var currentUserId = this.userId;
    return PlayersList.find( {createdBy: currentUserId} );
  });

  Meteor.methods({
    'insertPlayerData': function(playerNameVar, scoreVar){
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerNameVar,
        score: scoreVar,
        createdBy: currentUserId
      });
    },
    'removePlayerData': function(selectedPlayer){
      var currentUserId = Meteor.userId();
      PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue){
      PlayersList.update(selectedPlayer, {$inc: {score: scoreValue} });
    }
  });
}  // close if (Meteor.isServer) code block.

