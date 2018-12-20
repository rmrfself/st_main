# -*- coding: utf-8 -*-
# Produced by mike.a.zhang@gmail.com.
#	<!-- ================= -->
#	<!-- ST Order Project -->
#	<!-- =================  -->

from odoo.http import request
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


class Portal(http.Controller):
    @http.route('/portal/index/', auth='user', website=True)
    def index(self, **kw):
        return http.request.render('emb_portal.portal_layout')

    @http.route('/portal/color_list', type='json', auth="user", csrf=False, website=True)
    def get_color_list(self, **kw):
        ProductAttr = request.env['product.attribute']
        ProductAttrV = request.env['product.attribute.value']
        attr_id = ProductAttr.search([('name', '=', 'GM_COLOR')]).id
        color_list = ProductAttrV.search_read(
            [('attribute_id', '=', attr_id)], ['id', 'name'])
        return color_list

    @http.route('/portal/size_template', type='json', auth="user", csrf=False, website=True)
    def get_size_template(self, **kw):
        ProductAttr = request.env['product.attribute']
        ProductAttrV = request.env['product.attribute.value']
        size_group = ProductAttr.search([('name', '=', 'SIZE_GROUP')])
        size_types = size_group.value_ids.name.split('|')
        attrs_ids = ProductAttr.search([('name', 'in', size_types)]).ids
        attr_values = ProductAttrV.search([('attribute_id', 'in', attrs_ids)])
        result = {}
        for attr_value in attr_values:
            key = attr_value.attribute_id.name
            if key not in result:
                result[key] = []
            result[key].append({'id': attr_value.id, 'text': attr_value.name})
        return result

    @http.route('/portal/garments/create', auth='user', methods=['POST'], type='json', website=True)
    def create_garment(self, *args, **post):
        # instance of product.template
        ProductTemplate = request.env['product.template']
        # get parameter vals
        category_id = post['category_id']
        if not category_id:
            return {'error': 'category can not be empty'}
        name = post['name']
        style_ids = post['style_ids']
        brand = post['brand']
        sizes = post['sizes']
        description = post['desc']
        images = post['images']
        # transform images by postion
        filtered_images = []
        for k, v in images.items():
            filtered_images.append(
                (0, 0, request.env['product.image'].new({'name': k, 'image': v})))
        # setup styles
        # setup saved object
        rcd = {}
        rcd['description'] = description
        rcd['cated_id'] = int(category_id)
        rcd['image_ids'] = filtered_images
        # Create product template
        # product = ProductTemplate.create({
        #     'image': image_raw_data,
        #     'uom_id': uom_unit.id,
        #     'uom_po_id': uom_unit.id,
        #     'website_published': True,
        #     'public_categ_ids': [(4, int(category_id))],
        #     'attribute_line_ids': attribute_line_ids_domain
        # })
        return {'result': {'data': 'success'}}
