# -*- coding: utf-8 -*-
# Produced by mike.a.zhang@gmail.com.
#	<!-- ================= -->
#	<!-- ST Order Project -->
#	<!-- =================  -->

from odoo import models, api, tools, fields
import json


class ProductGarmentBrand(models.Model):
    _name = "product.garment.brand"

    name = fields.Char(string="Brand", required=True)

# contains 6 positions: t,b,f,b,l,r


class ProductImage(models.Model):
    _name = 'product.garment.image'

    name = fields.Char('Name', required=True)
    content_type = fields.Char('Content Type', required=True)
    image = fields.Binary('Image', attachment=True)


class LogoTemplate(models.Model):
    _name = "product.logo"

    # name
    name = fields.Char('Name', required=True)
    # image type
    content_type = fields.Char('Content Type', required=True)
    # logo description
    description = fields.Char('Description', required=True)
    # logo width 
    width = fields.Integer(required=True, default=0)
    # logo height
    height = fields.Integer(required=True, default=0)
    # raw image
    raw_data = fields.Binary('Raw Data', attachment=True)
    # raw image
    image = fields.Binary('Image', attachment=True)
    # unique ID
    uid = fields.Char('UID', required=True)
    # Stitch count
    stitch = fields.Integer(required=True, default=0)

class MrpBomLine(models.Model):
    _inherit = 'mrp.bom.line'

    product_brand = fields.Char(related='product_id.garment_info_id.brand',string='Brand', store=False)
    product_style = fields.Char(related='product_id.garment_info_id.style',string='Style', store=False)
    product_color = fields.Char(related='product_id.garment_info_id.color',string='Color', store=False)
    product_position = fields.Char(related='product_id.garment_info_id.position',string='Position', store=False)
    product_size_data = fields.Char(related='product_id.garment_info_id.size_data',string='Size Data' ,store=False)
    product_total = fields.Integer(related='product_id.garment_info_id.total',string='Total', store=False)


class Product(models.Model):
    _inherit = "product.product"

    garment_info_id = fields.Many2one(
        'product.garment.info', 'Product Garment', ondelete='cascade')

    description = fields.Char('Description', required=False)  

class GarmentInfo(models.Model):
    _name = "product.garment.info"

    # Brand
    brand = fields.Char('Brand', required=True)
    # Style
    style = fields.Char('Style', required=True)
    # Color
    color = fields.Char('Color', required=True)
    # Size
    size_data = fields.Char('Size', required=True)
    # Size
    total = fields.Integer('Total', required=True, default=0)
    # Position
    position = fields.Char('Position', required=True)

class GarmentTemplate(models.Model):
    _name = "product.garment"

    # top bottom left right front back
    image_ids = fields.Many2many(
        'product.garment.image', string='Images', required=True)

    design_template = fields.Char('Design Template')

class CartConfirm(models.Model):
    _name = "sale.order.preview"

    design_template = fields.Char('Design Template')

    status = fields.Boolean(default=False)

class DOrderConfirm(models.Model):
    _name = "sale.dorder.preview"

    design_template = fields.Char('Design Template')

    status = fields.Boolean(default=False)

class SaleOrderGarment(models.Model):
    _name = 'sale.order.garment'
    _description = 'Sales Order Garment List'
    _order = 'order_id, id' 

    order_id = fields.Many2one('sale.order', string='Order Reference', required=True, ondelete='cascade', index=True, copy=False)   
    name = fields.Text(string='Description', required=True)
    sequence = fields.Integer(string='Sequence', default=10)

    garment_type = fields.Text(string='Garment Type')
    garment_style = fields.Text(string='Garment Style')
    garment_brand = fields.Text(string='Garment Brand')
    garment_color = fields.Text(string='Garment Color')
    garment_size = fields.Text(string='Garment Size')
    garment_qty = fields.Integer(string='Garment Qty')
    garment_location = fields.Text(string='Logo Location')
    garment_designs = fields.Text(string='Logo Designs')

class SaleOrder(models.Model):
    _inherit = "sale.order"

    order_garment = fields.One2many('sale.order.garment', 'order_id', string='Order Garments', states={'cancel': [('readonly', True)], 'done': [('readonly', True)]}, copy=True, auto_join=True)

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'
    
    product_discount = fields.Char(string='Discount', store=False, compute='_get_product_dc')
    product_surcharge = fields.Char(string='Surcharge', store=False, compute='_get_product_sc')
    product_unit_price = fields.Float(string='UnitPrice', store=False, compute='_get_product_up')
    product_type = fields.Char(string='Type', store=False, compute='_get_product_type')
    product_stitch = fields.Char(string='Ks', store=False, compute='_get_product_stitch')
    product_uid = fields.Char(string='Product', store=False, compute='_get_product_uid')
    product_service = fields.Char(string='Service', store=False, compute='_get_product_service')
    product_desc = fields.Char(string='Discription', store=False, compute='_get_product_desc')

    @api.multi
    def _get_product_dc(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            ol.product_discount = prod_desc['discount']

    @api.multi
    def _get_product_sc(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            ol.product_surcharge = prod_desc['surcharge']

    @api.multi
    def _get_product_up(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            ol.product_unit_price = prod_desc['price']

    @api.multi
    def _get_product_desc(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            lid = int(prod_desc['rawId'])
            rawLogo = self.env['product.logo'].browse(lid)
            ol.product_desc = rawLogo.description

    @api.multi
    def _get_product_type(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            lid = int(prod_desc['rawId'])
            rawLogo = self.env['product.logo'].browse(lid)
            ol.product_type = rawLogo.content_type.upper()

    @api.multi
    def _get_product_stitch(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            lid = int(prod_desc['rawId'])
            rawLogo = self.env['product.logo'].browse(lid)
            ol.product_stitch = rawLogo.stitch

    @api.multi
    def _get_product_uid(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            lid = int(prod_desc['rawId'])
            rawLogo = self.env['product.logo'].browse(lid)
            ol.product_uid = rawLogo.uid

    @api.multi
    def _get_product_service(self):
        for ol in self:
            prod_desc = json.loads(ol.product_id.description)
            ol.product_service = prod_desc['service']