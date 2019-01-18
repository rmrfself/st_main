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

    @http.route('/portal/remove_garment', type='json', auth="user", csrf=False, website=True)
    def get_remove_garment(self, **kw):
        print(kw)
        id = kw.get('id')
        result = request.env['product.garment'].search([('id', '=', int(id))])
        img_ids = result.image_ids.ids
        print(img_ids)
        images = request.env['product.garment.image'].search(
            [('id', 'in', img_ids)])
        print(images)
        unlink_result = result.unlink()
        if unlink_result:
            images.unlink()
        return unlink_result

    @http.route('/portal/size_attributes', type='json', auth="user", csrf=False, website=True)
    def get_size_attribues(self, **kw):
        attrs_ids = list(map(int, kw['ids']))
        return request.env['product.attribute.value'].search_read([('id', 'in', attrs_ids)])

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
        ProductGarment = request.env['product.garment']
        # get parameter vals
        category_id = post['category_id']
        if not category_id:
            return {'error': 'category can not be empty'}
        gmt_id = post['gmt_id']
        name = post['name']
        style = post['style']
        brand = post['brand']
        sizes = post['sizes']
        description = post['desc']
        images = post['images']
        colors = post['colors']
        size_tpl = post['size_tpl']
        # transform images by postion
        filtered_images = []
        # if editable mode trigger
        editable_mode = False
        if gmt_id and int(gmt_id) > 0:
            old_product_gmt = ProductGarment.search([('id', '=', int(gmt_id))])
            if old_product_gmt:
                editable_mode = True
                # remove all images
                old_product_gmt.image_ids.unlink()
        for k, v in images.items():
            filtered_images.append(
                (0, 0, {'name': k, 'image': v['data'], 'content_type': v['type']}))
        # setup styles
        # setup saved object
        rcd = {}
        rcd['category_id'] = int(category_id)
        rcd['name'] = name
        rcd['brand'] = brand
        rcd['sizes'] = sizes
        rcd['description'] = description
        rcd['style'] = style
        rcd['size_tpl'] = size_tpl
        rcd['colors'] = colors
        saved_data = json.dumps(rcd)
        # Create product garment
        try:
            if editable_mode:
                old_product_gmt.write({
                    'image_ids': filtered_images,
                    'design_template': saved_data
                })
            else:
                ProductGarment.create({
                    'image_ids': filtered_images,
                    'design_template': saved_data
                })
        except Exception as e:
            print(e)
            return {'result': {'data': 'fail to save.'}}

        return {'result': {'data': 'success'}}
