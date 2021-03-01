//=============================================================================
// BattleVoice.js
//=============================================================================

/*:
様々な改造を行っている。

もともとある仕様というかバグなのか競合なのか、
・戦闘勝利ボイスが再生されない
・苦戦勝利ボイスが存在しない
・戦闘不能時に、ダメージボイスと戦闘不能ボイスとが同時に再生される
・戦闘開始ボイスは存在しない
という問題がある。

そこで……
◆ダメージボイス
通常の<damageVoice:filename>は使わず、<vpDamageVoice:filename> (vp)というジャンルを新設。
_Mu_GP.js側で呼び出して鳴らす。

◆戦闘勝利ボイス&苦戦勝利ボイス
FTKR_ExBattleEvent.jsにより戦闘勝利時のコモンイベント内で呼び出す。
またこのプラグイン内のSoundManager.playActorVoiceでHPとMPによって再生するファイル名を分岐させた。
苦戦判定の場合は戦闘勝利ボイスのファイル名の最後に3を付け加える。そうじゃない場合は１か２。
このプラグインの「var _BattleManager_processVictory = BattleManager.processVictory;」が残っていると戦闘勝利時に爆音が鳴るので、無効化している。おそらく競合問題。

◆戦闘開始ボイス
<BattleStartVoice:filename> (start)というジャンルを新設。
戦闘開始時のコモンイベントで呼び出す。

*/


/*:
 * @plugindesc play voice SE at battle when actor does spcified action
 * @author Sasuke KANNAZUKI
 * 
 * @param pitch
 * @desc pitch of SEs. this setting is common among all voice SEs.
 * @default 100
 *
 * @param volume
 * @desc volume of SEs. this setting is common among all  voice SEs.
 * @default 90
 * 
 * @noteParam attackVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam recoverVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam friendMagicVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam magicVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam skillVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam damageVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam defeatedVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam victoryVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * note specification:
 * write down each actor's note at following format to set SE filename.
 * <attackVoice:filename>  plays when actor does normal attack.
 * <recoverVoice:filename>   plays when actor uses HP recovering magic.
 * <friendMagicVoice:filename> plays when actor spells magic for friend
 *  except HP recovering. if this is not set but <skillVoice:filename> is set,
 *   it plays <magicVoice:filename> setting file.
 * <magicVoice:filename>   plays when actor spells magic(except for friend).
 * <skillVoice:filename>   plays when actor uses special skill except magic.
 * <damageVoice:filename>    plays when actor takes damage.
 * <defeatedVoice:filename>   plays when actor is died.
 * <victoryVoice:filename>   plays when battle finishes.
 *  if plural actors attend the battle, randomly selected actor's SE is adopted.
 *
 */
/*:ja
 * @plugindesc アクターの戦闘時の行動にボイスSEを設定します。
 * @author 神無月サスケ
 * 
 * @param pitch
 * @desc ボイスSEのピッチです。この設定が全てのボイスSEの共通となります。
 * @default 100
 *
 * @param volume
 * @desc ボイスSEのボリュームです。この設定が全てのボイスSEの共通となります。
 * @default 90
 *
 * @noteParam attackVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam recoverVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam friendMagicVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam magicVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam skillVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam damageVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam defeatedVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 *
 * @noteParam victoryVoice
 * @noteRequire 1
 * @noteDir audio/se/
 * @noteType file
 * @noteData actors
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * メモ設定方法:
 * それぞれのアクターのメモに以下の書式で書いてください。
 * filename はボイスSEのファイル名にしてください。
 *
 * <attackVoice:filename>  通常攻撃の時に再生されるボイスです。
 * <recoverVoice:filename>   HP回復魔法を使用した時に再生されるボイスです。
 * <friendMagicVoice:filename>   HP回復以外の味方向け魔法を使用した時に
 *  再生されるボイスです。省略された場合で<magicVoice:filename>が
 *  設定されている場合は、そちらが再生されます。
 * <magicVoice:filename> 味方向け以外の魔法を使用した時に再生されるボイスです。
 * <skillVoice:filename>   必殺技を使用した時に再生されるボイスです。
 * <damageVoice:filename>    ダメージを受けた時に再生されるボイスです。
 * <defeatedVoice:filename>   戦闘不能になった時に再生されるボイスです。
 * <victoryVoice:filename>   戦闘勝利時に再生されるボイスです。
 *  アクターが複数いる場合は、生きているアクターの中からランダムで再生されます。
 *
 */
