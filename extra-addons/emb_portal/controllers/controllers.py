# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.tools import config
import base64
import tempfile

import os
from subprocess import call
import shutil
import json
import hashlib

from odoo.exceptions import AccessError, UserError
import logging
_logger = logging.getLogger(__name__)

from odoo.http import request


def compare_lists(list1, list2):
    if len(list1) != len(list2):  # Weed out unequal length lists.
        return False
    for item in list1:
        if item not in list2:
            return False
    return True


class Portal(http.Controller):
    @http.route('/portal/index/', auth='user', website=True)
    def index(self, **kw):
        return http.request.render('emb_portal.portal_layout')

    @http.route('/portal/history', auth='user', website=True)
    def cart_history(self, **kw):
        return http.request.render('emb_portal.cart_history')

