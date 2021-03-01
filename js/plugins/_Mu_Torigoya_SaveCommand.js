/*---------------------------------------------------------------------------*
 * Torigoya_SaveCommand.js
 *---------------------------------------------------------------------------*
 * 2018/01/03 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc Add save command in Plugin Command
 * @author ru_shalm + 改造
 *
 * @help
 *
 * Plugin Command:
 *   SaveCommand save 1       # save to slot 1
 *   SaveCommand save [1]     # save to slot variables[1]
 *   SaveCommand save last    # save to last accessed file
 *   SaveCommand load 1       # load from slot 1
 *   SaveCommand load [1]     # load from slot variables[1]
 *   SaveCommand load last    # load from last accessed file
 *   SaveCommand remove 1     # remove save file of slot 1
 *   SaveCommand remove [1]   # remove save file of slot variables[1]
 *   SaveCommand remove last  # remove last accessed file
 *
 * (default last accessed file: 1)
 */

/*:ja
 * @plugindesc オートセーブ改良型プラグイン。シーン回想プラグインより下に置くこと
 * @author ru_shalm + 改造
 *
 * @help
 * イベントコマンドの「プラグインコマンド」を使って、
 * イベント中に自動的にセーブを実行できるようになります。
 *
 * 例えばオートセーブのゲームなどが作れるようになります。
 *
 * ------------------------------------------------------------
 * ■ プラグインコマンド（セーブ系）
 * ------------------------------------------------------------
 *
 * ● スロット1にセーブを実行する
 * SaveCommand save 1
 *
 * ※ 1 の部分の数字を変えると別のスロットにセーブされます
 *
 * ● 変数[1]番のスロットにセーブを実行する
 * SaveCommand save [1]
 *
 * ● 前回ロード/セーブしたスロットにセーブを実行する
 * SaveCommand save last
 *
 * ※ ロード/セーブしていない場合はスロット1になります。
 *
 * ＜おまけ＞
 * セーブ時に以下のように末尾に「notime」をつけることで
 * セーブ時刻を更新せずにセーブすることができます。
 *
 * SaveCommand save 1 notime
 *
 * これによってロード画面でカーソル位置をオートセーブした場所ではなく
 * プレイヤーが自分でセーブしたファイルに合わせたままにすることができます。
 *
 * ------------------------------------------------------------
 * ■ プラグインコマンド（ロード系）
 * ------------------------------------------------------------
 * ＜注意＞
 * RPGツクールはイベントの途中で
 * セーブデータがロードされることが想定されていません。
 * そのためイベントのタイミングによっては、
 * ロード後のゲームの動作がおかしくなることがあります。
 *
 * ● スロット1からロードを実行する
 * SaveCommand load 1
 *
 * ● 変数[1]番のスロットからロードを実行する
 * SaveCommand load [1]
 *
 * ● 前回ロード/セーブしたスロットからロードを実行する
 * SaveCommand load last
 *
 * ※ ロード/セーブしていない場合はスロット1になります。
 *
 * ● 一番最後にセーブをしたスロットからロードを実行する
 * SaveCommand load latest
 *
 * ※ last ではなく latest です＞＜；
 *
 * ------------------------------------------------------------
 * ■ プラグインコマンド（削除系）
 * ------------------------------------------------------------
 * ＜注意＞
 * セーブデータを削除するコマンドなので取扱注意ですよ！
 *
 * ● スロット1を削除する
 * SaveCommand remove 1
 *
 * ● 変数[1]番のスロットを削除する
 * SaveCommand remove [1]
 *
 * ● 前回ロード/セーブしたスロットを削除する
 * SaveCommand remove last
 *
 * ※ ロード/セーブしていない場合はスロット1になります。
 */