(function () {

    //乱数発生用
 //   const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);


  //
  // process parameters
  //
  var parameters = PluginManager.parameters('BattleVoice');
  var pitch = Number(parameters['pitch']) || 100;
  var volume = Number(parameters['volume']) || 90;

  AudioManager.createAudioByFileame = function(name){
    var audio = {};
    audio.name = name;
    audio.pitch = pitch;
    audio.volume = volume;
    return audio;
  };

///手動で100よりも大きな音を鳴らしたい時に使う
  AudioManager.createAudioByFileame2 = function (name,vo,muPitch) {
      if (muPitch == null) muPitch = 100;//指定しなかった場合はピッチは100
      var audio = {};
      audio.name = name;
      audio.pitch = muPitch;
      audio.volume = vo;
      return audio;
  };





  //
  // play actor voice
  //
  SoundManager.playActorVoice = function (actor, type,action = "") {
      if (actor == null) return;
      if ($gameSwitches.value(148) == false) return;//オプションでボイス無しにしている場合

      if(action != ""){
        if(action._item._itemId == 497) return;//「巡礼ミサイルお遍路さん」はボイスをコモンイベントで鳴らすので戦闘ボイスの対象外
        if(action._item._itemId == 483) return;//「アナスタシア」はボイスをコモンイベントで鳴らすので戦闘ボイスの対象外
        if(action._item._itemId == 481) return;//「女木鬼姫」はボイスをコモンイベントで鳴らすので戦闘ボイスの対象外
        if(action._item._itemId == 484) return;//「コモラーデ」はボイスをコモンイベントで鳴らすので戦闘ボイスの対象外
      }
    
   
    var name = '';
    switch(type){
      case 'attack':
          name = actor.meta.attackVoice;
          name += 1 + Math.floor(Math.random() * 3);
        break;
      case 'recover':
          name = actor.meta.recoverVoice;
          if ($gameSwitches.value(450) == true && actor.id == 1) {
            name += 3 + Math.floor(Math.random() * 2);
          }else{
            name += 1 + Math.floor(Math.random() * 2);
          }
        break;
      case 'friendmagic':
          name = actor.meta.friendMagicVoice || actor.meta.magicVoice;
          if ($gameSwitches.value(450)== true && actor.id == 1) {
            name += 3 + Math.floor(Math.random() * 2);
          }else{
            name += 1 + Math.floor(Math.random() * 2);
          }
        break;
      case 'magic':
          name = actor.meta.magicVoice;
          if ($gameSwitches.value(450)== true && actor.id == 1) {
            name += 3 + Math.floor(Math.random() * 2);
          }else{
            name += 1 + Math.floor(Math.random() * 2);
          }
        break;
      case 'skill':
          name = actor.meta.skillVoice;
          if ($gameSwitches.value(450)== true && actor.id == 1) {
            name += 3 + Math.floor(Math.random() * 2);
          }else{
            name += 1 + Math.floor(Math.random() * 2);
          }
        break;
      case 'damage':
          name = actor.meta.damageVoice;
          name += 1 + Math.floor(Math.random() * 2);
        break;
      case 'dead':
          name = actor.meta.defeatedVoice;
          name += 1 + Math.floor(Math.random() * 1);
        break;
      case 'victory':
          name = actor.meta.victoryVoice;

          //戦闘メンバーの誰かがVP0または、HP1以下の場合は戦闘ボイス３を再生。それ以外は戦闘ボイス１または２を再生。
          var i = 0;
          $gameParty.battleMembers().forEach(function (value) {
              if (value.mp == 0) { i += 1; }
              if (value.hp <= 1) { i += 1; }
          });
          if (i > 0) {
              if ($gameSwitches.value(450)== true && actor.id == 1) {
                name += 6;
              }else{
                name += 3;
              }  
                
          } else {
              if ($gameSwitches.value(450)== true && actor.id == 1) {
                name += 4 + Math.floor(Math.random() * 2);
              }else{
                name += 1 + Math.floor(Math.random() * 2);
              }  
          }
          break;

        case 'vp':
          name = actor.meta.vpDamageVoice;
          name += 1 + Math.floor(Math.random() * 2);
          break;
      case 'start':
          name = actor.meta.BattleStartVoice;
          if ($gameSwitches.value(450) == true&& actor.id == 1) {
            name += 4 + Math.floor(Math.random() * 3);
          }else{
            name += 1 + Math.floor(Math.random() * 3);
          } 
          
          break;
    }



    if(action != ""){
      if(actor.id == 1){
        switch(action._item._itemId){
          case 14://ソニックエッジ
            name = "vo_ov_sp1"
            break;
          case 16://フラッシュスラスト
            name = "vo_ov_sp2"
            break;
          case 209://ホーリースマッシュ
            name = "vo_ov_sp3"
            break;
          case 210://クイックドライブ
            name = "vo_ov_sp4"
            break;
          case 297://レピッドブレードダンス
            name = "vo_ov_sp5_a"
            break;
          case 298://バーサクラッシュ
            name = "vo_ov_sp6"
            break;
          case 215://渾身のお歌
            name = "vo_ov_sp7short"
            break;
        }
      }
    }
    


    if(name){
      var audio = AudioManager.createAudioByFileame(name);
      AudioManager.playSe(audio);
    }
  };

  //
  // functions for call actor voice.
  //
  var _Game_Actor_performAction = Game_Actor.prototype.performAction;
  Game_Actor.prototype.performAction = function(action) {
      _Game_Actor_performAction.call(this, action);
    if (action.isAttack()) {
      SoundManager.playActorVoice(this.actor(), 'attack');
    } else if (action.isHpRecover()) {//action.isMagicSkill() && 
      SoundManager.playActorVoice(this.actor(), 'recover');
    } else if (action.isForFriend() && !action.isGuard()) {//action.isMagicSkill() &&    さらに防御じゃない条件を追加
      SoundManager.playActorVoice(this.actor(), 'friendmagic');
    } else if (action.isMagicSkill()) {
      SoundManager.playActorVoice(this.actor(), 'magic');
    } else if (action.isSkill() && !action.isGuard()) {
      SoundManager.playActorVoice(this.actor(), 'skill',action);
    }
  };

  var _Game_Actor_performDamage = Game_Actor.prototype.performDamage;
  Game_Actor.prototype.performDamage = function() {
      _Game_Actor_performDamage.call(this);
    SoundManager.playActorVoice(this.actor(), 'damage');
  };

  var _Game_Actor_performCollapse = Game_Actor.prototype.performCollapse;
  Game_Actor.prototype.performCollapse = function() {
    _Game_Actor_performCollapse.call(this);
    if ($gameParty.inBattle()) {
      SoundManager.playActorVoice(this.actor(), 'dead');
    }
  };

    ////競合問題か多重再生されるので無効化
  /*
  var _BattleManager_processVictory = BattleManager.processVictory;
  BattleManager.processVictory = function() {
    var index = Math.randomInt($gameParty.aliveMembers().length);
    var actor = $gameParty.aliveMembers()[index].actor();
    SoundManager.playActorVoice(actor, 'victory');
    _BattleManager_processVictory.call(this);
  };
  */
})();
