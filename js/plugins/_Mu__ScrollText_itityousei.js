



(function () {

    Window_ScrollText.prototype.initialize = function() {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        Window_Base.prototype.initialize.call(this, 160, 0, width, height);////
        this.opacity = 0;
        this.hide();
        this._text = '';
        this._allTextHeight = 0;
    };


})();
