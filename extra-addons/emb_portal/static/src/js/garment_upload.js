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

    function GmManager() {};

    function UploadManager() {};

    var localStorage = require('web.local_storage');
    var session = require('web.session');
    var GARMENT_COLOR_KEY = 'GM_COLOR';
    var POSITION = ['right', 'left', 'back', 'front', 'top', 'bottom'];

    $.blockUI.defaults.overlayCSS = {
        opacity: .1,
        'background-color': '#000'
    };

    GmManager.prototype = {
        uploadModelWin: function () {
            return new UploadManager();
        },
        actbuttons: function () {
            return "<div class='asset-garment-act'><button type='button' class='btn select' data-toggle='button' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span>select</button><button type='button' class='btn remove' data-toggle='button' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-minus' aria-hidden='true'></span>remove</button></div>";
        },
        startup: function (uploadWin) {
            this.loadGarmentList();
        },
        loadGarmentList: function () {
            var self = this;
            var args = [
                [],
                ['id', 'design_template', 'image_ids']
            ];
            self._blockingUi();
            rpc.query({
                model: 'product.garment',
                method: 'search_read',
                args: args
            }).then(function (returned_value) {
                console.log(returned_value);
                self._refreshGarmentsData(returned_value);
            });
        },
        _refreshGarmentsData: function (_data) {
            var self = this;
            if (_.isEmpty(_data)) {
                $.notify({
                    title: "No Data",
                    message: "No garment data retrieved!"
                });
                this._unBlockUi();
                return false;
            }
            localStorage.setItem('garment_list', JSON.stringify(_data));
            var parentBox = this._getGarmentListEle();
            parentBox.html('');
            for (var i in _data) {
                var item = _data[i];
                var image_ids = item.image_ids;
                var id = item.id;
                var itemHolder = $("<div>").attr('id', 'gm-album-' + id).addClass('assets-group');
                itemHolder.attr('data-ids', image_ids);
                itemHolder.attr('data-id', id);
                parentBox.append(itemHolder);
            }
            $('.assets-group').each(function (item) {
                var ids = $(this).attr('data-ids');
                var id = $(this).attr('data-id');
                if (id != undefined && ids != undefined) {
                    ids = ids.split(',');
                    self._getGmImages(id, ids);
                }
            });
        },
        _getGmImages: function (id, image_ids) {
            var self = this;
            var args = [
                [
                    ['id', 'in', image_ids]
                ],
                ['id', 'name', 'image', 'content_type']
            ];
            rpc.query({
                model: 'product.garment.image',
                method: 'search_read',
                args: args
            }).then(function (returned_value) {
                self._appendGmImages(id, returned_value);
            });
        },
        _appendGmImages: function (id, _data) {
            var self = this;
            if (_.isEmpty(_data)) {
                return false;
            }
            var itemHolder = $('#gm-album-' + id);
            for (var i in _data) {
                var item = _data[i];
                var imgData = 'data:' + item.content_type + ';base64,' + item.image;
                var alink = $('<a>').attr('href', '#');
                var img = $('<img>').attr('width', 80).attr('src', imgData).attr('data-id', item.id).attr('data-name', item.name);
                alink.append(img);
                itemHolder.append(alink);
            }
            var actbuttons = self.actbuttons();
            itemHolder.append(actbuttons);
            var editingHolderId = $('#garment-list').attr('data-edit-id');
            var editModeofCon = $('#garment-list').attr('data-edit-mode');
            if (editingHolderId == id && Boolean(editModeofCon)) {
                self._setEditableMode(itemHolder);
                self._setHolderEditMode(id, itemHolder);
            }
            itemHolder.mouseenter(function (item) {
                self._setEditableMode($(this));
            }).mouseleave(function (item) {
                self._setReadableMode($(this));
            });
        },
        _setEditableMode: function (holder) {
            var self = this;
            var itemId = holder.attr('id');
            var id = holder.attr('data-id');
            holder.find('.asset-garment-act').slideDown();
            holder.css('border-bottom', '2px solid #4A90E2').css('cursor', 'pointer');
            holder.find('.remove').click(function (e) {
                var self = this;
                rpc.query({
                    route: '/portal/remove_garment',
                    params: {
                        id: id
                    }
                }).then(function (returned_value) {
                    if (returned_value) {
                        holder.slideUp(1000);
                        $.notify({
                            title: "Garment removed",
                            message: "Garment data has been uploaded successfully."
                        });
                    }
                });
            });
            holder.find('.select').click(function (e) {
                var state = $(this).text();
                var actbuttons = self.actbuttons();
                if (state == 'cancel') {
                    holder.find('.asset-garment-act').remove();
                    holder.append(actbuttons).show();
                    $('#garment-list').removeAttr('data-edit-mode');
                    $('#garment-list').removeAttr('data-edit-id');
                    return false;
                }
                // clear other states
                $('#garment-list').find('.assets-group').each(function (item) {
                    if ($(this).attr('id') != itemId) {
                        $(this).find('.asset-garment-act').removeClass('fixed');
                        $(this).find('.asset-garment-act').slideUp();
                        $(this).css('border-bottom', '2px solid #D8D8D8');
                        $(this).attr('data-edit-mode', false);
                        $(this).find('.asset-garment-act').remove();
                        $(this).append(actbuttons).show();
                    }
                });
                // set current states
                self._setHolderEditMode(id, holder);
                //self.selectCurrentGarment(itemId);
            });
        },
        _setReadableMode: function (holder) {
            holder.find('.remove').unbind('click');
            holder.find('.select').unbind("click");
            if (holder.attr('data-edit-mode') == undefined || holder.attr('data-edit-mode') == 'false') {
                holder.find('.asset-garment-act').slideUp();
                holder.css('border-bottom', '2px solid #D8D8D8').css('cursor', 'none');
            }
        },
        _setHolderEditMode: function (id, holder) {
            var self = this;
            holder.find('.select').html("<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>cancel");
            holder.find('.remove').hide();
            holder.find('.asset-garment-act').addClass('fixed');
            holder.find('.asset-garment-act').append("<button type='button' class='btn update' data-toggle='button' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-cog' aria-hidden='true'></span>update</button>");
            $('#garment-list').attr('data-edit-mode', true);
            $('#garment-list').attr('data-edit-id', id);
            holder.css('border-bottom', '2px solid #4A90E2');
            holder.attr('data-edit-mode', true);
            holder.find('.update').click(function (e) {
                self._updateGmtInfo(id);
            });
            self._displayGmtInfo(id);
        },
        _displayGmtInfo: function (id) {
            var cachedItems = localStorage.getItem('garment_list');
            if (cachedItems == undefined || id == null) {
                return false;
            }
            var cachedObjects = JSON.parse(cachedItems);
            var gmtDetailObj = null;
            for (var i in cachedObjects) {
                var obj = cachedObjects[i];
                if (obj.id == parseInt(id)) {
                    gmtDetailObj = obj;
                    break;
                }
            }
            var gmtDetailInfo = JSON.parse(gmtDetailObj.design_template);
            if (gmtDetailObj == null || gmtDetailInfo == undefined) {
                return false;
            }
            console.log(gmtDetailObj);
            $('#gmt-info-name').html(gmtDetailInfo.name);
            // display colors
            var colors = gmtDetailInfo.colors;
            var colors_con = $('#gmt-info-colors');
            colors_con.html('');
            colors.forEach(function (item) {
                var colorBlock = $('<span>').css("width", "40px").css("height", "40px").css("background", item);
                colorBlock.css("display", "inline-block").css("margin", "0 6px");
                colors_con.append(colorBlock);
            });
            // 
            $('#gmt-info-size-type').html('Garment Type:' + gmtDetailInfo.size_tpl);
            $('#gmt-info-supply-select').select2().trigger('change');
            rpc.query({
                route: '/portal/size_template',
                params: [
                    ids: gmtDetailInfo.sizes
                ]
            }).then(function (returned_value) {
                if (_.isEmpty(returned_value)) {
                    return false;
                }
                console.log(returned_value);
            });
        },
        _updateGmtInfo: function (id) {
            var itemIds = JSON.parse(localStorage.getItem('garment_list'));
            var selectData = null;
            for (var i in itemIds) {
                var data = itemIds[i];
                if (data.id == parseInt(id)) {
                    selectData = data;
                    break;
                }
            }
            if (selectData) {
                var curImageCon = $('#gm-album-' + id);
                var images = curImageCon.find('img').map(function (item) {
                    var pos = $(this).attr('data-name');
                    var value = this.src;
                    return {
                        [pos]: value
                    };
                });
                this.uploadModelWin()._preInputGmtInfo(selectData, images);
            }
        },
        _getGarmentListEle: function () {
            return $("#garment-list");
        },
        _blockingUi: function () {
            var gmlist = this._getGarmentListEle();
            $("#garment-list").block({
                message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                css: {
                    border: 'none',
                    left: '90%',
                    width: '96%',
                    background: 'transparent'
                }
            });
        },
        _unBlockUi: function () {
            var gmlist = this._getGarmentListEle();
            gmlist.unblock();
        },
    };
    UploadManager.prototype = {
        init: function () {
            console.log("Garment upload window initilized");
            this._getCategoryList();
            this._getBrandList();
            this._bindColorPickerEvent();
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
                self._clearUpInputs();
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
            self._blockingUi();
            // get images data
            var imageMap = {};
            $('.upload-link').each(function (item) {
                var holder = $(this);
                var pos = holder.attr('data-tag');
                var img = holder.find('img');
                if (img != null) {
                    var data = $(img).attr('src');
                    if (data != null) {
                        var trimData = data.substr(data.indexOf(',') + 1);
                        var contentType = self._base64MimeType(data);
                        imageMap[pos] = {
                            'data': trimData,
                            'type': contentType
                        };
                    }
                }
            });
            if (_.isEmpty(imageMap)) {
                this._imgUploadFailed();
                return false;
            }
            // get colors
            var colors = $("input[name='colors[]']").map(function () {
                return $(this).val();
            }).get();
            console.log(colors);
            // get size attributes
            var size_tpl = $('#gmt-size-tpl').val();
            var sizeAttrs = [];
            $('#size-attrs').find('input').each(function (item) {
                if ($(this).is(':checked')) {
                    sizeAttrs.push($(this).val());
                }
            });
            var post_name = $('#gmt-brand').val().trim();
            var post_style = $('#gmt-style').val().trim();
            var post_categ = $('#gmt-category').val();
            var post_brand = $('#gmt-brand').val().trim();
            var post_images = imageMap;
            var post_sizes = sizeAttrs;
            var post_desc = $('#gmt-desc').val().trim();
            var gmt_id = $('#gmt-id').val();
            var cachedPostData = {};
            cachedPostData.name = post_name;
            cachedPostData.style = post_style;
            cachedPostData.category_id = post_categ;
            cachedPostData.brand = post_brand;
            cachedPostData.images = post_images;
            cachedPostData.colors = colors;
            cachedPostData.size_tpl = size_tpl;
            cachedPostData.sizes = post_sizes;
            cachedPostData.desc = post_desc;
            cachedPostData.gmt_id = gmt_id;
            var postUrl = '/portal/garments/create';
            var debugStr = session.debug ? '?debug=true' : '';
            ajax.jsonRpc(postUrl + debugStr, 'call', cachedPostData).always(function () {
                if ($.blockUI) {
                    $.unblockUI();
                }
            }).done(function (data) {
                self._clearUpInputs();
                setTimeout(function () {
                    $('#gmt-upload-modal').modal('toggle');
                    $.notify({
                        title: "Data Saved",
                        message: "Garment data has been uploaded successfully."
                    });
                }, 2000);
                GmManager.prototype.loadGarmentList();
            }).fail(function () {
                setTimeout(function () {
                    $.notify({
                        title: "Data Is Not Saved",
                        message: "Failed to save your data,please try again"
                    });
                }, 3000);
                self._updateLocalData(false);
            });
        },
        _clearUpInputs: function () {
            this._unBlockUi();
            $('#gmt-id').val('');
            $('#gmt-category').select2('val', '');
            $('#gmt-size-tpl').select2('val', '');
            $('#gmt-style').val('');
            $('#gmt-name').val('');
            $('#gmt-brand').val('');
            $('.upload-link').each(function (item) {
                $(this).addClass('glyphicon glyphicon-open').attr('style', 'top:20px');
                this.innerHTML = '';
                var tag = $(this).attr('data-tag');
                $('#gmt-img-' + tag).val('');
                $('#gmt-r-' + tag).removeClass('glyphicon glyphicon-trash');
            });

            $('#gmt-colors').html('');
            $('#size-attrs').find('input').each(function (item) {
                if ($(this).is(':checked')) {
                    $(this).attr("checked", false);
                }
            });
            $('#gmt-desc').val('');
        },
        _updateLocalData: function (_data) {
            if (_data == false) {
                return localStorage.removeItem('garment_data');
            }
            localStorage.setItem('garment_data', JSON.stringify(_data));
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
                self._setupSpectrum(returned_value, container);
            });
        },
        _setupSpectrum: function (_data, container) {
            var picker = this._getColorPickerEle();
            /**
             * Initized picker events
             */
            var colors = _data.map(function (item) {
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
            eleSizeTpl.select2({
                minimumResultsForSearch: -1
            });
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
        _preInputGmtInfo: function (_data, _images) {
            var id = _data['id'];
            console.log(_data);
            var gmt_info = JSON.parse(_data['design_template']);
            $('#gmt-id').val(id);
            $('#gmt-category').select2('val', gmt_info.category_id);
            $('#gmt-size-tpl').select2('val', gmt_info.size_tpl);
            $('#gmt-style').val(gmt_info.style);
            $('#gmt-name').val(gmt_info.name);
            $('#gmt-brand').val(gmt_info.brand);
            // images
            var poss = {};
            _images.each(function (i) {
                poss = $.extend(poss, _images[i]);
            });
            $('.upload-link').each(function (item) {
                $(this).removeClass('glyphicon glyphicon-open').attr('style', 'top:0');
                var tag = $(this).attr('data-tag');
                if (poss[tag]) {
                    var img = $('<img>').attr('src', poss[tag]).attr('width', 60).attr('height', 60);
                    $(this).html(img);
                    $('#gmt-r-' + tag).addClass('glyphicon glyphicon-trash').show();
                }
            });
            var colors = gmt_info.colors;
            var colors_con = $('#gmt-colors');
            colors_con.html('');
            colors.forEach(function (item) {
                var colorBlock = $('<span>').css("width", "40px").css("height", "40px").css("background", item);
                colorBlock.css("display", "inline-block").css("margin", "0 6px");
                var inputNode = $("<input>").attr("name", "colors[]").attr("type", "hidden").val(item);
                colorBlock.append(inputNode);
                colors_con.show().append(colorBlock);
                colorBlock.on("click", function () {
                    $(this).remove();
                });
            });
            // set size tpl 
            var sizes = gmt_info.sizes;
            var size_tpl = gmt_info.size_tpl;
            $('#gmt-size-tpl').select2('val', size_tpl).trigger('change');
            $('#size-attrs').find('input').each(function (item) {
                if (sizes.indexOf($(this).val()) > -1) {
                    $(this).attr("checked", true);
                }
            });
            $('#gmt-desc').val(gmt_info.description);
            $('#gmt-upload-modal').modal('toggle');
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
            $("#gmt-upload").unblock();
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
        _base64MimeType: function (encoded) {
            var result = false;
            if (typeof encoded !== 'string') {
                return result;
            }
            var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (mime && mime.length) {
                result = mime[1];
            }
            return result;
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
        var garmentManager = new GmManager();
        var uploadModelWin = new UploadManager();
        garmentManager.startup(uploadModelWin);
        uploadModelWin.init();

        var upload_window = $('gmt-upload-modal');
        if (!upload_window.length) {
            return $.Deferred().reject("DOM doesn't contain garment_upload elements");
        }
        console.log("content loaded");
        console.log("document ready from garments_upload");
    });
});