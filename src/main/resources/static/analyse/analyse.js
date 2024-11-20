var images = {};
var bgSheet;
var levelSheet;

images["bg"] = new Image();
images["bg"].src = "/images/bgsheet.png";
images["bg"].onload = function () { bgSheet = getBackgroundSheet() };
images["map"] = new Image();
images["map"].src = "/images/mapsheet.png";
images["map"].onload = function () { levelSheet = getLevelSheet() };

var logFiles;
var responseEntity;
var selectAvailable;
var selectDownload;
var selectFinished;
var detailTabButtons;
var detailTabs;
var canvasContainer;

var logs = {};
var worldData;

var availableLogsId = "selectLog";
var downloadedLogsId = "selectDownload";
var selectedLogsId = "selectFinished";

var s_questions = [], s_answers = [], s_answers_buttons = [], s_answers_colors = [], s_answers_colors_buttons = [];
var s_selected = [];

var generateLevelButtons = [];

function getBackgroundSheet() {
    var sheet = [];
    var x = 0, y = 0, width = images["bg"].width / 32, height = images["bg"].height / 32;

    for (x = 0; x < width; x++) {
        sheet[x] = [];

        for (y = 0; y < height; y++) {
            sheet[x][y] = { X: x * 32, Y: y * 32, Width: 32, Height: 32 };
        }
    }
    return sheet;
}

function getLevelSheet() {
    var sheet = [], x = 0, y = 0, width = images['map'].width / 16, height = images['map'].height / 16;

    for (x = 0; x < width; x++) {
        sheet[x] = [];

        for (y = 0; y < height; y++) {
            sheet[x][y] = { X: x * 16, Y: y * 16, Width: 16, Height: 16 };
        }
    }
    return sheet;
}

$(document).ready(function () {
    selectAvailable = $("#" + availableLogsId);
    selectDownload = $("#" + downloadedLogsId);
    selectFinished = $("#" + selectedLogsId);
    detailTabButtons = $('#logDetailTabList');
    detailTabs = $('#logDetailTabs');

    canvasContainer = $("#canvas-container");

    // populate log select
    fetch("./logs")
        .then((response) => response.json())
        .then((json) => {
            logFiles = json;
            addLogEntries(json);
        });

    // create button handlers
    $("#logs-download").click(function () {
        $('#' + availableLogsId + ' option:selected').each(function () {
            downloadLogFile($(this).val());
        })
    });
    selectAvailable.on("dblclick", function (event) {
        downloadLogFile(event.target.value);
    });

    $("#logs-add").click(function () {
        $('#' + downloadedLogsId + ' option:selected').each(function () {
            addSelectedLog($(this).val());
        })
    });
    selectDownload.on("dblclick", function (event) {
        addSelectedLog(event.target.value);
    });

    $("#logs-detail-downloaded").click(function () {
        clearDetails();
        let active = true;
        $('#' + downloadedLogsId + ' option:selected').each(function () {
            showDetails($(this).val(), active);
            if (active) active = false;
        })
    });
    $("#logs-remove").click(function () {
        $('#' + selectedLogsId + ' option:selected').each(function () {
            removeSelectedLog($(this).val());
        })
    });
    selectFinished.on("dblclick", function (event) {
        removeSelectedLog(event.target.value);
    });
    $("#logs-detail-selected").click(function () {
        clearDetails();
        let active = true;
        $('#' + selectedLogsId + ' option:selected').each(function () {
            showDetails($(this).val(), active);
            if (active) active = false;
        })
    });

    $("#parse-survey").click(function () {
        console.log("parse survey clicked");
        let file = $("#survey").get(0).files[0];
        let reader = new FileReader();
        reader.onload = function (event) {
            logs.drawPlayerMovement = true;
            logs.drawPlayerDeath = true;
            // get plain text  from base64 
            let decoded = atob(event.target.result.split(',')[1]);
            let lines = decoded.split("\r\n");
            let i = 0;
            s_questions = lines[0].replace("\r", "").split(',');
            for (i = 0; i < s_questions.length; i++) {
                s_answers[i] = [];
                s_answers_buttons[i] = [];
                s_answers_colors[i] = [];
            }
            for (i = 1; i < lines.length; i++) {
                let answers = lines[i].replace("\r", "").split(',');
                if (logs[answers[1] + ".log"] == undefined) {
                    console.log("Could not find log entry for id " + answers[1]);
                    continue;
                }
                logs[answers[1] + ".log"].survey = {};
                logs[answers[1] + ".log"].survey.timestamp = answers[0];
                logs[answers[1] + ".log"].survey.gender = answers[2];
                addAnswer(2, answers[2]);
                logs[answers[1] + ".log"].survey.age = answers[3];
                addAnswer(3, answers[3]);
                logs[answers[1] + ".log"].survey.experience = {};
                logs[answers[1] + ".log"].survey.experience.computerGames = answers[4];
                addAnswer(4, answers[4]);
                logs[answers[1] + ".log"].survey.experience.mario = answers[5];
                addAnswer(5, answers[5]);
                logs[answers[1] + ".log"].survey.experience.keyboard = answers[6];
                addAnswer(6, answers[6]);
                logs[answers[1] + ".log"].survey.comments = answers[7];
            }
            for (i = 0; i < s_questions.length; i++) {
                s_answers[i].sort();
            }
            console.log("Loaded survey from file");
            //alert("Survey Data loaded!");
        };
        reader.readAsDataURL(file);
    });

    $("#parse-world").click(function () {
        // load world data from server
        if ($('#switch-world-server').is(":checked")) {
            fetch("./imario_world.json")
                .then((response) => response.json())
                .then((json) => {
                    worldData = json;
                    console.log("Loaded world data from server");
                    populateGeneratUi();
                    //alert("Loaded world data from server!");
                });
        } else {
            let file = $("#world-file").get(0).files[0];
            let reader = new FileReader();
            reader.onload = function (event) {
                // get json string from base64 
                var decoded = atob(event.target.result.split(',')[1]);
                worldData = JSON.parse(decoded);
                console.log("Loaded world data from file");
                populateGeneratUi();
                //alert("Loaded world data from file!");
            };
            reader.readAsDataURL(file);
        }
    });

    $("#remove-empty").click(function () {
        console.log("Removing empty logs");
        let counter = 0;
        $('#' + availableLogsId + ' > option').each(function () {
            let logFileName = this.value;
            if (logs[logFileName].size <= 97) {
                counter++;
                this.remove();
                console.log("Removing " + logFileName);
            }
        });
        console.log("Removed " + counter + " log entries");
        //alert("Removed " + counter + " empty log entries!")
    });

    $("#filter-survey").click(function () {
        console.log("Removing logs without survey");
        let counter = 0;
        $('#' + availableLogsId + ' > option').each(function () {
            let logFileName = this.value;
            if (logs[logFileName].survey == undefined) {
                counter++;
                this.remove();
                console.log("Removing " + logFileName);
            }
        });
        console.log("Removed " + counter + " log entries");
        //alert("Removed " + counter + " log entries without survey data!")
    });
});

