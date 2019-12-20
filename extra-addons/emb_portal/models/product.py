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


class Product(models.Model):
    _inherit = "product.product"

    product_type = fields.Char('Type', required=True)
    
    garment_id = fields.Many2one('sale_order_garment', string='Garment Reference', required=False, ondelete='cascade')

    logo_id = fields.Many2one('sale_order_logo', string='Logo Reference', required=False, ondelete='cascade')

class GarmentInfo(models.Model):
    _name = "product.garment.info"

    # Brand
    brand = fields.Char('Brand', required=True)
    # Style
    style = fields.Char('Style', required=True)
    # Color
    color = fields.Char('Color', required=False)
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

class SaleOrderGarmentInfo(models.Model):
    _name = 'sale.order.garment.info'
    _description = 'Sales Order Garment List'
    _order = 'id' 

    sequence = fields.Integer(string='Sequence', help="Gives the sequence order when displaying a list of analytic distribution")

    order_id = fields.Many2one('sale.order', string='Order Reference', required=True, ondelete='cascade', index=True, copy=False)
    garment_id = fields.Many2one('product.garment', string='Garment Reference', required=True)
    name = fields.Char(string='Description', required=True)
    style = fields.Char(string='Style')
    brand = fields.Char(string='Brand')
    color = fields.Char(string='Color')
    qty = fields.Integer(string='Quantity')
    qty_data = fields.Char(string='Quantity Detail')

class SaleOrderGarment(models.Model):
    _name = 'sale.order.garment'
    _description = 'Sales Order Garment List'
    _order = 'id' 

    garment_id = fields.Many2one('product.garment', string='Garment Reference', required=True)
    product_type = fields.Char(string='Type')
    name = fields.Char(string='Description', required=True)
    style = fields.Char(string='Style')
    brand = fields.Char(string='Brand')
    color = fields.Char(string='Color')
    face = fields.Char(string='Face')
    image_id = fields.Integer(string='Image Id')
    location = fields.Char(string='Location')
    line_info = fields.Char(string='Logo Colors')

class SaleOrderLogo(models.Model):
    _name = 'sale.order.logo'
    _description = 'Sales Order Logo List'
    _order = 'id' 
    
    name = fields.Char(string='Name', required=True)
    service = fields.Char(string='Service Name')
    line_data = fields.Char(string='Line Data')
    price = fields.Float(string='Price')
    discount = fields.Float(string='Discount')
    surcharge = fields.Float(string='Surcharge')
    stitch = fields.Integer(string='Stitch', default=0)
    surcharge_description = fields.Char(string='Surcharge Desc')

    image = fields.Binary('Image', attachment=True)

class SaleOrder(models.Model):
    _inherit = "sale.order"

    order_garment = fields.One2many('sale.order.garment.info', 'order_id', string='Order Garments', states={'cancel': [('readonly', True)], 'done': [('readonly', True)]}, copy=True, auto_join=True)

    buyer_name = fields.Char(string='Buyer')
    po_number  = fields.Char(string='P.O#')
    job_title  = fields.Char(string='Job Title')
    shipper_name  = fields.Char(string='Shipper')
    ship_date  = fields.Char(string='Ship Date')
    require_date  = fields.Char(string='Require Date')
    instruction  = fields.Text(string='Instruction')

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'
    
    surcharge = fields.Float(string='Surcharge', default=0)

    logo_name = fields.Char(string='Design Name', store=False, compute='_get_product_name')
    logo_service = fields.Char(string='Service', store=False, compute='_get_logo_service')
    service_type = fields.Char(string='Type', store=False, compute='_get_service_type')
    logo_stitch = fields.Integer(string='Ks', store=False, compute='_get_logo_stitch')

    @api.multi
    def _get_logo_stitch(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.ids)
            ol.logo_stitch = logo.stitch

    @api.multi
    def _get_service_type(self):
        for ol in self:
            ol.service_type = ol.product_id.product_type

    @api.multi
    def _get_logo_service(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.ids)
            ol.logo_service = logo.service               

    @api.multi
    def _get_product_name(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.ids)
            ol.logo_name = logo.name         