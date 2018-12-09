/**
 * Garment upload module
 * By mike.a.zhang@gmail.com
 * +8616604114500(china)
 * Github account: rmrfself
 */
odoo.define("emb_portal.garment_upload", function (require) {
    "use strict";

    var rpc = require('web.rpc');

    function uploadManager() {}

    uploadManager.prototype = {
        init: function (msg) {
            console.log("Garment upload window initilized " + msg);
            this._bindColorPickerEvent();
            this._getCategoryList();
            this._getSizeAttrs();
            this._bindImageUploadEvents();
        },
        _bindColorPickerEvent: function () {
            var picker = this._getColorPickerEle();
            var container = this._getGmtColorsEle();
            container.empty();
            /**
             * Initized picker events
             */
            picker.spectrum({
                showPaletteOnly: true,
                togglePaletteOnly: true,
                togglePaletteMoreText: 'more',
                togglePaletteLessText: 'less',
                hideAfterPaletteSelect: true,
                preferredFormat: "hex",
                color: 'blanchedalmond',
                showInput: true,
                showAlpha: true,
                palette: [
                    ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                    ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                    ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                    ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                    ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                    ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                    ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                    ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                ],
                change: function (color) {
                    var colorBlock = $('<span>').css("width", "40px").css("height", "40px").css("background", color.toHexString());
                    colorBlock.css("display", "inline-block").css("margin", "0 6px");
                    var inputNode = $("<input>").attr("name", "colors[]").attr("type", "hidden").val(color.toHexString());
                    colorBlock.append(inputNode);
                    container.show().append(colorBlock);
                    colorBlock.on("click", function () {
                        $(this).remove();
                    });
                }
            });
        },
        _bindImageUploadEvents: function () {
            var self = this;
            var p = ['right', 'left', 'back', 'front', 'top', 'bottom'];
            p.map(function (item) {
                $('#gmt-link-' + item).click(function (e) {
                    $('#gmt-img-' + item).click();
                });
                $('#gmt-img-' + item).on('change', function (e) {
                    self._gmtImgPreview(this, $('#gmt-link-' + item));
                });
            });
        },
        _gmtImgPreview: function (input, placeToInsertImagePreview) {
            if (input.files) {
                var filesAmount = input.files.length;
                for (var i = 0; i < filesAmount; i++) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        $($.parseHTML('<img>')).attr('src', event.target.result).attr('width', '60').attr('height', '60').appendTo(placeToInsertImagePreview);
                    }
                    reader.readAsDataURL(input.files[i]);
                    placeToInsertImagePreview.css('top',0);
                    placeToInsertImagePreview.removeClass('glyphicon-open').removeClass('glyphicon');
                }
            }
        },
        _getCategoryList: function () {
            var self = this;
            rpc.query({
                model: 'product.category',
                method: 'public_categories',
            }).then(function (returned_value) {
                console.log(returned_value);
                self._setCategoryAndStyleData(returned_value);
            });
        },
        _getSizeAttrs: function () {
            var self = this;
            var args = [
                [
                    ['name', 'in', ['Size Of Us', 'Size Of Europe']]
                ],
                ['name', 'id', 'value_ids'],
            ];
            rpc.query({
                model: 'product.attribute',
                method: 'search_read',
                args: args
            }).then(function (returned_value) {
                self._setSizeAttributes(returned_value);
            });
        },
        _setCategoryAndStyle: function (_data) {},
        _setCategoryAndStyleData: function (_data) {
            var eleCategory = this._getCategoryEle();
            var eleStyle = this._getStyleEle();
            for (var key in _data) {
                var option = _data[key];
                var newOption = new Option(option.name, option.id, false, false);
                eleCategory.append(newOption);
            }
            eleCategory.select2();
            eleStyle.select2();
            eleCategory.on('change', function (e) {
                eleStyle.html('');
                var id = $(this).val();
                var styleData = _data.filter(function (item) {
                    return item.id == id;
                });
                if (styleData.length > 0) {
                    var s = JSON.parse(styleData[0].child_id_with_name);
                    for (var j in s) {
                        var sp = s[j];
                        var sOption = new Option(sp[1], sp[0], false, false);
                        eleStyle.append(sOption);
                    }
                    eleStyle.trigger('change');
                }
            });
            eleCategory.trigger('change');
        },
        _setSizeAttributes: function (_data) {
            var eleSizeTpl = this._getSizeTplEle();
            var attrs = this._getSizeAttrsEle();
            for (var key in _data) {
                var option = _data[key];
                var newOption = new Option(option.name, option.id, false, false);
                eleSizeTpl.append(newOption);
            }
            eleSizeTpl.select2();
            var self = this;
            eleSizeTpl.on('change', function (e) {
                attrs.html('');
                var id = $(this).val();
                var attrData = _data.filter(function (item) {
                    return item.id == id;
                });
                if (attrData.length > 0) {
                    var s = attrData[0].value_ids;
                    // get Ids from rpc
                    var args = [
                        [
                            ['id', 'in', s]
                        ],
                        ['name', 'id'],
                    ];
                    rpc.query({
                        model: 'product.attribute.value',
                        method: 'search_read',
                        args: args
                    }).then(function (returned_value) {
                        self._fillSizeAttrs(returned_value);
                    });
                }
            });
            eleSizeTpl.trigger('change');
        },
        _fillSizeAttrs: function (_data) {
            var attrs = this._getSizeAttrsEle();
            for (var i in _data) {
                var p = $('<div>').attr('class', 'col-sm-2');
                var l = $('<label>').attr('class', 'checkbox-inline');
                var cb = $('<input>').attr('type', 'checkbox');
                var v = _data[i];
                cb.val(v.id);
                l.text(v.name);
                p.append(cb).append(l);
                attrs.append(p);
            }
        },
        _getCategoryEle: function () {
            return $("#gmt-category");
        },
        _getStyleEle: function () {
            return $("#gmt-style");
        },
        _getBrandEle: function () {
            return $("#gmt-brand");
        },
        _getColorPickerEle: function () {
            return $('#gmt-color-picker');
        },
        _getGmtColorsEle: function () {
            return $('#gmt-colors');
        },
        _getSizeTplEle: function () {
            return $('#gmt-size-tpl');
        },
        _getSizeAttrsEle: function () {
            return $('#size-attrs');
        }
    };

    $(document).ready(function () {
        var garmentManager = new uploadManager();
        garmentManager.init("over");

        var upload_window = $('gmt-upload-modal');
        if (!upload_window.length) {
            return $.Deferred().reject("DOM doesn't contain garment_upload elements");
        }
        console.log("content loaded");
        console.log("document ready from garments_upload");
    });
});