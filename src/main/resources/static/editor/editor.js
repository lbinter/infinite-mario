$(document).ready(function () {
    editorApp = new Enjine.Application().Initialize(new Mario.LoadingState("editor"), 320, 240, "editor");
    editorChooserApp = new Enjine.Application().Initialize(new Mario.LoadingState("editorChooser"), 320, 120, "editorChooser", "editorChooser");

    $("#level-generate").click(function () {
        editorState.GenerateLevel();
        $("#level-exit-x").val(editorState.Level.ExitX);
        $("#level-exit-y").val(editorState.Level.ExitY);
        $("#level-paused").prop('checked', false);
    });
    $("#level-generate-empty").click(function () {
        editorState.GenerateEmptyLevel();
        $("#level-paused").prop('checked', false);
    });
    $("#level-copy").click(function () {
        document.getElementById("level_data_raw").select();
        document.execCommand('copy');
    });
    $("#level-save").click(function () {
        let fileName = document.getElementById("file_name").value;
        if (fileName) {
            editorState.Save(fileName);
        } else {
            editorState.Save();
        }
    });
    $(window).on('show.bs.modal', function () {
        document.getElementById("level_data_raw").value = editorState.GenerateJSON();
    });
    $("#level-load").on('change', function () {
        let file = $("#level-load").get(0).files[0];
        let reader = new FileReader();
        reader.onload = function (event) {
            // get json string from base64 
            var decoded = atob(event.target.result.split(',')[1]);
            var level = JSON.parse(decoded);
            editorState.Load(level);
            $("#level-load").val(null);
        };
        reader.readAsDataURL(file);
    });
    $("#level-paused").click(function () {
        editorState.TogglePaused();
    });
    $("#level-bg").click(function () {
        editorState.ToggleBackground();
    });
    $("#level-grid").click(function () {
        editorState.ToggleGrid();
    });
    $("#level-grid-color").on('input', function () {
        editorState.UpdateGridColor(this.value);
    });
    $("#level-grid-active-color").on('input', function () {
        editorState.UpdateGridActiveColor(this.value);
    });
    $("#level-grid-number").click(function () {
        editorState.ToggleGridNumber();
    });
    $("#level-grid-number-color").on('input', function () {
        editorState.UpdateGridNumberColor(this.value);
    });

    $("#level-exit-x").on('input', function () {
        editorState.setExitX(parseInt(this.value));
    });
    $("#level-exit-y").on('input', function () {
        editorState.setExitY(parseInt(this.value));
    });
    $("#level-grid-length-x").on('input', function () {
        editorState.UpdateGridSelectedLengthX(parseInt(this.value));
    });
    $("#level-grid-length-y").on('input', function () {
        editorState.UpdateGridSelectedLengthY(parseInt(this.value));
    });

    $("#level-delete").click(function () {
        editorChooserState.ClearSelectedGrid();
        editorChooserState.DeleteModeToggle();
    });
    $("#level-smart-paste").click(function () {
        editorState.ToggleSmartPaste();
    });
    $("#editor-clear").click(function () {
        editorState.ClearSelectedGrid();
        editorChooserState.ClearSelectedGrid();
    });


    $("#enemy-type").on('input', function () {
        editorChooserState.SetEnemyType(parseInt(this.value));
    });
    $("#enemy-winged").click(function () {
        editorChooserState.EnemyWingedModeToggle();
    });
    $("#enemy-add").click(function () {
        if ($("#enemy-type").val() == -1) {
            $("#enemy-add").prop('checked', false);
            return;
        }
        editorChooserState.EnemyAddModeToggle();
    });

    editorApp.canvas.Canvas.addEventListener('mousedown', function (e) {
        const rect = editorApp.canvas.Canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let gX = Math.round(editorState.Camera.X / 16);
        gX += x / 32 | 0;
        let gY = y / 32 | 0;
        editorState.SetSelectedGrid(gX, gY);
    });

    editorChooserApp.canvas.Canvas.addEventListener('mousedown', function (e) {
        $("#level-delete").prop("checked", false);
        editorChooserState.SetDelete(false);
        const rect = editorChooserApp.canvas.Canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let gX = x / 32 | 0;
        let gY = y / 32 | 0;
        editorChooserState.SetSelectedGrid(gX, gY);
    });
});