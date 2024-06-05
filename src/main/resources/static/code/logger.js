function timeElapsed() {
    return CurrentLevel.TotalTimeLeft - CurrentLevel.TimeLeft;
}

var stompClient = null;
var scoreEventSubscription = null;

logger.startGame = function () {
    $(document).ready(function () {
        EnjineApp = new Enjine.Application().Initialize(new Mario.LoadingState(), 320, 240)
    });
}

function connectLogging() {
    fetch("./imario_world.json")
        .then((response) => response.json())
        .then((json) => worldMap = json);
    fetch("./player")
        .then((response) => response.json())
        .then((json) => {
            playerID = json.player;
            let socket = new SockJS('/logging');
            stompClient = Stomp.over(socket);
            stompClient.connect({ username: playerID, }, function () {
                console.log('Web Socket is connected to /logging with playerID: ' + playerID);
                stompClient.send('/mario/events', {}, JSON.stringify({ event: "SESSION_START" }));
                scoreEventSubscription = stompClient.subscribe(
                    '/players/queue/messages',
                    function (message) {
                        console.log('received :: ' + message.body);
                    });
                logger.isConnected = true;
                $("#container-logo").hide();
                $("#consent-show").prop('disabled', true);
                $("#playButtonContainer").hide();
                logger.startGame();
                $("#container-help").show();
                $("#container-main").show();
                $("#container-survey").show();
                $("#survey").prop('href', getSurveyUrl());
            });
            stompClient.debug = function () { };//do nothing
            socket.onclose = function () {
                disconnectLogging();
            };
        });
}

$(function () {
    $("#startGame").click(function () {
        if (!logger.isConnected) {
            connectLogging();
        }
    });
});

function disconnectLogging() {
    stompClient.send('/mario/events', {}, JSON.stringify({ event: "SESSION_CLOSE" }));
    if (scoreEventSubscription != null) {
        scoreEventSubscription.unsubscribe();
        scoreEventSubscription = null;
    }
    stompClient.disconnect();
    console.log('Disconnected');
    logger.isConnected = false;
}

logger.logKeys = false;
logger.ws = null;
logger.isConnected = false;
logger.url = function () {
    return ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/logging"
}

logger.log = function (message, replacer = null, stringify = true) {
    if (stompClient != null) {
        if (stringify) {
            if (replacer) {
                stompClient.send('/mario/events', {}, JSON.stringify(message, replacer));
            } else {
                stompClient.send('/mario/events', {}, JSON.stringify(message));
            }
        } else {
            stompClient.send('/mario/events', {}, message);
        }
    } else {
        console.error('connection not established, please connect.');
    }
}

logger.start = function () {
    logger.alive = true;
    let message = {
        event: "START",
        level: Mario.MarioCharacter.LevelString,
        lives: Mario.MarioCharacter.Lives,
        coins: Mario.MarioCharacter.Coins,
        timeleft: CurrentLevel.TimeLeft
    };
    this.log(message);
}

logger.finished = function () {
    let message = {
        event: "WIN_WORLD",
        level: Mario.MarioCharacter.LevelString,
        timeleft: CurrentLevel.TimeLeft
    };
    this.log(message);
}


logger.gameOver = function () {
    let message = {
        event: "GAME_OVER"
    };
    this.log(message);
}


logger.winState = function () {
    let message = {
        event: "WIN"
    };
    this.log(message);
}

/**
 * @param {Number} type -1 = time out, 0 = fell to death, 1 = death by enemy
 */
logger.alive = true;
logger.die = function (type) {
    if (!logger.alive) {
        return;
    }
    logger.disablePositionLog();
    logger.alive = false;
    let message = {
        event: "DEATH",
        deathType: type,
        time: timeElapsed()
    };
    this.log(message);
}

/**
 * 
 * @param {Number} x MarioCharacter position X
 * @param {Number} y MarioCharacter position Y
 * @param {Number} hurt 1 = hurt by enemy, 2 = hurt by shell, 3 = hurt by bullet bill
 */
logger.getHurt = function (x, y, hurt, enemyId) {
    let message = {
        event: "GET_HURT",
        posX: x,
        posY: y,
        hurt: hurt,
        enemyId: enemyId,
        time: timeElapsed()
    };
    this.log(message);
}

