/**
    State for editing / creating generated level.
    Code by Lucas Binter, 2023
*/

Mario.EditorState = function (difficulty = 1, type = Mario.LevelType.Overground) {
    this.LevelDifficulty = difficulty;
    this.LevelType = type;
    this.Level = null;
    this.Layer = null;
    this.BgLayer = [];

    this.DrawBackground = true;
    this.SmartPaste = true;

    this.Paused = false;

    this.Sprites = null;
    this.SpritesToAdd = null;
    this.SpritesToRemove = null;
    this.Camera = null;

    this.Tick = 0;

    this.Delta = 0;
};

Mario.EditorState.prototype = new Enjine.GameState();

Mario.EditorState.prototype.Enter = function () {
    editorApp.canvas.ResizeEditor("editorCanvas");

    this.GenerateEmptyLevel();

    editorState = this;
};

Mario.EditorState.prototype.Exit = function () {
    delete this.Level;
    delete this.Layer;
    delete this.BgLayer;
    delete this.Sprites;
    delete this.Camera;
    delete this.ShellsToCheck;
    delete this.FireballsToCheck;
    delete this.FontShadow;
    delete this.Font;
};

Mario.EditorState.prototype.Update = function (delta) {
    var i = 0, j = 0, xd = 0, yd = 0, sprite = null, hasShotCannon = false, xCannon = 0, x = 0, y = 0,
        dir = 0, st = null, b = 0;
    this.Delta = delta;

    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }

    for (i = 0; i < this.Sprites.Objects.length; i++) {
        sprite = this.Sprites.Objects[i];
        if (sprite !== Mario.MarioCharacter) {
            xd = sprite.X - this.Camera.X;
            yd = sprite.Y - this.Camera.Y;
            if (xd < -64 || xd > 320 + 64 || yd < -64 || yd > 240 + 64) {
                this.Sprites.RemoveAt(i);
            }
        }
    }

    if (this.Paused) {
        for (i = 0; i < this.Sprites.Objects.length; i++) {
            if (this.Sprites.Objects[i] === Mario.MarioCharacter) {
                this.Sprites.Objects[i].Update(delta);
            } else {
                this.Sprites.Objects[i].UpdateNoMove(delta);
            }
        }
    } else {
        this.Layer.Update(delta);
        this.Level.Update();

        hasShotCannon = false;
        xCannon = 0;
        this.Tick++;


        let visibleX = ((this.Camera.X / 16) | 0) - 1;
        let visibleXEnd = (((this.Camera.X + this.Layer.Width) / 16) | 0) + 1;

        for (x = visibleX; x <= visibleXEnd; x++) {
            for (y = ((this.Camera.Y / 16) | 0) - 1; y <= (((this.Camera.Y + this.Layer.Height) / 16) | 0) + 1; y++) {
                dir = 1;

                st = this.Level.GetSpriteTemplate(x, y);

                if (st !== null) {
                    if (st.LastVisibleTick !== this.Tick - 1) {
                        if (st.Sprite === null || !this.Sprites.Contains(st.Sprite)) {
                            st.Spawn(this, x, y, dir);
                        }
                    }

                    st.LastVisibleTick = this.Tick;
                }

                if (dir !== 0) {
                    b = this.Level.GetBlock(x, y);
                    if (((Mario.Tile.Behaviors[b & 0xff]) & Mario.Tile.Animated) > 0) {
                        if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                            if ((this.Tick - x * 2) % 100 === 0) {
                                xCannon = x;
                                for (i = 0; i < 8; i++) {
                                    this.AddSprite(new Mario.Sparkle(this, x * 16 + 8, y * 16 + ((Math.random() * 16) | 0), Math.random() * dir, 0, 0, 1, 5));
                                }
                                this.AddSprite(new Mario.BulletBill(this, x * 16 + 8 + dir * 8, y * 16 + 15, dir));
                                hasShotCannon = true;
                            }
                        }
                    }
                }
            }
        }
        if (hasShotCannon) {
            Enjine.Resources.PlaySound("cannon");
        }

        for (i = 0; i < this.Sprites.Objects.length; i++) {
            this.Sprites.Objects[i].Update(delta);
        }
    }

    this.Sprites.AddRange(this.SpritesToAdd);
    this.Sprites.RemoveList(this.SpritesToRemove);
    this.SpritesToAdd.length = 0;
    this.SpritesToRemove.length = 0;

    // TODO update camera
    var sideWaysSpeed = Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.A) ? 32 * 3 : 32;
    let Xa = 0;
    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Left)) {
        Xa -= sideWaysSpeed;
    }
    if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.Right)) {
        Xa += sideWaysSpeed;
    }
    this.Camera.X += Xa;
};

