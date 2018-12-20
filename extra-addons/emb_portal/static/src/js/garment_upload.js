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

    var GARMENT_COLOR_KEY = 'GM_COLOR';
    var POSITION = ['right', 'left', 'back', 'front', 'top', 'bottom'];

    uploadManager.prototype = {
        init: function (msg) {
            console.log("Garment upload window initilized " + msg);
            this._getCategoryList();
            this._getBrandList();
            this._bindColorPickerEvent();
            this._getSizeAttrs();
            this._bindImageUploadEvents();
            // this._bindSubmitEvents();
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
        // 01. setup categories
        _getCategoryList: function () {
            var self = this;
            var args = [
                [],
                ['id', 'name']
            ];
            rpc.query({
                model: 'product.category',
                method: 'search_read',
                args: args
            }).then(function (returned_value) {
                self._setCategoryData(returned_value);
            });
        },
        _setCategoryData: function (_data) {
            var eleCategory = this._getCategoryEle();
            for (var key in _data) {
                var option = _data[key];
                var newOption = new Option(option.name, option.id, false, false);
                eleCategory.append(newOption);
            }
            eleCategory.select2();
            eleCategory.trigger('change');
        },
        // 02. Bind color events
        _bindColorPickerEvent: function () {
            var container = this._getGmtColorsEle();
            // init container
            container.children().each(function (item) {
                $(this).on("click", function () {
                    $(this).remove();
                });
            });
            var self = this;
            rpc.query({
                route: '/portal/color_list',
                params: []
            }).then(function (returned_value) {
                if (_.isEmpty(returned_value)) {
                    return false;
                }
                console.log(returned_value);
                self._setupSpectrum(returned_value,container);
            });
        },
        _setupSpectrum: function (_data,container) {
            var picker = this._getColorPickerEle();
            /**
             * Initized picker events
             */
            var colors = _data.map(function(item){
                return item.name;
            });
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
                palette: colors,
                change: function (color) {
                    console.log(color)
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
        // 03. Get brand list
        _getBrandList: function () {
            $('.typeahead').typeahead({
                items: 5,
                minLength: 3,
                delay: 10,
                source: function (query, process) {
                    rpc.query({
                        model: 'product.garment.brand',
                        method: 'search_read',
                        args: [
                            [],
                            ['name']
                        ]
                    }).then(function (returned_value) {
                        process(returned_value);
                    });
                }
            });
        },
        // 04. Set size template
        _getSizeAttrs: function () {
            var self = this;
            rpc.query({
                route: '/portal/size_template',
                params: []
            }).then(function (returned_value) {
                if (_.isEmpty(returned_value)) {
                    return false;
                }
                console.log(returned_value);
                self._fetchSizeAttributes(returned_value);
            });
        },
        _fetchSizeAttributes: function (_data) {
            var eleSizeTpl = this._getSizeTplEle();
            var attrs = this._getSizeAttrsEle();
            var sizeTpl = Object.keys(_data);
            for (var key in sizeTpl) {
                var option = sizeTpl[key];
                var newOption = new Option(option, option, false, false);
                eleSizeTpl.append(newOption);
            }
            eleSizeTpl.select2({ minimumResultsForSearch: -1 });
            eleSizeTpl.on('change', function (e) {
                attrs.html('');
                var id = $(this).val();
                var attrData = _data[id];
                for (var i in attrData) {
                    var v = attrData[i];
                    var p = $('<div>').attr('class', 'col-sm-2');
                    var l = $('<label>').attr('class', 'checkbox-inline');
                    var cb = $('<input>').attr('type', 'checkbox');
                    var v = attrData[i];
                    cb.val(v.id);
                    l.text(v.text);
                    p.append(cb).append(l);
                    attrs.append(p);
                }
            });
            eleSizeTpl.trigger('change');
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
        _getCategoryEle: function () {
            return $("#gmt-category");
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