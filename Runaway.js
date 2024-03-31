(function() {
    var _Game_Enemy_performCollapse = Game_Enemy.prototype.performCollapse;
    
    Game_Enemy.prototype.performCollapse = function() {
        _Game_Enemy_performCollapse.call(this);
        
        if (this.enemy().meta.EscapeOnLoss) {
            var player = $gamePlayer;
            var enemy = this;
            var path = this.findEscapePath(player.x, player.y);
            
            if (path.length > 0) {
                var direction = path.shift();
                enemy.moveStraight(direction);
            }
        }
    };

    Game_Enemy.prototype.findEscapePath = function(targetX, targetY) {
        var finder = new Pathfinder($gameMap.width(), $gameMap.height(), this.x, this.y, targetX, targetY);
        return finder.findPath();
    };
    
    function Pathfinder(mapWidth, mapHeight, startX, startY, targetX, targetY) {
        this.map = [];
        this.openList = [];
        this.path = [];
        
        for (var y = 0; y < mapHeight; y++) {
            this.map[y] = [];
            for (var x = 0; x < mapWidth; x++) {
                this.map[y][x] = $gameMap.checkPassage(x, y) ? 0 : 1; // 0 - проходимый участок, 1 - непроходимый
            }
        }
        
        this.openList.push({x: startX, y: startY, g: 0, f: 0});
        
        // Нахождение пути
        while (this.openList.length > 0) {
            var current = this.openList.shift();
            
            if (current.x === targetX && current.y === targetY) {
                var path = [];
                while (current.parent) {
                    path.unshift(current.direction);
                    current = current.parent;
                }
                this.path = path;
                break;
            }
            
            this.findNeighbors(current, targetX, targetY);
        }
    }
    
    Pathfinder.prototype.findNeighbors = function(current, targetX, targetY) {
        var directions = [2, 4, 6, 8]; 
        var self = this;
        
        directions.forEach(function(direction) {
            var dx = $gameMap.roundXWithDirection(current.x, direction);
            var dy = $gameMap.roundYWithDirection(current.y, direction);
            
            if (self.map[dy] && self.map[dy][dx] === 0) {
                var g = current.g + 1;
                var h = Math.abs(targetX - dx) + Math.abs(targetY - dy);
                var f = g + h;
                
                var neighbor = self.openList.find(function(node) {
                    return node.x === dx && node.y === dy;
                });
                
                if (!neighbor || g < neighbor.g) {
                    if (!neighbor) {
                        neighbor = {x: dx, y: dy, g: g, f: f, direction: direction, parent: current};
                        self.openList.push(neighbor);
                    } else {
                        neighbor.g = g;
                        neighbor.f = f;
                        neighbor.direction = direction;
                        neighbor.parent = current;
                    }
                }
            }
        });
        
        this.openList.sort(function(a, b) {
            return a.f - b.f;
        });
    };

    //Чек общего пути вставить
    Pathfinder.prototype.findPath = function() {
        return this.path;
    };
})();