var middle, left, rightRecWidth;

Mario.EditorState.prototype.Draw = function (context) {
    let i = 0, time = 0, t = 0;

    if (this.Camera.X < 0) {
        this.Camera.X = 0;
    }
    if (this.Camera.Y < 0) {
        this.Camera.Y = 0;
    }
    if (this.Camera.X > this.Level.Width * 16 - 320) {
        this.Camera.X = this.Level.Width * 16 - 320;
    }
    if (this.Camera.Y > this.Level.Height * 16 - 240) {
        this.Camera.Y = this.Level.Height * 16 - 240;
    }

    if (this.DrawBackground) {
        for (i = 0; i < 2; i++) {
            this.BgLayer[i].Draw(context, this.Camera);
        }
    }

    // draw middle window of level
    middle = context.canvas.width / 2;
    left = middle - 160;
    rightRecWidth = middle + 160;
    if (this.Camera.X == 0 || this.Camera.X < middle - 160) {
        left = this.Camera.X;
        rightRecWidth = context.canvas.width - 160;
    }
    context.strokeRect(left, 0, 320, 240);

    context.save();
    //context.translate(left, 0);

    context.save();
    context.translate(-this.Camera.X, -this.Camera.Y);
    for (i = 0; i < this.Sprites.Objects.length; i++) {
        if (this.Sprites.Objects[i].Layer === 0) {
            this.Sprites.Objects[i].Draw(context, this.Camera);
        }
    }
    context.restore();

    this.Layer.Draw(context, this.Camera);

    if (this.Level.ExitX != -1) {
        this.Layer.DrawExit0(context, this.Camera, 0 === 0);

        context.save();
        context.translate(-this.Camera.X, -this.Camera.Y);
        for (i = 0; i < this.Sprites.Objects.length; i++) {
            if (this.Sprites.Objects[i].Layer === 1) {
                this.Sprites.Objects[i].Draw(context, this.Camera);
            }
        }
        context.restore();

        this.Layer.DrawExit1(context, this.Camera);

        context.restore();
    }


    let alpha = context.globalAlpha;
    context.globalAlpha = 0.3;
    context.fillRect(0, 0, left, 240);
    context.fillRect(left + 320, 0, rightRecWidth, 240);
    context.globalAlpha = alpha;
};

Mario.EditorState.prototype.AddSprite = function (sprite) {
    this.Sprites.Add(sprite);
};

Mario.EditorState.prototype.RemoveSprite = function (sprite) {
    this.Sprites.Remove(sprite);
};

Mario.EditorState.prototype.CheckForChange = function (context) {
    //console.log("called CheckForChange");
};

Mario.EditorState.prototype.GenerateLevel = function () {
    this.Exit();

    var levelGenerator = new Mario.LevelGenerator(320, 15), i = 0, scrollSpeed = 0, w = 0, h = 0, bgLevelGenerator = null;
    let difficulty = parseInt($("#level-difficulty").val());
    if (difficulty != -1) {
        this.LevelDifficulty = difficulty;
    }
    let type = parseInt($("#level-type").val());
    if (type != -1) {
        this.LevelType = type;
    }

    console.log("Generating Level width type [" + this.LevelType + "] and difficulty [" + this.LevelDifficulty + "]");

    this.Level = levelGenerator.CreateLevel(this.LevelType, this.LevelDifficulty);
    this.Level.Save();
    this.Layer = new Mario.EditorRenderer(this.Level, editorApp.canvas.BackBuffer.width, editorApp.canvas.BackBuffer.height, true, true);

    this.GenerateBGLayer();
    this.SetDefaults();
};


