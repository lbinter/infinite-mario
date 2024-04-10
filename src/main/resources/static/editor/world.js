
const worldTemplate = `
                <div id="world-block-#wid">
                    <h1>World #wid</h1>
                    <div class="container-fluid">
                        <div class="row">
                        <div class="col">
                            <canvas id="canvas-#wid" width="640" height="480"/>
                        </div>
                        <div class="col">
                            <div class="row">
                                <ul class="nav nav-tabs" id="tab-data-#wid" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="raw-tab-#wid" data-bs-toggle="tab" data-bs-target="#raw-tab-pane-#wid" type="button" role="tab" aria-controls="raw-tab-pane-#wid" aria-selected="true">Raw</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="list-tab-#wid" data-bs-toggle="tab" data-bs-target="#list-tab-pane-#wid" type="button" role="tab" aria-controls="list-tab-pane-#wid" aria-selected="false">List</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="overview-tab-#wid" data-bs-toggle="tab" data-bs-target="#overview-tab-pane-#wid" type="button" role="tab" aria-controls="overview-tab-pane-#wid" aria-selected="false">Overview</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="level-tab-#wid" data-bs-toggle="tab" data-bs-target="#level-tab-pane-#wid" type="button" role="tab" aria-controls="level-tab-pane-#wid" aria-selected="false">Level</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="data-tab-#wid" data-bs-toggle="tab" data-bs-target="#data-tab-pane-#wid" type="button" role="tab" aria-controls="data-tab-pane-#wid" aria-selected="false">Data</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="castle-tab-#wid" data-bs-toggle="tab" data-bs-target="#castle-tab-pane-#wid" type="button" role="tab" aria-controls="castle-tab-pane-#wid" aria-selected="false">Castle</button>
                                    </li>
                                </ul>
                                <div class="tab-content" id="world_info_#wid">
                                    <div class="tab-pane fade show active" id="raw-tab-pane-#wid" role="tabpanel" aria-labelledby="raw-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="Raw" id="world_raw_#wid" rows="16"></textarea>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="list-tab-pane-#wid" role="tabpanel" aria-labelledby="list-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="List" id="world_list_#wid" rows="16"></textarea>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="overview-tab-pane-#wid" role="tabpanel" aria-labelledby="overview-tab-#wid" tabindex="0">
                                        <table id="world_overview_#wid" class="table table-bordered data-text"></table>
                                    </div>
                                    <div class="tab-pane fade" id="level-tab-pane-#wid" role="tabpanel" aria-labelledby="level-tab-#wid" tabindex="0">
                                        <table id="world_level_#wid" class="table table-bordered data-text"></table>
                                    </div>
                                    <div class="tab-pane fade" id="data-tab-pane-#wid" role="tabpanel" aria-labelledby="data-tab-#wid" tabindex="0">
                                        <table id="world_data_#wid" class="table table-bordered data-text"></table>
                                    </div>
                                    <div class="tab-pane fade" id="castle-tab-pane-#wid" role="tabpanel" aria-labelledby="castle-tab-#wid" tabindex="0">
                                        <table id="world_castle_#wid" class="table table-bordered data-text"></table>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="container-fluid">
                                <div class="d-flex pt-2 justify-content-end align-self-end">
                                    <button type="button" class="btn btn-primary" onclick="generateWorld(#wid)">Generate World</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="level-block-#wid">
                    </div>
                    <div class="d-flex pt-2 justify-content-end align-self-end">
                        <button type="button" class="btn btn-primary" id="level-add-#wid" onclick="addLevel(#wid)">Add Level</button>
                    </div>
                </div>`;
const levelTemplate = `
                <div class="mb-3">
                    <label for="level_id_#lid" class="form-label">Level ID</label>
                    <input type="text" class="form-control" id="level_id_#lid" placeholder="Level ID" value="#lidValue">
                </div>
                <div class="mb-3">
                    <div class="input-group">
                        <span class="input-group-text">Level Data</span>
                        <textarea class="form-control" aria-label="Level Data" id="level_data_#lid"></textarea>
                    </div>
                </div>`;

var worldId = 0;
var levelId = new Map();
var worldApp = new Map();
var worldLevelList = new Map();
var worldCastleList = new Map();
var form;

function addWorld() {
    worldId++;
    levelId[worldId] = 0;
    var newWorld = worldTemplate.replaceAll("#wid", worldId);
    if (worldId > 1) {
        form.append("<hr>");
    }
    form.append(newWorld);
    generateWorld(worldId);
}

function generateWorld(world_id) {
    let oldApp = worldApp[world_id];
    if (oldApp) {
        oldApp.Exit();
        worldApp[world_id] = null;
    }
    levelId[worldId] = 0;
    let canvas_id = "canvas-" + world_id;
    let canvas = document.getElementById(canvas_id);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    let app = new Enjine.Application().Initialize(new Mario.LoadingState("world"), 320, 240, "world", canvas_id);
    worldApp[world_id] = app;

    const waitMapState = new Promise((resolve, reject) => {
        const loop = () => app.stateContext.State instanceof Mario.MapState ? resolve(app.stateContext.State) : setTimeout(loop)
        loop();
    });
    waitMapState.then((mapState) => {
        fillData(mapState, world_id);
        addLevels(world_id);
    });
}

