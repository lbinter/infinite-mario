/**
    State for tiles chooser
    Code by Lucas Binter, 2023
*/

Mario.EditorChooserState = function () {
    this.Level = null;
    this.Layer = null;
    this.tilesX = 16;
    this.tilesY = 8;
    this.tilesSize = 32;
    this.width = 640;
    this.height = 256;

    this.SelectedTile = 0;
    this.Delete = false;
    this.EnemyType = -1;
    this.EnemyWinged = false;
    this.EnemyAdd = false;

    this.Paused = false;

    this.Tick = 0;

    this.Delta = 0;
};


Mario.EditorChooserState.prototype = new Enjine.GameState();

Mario.EditorChooserState.prototype.Enter = function () {
    editorChooserApp.canvas.ResizeEditor("editorChooser", this.tilesX * this.tilesSize, this.tilesY * this.tilesSize);

    this.Level = new Mario.Level(this.tilesX, this.tilesY);

    // fill with block types
    let x = 0, y = 0;
    let offSet = 16;

    // base ground
    this.addBlockTypeLineH(this.Level, x, y, 128, 16);
    this.addBlockTypeLineH(this.Level, x, y + 1, 128 + offSet, 16);
    this.addBlockTypeLineH(this.Level, x, y + 2, 128 + offSet * 2, 16);

    this.addBlockTypeLineH(this.Level, x, y + 3, 128 + offSet * 3, 8);
    this.Level.SetBlock(x + 11, y + 3, 176 + 11);
    this.Level.SetBlock(x + 15, y + 3, 176 + 15);

    // bushes
    this.addBlockTypeLineH(this.Level, x + 8, y + 3, 80, 3);
    this.addBlockTypeLineH(this.Level, x + 12, y + 3, 96, 3);

    // signpost
    this.Level.SetBlock(x, y + 4, 67);
    this.Level.SetBlock(x + 1, y + 4, 68);
    this.Level.SetBlock(x, y + 5, 67 + offSet);
    this.Level.SetBlock(x + 1, y + 5, 68 + offSet);

    this.Level.SetBlock(x + 2, y + 4, 34); // coin
    this.Level.SetBlock(x + 2, y + 5, 21); // Block ?
    this.Level.SetBlock(x + 3, y + 4, 16); // Block destroyable
    this.Level.SetBlock(x + 3, y + 5, 4); // used Block


    this.Level.SetBlock(x + 4, y + 4, 9); // stone
    this.Level.SetBlock(x + 4, y + 5, 12); // wood
    this.Level.SetBlock(x + 5, y + 4, 28); // iron

    // tubes
    this.addBlockTypeLineV(this.Level, x + 13, y + 4, 10, 2);
    this.addBlockTypeLineV(this.Level, x + 14, y + 4, 11, 2);
    this.addBlockTypeLineV(this.Level, x + 15, y + 4, 24, 4);

    // canon
    this.Level.SetBlock(x + 6, y + 4, 14);
    this.Level.SetBlock(x + 6, y + 5, 14 + offSet);
    this.Level.SetBlock(x + 6, y + 6, 14 + offSet * 2);

    // bushes
    this.addBlockTypeLineV(this.Level, x + 7, y + 4, 70, 3);
    this.addBlockTypeLineV(this.Level, x + 8, y + 4, 71, 3);

    this.addBlockTypeLineH(this.Level, x + 3, y + 6, 118, 2);

    this.addBlockTypeLineV(this.Level, x + 9, y + 6, 104, 2);
    this.addBlockTypeLineV(this.Level, x + 10, y + 4, 73, 4);
    this.addBlockTypeLineV(this.Level, x + 11, y + 4, 74, 2);
    this.addBlockTypeLineV(this.Level, x + 12, y + 4, 75, 2);


    this.addBlockTypeLineH(this.Level, x, y + 6, 224, 3);
    this.addBlockTypeLineH(this.Level, x, y + 7, 224 + offSet, 3);

    this.addBlockTypeLineV(this.Level, x + 5, y + 5, 25, 3); // wood logs

    this.Layer = new Mario.EditorChooserRenderer(this.Level, editorChooserApp.canvas.BackBuffer.width, editorChooserApp.canvas.BackBuffer.height, false);

    this.Paused = false;

    editorChooserState = this;
};

Mario.EditorChooserState.prototype.addBlockTypeLineV = function (level, x, y, blockType, length, offSet = 16) {
    for (let Y = 0; Y < length; Y++) {
        level.SetBlock(x, y + Y, blockType + Y * offSet);
    }
};

Mario.EditorChooserState.prototype.addBlockTypeLineH = function (level, x, y, blockType, length) {
    for (let X = 0; X < length; X++) {
        level.SetBlock(x + X, y, blockType + X);
    }
};


Mario.EditorChooserState.prototype.Exit = function () {
    delete this.Level;
    delete this.Layer;
    delete this.BgLayer;
    delete this.Sprites;
};

Mario.EditorChooserState.prototype.Update = function (delta) {
    this.Layer.Update(delta);
    this.Level.Update();
};


Mario.EditorChooserState.prototype.Draw = function (context) {
    this.Layer.Draw(context);

};

Mario.EditorChooserState.prototype.CheckForChange = function (context) {
};

Mario.EditorChooserState.prototype.SetSelectedGrid = function (x, y) {
    this.Layer.selectedGridX = x;
    this.Layer.selectedGridY = y;

    this.SelectedTile = this.Level.GetBlock(x, y);
};

Mario.EditorChooserState.prototype.ClearSelectedGrid = function (x, y) {
    this.Layer.selectedGridX = null;
    this.Layer.selectedGridY = null;

    this.SelectedTile = 0;
};

Mario.EditorChooserState.prototype.DeleteModeToggle = function () {
    this.SetDelete(!this.Delete);
};

Mario.EditorChooserState.prototype.SetDelete = function (value) {
    this.Delete = value;
};

Mario.EditorChooserState.prototype.SetEnemyType = function (value) {
    this.EnemyType = value;
};

Mario.EditorChooserState.prototype.EnemyWingedModeToggle = function () {
    this.EnemyWinged = !this.EnemyWinged;
};

Mario.EditorChooserState.prototype.EnemyAddModeToggle = function () {
    this.EnemyAdd = !this.EnemyAdd;
};