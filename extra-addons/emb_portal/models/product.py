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

    name = fields.Char('Name')
    image = fields.Binary('Image', attachment=True, required=True)


class GarmentTemplate(models.Model):
    _name = "product.garment"

   # top bottom left right front back
    image_ids = fields.Many2many(
        'product.garment.image', string='Images', required=True)

    design_template = fields.Char('Design Template')