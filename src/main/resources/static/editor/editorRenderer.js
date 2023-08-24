/**
    Renders a level in an editor
    Code by Lucas Binter, 2023
*/

Mario.EditorRenderer = function (level, width, height, drawGrid = false, drawGridNumber = false) {
    this.Width = width;
    this.Height = height;
    this.Level = level;
    this.TilesY = ((height / 16) | 0) + 1;
    this.Delta = 0;
    this.Tick = 0;
    this.Bounce = 0;
    this.AnimTime = 0;

    this.DrawDataLayer = true;
    this.DrawGrid = drawGrid;
    this.DrawGridNumber = drawGridNumber;
    this.SelectedGridX = null;
    this.SelectedGridY = null;
    this.SelectedLengthX = 1;
    this.SelectedLengthY = 1;

    this.GridColor = '#000000';
    this.GridActiveColor = '#FF0000';
    this.GridNumberColor = '#FFFFFF';
    this.EnemyColor = '#0000FF';

    this.Background = Mario.SpriteCuts.GetLevelSheet();
};

Mario.EditorRenderer.prototype = new Enjine.Drawable();

Mario.EditorRenderer.prototype.Update = function (delta) {
    this.AnimTime += delta;
    this.Tick = this.AnimTime | 0;
    this.Bounce += delta * 30;
    this.Delta = delta;
};

Mario.EditorRenderer.prototype.Draw = function (context, camera) {
    this.DrawStatic(context, camera);
    this.DrawDynamic(context, camera);

    if (this.DrawGrid || this.DrawGridNumber || this.SelectedGridX) {
        this.DrawInfo(context, camera);
    }

    if (this.DrawDataLayer) {
        this.DrawSpiritTemplateSpawns(context, camera);
    }
};


Mario.EditorRenderer.prototype.DrawInfo = function (context, camera) {
    var x = 0, y = 0, xTileStart = (camera.X / 16) | 0, xTileEnd = ((camera.X + this.Width) / 16) | 0;
    for (x = xTileStart; x < xTileEnd + 1; x++) {
        for (y = 0; y < this.TilesY; y++) {
            let posX = ((x << 4) - camera.X) | 0;
            let posY = (y << 4) | 0;

            if (this.DrawGrid) {
                let strokeStyle = context.strokeStyle;
                let lineWidth = context.lineWidth;
                context.strokeStyle = this.GridColor;
                context.lineWidth = 0.2;
                context.strokeRect(posX, posY, 16, 16);
                context.strokeStyle = strokeStyle;
                context.lineWidth = lineWidth;
            }

            if (this.DrawGridNumber && y == 1) {
                let fillStyle = context.fillStyle;
                context.fillStyle = this.GridNumberColor;
                let offset = -4;
                if (x > 100 && x % 2 != 0) {
                    offset = 12;
                }
                context.fillText(x, posX + 2, posY + offset);
                context.fillStyle = fillStyle;
            }

            if (x == this.SelectedGridX && y == this.SelectedGridY) {
                context.save();
                context.globalAlpha = 1.0;
                context.strokeStyle = this.GridActiveColor;
                context.lineWidth = 1.0;
                context.strokeRect(posX, posY, 16 * this.SelectedLengthX, 16 * this.SelectedLengthY);
                context.restore();
            }
        }
    }
};

Mario.EditorRenderer.prototype.DrawSpiritTemplateSpawns = function (context, camera) {
    var x = 0, y = 0, xTileStart = (camera.X / 16) | 0, xTileEnd = ((camera.X + this.Width) / 16) | 0;

    for (x = xTileStart; x < xTileEnd + 1; x++) {
        for (y = 0; y < this.TilesY; y++) {
            let posX = ((x << 4) - camera.X) | 0;
            let posY = (y << 4) | 0;
            let st = this.Level.GetSpriteTemplate(x, y);
            if (st) {
                context.save();
                context.fillStyle = this.EnemyColor;
                let offset = 12;
                context.fillText("" + st.Type, posX + 6, posY + offset);
                context.globalAlpha = 1.0;
                context.strokeStyle = this.EnemyColor;
                context.lineWidth = 1.0;
                context.strokeRect(posX, posY, 16 * this.SelectedLengthX, 16 * this.SelectedLengthY);
                context.restore();
            }
        }
    }
};