Mario.EditorState.prototype.GenerateEmptyLevel = function () {
    this.Exit();
    this.Level = new Mario.Level(320, 15);
    this.Level.Save();
    this.Layer = new Mario.EditorRenderer(this.Level, editorApp.canvas.BackBuffer.width, editorApp.canvas.BackBuffer.height, true, true);

    let type = parseInt($("#level-type").val());
    if (type != -1) {
        this.LevelType = type;
    }

    this.FillEmptyLevel();

    this.GenerateBGLayer();
    this.SetDefaults();
}
Mario.EditorState.prototype.FillEmptyLevel = function () {
    if (this.LevelType == 0) return;
    let tileLeft = 0, tileLeft1 = 0, tileBottomTop = 0, tileBottom = 0, tileTopLeft = 0, tileTopLeft1 = 0, tileTopBottom = 0, tileTop = 0;
    switch (this.LevelType) {
        case 1:
            tileLeft = 158;
            tileLeft1 = 159;
            tileBottomTop = 141;
            tileBottom = tileBottomTop + 16;

            tileTopLeft = 156;
            tileTopLeft1 = 172;
            tileTopBottom = 173;
            tileTop = 157;
            break;
        case 2:
            tileLeft = 154;
            tileLeft1 = 155;
            tileBottomTop = 137;
            tileBottom = 153;

            tileTopLeft = 168;
            tileTopLeft1 = 168;
            tileTopBottom = 169;
            tileTop = 169;
            break;
    }

    for (let y = 0; y < 13; y++) {
        this.Level.SetBlock(0, y, tileLeft);
    }
    this.Level.SetBlock(0, 13, tileLeft1);
    this.Level.SetBlock(0, 14, tileBottom);


    this.Level.SetBlock(5, 0, tileTopLeft);
    for (let x = 6; x < 15; x++) {
        this.Level.SetBlock(x, 0, tileTop);
    }
    this.Level.SetBlock(5, 1, tileTopLeft1);
    for (let x = 6; x < 15; x++) {
        this.Level.SetBlock(x, 1, tileTopBottom);
    }


    for (let x = 1; x < 15; x++) {
        this.Level.SetBlock(x, 13, tileBottomTop);
    }
    for (let x = 1; x < 15; x++) {
        this.Level.SetBlock(x, 14, tileBottom);
    }

}

Mario.EditorState.prototype.GenerateBGLayer = function () {

    this.BgLayer = [];
    for (i = 0; i < 2; i++) {
        scrollSpeed = 4 >> i;
        w = ((((this.Level.Width * 16) - 320) / scrollSpeed) | 0) + 320;
        h = ((((this.Level.Height * 16) - 240) / scrollSpeed) | 0) + 240;
        bgLevelGenerator = new Mario.BackgroundGenerator(w / 32 + 1, h / 32 + 1, i === 0, this.LevelType);
        this.BgLayer[i] = new Mario.BackgroundRenderer(bgLevelGenerator.CreateLevel(), editorApp.canvas.BackBuffer.width, 240, scrollSpeed);
    }

};

Mario.EditorState.prototype.SetDefaults = function () {
    this.Paused = false;
    this.Sprites = new Enjine.DrawableManager();
    this.Camera = new Enjine.Camera();
    this.Tick = 0;

    this.ShellsToCheck = [];
    this.FireballsToCheck = [];
    this.SpritesToAdd = [];
    this.SpritesToRemove = [];
};

Mario.EditorState.prototype.TogglePaused = function () {
    this.Paused = !this.Paused;
};

Mario.EditorState.prototype.ToggleGrid = function () {
    this.Layer.ToggleGrid();
};

