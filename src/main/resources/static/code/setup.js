/**
	Just create the global mario object.
	Code by Rob Kleffner, 2011
*/
var editorApp = null;
var editorChooserApp = null;
var EnjineApp = null;
var Mario = {};
var CurrentLevel = {};
var logger = {};
var worldMap = {};
var playerID = null;
var editorState = null;
var editorChooserState = null;

var surveyUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScC-eGkE76wQ5g6S_ETQWUlzVjQK2vTzu0z_FLrRf58nHK1UQ/viewform?usp=pp_url&entry.2005620554=';

// points
var P_ENEMY_LOST_WINGS = 50;
var P_GREEN_KOOPA_DEAD = 100;
var P_RED_KOOPA_DEAD = 300;
var P_GOOMBA_DEAD = 100;
var P_SPIKY_DEAD = 200;
var P_FLOWER_DEAD = 200;

function addWorld(worldID) {
	worldMap[worldID] = {};
	worldMap[worldID].world = {};
	worldMap[worldID].levels = {};
	return worldMap[worldID];
}