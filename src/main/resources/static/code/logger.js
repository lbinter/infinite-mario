function timeElapsed() {
    return CurrentLevel.TotalTimeLeft - CurrentLevel.TimeLeft;
}

logger.logKeys = false;
logger.ws = null;
logger.isConnected = false;
logger.url =function () {
    return ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/logging"
}

logger.connect = function () {
    if (logger.isConnected) return;
    ws = new WebSocket(logger.url());
    ws.onopen = function () {
        console.log("Info: Connection Established with '"+ logger.url()+"'");
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

logger.log = function (message) {
    if (ws != null) {
        ws.send(JSON.stringify(message));
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
        event: "LEAVE-WORLD",
        timeleft: CurrentLevel.TimeLeft
    };
    this.log(message);
}

logger.died = function () {
    console.log("Mario died at time " + timeElapsed());
    let message = {
        event: "DIED",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedFlower = function () {
    console.log("Gained PowerUp Flower at time " + timeElapsed());
    let message = {
        event: "POWERUP",
        type: "flower",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedMushroom = function () {
    console.log("Gained PowerUp Mushroom at time " + timeElapsed());
    let message = {
        event: "POWERUP",
        type: "mushroom",
        time: timeElapsed()
    };
    this.log(message);
}

logger.lostPowerUp = function () {
    console.log("Lost PowerUp at time " + timeElapsed());
    let message = {
        event: "POWERUP-LOST",
        time: timeElapsed()
    };
    this.log(message);
}

logger.gainedCoin = function () {
    console.log("Gained coin " + Mario.MarioCharacter.Coins + " at time " + timeElapsed());
    let message = {
        event: "COIN",
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
        event: "BLOCK-DESTROYED",
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
        event: "ENEMY-DEATH",
        enemyType: type,
        posX: x,
        posY: y,
        deathtype: deathtype,
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
    if (printLog) console.log(str);
}

logger.connect();

window.onbeforeunload = function () {
    logger.disconnect();
}