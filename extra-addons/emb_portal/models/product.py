# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import models, api, tools, fields
import json


class ProductCategory(models.Model):
    _inherit = "product.category"

    child_id_with_name = fields.Char(compute='_compute_child_fields')

    @api.model
    def public_categories(self):
        all_categ_id = self.env['product.category'].search([('parent_id', '=', None)], limit=1)
        child_categ_id = self.env['product.category'].search_read([('parent_id', '=', all_categ_id.id)],['id','name','child_id_with_name'])
        return child_categ_id

    @api.one
    def _compute_child_fields(self):
        fields = []
        for child in self.child_id:
            if child.id:
                fields.append((child.id,child.name)) 
        self.child_id_with_name = json.dumps(fields)