logger.powerupSpawned = function (pType, x, y) {
    let message = {
        event: "POWERUP_SPAWN",
        posX: x,
        posY: y,
        pType: pType,
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedMushroom = function () {
    let message = {
        event: "POWERUP",
        pType: "mushroom",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedFlower = function () {
    let message = {
        event: "POWERUP",
        pType: "flower",
        time: timeElapsed()
    };
    this.log(message);
}

logger.lostPowerUp = function () {
    let message = {
        event: "POWERUP_LOST",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedCoin = function () {
    let message = {
        event: "COIN",
        coins: Mario.MarioCharacter.Coins,
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedLive = function () {
    let message = {
        event: "LIVE",
        lives: Mario.MarioCharacter.Lives,
        time: timeElapsed()
    };
    this.log(message);
}

logger.keydown = function (key) {
    if (!logger.logKeys) return;
    console.log("KeyDown[" + key + "]")
}

logger.keyup = function (key) {
    if (key == 75) { // == k key
        logger.logKeys = !logger.logKeys;
        if (logger.logKeys) {
            console.log("Enabled key logging");
        } else {
            console.log("Disabled key logging");
        }
    } else if (key == 80) { // == p key
        logger.logPostion = !logger.logPostion;
        if (logger.logPostion) {
            console.log("Enable positon logging");
        } else {
            console.log("Disabled positon logging");
        }
    }
    if (!logger.logKeys) return;
    console.log("KeyUp[" + key + "]")
}

logger.destroyBlock = function (x, y) {
    let message = {
        event: "BLOCK_DESTROYED",
        posX: x,
        posY: y,
        time: timeElapsed()
    };
    this.log(message);
}

logger.enemySpawn = function (type, x, y, id = -1) {
    let message = {
        event: "ENEMY_SPAWN",
        enemyType: type,
        enemyId: id,
        posX: x,
        posY: y,
        time: timeElapsed()
    };
    this.log(message);
}

logger.enemyDied = function (type, x, y, deathtype, id) {
    let message = {
        event: "ENEMY_DEATH",
        enemyType: type,
        enemyId: id,
        posX: x,
        posY: y,
        deathType: deathtype,
        time: timeElapsed()
    };
    this.log(message);
}

logger.lastX = 0;
logger.lastY = 0;
logger.lastPosTime = 0;
logger.logPostion = true;
logger.position = function (x, y, facing) {
    let time = timeElapsed();
    if (time == logger.lastPosTime) {
        return;
    }
    logger.lastPosTime = time;
    if (!logger.logPostion) return;
    let posChanged = false;
    if (logger.lastX != x) {
        logger.lastX = x;
        posChanged = true;
    }
    if (logger.lastY != y) {
        logger.lastY = y;
        posChanged = true;
    }
    if (posChanged) {
        let message = {
            event: "POS",
            posX: x,
            posY: y,
            facing: facing,
            time: time
        };
        this.log(message);
    }
}

logger.enablePositionLog = function () {
    logger.logPostion = true;
}

logger.disablePositionLog = function () {
    logger.logPostion = false;
}

logger.level = function (id, data) {
    let message = {
        event: "LEVEL",
        levelId: id,
        levelData: data
    };
    this.log(message);
}

logger.world = function (data) {
    let message = {
        event: "WORLD",
        worldData: {
            LevelDifficulty: data.LevelDifficulty,
            LevelType: data.LevelType,
            Level: data.Level,
            Data: data.Data,
            WorldNumber: data.WorldNumber,
            CastleData: data.CastleData
        }
    };
    this.log(message);
}

logger.jumpStart = function (stomp = false) {
    let message = {
        event: "JUMP_START",
        stomp: stomp,
        time: timeElapsed()
    };
    this.log(message);
}

logger.jumpLand = function () {
    let message = {
        event: "JUMP_LAND",
        time: timeElapsed()
    };
    this.log(message);
}

logger.runningStart = function () {
    let message = {
        event: "RUN_START",
        time: timeElapsed()
    };
    this.log(message);
}

logger.runningStop = function () {
    let message = {
        event: "RUN_STOP",
        time: timeElapsed()
    };
    this.log(message);
}

logger.fireball = function (x, y, facing) {
    let message = {
        event: "FIREBALL",
        posX: x,
        posY: y,
        facing: facing,
        time: timeElapsed()
    };
    this.log(message);
}

window.onbeforeunload = function () {
    disconnectLogging();
}

function getSurveyUrl() {
    return surveyUrl + playerID;
}


$("#container-main").hide();