function addLevels(world_id) {
    $("#level-block-" + world_id).empty();
    for (i = 0; i < worldLevelList[world_id].length; i++) {
        addLevelWithId(world_id, world_id + "-" + worldLevelList[world_id][i].id, world_id + "_" + worldLevelList[world_id][i].id);
    }
    for (i = 0; i < worldCastleList[world_id].length; i++) {
        addLevelWithId(world_id, world_id + "-#" + worldCastleList[world_id][i].id, world_id + "_" + worldCastleList[world_id][i].id);
    }
    levelId[world_id] = worldLevelList[world_id].length - 1;
}
function addLevel(world_id) {
    levelId[worldId]++;
    addLevelWithId(world_id, world_id + "-" + levelId[worldId], worldId + "_" + levelId[worldId])
}
function addLevelWithId(world_id, level_string, level_id) {
    $("#level-block-" + world_id).append(
        levelTemplate.replace("#lidValue", level_string).replaceAll("#lid", level_id)
    );

}

function fillData(mapState, world_id) {
    let raw_text = document.getElementById("world_raw_" + world_id);
    let list_text = document.getElementById("world_list_" + world_id);

    let overview_table = document.getElementById("world_overview_" + world_id);
    let level_table = document.getElementById("world_level_" + world_id);
    let data_table = document.getElementById("world_data_" + world_id);
    let castle_table = document.getElementById("world_castle_" + world_id);

    raw_text.value = mapState.StringifyMapState();
    list_text.value = generateLevelList(mapState, world_id);
    fillOverviewTable(overview_table, mapState);
    fillLevelTable(level_table, mapState);
    fillDataTable(data_table, mapState);
    fillCastleTable(castle_table, mapState);
}

function generateLevelList(mapState, world_id) {
    let level = mapState.Level,
        data = mapState.Data,
        castle = mapState.CastleData,
        data_value, castle_value;

    worldLevelList[world_id] = [],
        worldCastleList[world_id] = [];

    let last_level;
    for (y = 0; y < 15; y++) {
        for (x = 0; x < 20; x++) {
            data_value = data[x][y];
            castle_value = castle[x][y];
            if (level[x][y] == 2 && data_value != -11) {
                if (data_value == -3) {
                    worldCastleList[world_id].push({
                        coords: x + ',' + y,
                        id: castle_value
                    });
                } else if (data_value == -1) {
                    // ignore mushrooms they are always random
                } else if (data_value == -2) {
                    // end level
                    last_level = {
                        coords: x + ',' + y,
                        id: 'X'
                    };
                } else {
                    worldLevelList[world_id].push({
                        coords: x + ',' + y,
                        id: data_value
                    });
                }
            }
        }
    }

    worldLevelList[world_id].sort(({ id: a }, { id: b }) => a - b);
    worldCastleList[world_id].sort(({ id: a }, { id: b }) => a - b);

    worldLevelList[world_id].push(last_level);

    let s = 'Levels:\n';
    let coords;
    for (i = 0; i < worldLevelList[world_id].length; i++) {
        coords = (worldLevelList[world_id][i].coords + ": ").padStart(7, ' ');
        s += coords + world_id + "-" + worldLevelList[world_id][i].id + "\n";
    }
    s += "\nCastle Levels:\n"
    for (i = 0; i < worldCastleList[world_id].length; i++) {
        coords = (worldCastleList[world_id][i].coords + ": ").padStart(7, ' ');
        s += coords + world_id + "-#" + worldCastleList[world_id][i].id + "\n";
    }
    return s;
}

function clearTable(table) {
    let rows = table.rows.length;
    for (i = rows; i < 0; i--) {
        table.deleteRow(i);
    }
}

function fillOverviewTable(table, mapState) {
    let row, cell,
        value_level, value_data, value_castle,
        isLevel,
        level = mapState.Level,
        data = mapState.Data,
        castle = mapState.CastleData;

    clearTable(table);

    for (y = 0; y < 15; y++) {
        row = table.insertRow(y);
        for (x = 0; x < 20; x++) {
            cell = row.insertCell(x);
            cell.innerHTML = "&nbsp";

            isLevel = mapState.IsLevel(x, y);
            value_level = level[x][y];
            value_data = data[x][y];
            value_castle = castle[x][y];

            switch (value_level) {
                case undefined:
                    break;
                case 0: // grass
                case 4: // decoration
                    //  cell.classList.add("table-success");
                    break;
                case 1: // water 
                    // cell.classList.add("table-info");
                    break;
                case 2: // level
                    if (value_data == -3) { // castle
                        cell.classList.add("table-dark");
                        cell.innerHTML = value_castle;
                    } else if (value_data == -2) { // end castle
                        cell.innerHTML = "E";
                        cell.classList.add("table-success");
                    } else if (value_data == -1) { // mushroom
                        cell.innerHTML = "M";
                        cell.classList.add("table-primary");
                    } else if (value_data == -11) { // start
                        cell.innerHTML = "S";
                        cell.classList.add("table-danger");
                    } else {
                        cell.innerHTML = value_data;
                        cell.classList.add("table-info");
                    }
                    break;
                case 3: // road
                    cell.classList.add("table-warning");
                    break;
            }
            cell.classList.add("CellWithComment");
            cell.innerHTML = cell.innerHTML + '<span class="CellComment">' + x + ',' + y + '\n' +
                '<table class="table">' +
                '<tr> <td class="text-end">Level: </td><td>' + value_level + '</td> </tr>' +
                '<tr> <td class="text-end">Data: </td><td>' + value_data + '</td> </tr>' +
                '<tr> <td class="text-end">Castle: </td><td>' + value_castle + '</td> </tr>' +
                '</table>' +
                '</span>';
        }
    }
}

