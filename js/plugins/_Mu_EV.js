



(function () {





    //=============================================================================
    // プレイヤーが動いたか座標から判定する
    //=============================================================================
    Game_Interpreter.prototype.PlayerZahyouHennka = function () {
        if ($gameVariables._data[12] == this.character(-1).x && $gameVariables._data[13] == this.character(-1).y) {
            $gameVariables._data[12] = this.character(-1).x;
            $gameVariables._data[13] = this.character(-1).y;
            return false;
        } else {
            $gameVariables._data[12] = this.character(-1).x;
            $gameVariables._data[13] = this.character(-1).y;
            return true;
        }
        
    }

    //=============================================================================
    // �C�x���g�ƃv���C���[�̍��W�������ɂȂ��Ă��邩
    //=============================================================================
    Game_Interpreter.prototype.PlayerToEventKaburu = function () {
        if (this.character(0).x == this.character(-1).x && this.character(0).y == this.character(-1).y) {
            return true;
        } else {
            return false;
        }
    }


    Game_Interpreter.prototype.ActorKoukann = function (taisyouIndex,hennkaID) {
        //$gameParty._actors.push(5);
        $gameParty._actors.splice(taisyouIndex, 1,hennkaID);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    }

    //=============================================================================
    // 戦闘メンバーの宣伝合計
    //=============================================================================
    Game_Interpreter.prototype.bm_senndenn = function () {
        var value = 0 ;
       
        for(var i of  $gameParty._battleMembers){
            if(i != 0){
                value += $gameActors.actor(i).aopParam(0);
            }
   
            
        }
        return value;
    }

    //=============================================================================
    // 戦闘メンバーの費用合計
    //=============================================================================
    Game_Interpreter.prototype.bm_hiyou = function () {
        var value = 0 ;
  
        for(var i of  $gameParty._battleMembers){
            if(i != 0){
                value += $gameActors.actor(i).aopParam(1);
            }

            
        }
        return value;
    }


    //=============================================================================
    // 指定した２つにイベントが隣り合っているか。
    //=============================================================================
    Game_Interpreter.prototype.eventTonariKita = function (eventID,eventID2) {
        var hataX = this.character(eventID2).x;
        var hataY = this.character(eventID2).y;
  
        var eventX = this.character(eventID).x;
        var eventY = this.character(eventID).y;

        if(hataX == eventX){
            if(Math.abs(hataY - eventY) == 1){
                return true;
            }
        }
        if(hataY == eventY){
            if(Math.abs(hataX - eventX) == 1){
                return true;
            }
        }
        return false;
    };

    //=============================================================================
    // 指定したイベントと、特定のイベント名のイベントが隣接していれば隣接しているイベントのIDを返す
    //=============================================================================
    Game_Interpreter.prototype.隣接イベント名前指定取得 = function (chara_evnt,ev_name) {
        var rinnsetuEVid = 0;
        for(var Game_Event of $gameMap.events()) {
            var dataMapEvent = Game_Event.event();
            if (dataMapEvent.name == ev_name && Game_Event._erased == false){
                if(Game_Event._x == chara_evnt.x){
                    if(Math.abs(Game_Event._y - chara_evnt.y) == 1){
                        rinnsetuEVid = Game_Event.eventId();
                    }
                }
                if(Game_Event._y == chara_evnt.y){
                    if(Math.abs(Game_Event._x - chara_evnt.x) == 1){
                        rinnsetuEVid = Game_Event.eventId();
                    }
                }
            }

        }
        console.log(rinnsetuEVid);
        return rinnsetuEVid;
    }



    //=============================================================================
    // おとぎばなしの鬼ごっこ トラップ判定 トラップという名前のイベントが、イベントID１版の座標と一致していればtreuを返す
    //=============================================================================
    Game_Interpreter.prototype.wanaID = function () {
        //EventReSpawn.jsで生成したイベントは、「$dataMap.events」上ではIDも含めて全くおなじになる。
        //一方でGame_Event としては別IDが振られている。
        var wanaEVid = 0;
        for(var Game_Event of $gameMap.events()) {
            var dataMapEvent = Game_Event.event();
            if (dataMapEvent.name == "トラップ" && Game_Event._erased == false){
                if(Game_Event._x == this.character(1).x && Game_Event._y == this.character(1).y){
                    wanaEVid = Game_Event.eventId();
                    break;
                }
                
            }

        }
        return wanaEVid ;
    }

    //=============================================================================
    // おとぎばなしの鬼ごっこ トラップ判定 トラップという名前のイベントが、プレイヤーの座標と一致していればtreuを返す
    //=============================================================================
    Game_Interpreter.prototype.wanaID_PL = function () {
        //EventReSpawn.jsで生成したイベントは、「$dataMap.events」上ではIDも含めて全くおなじになる。
        //一方でGame_Event としては別IDが振られている。
        var wanaEVid = 0;
        for(var Game_Event of $gameMap.events()) {
            var dataMapEvent = Game_Event.event();
            if (dataMapEvent.name == "トラップ" && Game_Event._erased == false){
                if(Game_Event._x == this.character(-1).x && Game_Event._y == this.character(-1).y){
                    wanaEVid = Game_Event.eventId();
                    break;
                }
                
            }

        }
        return wanaEVid ;
    }

    //=============================================================================
    // プレイヤーの位置にイベントがあるか
    //=============================================================================
    Game_Interpreter.prototype.PlayerToEventKaburu2 = function () {
        for(var Game_Event of $gameMap.events()) {
            if (Game_Event._erased == false){
                if(Game_Event._x == this.character(-1).x && Game_Event._y == this.character(-1).y){
                    return true;
                }
            }
        }
        return false;
    }

    //=============================================================================
    // 指定したイベントとイベント、またはプレイヤーが同一座標にあるか
    //=============================================================================
    Game_Interpreter.prototype.MU2つのキャラの座標が同じ = function (eventID,eventID2) {
        if(this.character(eventID) == undefined)throw new Error("イベントID" + eventID  + "番のイベントがマップにない！");
        if(this.character(eventID2) == undefined)throw new Error("イベントID" + eventID2  + "番のイベントがマップにない！");

        if (this.character(eventID).x != this.character(eventID2).x ){
            return false;
        }
        if (this.character(eventID).y != this.character(eventID2).y ){
            return false;
        }
        console.log("aaa");
        if (this.character(eventID)._erased == false || this.character(eventID)._erased == undefined ){
            console.log("ffff");
            if (this.character(eventID2)._erased == false || this.character(eventID2)._erased == undefined ){
                return true;
            }
        }
        return false;
    }
   
    //=============================================================================
    // 指定したイベントとプレイヤーが同一座標にあるか
    //=============================================================================
    Game_Interpreter.prototype.追跡者と指定イベント座標が同じ = function (eventID) {
        if(this.character(eventID) == undefined)throw new Error("イベントID" + eventID  + "番がマップにないためプレイヤーと同じ座標か照合できない。");
      
        if (this.character(eventID).x != this.character(-1).x ){
            return false;
        }
        if (this.character(eventID).y != this.character(-1).y ){
            return false;
        }
        if (this.character(eventID)._erased == false || this.character(eventID)._erased == undefined ){
            return true;
        }
        return false;
    }

    //=============================================================================
    // 指定したイベントとヒロイン(ID1)が同一座標にあるか
    //=============================================================================
    Game_Interpreter.prototype.ヒロインと指定イベントの座標同じ = function (eventID) {
        if(this.character(eventID) == undefined)throw new Error("イベントID" + eventID  + "番がマップにないためヒロインと同じ座標か照合ができない。");
        if (this.character(eventID).x != this.character(1).x ){
            return false;
        }
        if (this.character(eventID).y != this.character(1).y ){
            return false;
        }
        if (this.character(eventID)._erased == false || this.character(eventID)._erased == undefined ){
            return true;
        }
        return false;
    }

    //=============================================================================
    // ヒロイン(ID1)が指定リージョンIDの上にいるか
    //=============================================================================
    Game_Interpreter.prototype.ヒロインが指定リージョン = function (リージョンID) {
        return $gameMap.regionId(this.character(1).x, this.character(1).y) == リージョンID;
    }

    //=============================================================================
    // プレイヤーが指定リージョンIDの上にいるか
    //=============================================================================
    Game_Interpreter.prototype.プレイヤーが指定リージョン = function (リージョンID) {
        return $gameMap.regionId(this.character(-1).x, this.character(-1).y) == リージョンID;
    }

   

    //=============================================================================
    // プレイヤーがヒロインより大きいリージョンIDの上にいるか
    //=============================================================================
    Game_Interpreter.prototype.プレイヤーがヒロインよりリージョンIDが大きい = function () {
        var hre =  $gameMap.regionId(this.character(1).x, this.character(1).y);
        var pre = $gameMap.regionId(this.character(-1).x, this.character(-1).y);
        if(hre == 0) return false;
        if(pre == 0) return false;
        if(pre > hre){
            return  true;
        }else{
            return  false;
        }
    }

    //=============================================================================
    // ヒロインと追跡者がfthis.character()だと表示が似ていて取り違えの原因になるので見やすく呼び出せるようにした
    //=============================================================================
    Game_Interpreter.prototype.ヒロイン = function () {
        return  this.character(1);
    }
    Game_Interpreter.prototype.プレイヤー = function () {
        return  this.character(-1);
    }





    //=============================================================================
    // 指定した２つにイベントの距離を返す。
    //=============================================================================
    Game_Interpreter.prototype.イベント同士の距離 = function (eventID,eventID2) {
        var hataX = this.character(eventID2).x;
        var hataY = this.character(eventID2).y;
        var eventX = this.character(eventID).x;
        var eventY = this.character(eventID).y;
        zettaiti = Math.abs(hataY - eventY) + Math.abs(hataX - eventX);
        return zettaiti;
    };

    //=============================================================================
    // 移
    //=============================================================================
    Game_Interpreter.prototype.イベント前方の地形タグ = function (eventID,kyori) {
        var ev = this.character(eventID);
        var hannteiX = ev.x;
        var hannteiY = ev.y;
        if (ev.direction() == 2) hannteiY += kyori;
        if (ev.direction() == 4) hannteiX -= kyori;
        if (ev.direction() == 6) hannteiX += kyori;
        if (ev.direction() == 8) hannteiY -= kyori;
        console.log(hannteiX);
        console.log(hannteiY);
        return $gameMap.terrainTag(hannteiX, hannteiY);
    }


    //=============================================================================
    // イベントやプレイヤーから離れる移動処理を改良。袋小路に逃げなければ動き回り続けられる。
    //=============================================================================
    Game_Character.prototype.moveAwayFromCharacter = function(character) {
        var sx = this.deltaXFrom(character.x);
        var sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.moveStraight(sx > 0 ? 6 : 4);
            if (!this.isMovementSucceeded() ) {//&& sy !== 0
                //プレイヤーのy軸が同じで、z軸方向が行き止まりの場合、下に逃げる
                this.moveStraight(sy > 0 ? 2 : 8);
                if (!this.isMovementSucceeded() ) {//&& sy !== 0
                    //X軸方向では距離が離せず、下にも逃げられない場合は上へ逃げる
                    this.moveStraight(sy > 0 ? 8 : 2);
                }
            }
        } else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 2 : 8);
           // console.log(character.findDirectionTo(character.x + 5,character.y + 5));
           // this.moveStraight(character.findDirectionTo(character.x + 5,character.y + 5));
            if (!this.isMovementSucceeded() ) {//&& sx !== 0
                //プレイヤーのx軸が同じで、Y軸方向が行き止まりの場合、左に逃げる
                this.moveStraight(sx > 0 ? 6 : 4);
                if (!this.isMovementSucceeded()) {
                    //Y軸方向では距離が離せず、左にも逃げられない場合は右へ逃げる
                    this.moveStraight(sx > 0 ? 4 : 6);
                }
            }
        }
    };

    //=============================================================================
    // 経路探索の処理を途中まで使い、目的地と最終到達地点が一致するか照合する
    //=============================================================================
    Game_Character.prototype.目的地に到達可能か = function(goalX, goalY) {
        var searchLimit = this.searchLimit();var mapWidth = $gameMap.width();
        var nodeList = [];
        var openList = [];
        var closedList = [];
        var start = {};
        var best = start;
    
        if (this.x === goalX && this.y === goalY) {
            return 0;
        }
    
        start.parent = null;
        start.x = this.x;
        start.y = this.y;
        start.g = 0;
        start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
        nodeList.push(start);
        openList.push(start.y * mapWidth + start.x);
    
        while (nodeList.length > 0) {
            var bestIndex = 0;
            for (var i = 0; i < nodeList.length; i++) {
                if (nodeList[i].f < nodeList[bestIndex].f) {
                    bestIndex = i;
                }
            }
    
            var current = nodeList[bestIndex];
            var x1 = current.x;
            var y1 = current.y;
            var pos1 = y1 * mapWidth + x1;
            var g1 = current.g;
    
            nodeList.splice(bestIndex, 1);
            openList.splice(openList.indexOf(pos1), 1);
            closedList.push(pos1);
    
    
    
            if (current.x === goalX && current.y === goalY) {
                best = current;
                break;
            }
    
            if (g1 >= searchLimit) {
                continue;
            }
    
            for (var j = 0; j < 4; j++) {
                var direction = 2 + j * 2;
                var x2 = $gameMap.roundXWithDirection(x1, direction);
                var y2 = $gameMap.roundYWithDirection(y1, direction);
                var pos2 = y2 * mapWidth + x2;
    
                if (closedList.contains(pos2)) {
                    continue;
                }
                if (!this.canPass(x1, y1, direction)) {
                    continue;
                }
    
                var g2 = g1 + 1;
                var index2 = openList.indexOf(pos2);
    
                if (index2 < 0 || g2 < nodeList[index2].g) {
                    var neighbor;
                    if (index2 >= 0) {
                        neighbor = nodeList[index2];
                    } else {
                        neighbor = {};
                        nodeList.push(neighbor);
                        openList.push(pos2);
                    }
                    neighbor.parent = current;
                    neighbor.x = x2;
                    neighbor.y = y2;
                    neighbor.g = g2;
                    neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
                    if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                        best = neighbor;
                    }
                }
            }
        }
    
        var node = best;
        if(node.x == goalX  && node.y == goalY)return true;
        return false;
    };
    


    //=============================================================================
    // マップ単位でセルフスイッチをOFF
    //=============================================================================
    Game_Interpreter.prototype.現在マップのセルフスイッチを一括OFF = function (swit) {
        for (var event of $gameMap.events()) {
            var key = [$gameMap._mapId, event._eventId, swit];
            $gameSelfSwitches.setValue(key, false)
        }
    }



})();