Mario.EditorState.prototype.ToggleBackground = function () {
    this.DrawBackground = !this.DrawBackground;
    if (this.DrawBackground) {
        this.Layer.GridNumberColor = '#FFFFFF';
    } else {
        this.Layer.GridNumberColor = '#000000';
    }
}

Mario.EditorState.prototype.ToggleGridNumber = function () {
    this.Layer.ToggleGridNumber();
};

Mario.EditorState.prototype.ToggleSmartPaste = function () {
    this.SmartPaste = !this.SmartPaste;
};

Mario.EditorState.prototype.SetSelectedGrid = function (x, y) {
    this.Layer.SetSelected(x, y)
    if (editorChooserState.EnemyAdd) {
        this.AddEnemy(x, y);
        return;
    }
    let oldBlock = this.Level.GetBlock(x, y);
    this.SetSelectedGridWithChooser(x, y);
    let newBlock = this.Level.GetBlock(x, y);
    if (oldBlock != newBlock) {
        console.log("Block[" + x + "][" + y + "] changed:[" + oldBlock + "] => [" + newBlock + "]");
    } else {
        console.log("Block[" + x + "][" + y + "]: [" + oldBlock + "]");
    }
};

Mario.EditorState.prototype.ClearSelectedGrid = function (x, y) {
    this.Layer.selectedGridX = null;
    this.Layer.selectedGridY = null;
};

Mario.EditorState.prototype.AddEnemy = function (x, y) {
    this.Level.SetSpriteTemplate(x, y, new Mario.SpriteTemplate(editorChooserState.EnemyType, editorChooserState.EnemyWinged));
}

Mario.EditorState.prototype.SetSelectedGridWithChooser = function (x, y) {
    if (editorChooserState.SelectedTile > 0 || editorChooserState.Delete) {
        if (this.SmartPaste) {
            let block = editorChooserState.SelectedTile;
            switch (block) {
                case 128: // overground
                    this.PlaceGround(x, y, 128, 144);
                    return;
                case 129:
                    this.PlaceGround(x, y, 129, 145);
                    return;
                case 130:
                    this.PlaceGround(x, y, 130, 146);
                    return;
                case 132: // extra overground
                    this.PlaceGround(x, y, 132, 148);
                    return;
                case 133:
                    this.PlaceGround(x, y, 133, 149);
                    return;
                case 134:
                    this.PlaceGround(x, y, 134, 150);
                    return;
                case 136: // castle
                    this.PlaceGround(x, y, 136, 152);
                    return;
                case 137:
                    this.PlaceGround(x, y, 137, 153);
                    return;
                case 138:
                    this.PlaceGround(x, y, 138, 154);
                    return;
                case 140: // underground
                    this.PlaceGround(x, y, 140, 156);
                    return;
                case 141:
                    this.PlaceGround(x, y, 141, 157);
                    return;
                case 142:
                    this.PlaceGround(x, y, 142, 158);
                    return;
                case 67: // arrow
                case 68:
                case 83:
                case 84:
                    this.PlaceArrow(x, y);
                    return;
                case 10: // tube
                case 11:
                case 26:
                case 27:
                    this.PlaceTube(x, y);
                    return;
                case 24: // small tube
                case 40:
                case 56:
                    this.PlaceSmallTube(x, y);
                    return;
            }
        }
        for (let x1 = 0; x1 < this.Layer.SelectedLengthX; x1++) {
            for (let y1 = 0; y1 < this.Layer.SelectedLengthY; y1++) {
                this.Level.SetBlock(x + x1, y + y1, editorChooserState.SelectedTile);
                this.Level.SetSpriteTemplate(x, y, null);
            }
        }
    }
};

Mario.EditorState.prototype.PlaceGround = function (x, y, block, bellow) {
    this.Level.SetBlock(x, y, block);

    for (let yi = y + 1; yi < this.Level.Height; yi++) {
        let curBlock = this.Level.GetBlock(x, yi);
        if (curBlock == 0 || curBlock == bellow) {
            this.Level.SetBlock(x, yi, bellow);
        } else {
            return;
        }
    }
};