function fillLevelTable(table, mapState) {
    let row, cell, value,
        level = mapState.Level;

    clearTable(table);

    for (y = 0; y < 15; y++) {
        row = table.insertRow(y);
        for (x = 0; x < 20; x++) {
            cell = row.insertCell(x);
            value = level[x][y];
            switch (value) {
                case undefined:
                    break;
                case 0: // grass
                case 4: // decoration
                    cell.innerHTML = value;
                    cell.classList.add("table-success");
                    break;
                case 1: // water 
                    cell.innerHTML = value;
                    cell.classList.add("table-info");
                    break;
                case 2: // level
                    cell.innerHTML = value;
                    cell.classList.add("table-danger");
                    break;
                case 3: // road
                    cell.innerHTML = value;
                    cell.classList.add("table-warning");
                    break;
            }
            cell.classList.add("CellWithComment");
            cell.innerHTML = cell.innerHTML + '<span class="CellComment">' + x + ',' + y + '</span>';
        }
    }
}

function fillDataTable(table, mapState) {
    let row, cell, type, isLevel;
    let data = mapState.Data;

    clearTable(table);

    for (y = 0; y < 15; y++) {
        row = table.insertRow(y);
        for (x = 0; x < 20; x++) {
            cell = row.insertCell(x);
            type = data[x][y];
            isLevel = mapState.IsLevel(x, y);
            switch (type) {
                case undefined:
                    cell.innerHTML = "&nbsp";
                    break;
                case -11: // start point
                    cell.innerHTML = type;
                    cell.classList.add("table-danger");
                    break;
                case -3: // castle
                    cell.innerHTML = type;
                    cell.classList.add("table-dark");
                    break;
                case -2: // end castle
                    cell.innerHTML = type;
                    cell.classList.add("table-success");
                    break;
                case -1: // mushroom level
                    cell.innerHTML = type;
                    cell.classList.add("table-primary");
                    break;
                case 1: // road
                    cell.innerHTML = type;
                    if (!isLevel) {
                        cell.classList.add("table-warning");
                    } else {
                        cell.classList.add("table-info");
                    }
                    break;
                default:
                    cell.innerHTML = type;
                    cell.classList.add("table-info");
                    break;
            }
            cell.classList.add("CellWithComment");
            cell.innerHTML = cell.innerHTML + '<span class="CellComment">' + x + ',' + y + '</span>';
        }
    }
}

function fillCastleTable(table, mapState) {
    let row, cell, value;
    let castle = mapState.CastleData;

    clearTable(table);

    for (y = 0; y < 15; y++) {
        row = table.insertRow(y);
        for (x = 0; x < 20; x++) {
            cell = row.insertCell(x);
            value = castle[x][y];
            if (value == 0) {
                cell.innerHTML = "&nbsp";
            } else {
                cell.innerHTML = value;
                cell.classList.add("table-dark");
            }
            cell.classList.add("CellWithComment");
            cell.innerHTML = cell.innerHTML + '<span class="CellComment">' + x + ',' + y + '</span>';
        }
    }
}

function generateIMarioJSON() {
    var elements = document.getElementById("form-world-data").elements;
    console.log("Form has: " + elements.length + " elements");
    for (i = 1; i <= worldId; i++) {
        //console.log(document.getElementById("world_raw_" + i).value);
    }
    let value = worldApp[1].stateContext.State.StringifyMapState();
    // TODO build file
    return value;
}

function downloadWorldDataFile() {
    let fileName = document.getElementById("file_name").value;
    if (!fileName) {
        file_name = "imario_world"
    }
    file = new Blob([
        generateIMarioJSON()
    ], { type: "application/json" }, 1);
    var a = document.createElement("a"),
        url = URL.createObjectURL(file);
    a.href = url;
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

$(document).ready(function () {
    form = $(".world-form")
    addWorld();

    $("#world-copy").click(function () {
        document.getElementById("world_data_raw").select();
        document.execCommand('copy');
    });

    $(window).on('show.bs.modal', function () {
        document.getElementById("world_data_raw").value = generateIMarioJSON();
    });
});