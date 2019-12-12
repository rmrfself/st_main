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

    garment_id = fields.Many2one('sale_order_garment', string='Garment Reference', required=False, ondelete='cascade', index=False, copy=True)

    logo_id = fields.Many2one('sale_order_logo', string='Logo Reference', required=False, ondelete='cascade', index=False, copy=True)
    

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

class SaleOrderGarment(models.Model):
    _name = 'sale.order.garment'
    _description = 'Sales Order Garment List'
    _order = 'order_id, id' 

    order_id = fields.Many2one('sale.order', string='Order Reference', required=True, ondelete='cascade', index=True, copy=False)   
    garment_id = fields.Many2one('product.garment', string='Garment Reference', required=True)

    logo_ids = fields.One2many('sale.order.logo', 'sale_order_garment_id', string='Order Logos', states={'cancel': [('readonly', True)], 'done': [('readonly', True)]}, copy=True, auto_join=True)

    image = fields.Binary('Image', attachment=True)
    design_image = fields.Binary('Image', attachment=True)

    name = fields.Text(string='Description', required=True)
    sequence = fields.Integer(string='Sequence', default=10)

    garment_face = fields.Text(string='Garment Face')
    garment_type = fields.Text(string='Garment Type')
    garment_style = fields.Text(string='Garment Style')
    garment_brand = fields.Text(string='Garment Brand')
    garment_color = fields.Text(string='Garment Color')
    garment_size = fields.Text(string='Garment Size')
    garment_qty = fields.Integer(string='Garment Qty')
    garment_location = fields.Text(string='Logo Location')
    garment_designs = fields.Text(string='Logo Designs')

class SaleOrderLogo(models.Model):
    _name = 'sale.order.logo'
    _description = 'Sales Order Logo List'
    _order = 'order_id, id' 

    order_id = fields.Many2one('sale.order', string='Order Reference', required=True, ondelete='cascade', index=True, copy=False)   

    sale_order_garment_id = fields.Many2one('sale.order.garment', string='Garment', required=True, ondelete='cascade', index=True, copy=False)
    
    image = fields.Binary('Image', attachment=True)
    
    name = fields.Char(string='Description', required=True)
    sequence = fields.Integer(string='Sequence', default=10)

    surcharge = fields.Float(string='Surcharge')
    surcharge_description = fields.Char(string='Surcharge Desc')
    service_type = fields.Char(string='Serice Type')
    service_name = fields.Char(string='Service Name')

    line_data = fields.Char(string='Line Data')

    price = fields.Float(string='Price')
    discount = fields.Float(string='Discount')
    location = fields.Char(string='Location')
    garment_qty = fields.Integer(string='Quantity')

    position_left = fields.Float(string='Position left')
    position_top = fields.Float(string='Position top')

    stitch = fields.Integer(string='Stitch', default=0)

class SaleOrder(models.Model):
    _inherit = "sale.order"

    order_garment = fields.One2many('sale.order.garment', 'order_id', string='Order Garments', states={'cancel': [('readonly', True)], 'done': [('readonly', True)]}, copy=True, auto_join=True)

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

    # top bottom left right front back
    garment_ids = fields.Many2many(
        'sale.order.garment','sale_order_line_garment_rel','sale_order_line_id','garment_id', string='Garments', required=True)