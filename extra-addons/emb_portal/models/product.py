# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import models, api, tools, fields
import json
from odoo.tools.translate import html_translate

class ProductBrand(models.Model):
    _name = "product.brand"

    name = fields.Char(string='Brand Name', required=True)

class ProductStyle(models.Model):
    _name = "product.style"

    name = fields.Char(string='Style Name', required=True)
    html_class = fields.Char(string='HTML Classes')

class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    @api.model
    def public_brands(self):
        brand_attr = self.env['product.attribute'].search(
            [('name', '=', 'Brand')], limit=1)
        brand_attr_vals = self.env['product.attribute.value'].search_read(
            [('attribute_id', '=', brand_attr.id)],['id', 'name'])
        return brand_attr_vals


class ProductCategory(models.Model):
    _inherit = "product.category"

    child_id_with_name = fields.Char(compute='_compute_child_fields')

    @api.model
    def public_categories(self):
        all_categ_id = self.env['product.category'].search(
            [('parent_id', '=', None)], limit=1)
        child_categ_id = self.env['product.category'].search_read(
            [('parent_id', '=', all_categ_id.id)], ['id', 'name', 'child_id_with_name'])
        return child_categ_id

    @api.one
    def _compute_child_fields(self):
        fields = []
        for child in self.child_id:
            if child.id:
                fields.append((child.id, child.name))
        self.child_id_with_name = json.dumps(fields)

class ProductTemplate(models.Model):
    _inherit = ["product.template", "website.seo.metadata", 'website.published.mixin', 'rating.mixin']
    _order = 'sequence desc, name'
    _name = 'product.template'

    image_ids = fields.One2many('product.image', 'product_tmpl_id', string='Images')

class ProductImage(models.Model):
    _name = 'product.image'

    name = fields.Char('Name')
    image = fields.Binary('Image', attachment=True)
    product_tmpl_id = fields.Many2one('product.template', 'Related Product', copy=True)

