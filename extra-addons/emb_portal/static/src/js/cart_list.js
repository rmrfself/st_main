odoo.define('emb_portal.cart_list', function (require) {
    'use strict';

    var rpc = require("web.rpc");
    var ajax = require('web.ajax');
    var core = require('web.core');
    var session = require('web.session');

    var qweb = core.qweb;
    var _t = core._t;
    var ZeroClipboard = window.ZeroClipboard;

    function CarListTable() {}

    $.blockUI.defaults.overlayCSS = {
        opacity: 0.1,
        "background-color": "#000"
    };

    CarListTable.prototype = {
        /**
         * Init events here
         */
        init: function () {
            this._loadCartData();
        },
        /**
         * Run load data methods.
         */
        _loadCartData: function () {
            var self = this;
            $("#cart-list").block({
                message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                css: {
                    border: "none",
                    left: "90%",
                    width: "96%",
                    background: "transparent"
                }
            });
            rpc
                .query({
                    route: "/portal/cart/list",
                    params: []
                })
                .then(function (returned_value) {
                    $("#cart-list").unblock();
                    if ($.blockUI) {
                        $.unblockUI();
                    }
                    if (_.isEmpty(returned_value)) {
                        $.notify({
                            icon: "glyphicon glyphicon-ok",
                            title: "Failed",
                            message: "Cart items are empty."
                        }, {
                            type: "success"
                        });
                    }
                    /**
                     * Hide empty msg
                     */
                    if (_.isEmpty(returned_value)) {
                        $('#emptymsg').html('Empty').show();
                        return false;
                    }
                    self._createListTable(returned_value);
                });

                /**
                 * Load digital order list
                 */
                rpc
                .query({
                    route: "/portal/cart/dlist",
                    params: []
                })
                .then(function (returned_value) {
                    $("#do-cart-list").unblock();
                    if ($.blockUI) {
                        $.unblockUI();
                    }
                    /**
                     * Hide empty msg
                     */
                    if (_.isEmpty(returned_value)) {
                        $('#do-emptymsg').html('Empty').show();
                        return false;
                    }
                    self._createDoListTable(returned_value);
                });
        },
        
        /**
         * @description
         * Create table list for d-order
         * @param {*} list
         */
        _createDoListTable: function(list) {
            if(_.isEmpty(list)) {
                $('#do_emptymsg').html('Empty').show();
            } else {
                $('#do_emptymsg').hide();
            }
            var parent = $('#dl');
            for(var key in list) {
                var data = list[key];
                var row = $('<tr>');
                /**
                 * Image field
                 */
                var imgf = $('<img>').attr('src', data['image']);
                imgf.attr('width','120');
                var imgf_td = $('<td width="120">');
                imgf_td.append(imgf);
                row.append(imgf_td);
                /**
                 * Name field
                 */
                var nmf = $('<td>').html(data['name']);
                row.append(nmf);
                var imgtf = $('<td>').html(data['ltype']);
                row.append(imgtf);
                var imgwf = $('<td>').html(data['width']);
                row.append(imgwf);
                var imghf = $('<td>').html(data['height']);
                row.append(imghf);
                var imguf = $('<td>').html(data['unit']);
                row.append(imguf);
                /**
                 * Add price input and surcharge
                 */
                var pin = $('<input type="text" id="do_price_' + data['id'] + '" placeholder="0.00" class="form-control">');
                var pintd = $('<td>').append(pin);
                row.append(pintd);

                var scin = $('<input type="text" id="do_sc_' + data['id'] + '" placeholder="0.00" class="form-control">');
                var sctd = $('<td>').append(scin);
                row.append(sctd);

                var da = $('<a>').attr('href','#').html('Remove');
                da.attr('data-toggle', 'confirmation');
                var did = data['id'];
                da.confirmation({
                    onCancel: function () {
                        console.log('You didn\'t choose anything');
                    },
                    onConfirm: function (value) {
                        var args = [did];
                        rpc.query({
                            model: "sale.dorder.preview",
                            method: "unlink",
                            args: args
                        }).then(function (returned_value) {
                            row.hide();
                        });
                    }
                });
                var af = $('<td>').html(da);
                row.append(af);
                parent.append(row);
            }

        },
        _onLogoPriceChange: function () {

        },
        _collectOrderData: function() {
            var self = this;
            var eOrderHolder = $("input[name='select[]']");
            var postData = [];
            eOrderHolder.each(function(item) {
                var obj = {};
                var designId = this.value;
                obj['id'] = designId;
                obj['qty'] = [];
                obj['logos'] = [];
                var topLevelTable = $('#ot_' + this.value);
                /**
                 * Search count labels
                 */
                var sizeInputs = topLevelTable.find("input[name='qty[]']");
                sizeInputs.each(function(item){
                    var sizeObj = {};
                    var key = $(this).attr('data-label');
                    sizeObj[key] = $(this).val();
                    obj['qty'].push(sizeObj);
                });
                /**
                 * Search the logo ids in current table
                 */
                var logoIds = topLevelTable.find("input[name='logoid[]']");
                logoIds.each(function(item){
                    var logoObj = {};
                    var id = $(this).val();
                    logoObj['id'] = id
                    logoObj['price'] = topLevelTable.find("input[data-id='logo_price_" + id + "']").val();
                    logoObj['surcharge'] = topLevelTable.find("input[data-id='logo_surcharge_" + id + "']").val();
                    logoObj['discount'] = topLevelTable.find("input[data-id='logo_discount_" + id + "']").val();
                    obj['logos'].push(logoObj);
                });
                postData.push(obj);
            });
            console.log(postData);
            return postData;
        },
        _submitQtOrder: function() {
            
        },
        _submitOrder: function() {

        },
        /**
         * Binding events for all table list
         */
        _bindInputEvents: function () {
            var self = this;
            $("input[name='select[]']").on('change', function (e) {
                var tp = $(this).parent().parent();
                var tpl = tp.find('.itemp');
                if ($(this).prop('checked') == true) {
                    tpl.attr('data-valid', 1);
                    $('#rlink').show();
                } else {
                    tpl.attr('data-valid', 0);
                }
                self._calTotalPrice($(this).val());
            });
            $('input[type="text"].logo-price').blur(function (e) {
                var p = $(this).val();
                if (!$.isNumeric(p)) {
                    $.notify({
                        icon: "glyphicon glyphicon-remove",
                        title: "Err Data",
                        message: "the price value should be a number"
                    }, {
                        type: "danger"
                    });
                    return false;
                }
                self._calTotalPrice($(this).attr('data-key'));
            });
            $('input[type="text"].logo-discount').blur(function (e) {
                var v = parseInt($(this).val());
                if (v < 0 || v > 100) {
                    $.notify({
                        icon: "glyphicon glyphicon-remove",
                        title: "Err Data",
                        message: "the discount value should be 1-100"
                    }, {
                        type: "danger"
                    });
                    return false;
                }
                self._calTotalPrice($(this).attr('data-key'));
            });
            $('input[type="text"].logo-surcharge').blur(function (e) {
                var s = $(this).val();
                if (!$.isNumeric(s)) {
                    $.notify({
                        icon: "glyphicon glyphicon-remove",
                        title: "Err Data",
                        message: "the surcharge value should be a number"
                    }, {
                        type: "danger"
                    });
                    return false;
                }
                self._calTotalPrice($(this).attr('data-key'));
            });
            $('input[type="text"].cart-qq').blur(function (e) {
                var q = $(this).val();
                if (!$.isNumeric(q)) {
                    $.notify({
                        icon: "glyphicon glyphicon-remove",
                        title: "Err Data",
                        message: "the quantity value should be a integer."
                    }, {
                        type: "danger"
                    });
                    return false;
                }
                self._calTotalPrice($(this).attr('data-key'));
            });
            $('#btn-quot').click(function (e) {
                $("#cart-list").block({
                    message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                    css: {
                        border: "none",
                        left: "90%",
                        width: "96%",
                        background: "transparent"
                    }
                });
                var postData = {};
                postData['eorder'] = self._collectOrderData();
                if(_.isEmpty(postData)) {
                    console.log('empty cart data.');
                    return false;
                }
                var postUrl = '/portal/cart/create';
                var debugStr = session.debug ? "?debug=true" : "";
                ajax.jsonRpc(postUrl + debugStr, "call", postData)
                    .always(function () {
                        $("#cart-list").unblock();
                        if ($.blockUI) {
                            $.unblockUI();
                        }
                    })
                    .done(function (data) {
                        $.notify({
                            icon: "glyphicon glyphicon-ok",
                            title: "Item is added.",
                            message: "Items are submitted successfully."
                        }, {
                            type: "success"
                        });
                    })
                    .fail(function () {
                        $.notify({
                            icon: "glyphicon glyphicon-remove",
                            title: "Failed",
                            message: "Failed to add item,please try again"
                        }, {
                            type: "danger"
                        });
                    });
            });
            $('#btn-order').click(function (e) {
                self._submitOrder();
                $("#cart-list").block({
                    message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                    css: {
                        border: "none",
                        left: "90%",
                        width: "96%",
                        background: "transparent"
                    }
                });
                setTimeout(function () {
                    $("#cart-list").unblock();
                    $.notify({
                        icon: "glyphicon glyphicon-ok",
                        title: "OK",
                        message: "Order has been created already."
                    }, {
                        type: "success"
                    });
                }, 3000);
            });
        },
        /**
         * Calculate total price here
         */
        _calTotalPrice: function (key) {
            /**
             * Cal total quantity
             */
            var qinputs = $('input[type="text"].cart-qq-' + key);
            var tq = 0;
            qinputs.each(function (e) {
                tq = tq + parseInt($(this).val());
            });
            $('#tq_' + key).html(tq);
            var dsTableRows = $('.ds-' + key).find('tr');
            var singlePrice = 0.0;
            dsTableRows.each(function () {
                var price = parseFloat($(this).find('.logo-price').val());
                var disc = parseInt($(this).find('.logo-discount').val());
                var surcharge = parseFloat($(this).find('.logo-surcharge').val());
                var tmp = price * (disc / 100) + surcharge;
                singlePrice = singlePrice + tmp;
            });
            $('#tp_' + key).html(singlePrice * tq);
            /**
             * cal total price
             */
            var tp = 0.0;
            $('.itemp').each(function (e) {
                var tmp = parseFloat($(this).text());
                /**
                 * conditions when input checkbox checked
                 */
                var c = $(this).attr('data-valid');
                if(parseInt(c) == 1) {
                    tp = tp + tmp;
                }
            });
            $('#f-subtotal').html('$ ' + tp);
            $('#f-total').html('$ ' + tp);
        },
        /**
         * Create list table
         */
        _createListTable: function (list) {
            var parent = $('#cl');
            for (var item in list) {
                var dr = list[item];
                var topRowTr = $('<tr>');
                /**
                 * 01. Add the checkbox input td first
                 */
                var t_tdi_1 = $('<td>');
                var ip_tdi_1 = $("<input type='checkbox' name='select[]'>");
                t_tdi_1.append(ip_tdi_1);
                topRowTr.append(t_tdi_1);
                /**
                 * Loop throgh each side of garment.
                 */
                var t_tdi_2 = $('<td>');
                var sideTable = $('<table>').addClass('table table-borderless');
                /*
                 * Prepare the head of table
                 */
                var tHeadRow = $('<tr>');
                tHeadRow.append($('<th>').append('Design'));
                tHeadRow.append($('<th class="minw150">').append('Garment Info'));
                /**
                 * Append one table
                 */
                var tSubHead = $('<table>').addClass('table headtable table-borderless');
                var tSubTr = $('<tr>');
                tSubTr.append($('<td class="minw80">').html('Service'));
                tSubTr.append($('<td class="minw80">').html('Design#'));
                tSubTr.append($('<td class="minw80">').html('Location'));
                tSubTr.append($('<td class="minw100">').html('Unit Price($)'));
                tSubTr.append($('<td class="minw90">').html('Discount(%)'));
                tSubTr.append($('<td class="minw90">').html('Surcharge($)'));
                tSubHead.append(tSubTr);
                tHeadRow.append($('<th>').append(tSubHead));
                tHeadRow.append($('<th>').append('Quantity'));
                tHeadRow.append($('<th>').append('Total Quantiy'));
                tHeadRow.append($('<th>').append('Total Price'));
                sideTable.append(tHeadRow);

                for (var key in dr) {
                    /**
                     * set content table id
                     */
                    sideTable.attr('id','ot_' + key);
                    /**
                     * ip_tdi_1 value
                     */
                    ip_tdi_1.val(key);
                    ip_tdi_1.prop('checked', true);
                    var sideRowData = dr[key];
                    /**
                     * How many side in this design ?
                     */
                    var sideRowCount = sideRowData.length;
                    /**
                     * Loop through every designment
                     */
                    /**
                     * Loop through every side data of columns
                     */
                    for (var cindex in sideRowData) {
                        var sideColumnData = sideRowData[cindex];
                        /**
                         * This rowCount is logos count
                         */
                        var logoCount = sideColumnData.logos_count;
                        /**
                         * Loop throght every logos.
                         */
                        var sideRowHolder = $('<tr>');
                        /**
                         * 01. Add image for every side design
                         */
                        var sdi_1 = $('<td>');
                        var img = $('<img>').attr('src', sideColumnData.image).attr('height', 100);
                        sdi_1.append(img);
                        sideRowHolder.append(sdi_1);
                        /**
                         * 02. Add shared data by every side
                         *     This data can be added by first side,1 time
                         * 
                         */
                        var sdi_2 = $('<td class="minw150">');
                        if (cindex == 0) {
                            var gmt_s = $('<label>').html('Style:' + sideColumnData.style);
                            sdi_2.append(gmt_s);
                            var gmt_b = $('<label>').html('Brand:' + sideColumnData.brand);
                            sdi_2.append(gmt_b);
                            var gmt_c = $('<label>').html('Color:' + sideColumnData.color);
                            sdi_2.append(gmt_c);
                            sdi_2.attr('rowspan', sideRowCount);
                            sideRowHolder.append(sdi_2);
                        }
                        /**
                         * 03. Loop throgh every logo 
                         *     Create one table for each side, one row is based on side.
                         */
                        var sdi_3 = $('<td>');
                        var logoTable = $('<table>').addClass('table nb ltable');
                        logoTable.addClass('ds-' + key);
                        for (var j = 0; j < logoCount; j++) {
                            var logoTr = $('<tr>');
                            // append logo service
                            var ltdi_1 = $('<td class="minw80">');
                            var logoObj = sideColumnData.logos[j];
                            var logo_s = $('<label>').html(logoObj.service);
                            ltdi_1.append(logo_s);
                            logoTr.append(ltdi_1);
                            // append logo design Num
                            var ltdi_2 = $('<td class="minw80">');
                            var logo_d = $('<label>').html(logoObj.id);
                            ltdi_2.append(logo_d);
                            logoTr.append(ltdi_2);
                            // append logo location
                            var ltdi_3 = $('<td width="80">');
                            var logo_l = $('<label>').html(logoObj.location);
                            ltdi_3.append(logo_l);
                            logoTr.append(ltdi_3);
                            // append unit price
                            var ltdi_4 = $('<td class="minw100">');
                            ltdi_4.append($('<input type="text" value="0.0" class="form-control logo-price" data-id="logo_price_' + logoObj.id + '" data-key="' + key + '">'));
                            logoTr.append(ltdi_4);
                            logoTr.append($('<input type="hidden" name="logoid[]" value="' + logoObj.id + '">'));
                            // append logo discount
                            var ltdi_5 = $('<td class="minw90">');
                            ltdi_5.append($('<input type="text" class="form-control logo-discount" data-id="logo_discount_' + logoObj.id + '" data-key="' + key + '" value="' + 0 + '">'));
                            logoTr.append(ltdi_5);
                            // append logo surcharge
                            var ltdi_6 = $('<td class="minw90">');
                            if (logoObj.surcharge == null || logoObj.surcharge == undefined) {
                                logoObj.surcharge = 0;
                            }
                            ltdi_6.append($('<input type="text" class="form-control logo-surcharge" data-id="logo_surcharge_' + logoObj.id + '" data-key="' + key + '" value="' + logoObj.surcharge + '">'));
                            logoTr.append(ltdi_6);
                            // append logo description
                            var ltdi_7 = $('<td class="minw100">');
                            ltdi_7.append($('<label>').html(logoObj.surchargeDescription));
                            //logoTr.append(ltdi_7);
                            logoTable.append(logoTr);
                        }
                        sdi_3.append(logoTable);
                        sideRowHolder.append(sdi_3);
                        /**
                         * 04. Create count input for current design, 
                         *     Shared by everyside.
                         */
                        var sdi_4 = $('<td>');
                        var totalq = 0;
                        if (cindex == 0) {
                            var sizeObj = sideColumnData.size;
                            for (var s in sizeObj) {
                                var cc = sizeObj[s];
                                totalq = totalq + parseInt(cc);
                                var ccd = $('<div>').addClass('ccd');
                                var label = $('<label>').addClass('qq_label').html(s + ':');
                                var ip_size = $('<input type="text" name="qty[]" data-label="' + s + '" data-id="' + key + '" value="' + cc + '" class="form-control cart-qq">');
                                ip_size.addClass('cart-qq-' + key);
                                ccd.append(label);
                                ccd.append(ip_size);
                                sdi_4.append(ccd);
                            }
                            sdi_4.attr('rowspan', sideRowCount);
                            sideRowHolder.append(sdi_4);
                        }
                        /**
                         * 05. Total quantity input
                         */
                        var sdi_5 = $('<td>');
                        if (cindex == 0) {
                            sdi_5.attr('rowspan', sideRowCount);
                            sdi_5.append($('<label>').attr('id', 'tq_' + key).html(totalq));
                            sideRowHolder.append(sdi_5);
                        }
                        /**
                         * 06. Total price label.
                         *     this field is calculated by inputs
                         */
                        var tdi_6 = $('<td>');
                        if (cindex == 0) {
                            tdi_6.attr('rowspan', sideRowCount);
                            tdi_6.append($('<label>').attr('id', 'tp_' + key).attr('data-valid',1).addClass('itemp').html('0.0'));
                            sideRowHolder.append(tdi_6);
                        }
                        sideTable.append(sideRowHolder);
                    }
                }
                t_tdi_2.append(sideTable);
                topRowTr.append(t_tdi_2);
                parent.append(topRowTr);
                for (var key in dr) {
                    this._calTotalPrice(key);
                }
            }
            this._bindInputEvents();
            this._addActionLinks();
        },
        _addActionLinks: function () {
            var parent = $('#cations').addClass('cartactions');
            parent.html('');
            var rl = $('<a>').html('Unselect');
            rl.attr('data-checked', '1');
            parent.append(rl);
            rl.click(function (e) {
                var self = this;
                var s = $(this).attr('data-checked');
                /**
                 * Unchecked status.
                 */
                if (s == '0') {
                    $("input[name='select[]']").each(function () {
                        $(this).prop('checked', true);
                        $(self).attr('data-checked', '1');
                        $(self).html('Unselect');
                        $('#rlink').show();
                    });
                }
                if (s == '1') {
                    $("input[name='select[]']").each(function () {
                        $(this).prop('checked', false);
                        $(self).attr('data-checked', '0');
                        $(self).html('Select');
                        $('#rlink').hide();
                    });
                }
            });
            var dl = $('<a>').html('Delete');
            dl.attr('id', 'rlink');
            dl.attr('data-toggle', 'confirmation');
            parent.append(dl);
            dl.confirmation({
                onCancel: function () {
                    console.log('You didn\'t choose anything');
                },
                onConfirm: function (value) {
                    /**
                     * This action will clear all the design on current side
                     * 1. clear all the logos on this side
                     */
                    var ids = [];
                    $("input[name='select[]']").each(function () {
                        if ($(this).prop('checked') == true) {
                            ids.push($(this).val());
                        }
                    });
                    if (ids.length == 0) {
                        $.notify({
                            icon: "glyphicon glyphicon-ok",
                            title: "Failed",
                            message: "Cart items are empty."
                        }, {
                            type: "warning"
                        });
                        return false;
                    }
                    $("#cart-list").block({
                        message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                        css: {
                            border: "none",
                            left: "90%",
                            width: "96%",
                            background: "transparent"
                        }
                    });
                    if (ids.length > 0) {
                        rpc.query({
                                route: "/portal/cart/remove",
                                params: {
                                    ids: ids
                                }
                            })
                            .then(function (returned_value) {
                                $("input[name='select[]']").each(function () {
                                    if ($(this).prop('checked') == true) {
                                        $(this).parent().parent().remove();
                                    }
                                });
                                $('#cations').show();
                                if ($("input[name='select[]']").length == 0) {
                                    $('#emptymsg').html('Empty.').show();
                                    $('#cations').hide();
                                }
                                $("#cart-list").unblock();
                                if ($.blockUI) {
                                    $.unblockUI();
                                }
                                $.notify({
                                    icon: "glyphicon glyphicon-ok",
                                    title: "Failed",
                                    message: "Cart items are empty."
                                }, {
                                    type: "success"
                                });
                                return false;
                            });
                    }
                },
            });
        }
    }

    $(document).ready(function () {
        $('.sc-list').select2({
            width: 140
        });
        $('.shipping-date').datepicker({});
        var tableLoader = new CarListTable();
        tableLoader.init();
    });
});