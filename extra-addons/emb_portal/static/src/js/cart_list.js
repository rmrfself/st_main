odoo.define('emb_portal.cart_list', function (require) {
    'use strict';

    var rpc = require("web.rpc");
    var ajax = require('web.ajax');
    var core = require('web.core');

    var qweb = core.qweb;
    var _t = core._t;
    var ZeroClipboard = window.ZeroClipboard;

    function CarListTable() {}

    $.blockUI.defaults.overlayCSS = {
        opacity: 0.1,
        "background-color": "#000"
    };

    CarListTable.prototype = {
        init: function () {
            this._loadCartData();
        },
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
        },
        _onLogoPriceChange: function () {

        },
        _bindInputEvents: function () {
            var self = this;
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
                setTimeout(function () {
                    $("#cart-list").unblock();
                    $.notify({
                        icon: "glyphicon glyphicon-ok",
                        title: "OK",
                        message: "Quotattion order has been created already."
                    }, {
                        type: "success"
                    });
                }, 3000);
            });
            $('#btn-order').click(function (e) {
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
                console.log($(this).text());
                var tmp = parseFloat($(this).text());
                tp = tp + tmp;
            });
            $('#f-subtotal').html('$ ' + tp);
            $('#f-total').html('$ ' + tp);
        },
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
                /**
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
                        console.log('row count is : ' + logoCount);
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
                            ltdi_4.append($('<input type="text" value="0.0" class="form-control logo-price" data-id="' + logoObj.id + '" data-key="' + key + '">'));
                            logoTr.append(ltdi_4);
                            // append logo discount
                            var ltdi_5 = $('<td class="minw90">');
                            ltdi_5.append($('<input type="text" class="form-control logo-discount" data-id="' + logoObj.id + '" data-key="' + key + '" value="' + 0 + '">'));
                            logoTr.append(ltdi_5);
                            // append logo surcharge
                            var ltdi_6 = $('<td class="minw90">');
                            ltdi_6.append($('<input type="text" class="form-control logo-surcharge" data-id="' + logoObj.id + '" data-key="' + key + '" value="' + logoObj.surcharge + '">'));
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
                                var ip_size = $('<input type="text" data-key="' + key + '" value="' + cc + '" class="form-control cart-qq">');
                                ip_size.addClass('cart-qq-' + key);
                                ccd.append(label);
                                ccd.append(ip_size);
                                sdi_4.append(ccd);
                            }
                            sdi_4.attr('rowspan', sideRowCount);
                            sideRowHolder.append(sdi_4);
                        }
                        /**
                         * 05. Total price input
                         */
                        var sdi_5 = $('<td>');
                        if (cindex == 0) {
                            sdi_5.attr('rowspan', sideRowCount);
                            sdi_5.append($('<label>').attr('id', 'tq_' + key).html(totalq));
                            sideRowHolder.append(sdi_5);
                        }
                        /**
                         * 06. Total quantity label.
                         *     this field is calculated by inputs
                         */
                        var tdi_6 = $('<td>');
                        if (cindex == 0) {
                            tdi_6.attr('rowspan', sideRowCount);
                            tdi_6.append($('<label>').attr('id', 'tp_' + key).addClass('itemp').html('0.0'));
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
                console.log('ckcik');
                console.log(s);
                if (s == '0') {
                    $("input[name='select[]']").each(function () {
                        console.log($(this).val());
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