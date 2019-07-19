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

import re

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
    @http.route('/portal/cart/dlist', type='json', auth="user", csrf=False, website=True)
    def dorder_cart_list_data(self, **kw):
        SaleOrderTpl = request.env['sale.dorder.preview']
        orders = SaleOrderTpl.search(
            [('status', '=', True), ('create_uid', '=', request.env.context.get('uid'))])
        container = []
        for data in orders:
            topLevel = {}
            dataTpl = json.loads(data.design_template)
            topLevel['id'] = data.id
            topLevel['name'] = dataTpl['name']
            topLevel['desc'] = dataTpl['desc']
            topLevel['ltype'] = dataTpl['type']
            topLevel['image'] = dataTpl['image']
            topLevel['width'] = dataTpl['width']
            topLevel['height'] = dataTpl['height']
            topLevel['unit'] = dataTpl['unit']
            container.append(topLevel)
        return container    

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
            if not gmt.design_template:
                continue
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
    # created at 2018/12/12
    @http.route('/portal/cart/create', auth='user', methods=['POST'], type='json', website=True)
    def create_cart(self, *args, **post):
        eOrderData = post['eorder']
        # Create one order on start here
        so = request.env['sale.order'].create({
            'partner_id': request.env.user.partner_id.id,
            'partner_invoice_id': request.env.user.partner_id.id,
            'partner_shipping_id': request.env.user.partner_id.id
        })
        order_id = so.id
        mappedDataArr = []
        # Step 1 
        # re-mapped the post into logo arrays
        for item in eOrderData:
            did = item['id']
            logoExData = item['logos']
            quantity = item['qty']
            OrderPrvModel = request.env['sale.order.preview']
            orderPrv = OrderPrvModel.search([('id', '=', int(did))])
            # Parse the preview data into products and sales orders 
            # Begin here
            tplData = json.loads(orderPrv.design_template)
            # Transform the json data into python objects of dict
            # Unit by 1.orderline <-----> 1.product <----> 1.logo <----> N.garments
            # Created by zhang qinghua
            transformData = self._transformData(tplData, logoExData, quantity)
            mappedDataArr.append(transformData)
            # Create order
            # self._generateOrderFromDesign(transformData)

        # Step 2 merge garment data info array
        logoContainer = []
        for topItemArr in mappedDataArr:
            for logoItem in topItemArr:
                logoContainer.append(logoItem)
        
        # Merge the same logo in the array 
        newLogoContainer = []
        deleteIds = []
        newLogoContainerCopy = logoContainer.copy()
        for newItem in logoContainer:
            # loop again to search the same logo
            iid = newItem['id']
            rawId = newItem['rawId']
            colorHashId = newItem['key']
            for newNewItem in newLogoContainerCopy:
                oldIid = newNewItem['id']
                oldRid = newNewItem['rawId']
                oldColorHashId = newNewItem['key']
                if oldIid not in deleteIds and oldIid != iid and oldRid == rawId and oldColorHashId == colorHashId:
                    oldGarment = newNewItem['garments'][0]
                    newItem['garments'].append(oldGarment)
                    deleteIds.append(oldIid)
            if iid not in deleteIds:
                newLogoContainer.append(newItem)

        # Begin to create product
        # Start to make orderline
        ProductTemplate = request.env['product.product']
        ProductLogo = request.env['product.logo']
        for godLogo in newLogoContainer:
            # Get logo data
            rawLogoId = int(godLogo['rawId'])
            rawLogo = request.env['product.logo'].search([('id','=',rawLogoId)])
            logoName = rawLogo.name
            logoImage = godLogo['image'].split(',')[1]
            # Start to create the product template
            productTpl = ProductTemplate.create({
                'name': logoName,
                'image': logoImage
            })    
            # Create bom
            logoProductBom = request.env['mrp.bom'].create({
                'product_id': productTpl.id,
                'product_tmpl_id': productTpl.product_tmpl_id.id,
                'product_uom_id': 1,
                'product_qty': 4.0,
                'type': 'normal'
            })

            # <----- Create bom of logo ---->
            bomGarmentList = godLogo['garments']
            for g in bomGarmentList:
                # Create product for every garment, 
                # Include those fields:
                # gid, images
                bomGid = g['gid']
                bomGImageFace = g['g_image_face']
                garmentQty = g['g_qty']

                garmentTmp = request.env['product.garment'].search([('id','=',bomGid)])
                gInfoObj = json.loads(garmentTmp['design_template'])
                garmentIds = garmentTmp.image_ids
                for img in garmentIds:
                    if img.name == bomGImageFace:
                        gImage = img.image

                gProductTpl = ProductTemplate.create({
                    'name': gInfoObj['name'],
                    'image': gImage
                }) 

                test_bom_l3 = request.env['mrp.bom.line'].create({
                    'bom_id': logoProductBom.id,
                    'product_id': gProductTpl.id,
                    'product_qty': 1,
                    'attribute_value_ids': [(4, 1)],
                })
            try:  
                sale_order_line = request.env['sale.order.line'].create({
                    'name': logoName,
                    'product_id': productTpl.product_variant_id.id,
                    'order_id': order_id,
                    'price_unit': 0.0
                })
            except Exception as e:
                print("4444444")
                print(e)   
        return []

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
    @http.route('/portal/pdf/preview', auth='user', methods=['POST'], type='json', website=True)
    def binary_pdf_preview(self, *args, **post):
        fileData = post['data'].split(',')[1]
        pdf_file, pdf_filename = tempfile.mkstemp()
        os.write(pdf_file, base64.b64decode(fileData))
        shutil.copy(pdf_filename, pdf_filename + '.pdf')
        new_pdf_file = pdf_filename + '.pdf'
        # Create website used image
        png_dir = tempfile.mkdtemp()
        png_filename = hashlib.md5(fileData.encode()).hexdigest()
        png_file = png_dir + '/' + png_filename
        # Image converter call
        try:
            call(["pdftocairo", new_pdf_file, "-png" ,png_file])
        except subprocess.CalledProcessError:
            return { "error": 'true' }
        except OSError:
            return { "error": 'true' }
        png_file = png_file + '-1.png'
        png_content = open(png_file, 'rb').read()
        return { "image": base64.b64encode(png_content) }
    # By zhang qinghua
    # created at 2019/04/11
    @http.route('/portal/file/preview', auth='user', methods=['POST'], type='json', website=True)
    def binary_file_preview(self, *args, **post):
        fileType = post['type']
        fileData = post['data'].split(',')[1]
        if fileType == 'dst':
            # Create dst file image
            dst_file, dst_filename = tempfile.mkstemp()
            os.write(dst_file, base64.b64decode(fileData))
            shutil.copy(dst_filename, dst_filename + '.dst')
            new_dst_file = dst_filename + '.dst'
            # Read dst file information
            dstWidth = 0
            dstHeight = 0
            stitch = 0
            uid = ''
            with open(new_dst_file,'rb') as search:
                search.seek(0, 0)  # Go to beginning of the file
                fl = search.read(20)
                uidRaw = fl.decode('utf-8')
                la = uidRaw.split(':')[1]
                uid = la.rstrip()
                sl = search.read(100)
                sRaw = sl.decode('utf-8').split('\r')
                for line in sRaw:
                    wt = re.findall("\+X:\s+([0-9]+)", line)
                    ht = re.findall("\+Y:\s+([0-9]+)", line)
                    st = re.findall("ST:\s+([0-9]+)", line)
                    if wt:
                        dstWidth = wt[0]
                    if ht:
                        dstHeight = ht[0]    
                    if st:
                        stitch = st[0]
            # Create website used image
            svg_dir = tempfile.mkdtemp()
            svg_filename = hashlib.md5(fileData.encode()).hexdigest()
            svg_file = svg_dir + '/' + svg_filename + '.svg'
            # Image converter call
            try:
                call(["libembroidery-convert", new_dst_file, svg_file])
            except subprocess.CalledProcessError:
                return { "error": 'true' }
            except OSError:
                return { "error": 'true' }
            try:
                svg_content = open(svg_file, 'r').read()
            except IOError:
                return { "error": 'true' }   
            svg_image = svg_content
            return {'image': svg_image,'width': dstWidth, 'height': dstHeight,'stitch': stitch, 'uid': uid}
        if fileType == 'ai':
            # Create dst file image
            ai_file, ai_filename = tempfile.mkstemp()
            os.write(ai_file, base64.b64decode(fileData))
            shutil.copy(ai_filename, ai_filename + '.ai')
            new_ai_file = ai_filename + '.ai'
            # get ai files width/height data
            # %%BoundingBox: 0 0 289 82
            aiWidth = 0
            aiHeight = 0
            with open(new_ai_file,'rb') as search:
                search.seek(190, 0)
                bRaw = search.read(70)
                boundBox = bRaw.decode('utf-8')
                if boundBox:
                    bd = re.findall("%%BoundingBox: ([0-9\s]+)", boundBox)
                    if bd:
                        bdd = bd[0].rstrip().split(' ')
                        aiWidth = bdd[-2]
                        aiHeight = bdd[-1]
            # create svg file image
            svg_dir = tempfile.mkdtemp()
            svg_filename = hashlib.md5(fileData.encode()).hexdigest()
            svg_file = svg_dir + '/' + svg_filename + '.svg'
            # image converter call
            try:
                call(["pdftocairo", new_ai_file, "-svg", svg_file])
            except subprocess.CalledProcessError:
                return { "error": 'true' }
            except OSError:
                return { "error": 'true' } 
            try:            
                svg_content = open(svg_file, 'r').read()
            except IOError:
                return { "error": 'true' }    
            svg_image = svg_content
            return {'image': svg_image,'width': aiWidth, 'height': aiHeight}
        return {}
    # By zhang qinghua
    # created at 2019/04/18
    @http.route('/portal/logo/save', auth='user', methods=['POST'], type='json', website=True)
    def save_logo(self, *args, **post):
        rcd = {}
        rcd['name'] = post['name']
        rcd['uid'] = post['name']
        rcd['content_type'] = post['type']
        rcd['description'] = post['desc']
        rcd['width'] = int(post['width'])
        rcd['height'] = int(post['height'])
        rcd['stitch'] = int(post['stitch'])
        rcd['image'] = post['svgImage']
        # set stitch information
        # set uid information for dst file
        # parse the width and height data
        contentType = rcd['content_type'].lower()
        LogoTemplate = request.env['product.logo']
        LogoTemplate.create(rcd)
        return {'result': {'data': 'success'}}

    # By zhang qinghua
    # created at 2019/04/18
    @http.route('/portal/dorder/save', auth='user', methods=['POST'], type='json', website=True)
    def save_dorder(self, *args, **post):
        # 1. Create product.template for:
        #  contains 1 product.garment
        #  contains image
        #  contains attribute of color
        #  contains bom of logos(prouduct)
        DOrderTpl = request.env['sale.dorder.preview']
        DOrderTpl.create({
            'design_template': json.dumps(post),
            'status': True
        })
        return {'result': {'data': 'success'}}      
    
    # Transform logo data into dictionary
    #  Put all the logos into one array
    #  Date: 2019/07/12
    #  By Zhang qinghua
    def _transformData(self, dataHolder,exData,exQty):
        flattenLogoTopObjects = []
        designData = dataHolder['data']
        # Loop through every face: top / left / right ...
        for k,v in designData.items():
            logoArr = v['logos']
            # Loop through the array of logos
            newLogoObject = {}
            for logoObj in logoArr:
                logoId = logoObj['id']
                logoColors = json.dumps(logoObj['colors'])
                newKey = hashlib.md5(logoColors.encode('utf-8')).hexdigest()
                # merge the ex-data
                for exDataItem in exData:
                    if exDataItem['id'] == logoId:
                        logoObj.update(exDataItem)
                newLogoObject = dict(logoObj)
                newLogoObject['key'] = newKey
                newGarment = {}
                newLogoObject['garments'] = []
                newGarment['gid'] = v['gid']
                newGarment['color'] = dataHolder['color']
                newGarment['g_image_id'] = v['image_id']
                newGarment['g_image_face'] = v['image_face']
                newGarment['g_qty'] = exQty
                newLogoObject['garments'].append(newGarment)
                newLogoObject['image'] = v['image']
                flattenLogoTopObjects.append(newLogoObject)           
        return flattenLogoTopObjects
    # By zhang qinghua
    # created at 2019/06/01
    def _generateOrderFromDesign(self, parent_data, order_id):
        ProductTemplate = request.env['product.product']
        # Map the post data into variables
        dataHolder = parent_data['data']
        sizeAttrs = parent_data['count']
        garmentId = int(parent_data['gid'])
        name = '#' + str(garmentId)

        # Garment object
        garment = request.env['product.garment'].search([('id','=',garmentId)])

        gDesignData = json.loads(garment.design_template)
        sizeTpl = gDesignData['size_tpl']
        # Get attributes
        size_attr = request.env['product.attribute'].search([('name','=',sizeTpl)])
        req_size_values = sizeAttrs.keys()
        size_values = request.env['product.attribute.value'].search([('name','in',req_size_values)])

        # Get images list
        images = []
        exImgs = []
        for k,v in dataHolder.items():
            cf = (0,0,)
            tmp = {}
            tmp['name'] = v['image_face']
            imgt = v['image']
            # Get content type
            imgtStr = imgt.split(';')[0]
            imgType = imgtStr.split('/')[1]
            imgC = imgt.split(',')[1]
            tmp['name'] += '|' + imgType
            tmp['image'] = imgC + '=' * (-len(imgt) % 4)
            exImgs.append(imgC)
            images.append(cf + (tmp,))

            # Start to create the product template
            productTpl = ProductTemplate.create({
                'name': name,
                'image': imgC
            })    
            try:  
                sale_order_line = request.env['sale.order.line'].create({
                    'name': '#line-' + str(garmentId),
                    'product_id': productTpl.product_variant_id.id,
                    'order_id': order_id,
                    'price_unit': 0.0
                })
            except Exception as e:
                print(e)   
        # Create sub product components
        # https://www.cybrosys.com/blog/make-to-order-and-make-to-stock-in-odoo-v12