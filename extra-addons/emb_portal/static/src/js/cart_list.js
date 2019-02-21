odoo.define('emb_portal.cart_list', function (require) {
    'use strict';
    var ajax = require('web.ajax');
    var core = require('web.core');
    var Widget = require('web.Widget');
    var base = require('web_editor.base');

    var qweb = core.qweb;
    var _t = core._t;
    var ZeroClipboard = window.ZeroClipboard;

    $(document).ready(function () {
        $('.sc-list').select2({
            width: 140
        });
        $('.shipping-date').datepicker({
        });
    });
});