function getSurveyDataByID(logFileName, answerId) {
    switch (answerId) {
        case 0:
            return logs[logFileName].survey.timestamp;
        case 1:
            return getLogId(logFileName);
        case 2:
            return logs[logFileName].survey.gender;
        case 3:
            return logs[logFileName].survey.age;
        case 4:
            return logs[logFileName].survey.experience.computerGames;
        case 5:
            return logs[logFileName].survey.experience.mario;
        case 6:
            return logs[logFileName].survey.experience.keyboard;
        case 7:
            return logs[logFileName].survey.comments;
    }
}

function addAnswer(qID, answer) {
    if (!s_answers[qID].includes(answer)) {
        s_answers[qID].push(answer);
    }
}

var logData; var logFile;

async function downloadLogFile(logFileName) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
    let option = $('#selectLog [value="' + logFileName + '"]');
    console.log('Downloading: ' + logFileName);
    fetch("./logAsJson?name=" + logFileName)
        .then((response) => {
            const reader = response.body.getReader();
            logs[logFileName].loaded = 0;
            return new ReadableStream({
                start(controller) {
                    return pump();
                    function pump() {
                        return reader.read().then(({ done, value }) => {
                            // When no more data needs to be consumed, close the stream
                            if (done) {
                                controller.close();
                                return;
                            }
                            logs[logFileName].loaded += value.length;
                            option.html(logFileName + ' | ' + humanFileSize(logs[logFileName].loaded) + '/' + humanFileSize(logs[logFileName].size));
                            // Enqueue the next data chunk into our target stream
                            controller.enqueue(value);
                            return pump();
                        });
                    }
                },
            });
        })
        // Create a new response out of the stream
        .then((stream) => new Response(stream))
        .then((response) => response.text())
        .then((text) => {
            logData = text;
            logs[logFileName].data = JSON.parse(text);
            option.remove();
            selectDownload.append($('<option>', {
                value: logFileName,
                text: logFileName + ' | ' + humanFileSize(logs[logFileName].size)
            }));
        })
        .catch((err) => alert(err));
}

