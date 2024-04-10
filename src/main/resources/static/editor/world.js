
const worldTemplate = `
                <div id="world-block-#wid">
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
                                    <button class="nav-link" id="level-tab-#wid" data-bs-toggle="tab" data-bs-target="#level-tab-pane-#wid" type="button" role="tab" aria-controls="level-tab-pane-#wid" aria-selected="false">Level</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="data-tab-#wid" data-bs-toggle="tab" data-bs-target="#data-tab-pane-#wid" type="button" role="tab" aria-controls="data-tab-pane-#wid" aria-selected="false">Data</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="castle-tab-#wid" data-bs-toggle="tab" data-bs-target="#castle-tab-pane-#wid" type="button" role="tab" aria-controls="castle-tab-pane-#wid" aria-selected="false">Castle</button>
                                    </li>
                                </ul>
                                <div class="tab-content" id="myTabContent">
                                    <div class="tab-pane fade show active" id="raw-tab-pane-#wid" role="tabpanel" aria-labelledby="raw-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="Raw" id="world_raw_#wid" rows="16"></textarea>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="level-tab-pane-#wid" role="tabpanel" aria-labelledby="level-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="Level" id="world_level_#wid" rows="16"></textarea>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="data-tab-pane-#wid" role="tabpanel" aria-labelledby="data-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="Data" id="world_data_#wid" rows="16"></textarea>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="castle-tab-pane-#wid" role="tabpanel" aria-labelledby="castle-tab-#wid" tabindex="0">
                                        <div class="input-group">
                                            <textarea class="form-control data-text" aria-label="Data" id="world_castle_#wid" rows="16"></textarea>
                                        </div>
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
                    <div class="level-block-#wid">
                    </div>
                    <button type="button" class="btn btn-primary" id="level-add-#wid" onclick="addLevel(#wid)">Add Level</button>
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
var form;

function addLevel(world_id) {
    levelId[worldId]++;
    var curWorld = $(".level-block-" + world_id);
    var newLevel = levelTemplate.replace("#lidValue", world_id + "-" + levelId[worldId]).replaceAll("#lid", levelId[world_id]);
    curWorld.append(newLevel);
}

function addWorld() {
    worldId++;
    levelId[worldId] = 0;
    var newWorld = worldTemplate.replaceAll("#wid", worldId);
    if (worldId > 1) {
        form.append("<hr>");
    }
    form.append(newWorld);
    generateWorld(worldId);
    addLevel(worldId);
}

function getCurrentWorldMapData(world_id) {
    // get the Mario.MapState obj of the world
    console.log("calling worldApp[" + world_id + "].stateContext.State");
    let mapState = worldApp[world_id].stateContext.State;
    return mapState.Data;
}

function generateWorld(world_id) {
    console.log("Generating World " + world_id);
    let oldApp = worldApp[world_id];
    if (oldApp) {
        oldApp.Exit();
        worldApp[world_id] = null;
    }
    let canvas_id = "canvas-" + world_id;
    let canvas = document.getElementById(canvas_id);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    let app = new Enjine.Application().Initialize(new Mario.LoadingState("world"), 320, 240, "world", canvas_id);
    worldApp[world_id] = app;
    let raw_text = document.getElementById("world_raw_" + worldId);
    let level_text = document.getElementById("world_level_" + worldId);
    let data_text = document.getElementById("world_data_" + worldId);
    let castle_text = document.getElementById("world_castle_" + worldId);

    const waitMapState = new Promise((resolve, reject) => {
        const loop = () => app.stateContext.State instanceof Mario.MapState ? resolve(app.stateContext.State) : setTimeout(loop)
        loop();
    });
    waitMapState.then((mapState) => {
        console.log(mapState);
        level_text.value = mapState.VisualizeLevel();
        data_text.value = mapState.VisualizeData();
        castle_text.value = mapState.VisualizeCastle();
    });
    //text.value = app.stateContext.State.Data;
}


$(document).ready(function () {
    form = $(".world-form")
    addWorld();
});