(function (global) {
    'use strict';

    var SaveCommand = {
        name: 'Torigoya_SaveCommand',
        settings: {},
        lastTimestamp: undefined,
        lastAccessId: undefined
    };

    // -------------------------------------------------------------------------
    // SaveCommand

    /**
     * スロットID指定文字列からスロットIDを求める
     * @param {string} str
     * @returns {number}
     */
    SaveCommand.parseSlotId = function (str) {
        var slotId, matches;
        if (matches = str.match(/^\[(\d+)\]$/)) {
            slotId = $gameVariables.value(~~matches[1]);
        } else if (str.match(/^\d+$/)) {
            slotId = ~~str;
        } else {
            switch (str) {
                case 'last':
                    slotId = DataManager.lastAccessedSavefileId();
                    break;
                case 'latest':
                    slotId = DataManager.latestSavefileId();
                    break;
            }
        }

        if (~~slotId <= 0) {
            throw '[Torigoya_SaveCommand.js] invalid SlotId: ' + slotId;
        }

        return slotId;
    };

    /**
     * セーブ系コマンド処理の実行
     * @param {Game_Interpreter} gameInterpreter
     * @param {string} type
     * @param {number} slotId
     * @param {boolean} skipTimestamp
     */
    SaveCommand.runCommand = function (gameInterpreter, type, slotId, skipTimestamp) {
        switch (type) {
            case 'load':
                this.runCommandLoad(gameInterpreter, slotId);
                break;
            case 'save':
                this.runCommandSave(gameInterpreter, slotId, skipTimestamp);
                break;
            case 'remove':
                this.runCommandRemove(gameInterpreter, slotId);
                break;
        }
    };

    /**
     * ロード処理
     * @note ちょっと無理やり感があるのでイベントの組み方次第ではまずそう
     * @param {Game_Interpreter} gameInterpreter
     * @param {number} slotId
     */
    SaveCommand.runCommandLoad = function (gameInterpreter, slotId) {
        if (!DataManager.isThisGameFile(slotId)) return;

        var scene = SceneManager._scene;
        scene.fadeOutAll();
        DataManager.loadGame(slotId);
        gameInterpreter.command115(); // 今のイベントが継続しないように中断コマンドを実行する
        Scene_Load.prototype.reloadMapIfUpdated.apply(scene);
        SceneManager.goto(Scene_Map);
        $gameSystem.onAfterLoad();
    };

    /**
     * セーブ処理
     * @param {Game_Interpreter} _
     * @param {number} slotId
     * @param {boolean} skipTimestamp
     */
    SaveCommand.runCommandSave = function (_, slotId, skipTimestamp) {
        
        if (skipTimestamp) {
            var info = DataManager.loadSavefileInfo(slotId);
           // console.log($gameSystem["fp_save_rannsuuA"]);
           // console.log($gameSystem["fp_save_rannsuuB"]);
            if (info != null) {
                
                if ($gameSystem["fp_save_rannsuuA"] == $gameSystem["fp_save_rannsuuB"]) {
                    return;//セーブ直前に発生させた乱数と、その後に発生させた乱数が同じ場合はセーブしない。
                }
            }
            // autosave_timestamp = DataManager.loadSavefileInfo(autosaveID).timestamp;
            //SaveCommand.lastTimestamp = info && info.timestamp ? info.timestamp : 0;///skipTimestampの場合でも、Timestampは前のものを持ってこずちゃんと更新する。
            SaveCommand.lastAccessId = DataManager.lastAccessedSavefileId();
            $gameSystem["fp_save_bongou"] = SaveCommand.lastAccessId;//オートセーブの時は、$gameSystem["fp_save_bongou"]に大元のlastAccessIdを入れておく。これによりオートセーブから再開したあとの、初期セーブ対象スロットが正常に用意できる。
        }

        $gameSystem["fp_save_rannsuuB"] = $gameSystem["fp_save_rannsuuA"];//乱数を更新

        $gameSystem.onBeforeSave();
        if (DataManager.saveGame(slotId) && StorageManager.cleanBackup) {
            StorageManager.cleanBackup(slotId);
        }

        if (skipTimestamp) {
            DataManager._lastAccessedId = SaveCommand.lastAccessId;
            // SaveCommand.lastTimestamp = undefined;//skipTimestampの場合でもTimestampはリセットしないようにする。
            SaveCommand.lastAccessId = undefined;//lastAccessIdは通常通りリセット
        }

        

        console.log("オートセーブ実行");
    };

    /**
     * セーブファイルの削除処理
     * @param {Game_Interpreter} _
     * @param {number} slotId
     */
    SaveCommand.runCommandRemove = function (_, slotId) {
        StorageManager.remove(slotId);
    };

    // -------------------------------------------------------------------------
    // alias

    var upstream_DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
    DataManager.makeSavefileInfo = function () {
        var info = upstream_DataManager_makeSavefileInfo.apply(this);
        if (SaveCommand.lastTimestamp !== undefined) {
            info.timestamp = SaveCommand.lastTimestamp;
        }
        return info;
    };

    var upstream_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SaveCommand') {
            var type = (args[0] || '').trim();
            var slotId = SaveCommand.parseSlotId((args[1] || '').trim());
            var skipTimestamp = (args[2] === 'notime');
            SaveCommand.runCommand(this, type, slotId, skipTimestamp);
            return;
        }
        upstream_Game_Interpreter_pluginCommand.apply(this, arguments);
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.SaveCommand = SaveCommand;


    // -------------------------------------------------------------------------
    //武藤FP 他の基礎プラグインからもってきたもの

    var autosaveID = 21;

    DataManager.latestSavefileId = function () {
        var globalInfo = this.loadGlobalInfo();
        var savefileId = 1;
        var timestamp = 0;
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                //autosaveIDの場合は、latestSavefileIdを探す時に対象外に。通常ロード画面でオートセーブファイルIDに初期カーソルが合わさらないようにする。
                if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp && i != autosaveID) {
                    timestamp = globalInfo[i].timestamp;
                    savefileId = i;
                }
            }
        }
        return savefileId;
    };

    DataManager.loadGameWithoutRescue = function (savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            this.createGameObjects();
            this.extractSaveContents(JsonEx.parse(json));
            if (autosaveID == savefileId) {//オートセーブデータをロードした場合は、lastAccessedSavefileIdを更新しない。
                this._lastAccessedId = $gameSystem["fp_save_bongou"];
            } else {
                this._lastAccessedId = savefileId;
            }
            
            return true;
        } else {
            return false;
        }
    };



    //タイトル画面のコマンドリストを作成
    var mu_Window_TitleCommandprototypemakeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function () {
        mu_Window_TitleCommandprototypemakeCommandList.call(this);
        this.addCommand("Auto Save", 'autosave', this.isAutoSaveEnabled());
        
    };

    //タイトル画面で判定。オートセーブファイルがあるか。
    //ちなみにisContinueEnabled()はいじっていないため、オートセーブファイルを含めてファイルが１つでもある場合はisContinueEnabled()もtrueを返すようになっている。
    //そのためオートセーブファイルがあると通常セーブファイルが存在しなくてもコンテニューが選べてしまうが、まあ実害はないだろう。
    Window_TitleCommand.prototype.isAutoSaveEnabled = function () {
        return StorageManager.exists(autosaveID);
    };

    Window_TitleCommand.prototype.selectLast = function () {

        //本来は、ゲーム本編やコンフィグからタイトルに戻ってきた場合は、そのカーソルを引き継ぐ。
        //しかしオートセーブでゲームを始めると、通常セーブをその後したとしても、コマンド「ゲーム終了」→タイトルだと、初期カーソルがオートセーブになってしまう。
        //そのためthis.selectSymbol(Window_TitleCommand._lastCommandSymbol);は無効化している。

        //そのうえで通常セーブとオートセーブで新しい方にカーソルを自動であわせるようにした。

        if (this.isContinueEnabled()) {//isContinueEnabled()は現状、通常セーブでもオートセーブでもいずれか１つあればtrue


            //通常セーブデータの中で最もタイムスタンプが新しいもののタイムスタンプを取得
            var lassave1_timestamp;
            var autosave_timestamp;
            if (DataManager.loadSavefileInfo(DataManager.latestSavefileId()) != null) {
                lassave1_timestamp = DataManager.loadSavefileInfo(DataManager.latestSavefileId()).timestamp;
            } else {
                lassave1_timestamp = 0;
            }
            //オートセーブファイルのタイムスタンプを取得
            if (DataManager.loadSavefileInfo(autosaveID) != null) {
                autosave_timestamp = DataManager.loadSavefileInfo(autosaveID).timestamp;
            } else {
                autosave_timestamp = 0;
            }
           // console.log("lassave1_timestamp");
           // console.log(lassave1_timestamp);
           // console.log("autosave_timestamp");
           // console.log(autosave_timestamp);
            if (autosave_timestamp > lassave1_timestamp) {
                this.selectSymbol('autosave');
            } else {
                this.selectSymbol('continue');
            }
        }
        
    };

    //タイトル画面のコマンドリストを実行内容等と結びつける
    var Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('autosave', this.commandAutoSave.bind(this));
    };


    Scene_Title.prototype.commandAutoSave = function () {
        
        var slotId = autosaveID;
        if (!DataManager.isThisGameFile(slotId)) return;
        var scene = SceneManager._scene;
        scene.fadeOutAll();
        DataManager.loadGame(slotId);
        Scene_Load.prototype.reloadMapIfUpdated.apply(scene);
        
        SceneManager.goto(Scene_Map);
        $gameSystem.onAfterLoad();
        
    };


})(window);