Mario.EditorRenderer.prototype.DrawStatic = function (context, camera) {
    var x = 0, y = 0, b = 0, frame = null, xTileStart = (camera.X / 16) | 0, xTileEnd = ((camera.X + this.Width) / 16) | 0;
    for (x = xTileStart; x < xTileEnd + 1; x++) {
        for (y = 0; y < this.TilesY; y++) {
            b = this.Level.GetBlock(x, y) & 0xff;
            if ((Mario.Tile.Behaviors[b] & Mario.Tile.Animated) === 0) {
                frame = this.Background[b % 16][(b / 16) | 0];
                context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, ((x << 4) - camera.X) | 0, (y << 4) | 0, frame.Width, frame.Height);
            }
        }
    }
};

Mario.EditorRenderer.prototype.DrawDynamic = function (context, camera) {
    var x = 0, y = 0, b = 0, animTime = 0, yo = 0, frame = null;
    for (x = (camera.X / 16) | 0; x <= ((camera.X + this.Width) / 16) | 0; x++) {
        for (y = (camera.Y / 16) | 0; y <= ((camera.Y + this.Height) / 16) | 0; y++) {
            b = this.Level.GetBlock(x, y);

            if (((Mario.Tile.Behaviors[b & 0xff]) & Mario.Tile.Animated) > 0) {
                animTime = ((this.Bounce / 3) | 0) % 4;
                if ((((b % 16) / 4) | 0) === 0 && ((b / 16) | 0) === 1) {
                    animTime = ((this.Bounce / 2 + (x + y) / 8) | 0) % 20;
                    if (animTime > 3) {
                        animTime = 0;
                    }
                }
                if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                    animTime = 2;
                }
                yo = 0;
                if (x >= 0 && y >= 0 && x < this.Level.Width && y < this.Level.Height) {
                    yo = this.Level.Data[x][y];
                }
                if (yo > 0) {
                    yo = (Math.sin((yo - this.Delta) / 4 * Math.PI) * 8) | 0;
                }
                frame = this.Background[(((b % 16) / 4) | 0) * 4 + animTime][(b / 16) | 0];
                context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (x << 4) - camera.X, (y << 4) - camera.Y - yo, frame.Width, frame.Height);
            }
        }
    }
};

Mario.EditorRenderer.prototype.DrawExit0 = function (context, camera, bar) {
    var y = 0, yh = 0, frame = null;
    for (y = this.Level.ExitY - 8; y < this.Level.ExitY; y++) {
        frame = this.Background[12][y === this.Level.ExitY - 8 ? 4 : 5];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X - 16, (y << 4) - camera.Y, frame.Width, frame.Height);
    }

    if (bar) {
        yh = this.Level.ExitY * 16 - (3 * 16) - (Math.sin(this.AnimTime) * 3 * 16) - 8;// - ((Math.sin(((this.Bounce + this.Delta) / 20) * 0.5 + 0.5) * 7 * 16) | 0) - 8;
        frame = this.Background[12][3];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X - 16, yh - camera.Y, frame.Width, frame.Height);
        frame = this.Background[13][3];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X, yh - camera.Y, frame.Width, frame.Height);
    }
};

Mario.EditorRenderer.prototype.DrawExit1 = function (context, camera) {
    var y = 0, frame = null;
    for (y = this.Level.ExitY - 8; y < this.Level.ExitY; y++) {
        frame = this.Background[13][y === this.Level.ExitY - 8 ? 4 : 5];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X + 16, (y << 4) - camera.Y, frame.Width, frame.Height);
    }
};

Mario.EditorRenderer.prototype.ToggleGrid = function () {
    this.DrawGrid = !this.DrawGrid;
};

Mario.EditorRenderer.prototype.ToggleGridNumber = function () {
    this.DrawGridNumber = !this.DrawGridNumber;
};

Mario.EditorRenderer.prototype.SetSelected = function (x, y) {
    this.SelectedGridX = x;
    this.SelectedGridY = y;
};

Mario.EditorRenderer.prototype.SetSelectedLengthX = function (lengthX) {
    if (lengthX < 1) {
        lengthX = 1;
    }
    if (lengthX >= 15) {
        lengthX = 15;
    }
    this.SelectedLengthX = lengthX;
};

Mario.EditorRenderer.prototype.SetSelectedLengthY = function (lengthY) {
    if (lengthY < 1) {
        lengthY = 1;
    }
    if (lengthY >= 15) {
        lengthY = 15;
    }
    this.SelectedLengthY = lengthY;
};