Mario.EditorState.prototype.PlaceArrow = function (x, y) {
    this.Level.SetBlock(x, y, 67);
    this.Level.SetBlock(x + 1, y, 68);
    this.Level.SetBlock(x, y + 1, 83);
    this.Level.SetBlock(x + 1, y + 1, 84);
};

Mario.EditorState.prototype.PlaceTube = function (x, y) {
    this.Level.SetBlock(x, y, 10);
    this.Level.SetBlock(x + 1, y, 11);

    for (let yi = y + 1; yi < this.Level.Height; yi++) {
        if (this.Level.GetBlock(x, yi) == 0) {
            this.Level.SetBlock(x, yi, 26);
            this.Level.SetBlock(x + 1, yi, 27);
        } else {
            return;
        }
    }
};


Mario.EditorState.prototype.PlaceSmallTube = function (x, y) {
    this.Level.SetBlock(x, y, 24);
    this.Level.SetBlock(x, y + 1, 40);
    this.Level.SetBlock(x, y + 2, 56);
};

Mario.EditorState.prototype.UpdateGridColor = function (color) {
    this.Layer.GridColor = '' + color;
};

Mario.EditorState.prototype.UpdateGridActiveColor = function (color) {
    this.Layer.GridActiveColor = '' + color;
};

Mario.EditorState.prototype.UpdateGridNumberColor = function (color) {
    this.Layer.GridNumberColor = '' + color;
};

Mario.EditorState.prototype.UpdateGridSelectedLengthX = function (lengthX) {
    this.Layer.SetSelectedLengthX(lengthX);
};

Mario.EditorState.prototype.setExitX = function (x) {
    this.Level.ExitX = x;
};

Mario.EditorState.prototype.setExitY = function (y) {
    this.Level.ExitY = y;
};

Mario.EditorState.prototype.Save = function () {
    var level = {
        Width: this.Level.Width,
        Height: this.Level.Height,
        ExitX: this.Level.ExitX,
        ExitY: this.Level.ExitY,
        Map: [],
        Data: [],
        SpriteTemplates: []
    };
    let x, y, sprites = 0;
    for (x = 0; x < this.Level.Width; x++) {
        level.Map[x] = [];
        level.Data[x] = [];
        for (y = 0; y < this.Level.Height; y++) {
            level.Map[x][y] = this.Level.Map[x][y];
            level.Data[x][y] = this.Level.Data[x][y];
            let st = this.Level.SpriteTemplates[x][y];
            if (st) {
                level.SpriteTemplates[sprites] = {
                    X: x,
                    Y: y,
                    Type: st.Type,
                    Winged: st.Winged
                };
                sprites++;
            }
        }
    }
    console.log("sprites added: " + sprites);

    file = new Blob([
        JSON.stringify(level, null)
    ], { type: "application/json" }, 1);
    var a = document.createElement("a"),
        url = URL.createObjectURL(file);
    a.href = url;
    a.download = "mario-level";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};

Mario.EditorState.prototype.Load = function (level) {
    if (!level) {
        return;
    }
    // clear all data
    editorState.GenerateEmptyLevel();
    // load level data

    this.Level.ExitX = level.ExitX;
    this.Level.ExitY = level.ExitY;
    let x, y;
    for (x = 0; x < this.Level.Width; x++) {
        for (y = 0; y < this.Level.Height; y++) {
            this.Level.SetBlock(x, y, level.Map[x][y]);
            this.Level.SetBlockData(x, y, level.Data[x][y]);
            level.Map[x][y] = this.Level.Map[x][y];
            level.Data[x][y] = this.Level.Data[x][y];
        }
    }

    for (let i = 0; i < level.SpriteTemplates; i++) {
        let st = level.SpriteTemplates[i];
        this.Level.SetSpriteTemplate(st.X, st.Y, new Mario.SpriteTemplate(st.Type, st.Winged));

    }
};