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
from cairosvg import svg2png

import random

from datetime import datetime
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

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

    # This controller is for /portal/partner/list page to load the data asychronised
    # By zhang qinghua
    # created at 2018/11/11
    @http.route('/portal/partner/list', type='http', auth="user", csrf=False, website=True)
    def get_partner_list(self, **kw):
        container = {}
        keyw = kw['q']
        container['results'] = []
        if keyw:
            partners = request.env['res.partner'].search([('name','like','%' + keyw + '%')])
        if len(partners) > 0:
            p = []
            for partner in partners:
                p.append({'id': partner.id, 'text': partner.name})
            container['results'] = p
            return json.dumps(container)  
        return json.dumps(container)  

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
            print(dataTpl['customer'])
            cid = dataTpl['customer']
            topLevel['id'] = data.id
            if cid:
                resPartner = request.env['res.partner'].browse(int(cid))
                topLevel['customer'] = resPartner.name
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
            [('status', '=', True), ('create_uid', '=', request.env.context.get('uid'))])
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
        # Dorder handle begin
        dOrderData = post['dorder']
        if dOrderData and len(dOrderData) > 0:
            # Create purchase order
            # Step 02
            po = request.env['purchase.order'].create({
                'partner_id': request.env.user.partner_id.id
            })
            for ditem in dOrderData:
                dorderId = int(ditem['id'])
                dObj = request.env['sale.dorder.preview'].browse(dorderId)
                dTpl = json.loads(dObj.design_template)
                dTpl.update(ditem)
                # Create product here
                pLogoName = dTpl['name']
                pLogoCustomerId = int(dTpl['customer'])
                pLogoCustomer = request.env['res.partner'].browse(pLogoCustomerId)
                pImage = dTpl['image'].split(',')[1]
                purchase_order_logo = request.env['purchase.order.logo'].create({
                    'name': dTpl['name'],
                    'customer': pLogoCustomer.name,
                    'desc': dTpl['desc'],
                    'size': str(dTpl['width']) + 'X' + str(dTpl['height']),
                    'size_unit': dTpl['unit'],
                    'price': dTpl['price'],
                    'surcharge': dTpl['sc'],
                    'image_type': dTpl['type'],
                    'image': pImage
                })
                PProductTemplate = request.env['product.product']
                logoProductTpl = PProductTemplate.create({
                    'name': pLogoName,
                    'default_code': pLogoName,
                    'product_type': 'PLogo',
                    'image': pImage,
                    'price': float(dTpl['price']),
                    'p_logo_id': purchase_order_logo.id
                })
                POrderlineTpl = request.env['purchase.order.line']
                pUom = request.env.ref('product.product_uom_unit')
                pol = POrderlineTpl.create({
                    'order_id': po.id,
                    'name': pLogoName,
                    'logo_id': purchase_order_logo.id,
                    'product_id': logoProductTpl.id,
                    'product_qty': 1.0,
                    'price_unit': float(dTpl['price']),
                    'product_image': pImage,
                    'product_uom': pUom.id,
                    'date_planned': datetime.today().strftime(DEFAULT_SERVER_DATETIME_FORMAT)
                })
                # update cart status
                dObj.write({'status': False})
        # Dorder end
        buyer = post['buyer']
        order_po = post['order_po']
        job_title = post['job_title']
        shipper = post['shipper']
        order_sd = post['order_sd']
        order_ra = post['order_ra']
        instruction = post['instruction']
        eOrderData = post['eorder']
        didss = []
        # Create global variables for order object
        so = request.env['sale.order'].create({
            'buyer_name': buyer,
            'po_number': order_po,
            'job_title': job_title,
            'shipper_name': shipper,
            'ship_date': order_sd,
            'require_date': order_ra,
            'instruction': instruction,
            'partner_id': request.env.user.partner_id.id,
            'partner_invoice_id': request.env.user.partner_id.id,
            'partner_shipping_id': request.env.user.partner_id.id
        })
        # Global variables
        order_id = so.id
        deisgnLogoIds = []
        OrderPrvModel = request.env['sale.order.preview']
        # design container for bom search in 3th step
        design_container = []
        logoDict = {}
        # Step 0 Get All different logos based on ID and surcharge
        # re-mapped the post into garment view
        for item in eOrderData:
            did = item['id']
            orderPrv = OrderPrvModel.search([('id', '=', int(did))])
            didss.append(int(did))
            tplData = json.loads(orderPrv.design_template)
            # Get preview design data
            designData = self._mergePriceData(tplData, item)
            designDataHolder = designData['data']
            oneItemLogos = self._getDifferentLogos(designDataHolder)
            logoDict.update(oneItemLogos)

        # Step 1 Get all garments side by side grouped by garment ID
        garmentListDict = {}
        for item in eOrderData:
            did = item['id']
            orderPrv = OrderPrvModel.search([('id', '=', int(did))])
            tplData = json.loads(orderPrv.design_template)
            gid = tplData['gid']
            # Get preview design data
            designData = self._mergePriceData(tplData, item)
            # Design data format:
            # {"gid": "75", "color": "#444444", "data": {"line-75-top": {"gid": "75", "image_id": "154", "image_face": "top", "logos": "]"
            # Include multi-side data
            # Sum up quantity values
            tmpQuantity = 0
            for tmp in designData['qty']:
                tmpQuantity = tmpQuantity + int(tuple(tmp.values())[0])
            designDataHolder = designData['data']
            # Start to create garment data from design data
            # Garment design data
            garment = request.env['product.garment'].search([('id','=',gid)])
            # Data format is
            # {"category_id": 1, "name": "Nike", "brand": "Nike", "sizes": ["15", "16", "17"], "description": "asdf", "style": "ssss", "size_tpl": "EU_SIZE", "colors": ["#000000", "#444444", "#ffebcd"], "default_color": "#000000"}
            gDesignData = json.loads(garment.design_template)

            # Create garment basic info
            sale_order_garment_info = request.env['sale.order.garment.info'].create({
                'order_id': order_id,
                'garment_id': garment.id,
                'name': request.env['ir.sequence'].with_context(force_company=request.env.user.company_id.id).next_by_code('sale.order.garment'),
                'style': gDesignData['style'],
                'color': designData['color'],
                'brand': gDesignData['brand'],
                'qty': tmpQuantity,
                'qty_data': designData['qty']
            })
            # Initialize garment data
            #下面的循环已经考虑过多个面了: 第一个循环就是每个面
            garmentDict = []
            for item, sideFace in designDataHolder.items():
                sharedGarmentObject = {}
                faceImg = sideFace['image'].split(',')[1]
                # Collect garment data
                sharedGarmentObject['gid'] = sideFace['gid']
                sharedGarmentObject['name'] = gDesignData['name']
                sharedGarmentObject['code'] = sale_order_garment_info.name
                sharedGarmentObject['style'] = gDesignData['style']
                sharedGarmentObject['brand'] = gDesignData['brand']
                sharedGarmentObject['color'] = designData['color']
                sharedGarmentObject['face'] = sideFace['image_face']
                sharedGarmentObject['image_id'] = sideFace['image_id']
                sharedGarmentObject['qty'] = tmpQuantity
                sharedGarmentObject['qty_data'] = designData['qty']
                sharedGarmentObject['image'] = faceImg
                designLogoData = sideFace['logos']
                # 包含的情况
                # 2个logo 同时出现在一件衣服的同一面时
                # 2个logo 同时出现在一件衣服的不同面时
                for logoItem in designLogoData:
                    uid = logoItem['uid']
                    price = logoItem['price']
                    surcharge = logoItem['surcharge']
                    ukey = hashlib.md5((uid + str(price) + surcharge).encode('utf-8')).hexdigest()
                    if ukey not in garmentListDict:
                        garmentListDict[ukey] = []
                    insideGarmentList = garmentListDict[ukey]
                    sharedGarmentObject['location'] = logoItem['location']
                    sharedGarmentObject['line_info'] = logoItem['colors']
                    insideGarmentList.append(sharedGarmentObject)

        # Step 3 Merge garment and logo and create product and its bills of materials
        for dictKey,logoItemNew in logoDict.items():
            rawId = logoItemNew['rawId']
            rawLogo = request.env['product.logo'].search([('id','=',int(rawId))])
            logoName = rawLogo.name
            # Image handle start here
            # Possible bugs:
            # viewBox is the point,  the size is fixed at the current time, it should be variables.
            logoImage = rawLogo.image
            c = base64.b64decode(logoImage).decode('utf-8')
            c = c.replace('<!--?xml version="1.0"?-->','')
            c = c.replace('<!-- Embroidermodder 2 SVG Embroidery File -->','')
            c = c.replace('<!-- Embroidermodder 2 SVG Embroidery File -->','')
            c = c.replace('<svg', '<svg viewBox="-30 -30 50 50"')
            d = svg2png(bytestring=c, parent_width=110, parent_height=60)
            # Image handle end here
            pngImage = base64.b64encode(d)
            # basic infor parts
            # Prepare the price surcharge and discount of each logo
            price = round(float(logoItemNew['price']),2)
            discount = round(float(logoItemNew['discount']),2)
            surcharge = round(float(logoItemNew['surcharge']),2)
            endPrice = price * (1 - discount/100) + surcharge
            # Handle color strings
            # 
            sale_order_logo = request.env['sale.order.logo'].create({
                'name': request.env['ir.sequence'].next_by_code('sale.order.logo'),
                'image': pngImage,
                'raw_image': rawLogo.raw_data,
                'raw_image_type': rawLogo.content_type,
                'surcharge': surcharge,
                'surcharge_description': logoItemNew['surchargeDescription'],
                'price': price,
                'service': 'Embroidery',
                'discount': discount,
                'stitch': rawLogo['stitch'],
                'line_data': json.dumps(logoItemNew['colors'])
            })
            LogoProductTemplate = request.env['product.product']
            # It is a big bug here: start
            # Create product for each logo here
            warehouse = request.env.ref('stock.warehouse0')
            route_manufacture = warehouse.manufacture_pull_id.route_id.id
            route_mto = warehouse.mto_pull_id.route_id.id
            # It is a mock warehouse. this data need to be redefined later.
            # Chech if the product is already created with the same name and price
            # Weather this product is repeatable ?????????  
            # The logo product must be one-2-one relation with sale.order.logo, because of design activity
            logoProductTpl = LogoProductTemplate.create({
                'name': logoName,
                'default_code': sale_order_logo.name,
                'product_type': 'Logo',
                'image': pngImage,
                'price': endPrice,
                'route_ids': [(6, 0, [route_manufacture, route_mto])],
                'logo_id': sale_order_logo.id
            })
            # Create new bom object for each new product
            company_id = request.env.user.partner_id.company_id.id
            routeIds = request.env['mrp.routing'].search([('company_id','=',company_id),("active","=",True)])
            routeId = random.choice(routeIds.ids)
            logoProductBom = request.env['mrp.bom'].create({
                'product_id': logoProductTpl.id,
                'product_tmpl_id': logoProductTpl.product_tmpl_id.id,
                'product_qty': 0,
                'type': 'normal',
                'routing_id': routeId
            })
            # Garment list
            garmentList = garmentListDict[dictKey]
            GmtProductTemplate = request.env['product.product']
            # Create garment item for each design
            productQty = 0
            logo_images = []
            for gItem in garmentList:
                # Append design images into logo images
                logo_images.append((0, 0, {'image': gItem['image']}))
                sale_order_garment = request.env['sale.order.garment'].create({
                    'sale_order_id': order_id,
                    'garment_id': int(gItem['gid']),
                    'name': gItem['code'],
                    'style': gItem['style'],
                    'brand': gItem['brand'],
                    'color': gItem['color'],
                    'face': gItem['face'],
                    'image_id': gItem['image_id'],
                    'line_info': gItem['line_info'],
                    'location': gItem['location'],
                    'quantity': gItem['qty']
                })
                gmtProductTpl = GmtProductTemplate.create({
                    'name': gItem['name'],
                    'type': 'consu',
                    'garment_id': sale_order_garment.id,
                    'image': gItem['image'],
                    'default_code': sale_order_garment.name,
                    'product_type': 'Garment',
                })
                bom_line_item = request.env['mrp.bom.line'].create({
                    'bom_id': logoProductBom.id,
                    'product_id': gmtProductTpl.id,
                    'product_qty': gItem['qty']
                })
                productQty = productQty + int(gItem['qty'])

            # Post actions after done.
            logoProductBom.write({'product_qty': productQty})  
            logoProductTpl.write({
                'design_image_ids': logo_images
            })
            
            sale_order_line = request.env['sale.order.line'].create({
                'name': logoProductTpl.name,
                'product_id': logoProductTpl.product_variant_id.id,
                'order_id': order_id,
                'product_uom_qty': productQty,
                'price_unit': endPrice,
                'surcharge': surcharge
            })
        # Update status 
        OrderPrvModel.search([('id','in',didss)]).write({'status': False})    
        return True

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
        cartData = json.dumps(post)
        SaleOrderTpl.create({
            'design_template': cartData,
            'status': True
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
        rcd['partner_id'] = int(post['customer'])
        rcd['name'] = post['name']
        rcd['uid'] = post['name']
        rcd['content_type'] = post['type']
        rcd['description'] = post['desc']
        rcd['width'] = int(post['width'])
        rcd['height'] = int(post['height'])
        rcd['stitch'] = int(post['stitch'])
        rcd['image'] = post['svgImage']
        imageRaw = post['imageRaw']
        if imageRaw:
            coreData = imageRaw.split(",")[1]
            rcd['raw_data'] = coreData
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
    
    # Merge design data with prices by design id
    # start from: 2019/12/09
    # Example data: {'id': 'fbc7b', 'type': 'dst', 'left': 98, 'top': 171, 'colors': {'line-0': 'S0502', 'line-1': 'S0502', 'line-2': 'S0502'}, 'location': 'top', 'surcharge': '1', 'surchargeDescription': 'desc', 'service': 'Embroidery', 'rawId': '36', 'price': '1', 'discount': '1', 'key': 'b96932b4b1be44ac13e9bae271555cc3', 'garments': [{'gid': '75', 'color': '#000000', 'g_image_id': '154', 'g_image_face': 'top', 'g_qty': [{'XS': '1'}, {'S': '1'}, {'L': '1'}, {'M': '1'}]}], 'image': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHCAkIBgoJCAkMCwoMDxoRDw4ODx8WGBMaJSEnJiQhJCMpLjsyKSw4LCMkM0Y0OD0/QkNCKDFITUhATTtBQj//2wBDAQsMDA8NDx4RER4/Kik='}
    # {"gid": "75", "color": "#444444", "data": {"line-75-top": {"gid": "75", "image_id": "154", "image_face": "top", "logos": [{"id": "W2FDB6", "type": "dst", "left": 89, "top": 152, "colors": {"line-0": "S0502", "line-1": "S0502", "line-2": "S0502"}, "location": "123", "surcharge": 1222, "surchargeDescription": "123", "service": "Embroidery", "rawId": "36"}],
    # [{'id': '25', 'qty': [{'XS': '1'}, {'S': '1'}, {'L': '1'}, {'M': '1'}], 'logos': [{'id': 'fbc7b', 'price': '1', 'surcharge': '1', 'discount': '1'}]}, {'id': '26', 'qty': [{'XS': '1'}, {'S': '1'}, {'L': '1'}], 'logos': [{'id': '3163d', 'price': '1', 'surcharge': '111', 'discount': '1'}]}, {'id': '28', 'qty': [{'XS': '0'}, {'S': '1'}, {'L': '1'}, {'M': '0'}], 'logos': [{'id': 'c81b5', 'price': '1', 'surcharge': '11', 'discount': '1'}]}, {'id': '29', 'qty': [{'XS': '0'}, {'S': '0'}, {'L': '8'}, {'M': '0'}], 'logos': [{'id': 'W2FDB6', 'price': '1', 'surcharge': '234', 'discount': '1'}]}, {'id': '30', 'qty': [{'XS': '0'}, {'S': '0'}, {'L': '0'}, {'M': '9'}], 'logos': [{'id': 'W2FDB6', 'price': '1', 'surcharge': '123', 'discount': '1'}]}, {'id': '31', 'qty': [{'XS': '0'}, {'S': '0'}, {'L': '3'}], 'logos': [{'id': 'W2FDB6', 'price': '1', 'surcharge': '123', 'discount': '1'}]}]
    def _mergePriceData(self, dataHolder, postData):
        # Update garments quantity data here.
        designDataHolder = dataHolder['data']
        # Merge above data
        for k, designData in designDataHolder.items():
            logoList = designData['logos']
            for logoItem in logoList:
                lid = logoItem['id']
                # get the price data from request.env's post data
                srcLogos = postData['logos']
                for srcLogo in srcLogos:
                    if srcLogo['id'] == lid:
                        if not srcLogo['price'] or not srcLogo['price'].isdigit():
                            srcLogo['price'] = 0.0
                        if not srcLogo['discount'] or not srcLogo['discount'].isdigit():
                            srcLogo['discount'] = 0.0
                        if float(srcLogo['discount']) > 100.0:
                                srcLogo['discount'] = 100
                        if not srcLogo['surcharge'] or not srcLogo['surcharge'].isdigit():
                            srcLogo['discount'] = 0.0       
                        logoItem.update(srcLogo)
                        break
        dataHolder['qty'] = postData['qty']      
        return dataHolder           

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
                newGarment['color'] = dataHolder['color'] or '#FFFFFF'
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

    # Create different logo products
    def _getDifferentLogos(self, dataHolder):
        result = {}
        for index, sideObj in dataHolder.items():
            logoHolder = sideObj['logos']
            for logoItem in logoHolder:
                uid = logoItem['uid']
                price = logoItem['price']
                surcharge = logoItem['surcharge']
                ukey = hashlib.md5((uid + str(price) + surcharge).encode('utf-8')).hexdigest()
                result[ukey] = logoItem
        return result        