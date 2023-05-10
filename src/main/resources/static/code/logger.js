function timeElapsed() {
    return CurrentLevel.TotalTimeLeft - CurrentLevel.TimeLeft;
}

logger.logKeys = false;
logger.ws = null;
logger.isConnected = false;
logger.url = function () {
    return ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/logging"
}

logger.connect = function () {
    if (logger.isConnected) return;
    ws = new WebSocket(logger.url());
    ws.onopen = function () {
        console.log("Info: Connection Established with '" + logger.url() + "'");
        logger.isConnected = true;
    };

    ws.onclose = function (event) {
        console.log("Info: Closing Connection.");
        logger.isConnected = false;
    };
}

logger.disconnect = function () {
    if (ws != null) {
        ws.close();
        ws = null;
    }
}

logger.log = function (message, replacer = null, stringify = true) {
    if (ws != null) {
        if (stringify) {
            if (replacer) {
                ws.send(JSON.stringify(message, replacer));
            } else {
                ws.send(JSON.stringify(message));
            }
        } else {
            ws.send(message);
        }
    } else {
        console.error('connection not established, please connect.');
    }
}

logger.start = function () {
    console.log("Starting world " + Mario.MarioCharacter.LevelString +
        " with " + Mario.MarioCharacter.Lives +
        " lives, " + Mario.MarioCharacter.Coins +
        " coin and time " + CurrentLevel.TimeLeft);
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
    console.log("Finished world with time " + CurrentLevel.TimeLeft + " left.");
    let message = {
        event: "WIN_WORLD",
        level: Mario.MarioCharacter.LevelString,
        timeleft: CurrentLevel.TimeLeft
    };
    this.log(message);
}


logger.gameOver = function () {
    console.log("Game Over.");
    let message = {
        event: "GAME_OVER"
    };
    this.log(message);
}


logger.winState = function () {
    console.log("Won with " + Mario.MarioCharacter.Lives + " left.");
    let message = {
        event: "WIN"
    };
    this.log(message);
}

logger.died = function () {
    console.log("Mario died at time " + timeElapsed());
    let message = {
        event: "DEATH",
        time: timeElapsed()
    };
    this.log(message);
}

logger.powerupSpawned = function (pType) {
    console.log("PowerUp " + pType + " spawned at time " + timeElapsed());
    let message = {
        event: "POWERUP_SPAWNED",
        pType: pType,
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedMushroom = function () {
    console.log("Gained PowerUp Mushroom at time " + timeElapsed());
    let message = {
        event: "POWERUP",
        pType: "mushroom",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedFlower = function () {
    console.log("Gained PowerUp Flower at time " + timeElapsed());
    let message = {
        event: "POWERUP",
        pType: "flower",
        time: timeElapsed()
    };
    this.log(message);
}

logger.lostPowerUp = function () {
    console.log("Lost PowerUp at time " + timeElapsed());
    let message = {
        event: "POWERUP_LOST",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedCoin = function () {
    console.log("Gained coin " + Mario.MarioCharacter.Coins + " at time " + timeElapsed());
    let message = {
        event: "COIN",
        coins: Mario.MarioCharacter.Coins,
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedLive = function () {
    console.log("Gained live - new total " + Mario.MarioCharacter.Lives + " at time " + timeElapsed() + ". Coins set to 0.");
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

logger.destroyBlock = function (x, y) {
    console.log("destroyed block[" + x + "," + y + "]");
    let message = {
        event: "BLOCK_DESTROYED",
        posX: x,
        posY: y,
        time: timeElapsed()
    };
    this.log(message);
}

logger.enemyDied = function (type, x, y, deathtype) {
    let str = "";
    if (type == 0) { // RedKoopa
        str += "Red Koopa";
    } else if (type == 1) { // GreenKoopa
        str += "Green Koopa";
    } else if (type == 2) { // Goomba
        str += "Goomba";
    } else if (type == 3) { // Spiky
        str += "Spiky";
    } else if (type == 4) { // Flower
        str += "Flower";
    }
    if (deathtype == -1) {
        str += " lost wings at pos[" + x + "," + y + "].";
    } else {
        str += " died at pos[" + x + "," + y + "]";
        if (deathtype == 0) { // stomp
            str += " by stomp.";
        } else if (deathtype == 1) { // shell
            str += " by shell.";
        } else if (deathtype == 2) { // fireball
            str += " by fireball.";
        }
    }
    console.log(str);
    let message = {
        event: "ENEMY_DEATH",
        enemyType: type,
        posX: x,
        posY: y,
        deathType: deathtype,
        time: timeElapsed()
    };
    this.log(message);
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

logger.lastX = 0;
logger.lastY = 0;
logger.logPostion = true;
logger.position = function (x, y) {
    if (!logger.logPostion) return;
    let str = "Pos[Time:" + timeElapsed() + ",";
    let printLog = false;
    if (logger.lastX != x) {
        logger.lastX = x;
        str += "X:" + x;
        printLog = true;
    }
    if (logger.lastY != y) {
        logger.lastY = y;
        if (printLog) str += ",";
        str += "Y:" + y;
        printLog = true;
    }
    str += "]";
    if (printLog) {
        console.log(str);
        let message = {
            event: "POS",
            posX: x,
            posY: y,
            time: timeElapsed()
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

logger.level = function (level_string, level) {
    let message = {
        event: "LEVEL",
        level_string: level_string,
        level_data: level
    };
    this.log(message, function replacer(key, value) {
        if (key !== "levelMap"
            && key !== "levelData"
            && key !== "levelSpriteTemplates") { return value; }
    });
    console.log("level:" + level);
}

logger.jumpStart = function (stomp = false) {
    if (stomp) {
        console.log("jump stomp start");
    } else {
        console.log("jump start");
    }
    let message = {
        event: "JUMP_START",
        time: timeElapsed()
    };
    this.log(message);
}

logger.jumpLand = function () {
    console.log("jump land");
    let message = {
        event: "JUMP_LAND",
        time: timeElapsed()
    };
    this.log(message);
}

logger.runningStart = function () {
    console.log("run start");
    let message = {
        event: "RUN_START",
        time: timeElapsed()
    };
    this.log(message);
}

logger.runningStop = function () {
    console.log("run stop");
    let message = {
        event: "RUN_STOP",
        time: timeElapsed()
    };
    this.log(message);
}

logger.connect();

window.onbeforeunload = function () {
    logger.disconnect();
}
