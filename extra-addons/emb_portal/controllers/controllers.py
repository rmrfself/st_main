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
import hashlib

import os
from subprocess import call
import shutil
import json
import hashlib

from odoo.exceptions import AccessError, UserError
import logging
_logger = logging.getLogger(__name__)


class Portal(http.Controller):

    # This controller is for /port/index page
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/index/', auth='user', website=True)
    def index(self, **kw):
        return http.request.render('emb_portal.portal_layout')

    # This controller is for /port/cart page
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/cart/', auth='user', website=True)
    def cart_list(self, **kw):
        return http.request.render('emb_portal.portal_cart_list')

    # This controller is for /port/cart/remove page to load the data asychronised
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/cart/remove', type='json', auth="user", csrf=False, website=True)
    def remove_cart_items(self, **kw):
        ids = list(map(int, kw['ids']))
        SaleOrderTpl = request.env['sale.order.preview']
        result = SaleOrderTpl.search([('id', 'in', ids)])
        ret = result.unlink()
        return ret 

    # This controller is for /port/cart/list page to load the data asychronised
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/cart/list', type='json', auth="user", csrf=False, website=True)
    def cart_list_data(self, **kw):
        SaleOrderTpl = request.env['sale.order.preview']
        orders = SaleOrderTpl.search(
            [('status', '=', False), ('create_uid', '=', request.env.context.get('uid'))])
        # refactor the design data template
        # response format [{'id': [{'image_face': 'top','image': ..., 'brand': 'nike','logos':[{'serice':'EMB'}]}]}]
        container = []
        for data in orders:
            topLevel = {}
            dataTpl = json.loads(data.design_template)
            gColor = dataTpl['color']
            gId = dataTpl['gid']
            # Get design data
            gData = dataTpl['data']
            # Search garment data object
            ProductGarment = request.env['product.garment']
            gmt = ProductGarment.search([('id', '=', int(gId))])
            designTpl = json.loads(gmt.design_template)
            # Create top level array
            topLevel[data.id] = []
            # Loop every face from design data
            for key, value in gData.items():
                secLevel = {}
                # User design pic
                secLevel['image'] = value['image']
                secLevel['image_face'] = value['image_face']
                # Garment information
                secLevel['brand'] = designTpl['brand']
                secLevel['style'] = designTpl['style']
                secLevel['name'] = designTpl['name']
                secLevel['color'] = dataTpl['color']
                # Logo information
                secLevel['logos'] = value['logos']
                secLevel['logos_count'] = len(value['logos'])
                # Cart information including size template
                secLevel['size'] = dataTpl['count']
                topLevel[data.id].append(secLevel)
            container.append(topLevel)
        return container

    # This controller is for /port/color_list page to load the data asychronised
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/color_list', type='json', auth="user", csrf=False, website=True)
    def get_color_list(self, **kw):
        ProductAttr = request.env['product.attribute']
        ProductAttrV = request.env['product.attribute.value']
        attr_id = ProductAttr.search([('name', '=', 'GM_COLOR')]).id
        color_list = ProductAttrV.search_read(
            [('attribute_id', '=', attr_id)], ['id', 'name'])
        return color_list

    # This controller is used for remove_garment
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/remove_garment', type='json', auth="user", csrf=False, website=True)
    def get_remove_garment(self, **kw):
        id = kw.get('id')
        result = request.env['product.garment'].search([('id', '=', int(id))])
        img_ids = result.image_ids.ids
        images = request.env['product.garment.image'].search(
            [('id', 'in', img_ids)])
        unlink_result = result.unlink()
        if unlink_result:
            images.unlink()
        return unlink_result

    # This controller is used for get size attrs
    # By zhang qinghua
    # created at 2018/11/11
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

    # By zhang qinghua
    # created at 2018/11/11
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
        default_color = post['default_color']
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
        rcd['default_color'] = default_color
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

    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/cart_update', auth='user', methods=['POST'], type='json', website=True)
    def cart_update(self, *args, **post):
        # 1. Create product.template for:
        #  contains 1 product.garment
        #  contains image
        #  contains attribute of color
        #  contains bom of logos(prouduct)
        SaleOrderTpl = request.env['sale.order.preview']
        SaleOrderTpl.create({
            'design_template': json.dumps(post)
        })
        return {'result': {'data': 'success'}}

    # By zhang qinghua
    # created at 2019/04/11
    @http.route('/portal/file/preview', auth='user', methods=['POST'], type='json', website=True)
    def binary_file_preview(self, *args, **post):
        fileType = post['type']
        fileData = post['data'].split(',')[1]
        if fileType == 'dst':
            # Create dst file i mage
            dst_file, dst_filename = tempfile.mkstemp()
            os.write(dst_file, base64.b64decode(fileData))
            shutil.copy(dst_filename, dst_filename + '.dst')
            new_dst_file = dst_filename + '.dst'
            # Create website used image
            svg_dir = tempfile.mkdtemp()
            svg_filename = hashlib.md5(fileData.encode()).hexdigest()
            svg_file = svg_dir + '/' + svg_filename + '.svg'
            # Image converter call
            call(["libembroidery-convert", new_dst_file, svg_file])
            svg_content = open(svg_file, 'r').read()
            svg_image = svg_content
        if fileType == 'ai':
            # Create dst file image
            ai_file, ai_filename = tempfile.mkstemp()
            os.write(ai_file, base64.b64decode(fileData))
            shutil.copy(ai_filename, ai_filename + '.ai')
            new_ai_file = ai_filename + '.ai'
            # create svg file image
            svg_dir = tempfile.mkdtemp()
            svg_filename = hashlib.md5(fileData.encode()).hexdigest()
            svg_file = svg_dir + '/' + svg_filename + '.svg'
            # image converter call
            call(["pdftocairo", new_ai_file, "-svg", svg_file])
            svg_content = open(svg_file, 'r').read()
            svg_image = svg_content
        return {'image': svg_image}

    # By zhang qinghua
    # created at 2019/04/18
    @http.route('/portal/logo/save', auth='user', methods=['POST'], type='json', website=True)
    def save_logo(self, *args, **post):
        rcd = {}
        rcd['name'] = post['name']
        rcd['content_type'] = post['type']
        rcd['description'] = post['desc']
        rcd['width'] = int(post['width'])
        rcd['height'] = int(post['height'])
        rcd['image'] = post['svgImage']
        LogoTemplate = request.env['product.logo']
        LogoTemplate.create(rcd)
        return {'result': {'data': 'success'}}