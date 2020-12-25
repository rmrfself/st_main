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
    inch_width = fields.Float(required=True, default=0)
    mm_width = fields.Float(required=True, default=0)
    minusx = fields.Integer(required=True, default=0)
    # logo height
    inch_height = fields.Float(required=True, default=0)
    mm_height = fields.Float(required=True, default=0)
    minusy = fields.Integer(required=True, default=0)
    co = fields.Integer(required=True, default=0)
    # raw image
    raw_data = fields.Binary('Raw Data', attachment=True)
    # raw image
    image = fields.Binary('Image', attachment=True)
    # unique ID
    uid = fields.Char('UID', required=True)
    # Stitch count
    stitch = fields.Integer(required=True, default=0)
    # Is show
    is_show = fields.Boolean(default=True)
    # size unit
    size_unit = fields.Char('Unit', required=True)

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
                cid = self.env['product.category'].browse(int(gdata['category_id']))
                ol.garment_type = cid.name

class Product(models.Model):
    _inherit = "product.product"

    # top bottom left right front back
    design_image_ids = fields.Many2many('product.logo.image', string='Images', required=False)

    product_type = fields.Char(string='Product Type')
    
    garment_id = fields.Many2one('sale.order.garment', string='Garment Reference', required=False, ondelete='cascade')

    logo_id = fields.Many2one('sale.order.logo', string='Logo Reference', required=False, ondelete='cascade')

    p_logo_id = fields.Many2one('purchase.order.logo', string='Purchase Logo Reference', required=False, ondelete='cascade')

    design_name = fields.Char(string='Design Name', store=False, related='logo_id.raw_name')

    p_design_name = fields.Char(string='Design Name', store=False, related='p_logo_id.name')

    design_service = fields.Char(string='Service', store=False, related='logo_id.service')

    stitch_count = fields.Integer(string='Stitches', store=False, related='logo_id.stitch')

    logo_description = fields.Char(string='Logo Description', store=False, related='logo_id.raw_desc')

    logo_sc_description = fields.Char(string='Surcharge Description', store=False, related='logo_id.surcharge_description')

    line_data = fields.Char(string='Colors', store=False, compute='_get_line_data')

    logo_size = fields.Char(string='Logo Size', store=False, compute='_get_logo_size')

    # Below its garment's data
    garment_color = fields.Char(string='Garment Color', store=False, related='garment_id.color')
    garment_qty = fields.Char(string='Qty', store=False, related='garment_id.quantity')

    garment_images = fields.Many2many('product.garment.image', string='Images', store=False, compute='_get_garment_images')


    @api.multi
    def _get_garment_images(self):
        for ol in self:
            product_garment = ol.garment_id.garment_id
            if product_garment:
                images = product_garment.image_ids
                ol.garment_images = images


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

    @api.multi
    def _get_logo_size(self):
        for ol in self:
            rawId = ol.logo_id.raw_id
            if rawId:
                rawLogo = self.env['product.logo'].browse(rawId)
                sizeUnit = rawLogo.size_unit
                if sizeUnit == 'mm':
                    ol.logo_size = str(rawLogo.mm_width) + ' X ' + str(rawLogo.mm_height) + ' ' + sizeUnit
                if sizeUnit == 'inch':
                    ol.logo_size = str(rawLogo.inch_width) + ' X ' + str(rawLogo.inch_height) + ' ' + sizeUnit

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

    # Is show
    is_show = fields.Boolean(default=True)

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
    garment_id = fields.Many2one('product.garment', string='Garment Reference', required=True, ondelete='cascade')

    gmt_product_id = fields.Many2one('product.product', string='Product', store=False, compute='_get_gmt_product')

    name = fields.Char(string='Name', required=True)
    description = fields.Char(string='Description', required=True)
    garment_type = fields.Char(string='Type', required=True)
    style = fields.Char(string='Style')
    brand = fields.Char(string='Brand')
    color = fields.Char(string='Color')
    location = fields.Char(string='Location')
    qty = fields.Integer(string='Quantity')
    qty_data = fields.Char(string='Quantity Detail')
    qty_formatted = fields.Char(string='Quantity', store=False, compute='_get_quantity')
    garment_name = fields.Char(string='Name', store=False, compute='_get_garment_name')


    @api.multi
    def _get_gmt_product(self):
        for ol in self:
            order_id = ol.order_id.id
            garment_id = ol.garment_id.id
            sog = self.env['sale.order.garment'].search([('sale_order_id', '=', order_id),('garment_id', '=', garment_id)])
            print(sog)
            if sog:
                product = self.env['product.product'].search([('garment_id', '=', sog.id)])
                ol.gmt_product_id = product

    @api.multi
    def _get_garment_name(self):
        for ol in self:
            gmt_tpl = json.loads(ol.garment_id.design_template)
            if gmt_tpl:
                ol.garment_name = gmt_tpl['name']

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
    garment_id = fields.Many2one('product.garment', string='Garment Reference', required=True, ondelete='cascade')
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

    raw_id = fields.Integer(string='Logo Id')
    raw_name = fields.Char(string='Logo Name',default='')
    raw_desc = fields.Char(string='Logo Description',default='')
    raw_image = fields.Binary('Raw Image', attachment=True, required=False)
    raw_image_type = fields.Char(string='Image Type')


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

    logo_name = fields.Char(string='Design Name', store=False, compute='_get_logo_name')
    logo_desc = fields.Char(string='Description', store=False, compute='_get_logo_desc')
    logo_service = fields.Char(string='Service', store=False, compute='_get_logo_service')
    logo_stitch = fields.Char(string='Ks', store=False, compute='_get_logo_stitch')
    logo_colors_count = fields.Char(string='Colors', store=False, compute='_get_colors_count')
    surcharge_description = fields.Char(string='Surcharge Description', store=False, compute='_get_surcharge_desc')

    @api.multi
    def _get_logo_stitch(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            ol.logo_stitch = "{:.3f}".format(int(logo.stitch)/1000)

    @api.multi
    def _get_surcharge_desc(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            ol.surcharge_description = logo.surcharge_description

    @api.multi
    def _get_colors_count(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            ol.logo_colors_count = len(json.loads(logo.line_data))

    @api.multi
    def _get_logo_service(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            ol.logo_service = logo.service         

    @api.multi
    def _get_logo_name(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            if logo.raw_name:
                ol.logo_name = logo.raw_name 

    @api.multi
    def _get_logo_desc(self):
        for ol in self:
            logo = self.env['sale.order.logo'].browse(ol.product_id.logo_id.id)
            if logo.raw_desc:
                ol.logo_desc = logo.raw_desc      

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

    filename = fields.Char('File Name')

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

class MrpWorkorder(models.Model):
    _inherit = 'mrp.workorder'

    logo_file = fields.Binary(string='File Download', readonly=True, store=False, compute='_get_logo_file')

    logo_file_name = fields.Char("Download Design", compute='_get_logo_file_name')

    @api.multi
    def _get_logo_file(self):
        for record in self:
            product = record.product_id
            if product:
                record.logo_file = product.logo_id.raw_image
            else:
                record.logo_file = ""

    def _get_logo_file_name(self):
        for record in self:
            product = record.product_id
            if product:
                image_type = product.logo_id.raw_image_type
                if image_type:
                    record. logo_file_name = "design." + image_type       

class MrpWorkcenterProductivity(models.Model):
    _inherit = "mrp.workcenter.productivity"

    qty_production = fields.Float('Qty')                  

class Employee(models.Model):

    _inherit = "hr.employee"

    breaks = fields.Char(string='Breaks')

    hire_date = fields.Date('Hire Date', required=False)

    salary = fields.Selection([
        ('hourly', 'Hourly'),
        ('monthly', 'Monthly'),
        ('all', 'All')
        ], 'Salary', default='hourly', required=True)

    shift = fields.Selection([
        ('day', 'Day'),
        ('noon', 'Noon'),
        ('night', 'Night')
        ], 'Shift', default='day', required=True)

class EmbResPartnerNew(models.Model):
    
    _inherit = 'res.partner'

    f_tax_gst = fields.Char(string='GST #', required=False)
    f_tax_pst = fields.Char(string='PST #', required=False)

    f_tax_code = fields.Selection([
        ('0.0', 'No Tax'),
        ('0.0', ' E-GST Exempt'),
        ('5.00', 'G-GST'),
        ('7.00', 'I-GST'),
        ('7.00', 'P-PST'),
        ('7.00', 'B-PST'),
        ('12.00', 'GST 5.00%'),
        ('12.00', 'H-HST'),
        ('13.00', 'H-HST'),
        ], 'Tax Code', default='hourly', required=False)