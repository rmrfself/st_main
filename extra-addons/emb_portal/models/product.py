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

class ProductLogoImage(models.Model):
    _name = 'product.logo.image'

    image = fields.Binary('Image', attachment=True)

# contains 6 positions: t,b,f,b,l,r

class ProductGarmentImage(models.Model):
    _name = 'product.garment.image'

    name = fields.Char('Name', required=True)
    content_type = fields.Char('Content Type', required=True)
    image = fields.Binary('Image', attachment=True)

class LogoTemplate(models.Model):
    _name = "product.logo"

    # name
    name = fields.Char('Name', required=True)
    # custom
    partner_id = fields.Many2one('res.partner', string='Partner')
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

    # This is garment information
    garment_type = fields.Char(string='Type', store=False, compute='_get_garment_type')

    garment_style = fields.Char(string='Style', store=False, related='product_id.garment_id.style')

    garment_brand = fields.Char(string='Brand', store=False, related='product_id.garment_id.brand')

    garment_color = fields.Char(string='Color', store=False, related='product_id.garment_id.color')

    garment_quantity = fields.Char(string='Qty', store=False, related='product_id.garment_id.quantity')

    # This is garment information
    garment_location = fields.Char(string='Location', store=False, compute='_get_garment_locations')

    @api.multi
    def _get_garment_locations(self):
        for ol in self:
            pid = ol.product_id
            if pid.garment_id:
                oid = pid.garment_id.sale_order_id.id
                gid = pid.garment_id.garment_id.id
                gids = self.env['sale.order.garment'].search([('sale_order_id', '=', oid),('garment_id', '=', gid)])
                locs = []
                for gobj in gids:
                    loc = gobj.location
                    locs.append(loc)
                if locs:    
                    ol.garment_location = ','.join(locs)

    @api.multi
    def _get_garment_type(self):
        for ol in self:
            pid = ol.product_id
            gid = pid.garment_id.garment_id
            if gid.design_template:
                gdata = json.loads(gid.design_template)
                print('99999999')
                print(gdata)
                cid = self.env['product.category'].browse(int(gdata['category_id']))
                ol.garment_type = cid.name

class Product(models.Model):
    _inherit = "product.product"

    # top bottom left right front back
    design_image_ids = fields.Many2many('product.logo.image', string='Images', required=False)

    product_type = fields.Char(string='Product Type', store=False, related='logo_id.service')
    
    garment_id = fields.Many2one('sale.order.garment', string='Garment Reference', required=False, ondelete='cascade')

    logo_id = fields.Many2one('sale.order.logo', string='Logo Reference', required=False, ondelete='cascade')

    p_logo_id = fields.Many2one('purchase.order.logo', string='Purchase Logo Reference', required=False, ondelete='cascade')

    design_name = fields.Char(string='Design Name', store=False, related='logo_id.name')

    p_design_name = fields.Char(string='Design Name', store=False, related='p_logo_id.name')

    stitch_count = fields.Integer(string='Stitches', store=False, related='logo_id.stitch')

    line_data = fields.Char(string='Colors', store=False, compute='_get_line_data')

    @api.multi
    def _get_line_data(self):
        for ol in self:
            lineDataCk = ol.logo_id.line_data
            if lineDataCk:
                rawline = json.loads(ol.logo_id.line_data)
                rawlineval = []
                index = 1
                for k,v in rawline.items():
                    rawlineval.append('line-' + str(index) + ":  " + v)
                    index = index + 1
                ol.line_data = ",  ".join(rawlineval)
            else:
                ol.line_data = '-'

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
    qty_formatted = fields.Char(string='Quantity', store=False, compute='_get_quantity')

    @api.multi
    def _get_quantity(self):
        for ol in self:
            tmp = json.loads('{"data":' + ol.qty_data.replace('\'','"') + "}")
            resin = []
            for item in tmp["data"]:
                key = tuple(item.keys())[0]
                val = tuple(item.values())[0]
                res = key + ": " + val
                resin.append(res)
            ol.qty_formatted = "   ".join(resin)

class SaleOrderGarment(models.Model):
    _name = 'sale.order.garment'
    _description = 'Sales Order Garment List'
    _order = 'id' 

    sale_order_id = fields.Many2one('sale.order', string='Order Reference', required=True)
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

    quantity = fields.Char(string='Quantity')

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

class PurchaseOrder(models.Model):
    _inherit = "purchase.order"

    stitch = fields.Char(string='Stitches', store=False, compute='_get_total_stitch')

    @api.multi
    def _get_total_stitch(self):
        for ol in self:
            ols = ol.order_line
            total_stitch = 0
            for line in ols:
                ol_stitch = int(line.p_stitch)
                total_stitch = total_stitch + ol_stitch
            ol.stitch = total_stitch    

class PurchaseOrderLine(models.Model):
    _inherit = 'purchase.order.line'

    logo_id = fields.Many2one('purchase.order.logo', string='Order Design', required=True)

    p_design_size = fields.Char(string='Size', store=True, related='logo_id.size')

    p_customer = fields.Char(string='Customer', store=True, related='logo_id.customer')

    p_design_size_unit = fields.Char(string='Size Unit', store=True, related='logo_id.size_unit')

    p_specital_instr = fields.Text(string='Special Instruction', store=True, related='logo_id.instruction')

    p_fabric = fields.Char(string='Fabric', store=True, related='logo_id.fabric')

    p_stitch = fields.Char(string='Stitches', store=True, related='logo_id.stitiches')

    design_image = fields.Binary('Upload Dst', attachment=True)

    p_design_image = fields.Binary(string='Origin Image', store=False, related='logo_id.image')

class PurchaseOrderLogo(models.Model):
    _name = 'purchase.order.logo'
    _description = 'Purchase Order Logo'
    _order = 'id' 
    
    name = fields.Char(string='Desgin Name', required=True)
    customer = fields.Char(string='Customer', required=False)
    desc = fields.Char(string='Description')
    size = fields.Char(string='Size')
    size_unit = fields.Char(string='Size Unit')
    stitiches = fields.Char(string='Stitches')
    price = fields.Char(string='Discount')
    surcharge = fields.Char(string='Surcharge')
    instruction = fields.Text(string='Instruction')
    fabric = fields.Char(string='Fabirc')

    image_type = fields.Char(string='Type')

    image = fields.Binary('Image', attachment=True)    