function addSelectedLog(logFileName) {
    let option = $('#' + downloadedLogsId + ' [value="' + logFileName + '"]');
    option.remove();
    console.log('Adding "' + logFileName + '" to selected logs');
    selectFinished.append($('<option>', {
        value: logFileName,
        text: logFileName + ' | ' + humanFileSize(logs[logFileName].size)
    }));
    logs[logFileName].selected = true;
    logs[logFileName].drawPlayerMovement = true;
    logs[logFileName].drawPlayerDeath = true;
    filterPlayerData(logFileName);
}

function removeSelectedLog(logFileName) {
    let option = $('#' + selectedLogsId + ' [value="' + logFileName + '"]');
    option.remove();
    console.log('Removing "' + logFileName + '" from selected logs');
    selectDownload.append($('<option>', {
        value: logFileName,
        text: logFileName + ' | ' + humanFileSize(logs[logFileName].size)
    }));
    logs[logFileName].selected = false;
    logs[logFileName].drawPlayerMovement = false;
    logs[logFileName].drawPlayerDeath = false;
}

function humanFileSize(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function addLogEntries(json) {
    if (!json || !json.logs) {
        return;
    }
    json.logs.forEach(elem => {
        addLogEntry(elem);
    });
}

function addLogEntry(entry) {
    selectAvailable.append($('<option>', {
        value: entry.name,
        text: entry.name + ' | ' + humanFileSize(entry.size)
    }));
    logs[entry.name] = {
        size: entry.size,
        loaded: 0,
        data: ''
    };
}

function clearDetails() {
    detailTabButtons.empty();
    detailTabs.empty();
}

function showDetails(logFileName, active = false) {
    // Create new Tab for log file with nav entry an bootstrap tab
    let newTabEntry = createTabNavEntry(logFileName, "detailTab_button_" + logFileName, "#" + logFileName, logFileName, active);
    detailTabButtons.append(newTabEntry);

    let tabPane = createTabPanel(logFileName, logFileName, active);

    // create form container for data
    let form = $('<form>', {});

    // input for debug console text to copy
    let divConsole = $('<div>', {
        class: "input-group mt-2 mb-2"
    });

    let inputAddon = $('<span>', {
        class: "input-group-text",
        id: "c-addon-" + logFileName
    });
    inputAddon.append(document.createTextNode("Console:"));
    let consoleInput = $('<input>', {
        type: "text",
        class: "form-control",
        placeholder: "logs['" + logFileName + "']",
        'aria-label': "console help",
        id: "c-addon-" + logFileName,
        'aria-describedby': "c-addon-" + logFileName,
        value: "logs['" + logFileName + "']"
    });
    let copyButtonConsole = $('<button>', {
        type: "button",
        class: "btn btn-primary",
        id: "copy_console_" + logFileName,
    })
    copyButtonConsole.append(document.createTextNode("Copy"));

    copyButtonConsole.click(function () {
        consoleInput.select();
        document.execCommand('copy');
    });
    divConsole.append(inputAddon);
    divConsole.append(consoleInput);
    divConsole.append(copyButtonConsole);

    // container for log file raw textarea with copy button
    let divLogRaw = $('<div>', {
        class: "input-group mb-2"
    });
    let showRawButton = $('<button>', {
        type: "button",
        class: "btn btn-primary",
        id: "show_raw_button_" + logFileName,
    })
    let divShowRaw = $('<div>', {
        class: "text-center mt-3 mb-3"
    });
    showRawButton.append(document.createTextNode("Show Log File [" + humanFileSize(logs[logFileName].loaded) + "]"));
    divShowRaw.append(showRawButton)

    showRawButton.click(function () {
        divShowRaw.remove();
        let textAreaRaw = displayRaw(divLogRaw, logFileName);
        let divCopyRaw = $('<div>', {
            class: "input-group"
        });
        let copyButtonData = $('<button>', {
            type: "button",
            class: "btn btn-primary",
            id: "copy_clipBoard_" + logFileName,
        })
        copyButtonData.append(document.createTextNode("Copy to Clipboard"));
        divCopyRaw.append(copyButtonData);
        copyButtonData.click(function () {
            textAreaRaw.select();
            document.execCommand('copy');
        });
        rawTabPane.append(divCopyRaw);
    });

    // create tab pane for data
    let dataContainer = $('<div>', {
        class: "container"
    });
    let ulData = $('<ul>', {
        class: "nav nav-tabs",
        id: "ul-" + logFileName,
        role: "tablist"
    });
    let tabPaneData = $('<div>', {
        class: "tab-content",
        id: "tabs-" + logFileName,
    });
    dataContainer.append(ulData);
    dataContainer.append(tabPaneData);

    let rawTabEntry = createTabNavEntry("Raw", "raw_nav_" + logFileName, "#raw_" + logFileName, "raw_" + logFileName, false);
    let rawTabPane = createTabPanel("raw_" + logFileName, "raw_" + logFileName, false);

    rawTabPane.append(divShowRaw);
    rawTabPane.append(divLogRaw);

    let analyseTabEntry = createTabNavEntry("Analyse", "a_nav_" + logFileName, "#a_" + logFileName, "a_" + logFileName, true);
    let analyseTabEntryTabPane = createTabPanel("a_" + logFileName, "a_" + logFileName, true);

    initAnalyseTab(analyseTabEntryTabPane, logFileName);

    ulData.append(rawTabEntry);
    ulData.append(analyseTabEntry);

    tabPaneData.append(rawTabPane);
    tabPaneData.append(analyseTabEntryTabPane);

    // build log entry
    form.append(divConsole);
    form.append(dataContainer);

    tabPane.append(form);

    // append log tab to tab container
    detailTabs.append(tabPane);
}

function displayRaw(tab, logFileName) {
    let textarea = $('<textarea>', {
        class: "form-control",
        'aria-label': "log_data_raw_" + logFileName,
        id: "log_data_raw_" + logFileName,
        rows: "22"
    });
    tab.append(textarea);

    // populate textarea with log file raw data
    textarea.val(JSON.stringify(logs[logFileName].data, undefined, 2));
    return textarea;
}

function createTabNavEntry(text, id, target, ariaControls, active = false) {
    let newTabEntry = $('<li>', {
        class: "nav-item",
        role: "presentation"
    });
    let tabButton = createTabButton(text, id, target, ariaControls, active);
    newTabEntry.append(tabButton);
    return newTabEntry
}

function createTabButton(text, id, target, ariaControls, active = false) {
    let buttonClass = "nav-link";
    let buttonAriaSelected = "false";
    if (active) {
        buttonClass = "nav-link active";
        buttonAriaSelected = "true";
    }
    let button = $('<button>', {
        class: buttonClass,
        id: id,
        'data-bs-toggle': "tab",
        'data-bs-target': target,
        type: "button",
        role: "tab",
        'aria-controls': ariaControls,
        'aria-selected': buttonAriaSelected
    })
    button.append(document.createTextNode(text));
    return button;
}

function createTabPanel(id, labelledby, active = false) {
    let tabClass = "tab-pane fade";
    if (active) {
        tabClass = "tab-pane fade show active";
    }
    return $('<div>', {
        class: tabClass,
        id: id,
        role: "tabpanel",
        'aria-labelledby': labelledby,
        tabindex: "0"
    });
}

function initAnalyseTab(tab, logFileName) {
    let summaryButton = $('<button>', {
        type: "button",
        class: "btn btn-primary",
        id: "summary_button_" + logFileName,
    })
    summaryButton.append(document.createTextNode("Create Summary [" + humanFileSize(logs[logFileName].loaded) + "]"));
    let div = $('<div>', {
        class: "text-center mt-3 mb-3"
    });
    div.append(summaryButton)
    tab.append(div);

    summaryButton.click(function () {
        div.remove();
        createSummary(logFileName);
        displaySummary(tab, logFileName);
    });
}

function displaySummary(tab, logFileName) {
    let header = $('<h3>', {});
    header.append(document.createTextNode("Summary [" + humanFileSize(logs[logFileName].loaded) + "]"));

    let textarea = $('<textarea>', {
        class: "form-control",
        'aria-label': "summary_" + logFileName,
        id: "summary_" + logFileName,
        rows: "24"
    });
    textarea.val(
        "LevelsPlayed: " +
        JSON.stringify(logs[logFileName].levelsPlayed, undefined, 2)
        + "\nEvents: " +
        JSON.stringify(logs[logFileName].summary, undefined, 2)
    );

    tab.append(header);
    tab.append(textarea);
}

function createSummary(logFileName) {
    if (logs[logFileName].summary !== undefined) {
        // already created summary
        return;
    }
    console.log("Creating summary for " + logFileName);
    if (logFileName == undefined) {
        alert("no log file given");
        return false;
    }
    let logId = getLogId(logFileName);
    if (logs[logFileName] === undefined) {
        alert("could not find log entry for " + logFileName);
        return false;
    }
    if (logs[logFileName].loaded == 0) {
        alert("Log file " + logFileName + " has not be downloaded");
        return false;
    }
    let events = logs[logFileName].data[logId].events;
    let eventCounter = 0;
    logs[logFileName].summary = {};
    logs[logFileName].levelsPlayed = [];
    for (const [key, value] of Object.entries(events)) {
        let event = value.event;
        if (logs[logFileName].summary[event] == undefined) {
            logs[logFileName].summary[event] = 1;
        } else {
            logs[logFileName].summary[event]++;
        }
        if (event == "START") {
            if (!logs[logFileName].levelsPlayed.includes(value.level)) {
                logs[logFileName].levelsPlayed.push(value.level);
            }
        }
        eventCounter++;
    }
    console.log("Events found: " + eventCounter);
    return true;
}

function getLogId(logFileName) {
    if (logFileName == undefined) {
        console.log("no log file given");
        return
    }
    return logFileName.replace(".log", "");
}

function populateGeneratUi() {
    let worldId = 1;
    $("#generate-ui").empty();
    generateLevelButtons = [];
    while (worldData[worldId] !== undefined) {
        let div = $('<div>', {
            class: "text-start mt-3 mb-3"
        });
        let hr = $('<hr>', {});
        let header = $('<h3>', {});
        header.append(document.createTextNode("World " + worldId));
        div.append(hr);
        div.append(header);
        for (const [key, value] of Object.entries(worldData[worldId].levels)) {
            let button = createWorldButton(key, value);
            div.append(button);
            $("#generate-ui").append(div);
        }
        worldId++;
    }
}

function sanitizeLevelId(levelId) {
    return levelId.replaceAll("?", "Q").replaceAll("#", "c");
}

function createWorldButton(levelId, levelData) {
    let button = $('<button>', {
        type: "button",
        class: "btn btn-primary m-2",
        id: "generate_" + sanitizeLevelId(levelId),
    });
    button.append(document.createTextNode(levelId));

    generateLevelButtons.push(button);

    button.click(function () {
        createLevel(levelId, levelData);
    });
    return button;
}

var sizeMultiplier = 32;

function createGridUi(levelId, levelData) {
    let form = $('<form>', {
        class: "d-flex m-2"
    });

    let update = $('<button>', {
        type: "button",
        class: "btn btn-warning",
        id: "updateLevel" + levelId,
    });
    update.append(document.createTextNode("Update"));

    update.click(function () {
        drawLevel(levelId, levelData);
    });
    form.append(update);

    let gridSwitch = createSwitchButton("grid_" + levelId, "Grid", levelData.drawGrid);
    let chooserGrid = createColorChooser("grid_color_" + levelId, "Grid Color", levelData.GridColor);
    form.append(gridSwitch);
    form.append(chooserGrid);

    let gridNumber = createSwitchButton("gridNumber_" + levelId, "Grid Number", levelData.DrawGridNumber);
    let chooserGridNumber = createColorChooser("grid_color_number_" + levelId, "Grid Number Color", levelData.GridNumberColor);
    form.append(gridNumber);
    form.append(chooserGridNumber);

    let drawPlayerMovement = createSwitchButton("drawPlayerMovement" + levelId, "Draw Player Movement", logs.drawPlayerMovement);
    form.append(drawPlayerMovement);

    let drawPlayerDeath = createSwitchButton("drawPlayerDeath" + levelId, "Draw Player Death", logs.drawPlayerDeath);
    form.append(drawPlayerDeath);

    canvasContainer.append(form);

    $("#grid_" + levelId).click(function () {
        levelData.drawGrid = !levelData.drawGrid;
        drawLevel(levelId, levelData);
    })
    $("#grid_color_" + levelId).on('input', function () {
        levelData.GridColor = this.value;
    });
    $("#gridNumber_" + levelId).click(function () {
        levelData.DrawGridNumber = !levelData.DrawGridNumber;
        drawLevel(levelId, levelData);
    })
    $("#grid_color_number_" + levelId).on('input', function () {
        levelData.GridNumberColor = this.value;
    });
    $("#drawPlayerMovement" + levelId).click(function () {
        logs.drawPlayerMovement = !logs.drawPlayerMovement;
        drawLevel(levelId, levelData);
    })
    $("#drawPlayerDeath" + levelId).click(function () {
        logs.drawPlayerDeath = !logs.drawPlayerDeath;
        drawLevel(levelId, levelData);
    })
}

function filterPlayerData(logFileName) {
    createSummary(logFileName);
    console.log("Filtering player event from file " + logFileName);
    let logId = getLogId(logFileName);
    let events = logs[logFileName].data[logId].events;
    let currentPosEvents = [];
    let curLevelId;
    let lastPosEvent;
    if (logs[logFileName].movement == undefined) {
        logs[logFileName].movement = {};
    }
    for (const [key, value] of Object.entries(events)) {
        switch (value.event) {
            case "START":
                currentPosEvents = [];
                curLevelId = value.level;
                break;
            case "DEATH":
                if (logs[logFileName].movement[curLevelId] == undefined) {
                    logs[logFileName].movement[curLevelId] = [];
                }
                if (logs[logFileName].death == undefined) {
                    logs[logFileName].death = {};
                }
                if (logs[logFileName].death[curLevelId] == undefined) {
                    logs[logFileName].death[curLevelId] = [];
                }
                logs[logFileName].movement[curLevelId].push(currentPosEvents);
                if (lastPosEvent.y > 240) {
                    lastPosEvent.y = 240; // ensure death spot is visible in level
                }
                logs[logFileName].death[curLevelId].push(lastPosEvent);
                break;
            case "WIN_WORLD":
                if (logs[logFileName].movement[curLevelId] == undefined) {
                    logs[logFileName].movement[curLevelId] = [];
                }
                logs[logFileName].movement[curLevelId].push(currentPosEvents);
                break;
            case "POS":
                let pos = {
                    time: value.time,
                    x: value.posX,
                    y: value.posY,
                    facing: value.facing
                };
                lastPosEvent = pos;
                currentPosEvents.push(pos);
                break;
        }
    }
}

function createSwitchButton(id, text, checked = false, clazz = "") {
    let divSwitch = $('<div>', {
        class: "form-check form-switch" + clazz
    });
    let checkbox = $('<input>', {
        class: "btn-check",
        id: id,
        type: "checkbox"
    });
    checkbox.prop('checked', checked)
    let label = $('<label>', {
        class: "btn btn-outline-primary",
        for: id
    });
    label.append(document.createTextNode(text));

    divSwitch.append(checkbox);
    divSwitch.append(label);

    return divSwitch;
}

function createColorChooser(id, title, color = "#000000",) {
    return colorChooser = $('<input>', {
        class: "form-control form-control-color ms-2",
        id: id,
        type: "color",
        value: color,
        title: title
    });
}

function createLevel(levelId, levelData) {
    console.log("Called create level " + levelId);
    canvasContainer.empty();

    levelData.drawGrid = false;
    levelData.DrawGridNumber = false;
    levelData.GridColor = '#000000';
    levelData.GridNumberColor = '#000000';
    levelData.canvasWidth = (levelData.ExitX + 5) * sizeMultiplier;
    levelData.canvasHeight = 15 * sizeMultiplier;

    let header = $('<h3>', {});
    header.append(document.createTextNode("Level " + levelId));
    canvasContainer.append(header);

    let canvas = $('<canvas/>', {
        'class': "level mr-5",
        'id': "canvas_" + levelId,
        'style': "border:1px solid #FFFFFF"
    });
    canvasContainer.append(canvas);
    createGridUi(levelId, levelData);
    updateLevelOptions();
    drawLevel(levelId, levelData);
}

function drawLevel(levelId, levelData) {
    const canvas = document.getElementById("canvas_" + levelId);
    canvas.setAttribute("width", levelData.canvasWidth);
    canvas.setAttribute("height", levelData.canvasHeight);
    const context = canvas.getContext("2d");

    // clear canvas with white background
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    dataWidth = ((levelData.canvasWidth / sizeMultiplier) | 0) + 1;
    dataHeight = ((levelData.canvasHeight / sizeMultiplier) | 0);
    var x, y, posX, posY, frame;
    for (x = 0; x < dataWidth; x++) {
        for (y = 0; y < dataHeight; y++) {
            /*let posX = x * sizeMultiplier;
            let posY = y * sizeMultiplier;*/
            // optimize for sizeMultiplier = 32
            posX = x << 5;
            posY = y << 5;

            if (levelData.drawGrid) {
                let strokeStyle = context.strokeStyle;
                let lineWidth = context.lineWidth;
                context.strokeStyle = levelData.GridColor;
                context.lineWidth = 0.2;
                context.strokeRect(posX, posY, sizeMultiplier, sizeMultiplier);
                context.strokeStyle = strokeStyle;
                context.lineWidth = lineWidth;
            }

            if (levelData.DrawGridNumber && y == 1) {
                let fillStyle = context.fillStyle;
                let font = context.font;
                context.fillStyle = levelData.GridNumberColor;
                context.font = '14px Verdana';
                let offset = -4;
                if (x > 100 && x % 2 != 0) {
                    offset = 14;
                }
                context.fillText(x, posX + 2, posY + offset);
                context.fillStyle = fillStyle;
                context.font = font;
            }

            // draw level
            b = getBlock(levelData, x, y) & 0xff;
            if (b != 0) {
                if (b == 34) { b = 32; } // better static coin
                frame = levelSheet[b % 16][(b / 16) | 0];
                context.drawImage(images["map"], frame.X, frame.Y, frame.Width, frame.Height, posX, posY, 32, 32);
            }
        }
    }

    drawData(levelId);
}

function drawData(levelId) {
    for (const [logFileName, data] of Object.entries(logs)) {
        if (!data.selected) {
            continue;
        }

        // filter survey
        let skip = false;
        for (let i = 0; i < s_answers_buttons.length; i++) {
            if (s_answers_buttons[i].length == 0) {
                continue;
            }
            let found = false;
            let answer = getSurveyDataByID(logFileName, i);
            for (let j = 0; j < s_answers_buttons[i].length; j++) {
                if ($("#" + s_answers_buttons[i][j]).is(":checked")) {
                    if (answer == s_answers[i][j]) {
                        found = true;
                    }
                }
            }
            if (!found) {
                skip = true;
            }
        }
        if (skip) {
            continue;
        }

        // draw if global flags allow
        if (logs.drawPlayerMovement && data.drawPlayerMovement) {
            drawPlayerPositionData(logFileName, levelId);
        }
        if (logs.drawPlayerDeath && data.drawPlayerDeath) {
            drawPlayerDeathData(logFileName, levelId);
        }
    }
}

function drawPlayerPositionData(logFileName, levelId) {
    if (logs[logFileName].movement[levelId] == undefined) {
        console.log("log " + logFileName + " does not have any positon data for level " + levelId);
        return;
    }

    let playerRuns = logs[logFileName].movement[levelId];

    for (i = 0; i < playerRuns.length; i++) {
        drawPlayerFromPoints(levelId, playerRuns[i], logFileName);
    }
}

const pointScale = 2;

// based on https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
function drawPlayerFromPoints(levelId, posData, logFileName) {
    if (posData == undefined || posData.length == 0) {
        return;
    }
    const canvas = document.getElementById("canvas_" + levelId);
    const context = canvas.getContext("2d");

    let strokeStyle = context.strokeStyle;

    context.beginPath();
    context.strokeStyle = getPlayerMovementColor(logFileName);
    context.moveTo(posData[0].x, posData[0].y);

    let i;
    for (i = 0; i < posData.length - 2; i++) {
        let x = posData[i].x;
        let y = posData[i].y;
        var xc = (posData[i].x + posData[i + 1].x) / 2;
        var yc = (posData[i].y + posData[i + 1].y) / 2;
        context.quadraticCurveTo(x * pointScale, y * pointScale, xc * pointScale, yc * pointScale);
    }
    context.quadraticCurveTo(posData[i].x * pointScale, posData[i].y * pointScale, posData[i + 1].x * pointScale, posData[i + 1].y * pointScale);

    context.stroke();

    context.strokeStyle = strokeStyle;
}

function getPlayerMovementColor(logFileName) {
    let defaultColor = "#00000";
    for (let i = 0; i < s_answers.length; i++) {
        let useColor = $("#color_answer_" + i);
        if (useColor.length == 0) {
            continue;
        }
        if (useColor.is(":checked")) {
            let answer = getSurveyDataByID(logFileName, i);
            let j = s_answers[i].indexOf(answer);
            if (j == -1) {
                return defaultColor;
            }
            return s_answers_colors[i][j];
        }
    }
    return defaultColor;
}

function drawPlayerDeathData(logFileName, levelId) {
    if (logs[logFileName].death[levelId] == undefined) {
        console.log("log " + logFileName + " does not have any death data for level " + levelId);
        return;
    }
    const canvas = document.getElementById("canvas_" + levelId);
    const context = canvas.getContext("2d");

    let playerDeaths = logs[logFileName].death[levelId];

    let fillStyle = context.fillStyle;
    context.fillStyle = "red";

    for (i = 0; i < playerDeaths.length; i++) {
        let x = playerDeaths[i].x * pointScale;
        let y = playerDeaths[i].y * pointScale;
        context.beginPath();
        context.arc(x, y, 20, 0, 2 * Math.PI);
        context.fill();
    }

    context.fillStyle = fillStyle;
}

function drawExit(levelData) {
    // TODO
}

function getBlock(levelData, x, y) {
    let width = levelData.Width;
    let height = levelData.Height;
    if (x < 0) { x = 0; }
    if (y < 0) { return 0; }
    if (x >= width) { x = width - 1; }
    if (y >= height) { y = height - 1; }
    if (levelData.Map[x]) {
        return levelData.Map[x][y];
    } else {
        return 0;
    }
}

function updateGenerateLevelButtons() {
    // reset buttons
    let i;
    for (i = 0; i < generateLevelButtons.length; i++) {
        if (generateLevelButtons[i].hasClass("btn-light")) {
            generateLevelButtons[i].removeClass("btn-light");
            generateLevelButtons[i].addClass("btn-primary");
        }
    }

    // filter buttons
    $("#" + selectedLogsId + " > option").each(function () {
        let logFileName = this.value;
        createSummary(logFileName);
        //ensure player positon data is filtered
        if (logs[logFileName].levelsPlayed !== undefined) {
            for (i = 0; i < logs[logFileName].levelsPlayed.length; i++) {
                let levelId = logs[logFileName].levelsPlayed[i];
                let bId = "generate_" + sanitizeLevelId(levelId);
                if ($("#" + bId).length) {
                    if ($("#" + bId).hasClass("btn-primary")) {
                        $("#" + bId).removeClass("btn-primary");
                    }
                    if (!$("#" + bId).hasClass("btn-light")) {
                        $("#" + bId).addClass("btn-light");
                    }
                }
            }
        }
    });
}

function updateLevelOptions() {
    let container = $("#survey_filter");
    if (container.length != 0) {
        container.empty();
    } else {
        container = $('<div>', {
            class: "container container-custom mb-5",
            id: "survey_filter"
        });
    }

    let title = $('<h3>', {});
    title.append(document.createTextNode("Filter by Survey Data"));
    container.append(title);
    for (let i = 0; i < s_questions.length; i++) {
        if (s_answers[i].length == 0) {
            continue;
        }

        let text = document.createTextNode(s_questions[i].replace('\nPlease rate your experience:', '').replaceAll('"', ''));
        let header = $('<h5>', {});
        header.append(text);
        container.append(header);

        let form = $('<form>', {
            class: "d-flex mb-2"
        });

        let useColor = createSwitchButton("color_answer_" + i, "Use Color", false, " ps-0 pe-2");
        s_answers_colors_buttons.push("color_answer_" + i);
        useColor.click(function () {
            for (let j = 0; j < s_answers_colors_buttons.length; j++) {
                if (s_answers_colors_buttons[j] != "color_answer_" + i) {
                    $("#" + s_answers_colors_buttons[j]).prop("checked", false);
                }
            }
        })
        form.append(useColor);

        let toggleAll = $('<button>', {
            type: "button",
            class: "btn btn-success",
            id: "toggle_" + i,
        });
        toggleAll.append(document.createTextNode("Select All"));

        toggleAll.click(function () {
            var $this = $(this);
            let select;
            if ($this.hasClass('btn-success')) {
                $this.removeClass('btn-success');
                $this.addClass('btn-danger');
                $this.text('Deselect All');
                select = true;
            } else {
                $this.removeClass('btn-danger');
                $this.addClass('btn-success');
                $this.text('Select All');
                select = false;
            }
            for (let j = 0; j < s_answers_buttons[i].length; j++) {
                $("#" + s_answers_buttons[i][j]).prop("checked", select);
            }
        });

        form.append(toggleAll);
        for (let j = 0; j < s_answers[i].length; j++) {
            let button;
            let answer = s_answers[i][j];
            let id = "answer_" + i + "_" + j;
            button = createSwitchButton(id, answer, true);
            s_answers_buttons[i].push(id);
            s_answers_colors[i][j] = "#000000";

            let colorChooser = createColorChooser("color_" + id, "Color for '" + answer + "'", s_answers_colors[i][j]);
            form.append(button);
            form.append(colorChooser);

            colorChooser.on('input', function () {
                s_answers_colors[i][j] = this.value;
            });
        }
        container.append(form);
    }
    canvasContainer.append(container);
}