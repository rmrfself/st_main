/**
 * Garment upload module
 * By mike.a.zhang@gmail.com
 * +8616604114500(china)
 * Github account: rmrfself
 */
odoo.define("emb_portal.garment_upload", function (require) {
    "use strict";

    var rpc = require('web.rpc');
    var ajax = require('web.ajax');

    function uploadManager() {}

    var POSITION = ['right', 'left', 'back', 'front', 'top', 'bottom'];

    uploadManager.prototype = {
        init: function (msg) {
            console.log("Garment upload window initilized " + msg);
            this._bindColorPickerEvent();
            this._getCategoryList();
            this._getBrandList();
            this._getSizeAttrs();
            this._bindImageUploadEvents();
            this._bindSubmitEvents();
        },
        _bindSubmitEvents: function () {
            var self = this;
            $('#gmt-submit-btn').click(function (e) {
                self._postGmtData();
            });
            $('#gmt-cancel-btn').click(function (e) {
                $('#gmt-upload-modal').modal('toggle');
            });
        },
        _blockingUi: function () {
            $("#gmt-upload").block({
                message: $('#gmt-upload-loader'),
                css: {
                    border: 'none',
                    left: '90%',
                    width: '96%',
                    background: 'transparent'
                }
            });
        },
        _unBlockUi: function () {
            $("#gmt-upload").unblockUI();
        },
        _postGmtData: function () {
            var self = this;
            // If input is invalid, then show failed message.
            if (self._doValidation()) {
                return false;
                // $.notify({
                //     title: "Failed:",
                //     message: "This plugin has been provided to you by Robert McIntosh aka mouse0270"
                // });
            }
            // get images data
            var imageMap = {};
            $('.upload-link').each(function (item) {
                var holder = $(this);
                var pos = holder.attr('data-tag');
                var img = holder.find('img');
                if (img != null) {
                    var data = $(img).attr('src');
                    imageMap[pos] = data;
                }
            });
            if (_.isEmpty(imageMap)) {
                this._imgUploadFailed();
                return false;
            }
            console.log("ImageMap data is:");
            console.log(imageMap);
            // get size attributes
            var sizeAttrs = [];
            $('#size-attrs').find('input').each(function (item) {
                if ($(this).is(':checked')) {
                    sizeAttrs.push($(this).val());
                }
            });
            ajax.jsonRpc("/portal/garments/create", 'call', {
                name: $('#gmt-brand').val().trim(),
                category_id: $('#gmt-category').val(),
                style_ids: $('#gmt-style').val(),
                brand: $('#gmt-brand').val().trim(),
                images: imageMap,
                sizes: sizeAttrs,
                desc: $('#gmt-desc').val().trim(),
            }).always(function () {
                if ($.blockUI) {
                    $.unblockUI();
                }
            }).done(function (data) {

            }).fail(function () {

            });
        },
        _doValidation: function () {
            var invalidInput = false;
            // Validate branch name
            var eleBn = $('#gmt-brand');
            var brandName = eleBn.val().trim();
            var nameRule = /^[A-Za-z0-9@_-]+$/;
            if (brandName == '' || !nameRule.test(brandName)) {
                this._brandSetFailed();
                invalidInput = true;
            }
            // upload image vaidate
            var emptyImage = false;
            $('.upload-link').each(function (item) {
                if (this.innerHTML != '') {
                    emptyImage = true;
                }
            });
            if (!emptyImage) {
                this._imgUploadFailed();
                invalidInput = true;
            }
            // validate garment color
            var gmtColors = $('#gmt-colors');
            if (gmtColors.children().length == 0) {
                this._colorsSetFailed();
                invalidInput = true;
            }
            // validate site attr
            var emptyChecked = false;
            $('#size-attrs').find('input').each(function (item) {
                if ($(this).is(':checked')) {
                    emptyChecked = true;
                }
            });
            if (!emptyChecked) {
                this._sizeSetFailed();
                invalidInput = true;
            }
            // validate description
            var desc = $('#gmt-desc').val();
            if ((/^\s*$/).test(desc)) {
                this._descEmptyMessage();
                invalidInput = true;
            }
            return invalidInput;
        },
        _bindColorPickerEvent: function () {
            var picker = this._getColorPickerEle();
            var container = this._getGmtColorsEle();
            // init container
            container.children().each(function (item) {
                $(this).on("click", function () {
                    $(this).remove();
                });
            });
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
        _descEmptyMessage: function () {
            $('#gmt-desc').qtip({
                content: {
                    text: 'Please input some description.'
                },
                position: {
                    my: 'bottom center',
                    at: 'top center',
                },
                show: {
                    event: false
                }
            }).qtip('show');
        },
        _brandSetFailed: function () {
            $('#gmt-brand').qtip({
                content: {
                    text: 'Please input valid name'
                },
                position: {
                    my: 'top center',
                    at: 'bottom center',
                },
                show: {
                    event: false
                }
            }).qtip('show');
        },
        _imgUploadFailed: function () {
            $('.upload-link').first().qtip({
                content: {
                    text: 'At least one image.'
                },
                position: {
                    my: 'top center',
                    at: 'bottom center',
                },
                show: {
                    event: false
                }
            }).qtip('show');
        },
        _colorsSetFailed: function () {
            $('#gmt-color-picker').first().qtip({
                content: {
                    text: 'please choose your color.'
                },
                position: {
                    my: 'top center',
                    at: 'bottom center',
                },
                show: {
                    event: false
                },
                hide: {
                    delay: 1000
                }
            }).qtip('show');
        },
        _sizeSetFailed: function () {
            $('#size-attrs').find('input').first().qtip({
                content: {
                    text: 'At least one size value specified.'
                },
                position: {
                    my: 'top center',
                    at: 'bottom center',
                },
                show: {
                    event: false
                }
            }).qtip('show');
        },
        _bindImageUploadEvents: function () {
            var self = this;
            var p = ['right', 'left', 'back', 'front', 'top', 'bottom'];
            p.map(function (item) {
                $('#gmt-link-' + item).click(function (e) {
                    $('#gmt-img-' + item).click();
                });
                $('#gmt-r-' + item).click(function (e) {
                    $('#gmt-link-' + item).children().each(function (item) {
                        $(this).remove();
                    });
                    $('#gmt-link-' + item).attr('class', 'glyphicon glyphicon-open upload-link').attr('style', 'top:20px');
                    $('#gmt-r-' + item).css('display', 'none');
                    $('#gmt-img-' + item).val('');
                });
                $('#gmt-img-' + item).on('change', function (e) {
                    if ($(this).val() == '') {
                        self._imgUploadFailed();
                        return false;
                    }
                    $('#gmt-r-' + item).css('display', 'inline');
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
                    placeToInsertImagePreview.css('top', 0);
                    placeToInsertImagePreview.removeClass('glyphicon-open').removeClass('glyphicon');
                }
            }
        },
        _getBrandList: function () {
            var self = this;
            rpc.query({
                model: 'product.attribute',
                method: 'public_brands',
            }).then(function (returned_value) {
                console.log(returned_value);
                self._setBrandData(returned_value);
            });
        },
        _setBrandData: function (data) {
            var brandEle = this._getBrandEle();
            if (_.isEmpty(data)) {
                return false;
            }
            var selectData = data.map(function (item) {
                return {
                    id: item.id,
                    text: item.name
                };
            });
            brandEle.select2({
                createSearchChoice: function (term, data) {
                    if ($(data).filter(function () {
                            return this.text.localeCompare(term) === 0;
                        }).length === 0) {
                        return {
                            id: 0,
                            text: term
                        };
                    }
                },
                multiple: false,
                data: selectData
            });
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