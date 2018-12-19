# -*- coding: utf-8 -*-
# Produced by mike.a.zhang@gmail.com.
#	<!-- ================= -->
#	<!-- ST Order Project -->
#	<!-- =================  -->

import re

from odoo import api, fields, models, tools, _
from odoo.exceptions import ValidationError
from odoo.osv import expression
from odoo.exceptions import ValidationError, RedirectWarning, except_orm


# Defined categories for customers
class ProductEmbCategory(models.Model):
    _name = "product.emb.category"
    _description = "Website Product Category"
    _order = "sequence, name"

    name = fields.Char(required=True, translate=True)
    parent_id = fields.Many2one(
        'product.emb.category', string='Parent Category', index=True)
    child_id = fields.One2many(
        'product.emb.category', 'parent_id', string='Children Categories')
    sequence = fields.Integer(string='Sequence',
        help="Gives the sequence order when displaying a list of product categories.")

    @api.constrains('parent_id')
    def check_parent_id(self):
        if not self._check_recursion():
            raise ValueError(
                _('Error ! You cannot create recursive categories.'))

    @api.multi
    def name_get(self):
        res = []
        for category in self:
            names = [category.name]
            parent_category = category.parent_id
            while parent_category:
                names.append(parent_category.name)
                parent_category = parent_category.parent_id
            res.append((category.id, ' / '.join(reversed(names))))
        return res


class ShProductStyle(models.Model):
    _name = "sh.product.style"

    name = fields.Char(string="Style", required=True)

    categ_id = fields.Many2one(
        'product.emb.category', 'Public Category',
        change_default=True, required=True, help="Select category for the current product")


class ShProductSize(models.Model):
    _name = "sh.product.size"

    name = fields.Char(string="Size", required=True)

    type = fields.Selection([
        ('1', 'US'),
        ('2', 'Europ'),
    ], 'Size', default='1', required=True)


class ShProductColor(models.Model):
    _name = "sh.product.color"

    name = fields.Char(string="Color", required=True)


class ShProductBrand(models.Model):
    _name = "sh.product.brand"

    name = fields.Char(string="Brand", required=True)


class ProductProduct(models.Model):
    _inherit = "product.product"

    sh_color_id = fields.Many2one(
        "sh.product.color", string="Color", readonly=True)
    sh_style_id = fields.Many2one(
        "sh.product.style", string="Style", readonly=True)
    sh_brand_id = fields.Many2one(
        "sh.product.brand", string="Brand", readonly=True)
    sh_size_id = fields.Many2one(
        "sh.product.size", string="Size", readonly=True)

    @api.multi
    def name_get(self):
        # TDE: this could be cleaned a bit I think
        def _name_get(d):
            pro_name = d.get('name', '')
            code = self._context.get('display_default_code', True) and d.get(
                'default_code', False) or False

            color = d.get('sh_color_id', False) or False
            brand = d.get('sh_brand_id', False) or False
            size = d.get('sh_size_id', False) or False
            style = d.get('sh_style_id', False) or False

            name = '['
            if code:
                name += code

            if color:
                if name == '[':
                    name += color
                else:
                    name += ' ' + color
            if brand:
                if name == '[':
                    name += brand
                else:
                    name += ' ' + brand
            if size:
                if name == '[':
                    name += size
                else:
                    name += ' ' + size
            if style:
                if name == '[':
                    name += style
                else:
                    name += ' ' + style

            name += ']'
            if name == '[]':
                name = pro_name
            else:
                name += ' ' + pro_name

            return (d['id'], name)

        partner_id = self._context.get('partner_id')
        if partner_id:
            partner_ids = [partner_id, self.env['res.partner'].browse(
                partner_id).commercial_partner_id.id]
        else:
            partner_ids = []

        # all user don't have access to seller and partner
        # check access and use superuser
        self.check_access_rights("read")
        self.check_access_rule("read")

        result = []
        for product in self.sudo():
            # display only the attributes with multiple possible values on the template
            variable_attributes = product.attribute_line_ids.filtered(
                lambda l: len(l.value_ids) > 1).mapped('attribute_id')
            variant = product.attribute_value_ids._variant_name(
                variable_attributes)

            name = variant and "%s (%s)" % (
                product.name, variant) or product.name
            sellers = []
            if partner_ids:
                sellers = [x for x in product.seller_ids if (
                    x.name.id in partner_ids) and (x.product_id == product)]
                if not sellers:
                    sellers = [x for x in product.seller_ids if (
                        x.name.id in partner_ids) and not x.product_id]
            if sellers:
                for s in sellers:
                    seller_variant = s.product_name and (
                        variant and "%s (%s)" % (
                            s.product_name, variant) or s.product_name
                    ) or False
                    mydict = {
                        'id': product.id,
                        'name': seller_variant or name,
                        'default_code': s.product_code or product.default_code,
                        'sh_color_id': product.sh_color_id and product.sh_color_id.name,
                        'sh_brand_id': product.sh_brand_id and product.sh_brand_id.name,
                        'sh_size_id': product.sh_size_id and product.sh_size_id.name,
                        'sh_style_id': product.sh_style_id and product.sh_style_id.name,
                    }
                    temp = _name_get(mydict)
                    if temp not in result:
                        result.append(temp)
            else:
                mydict = {
                    'id': product.id,
                    'name': name,
                    'default_code': product.default_code,
                    'sh_color_id': product.sh_color_id and product.sh_color_id.name,
                    'sh_brand_id': product.sh_brand_id and product.sh_brand_id.name,
                    'sh_size_id': product.sh_size_id and product.sh_size_id.name,
                    'sh_style_id': product.sh_style_id and product.sh_style_id.name,
                }
                result.append(_name_get(mydict))
        return result

    @api.model
    def name_search(self, name='', args=None, operator='ilike', limit=100):
        if not args:
            args = []
        if name:
            positive_operators = ['=', 'ilike', '=ilike', 'like', '=like']
            products = self.env['product.product']
            if operator in positive_operators:
                products = self.search(['|', '|', '|', '|',
                                        ('default_code', '=', name),
                                        ('sh_color_id.name', 'ilike', name),
                                        ('sh_brand_id.name', 'ilike', name),
                                        ('sh_size_id.name', 'ilike', name),
                                        ('sh_style_id.name', 'ilike', name)
                                        ] + args, limit=limit)
                if not products:
                    products = self.search(
                        [('barcode', '=', name)] + args, limit=limit)

            if not products and operator not in expression.NEGATIVE_TERM_OPERATORS:
                # Do not merge the 2 next lines into one single search, SQL search performance would be abysmal
                # on a database with thousands of matching products, due to the huge merge+unique needed for the
                # OR operator (and given the fact that the 'name' lookup results come from the ir.translation table
                # Performing a quick memory merge of ids in Python will give much better performance
                products = self.search(
                    args + [('default_code', operator, name)], limit=limit)
                if not limit or len(products) < limit:
                    # we may underrun the limit because of dupes in the results, that's fine
                    limit2 = (limit - len(products)) if limit else False
                    products += self.search(
                        args + [('name', operator, name), ('id', 'not in', products.ids)], limit=limit2)
            elif not products and operator in expression.NEGATIVE_TERM_OPERATORS:
                products = self.search(
                    args + ['&', ('default_code', operator, name), ('name', operator, name)], limit=limit)
            if not products and operator in positive_operators:
                ptrn = re.compile('(\[(.*?)\])')
                res = ptrn.search(name)
                if res:
                    products = self.search(
                        [('default_code', '=', res.group(2))] + args, limit=limit)
            # still no results, partner in context: search on supplier info as last hope to find something
            if not products and self._context.get('partner_id'):
                suppliers = self.env['product.supplierinfo'].search([
                    ('name', '=', self._context.get('partner_id')),
                    '|',
                    ('product_code', operator, name),
                    ('product_name', operator, name)])
                if suppliers:
                    products = self.search(
                        [('product_tmpl_id.seller_ids', 'in', suppliers.ids)], limit=limit)
        else:
            products = self.search(args, limit=limit)
        return products.name_get()

# contains 6 positions: t,b,f,b,l,r
class ProductImage(models.Model):
    _name = 'product.side_image'

    name = fields.Char('Name')
    image = fields.Binary('Image', attachment=True, required=True)


class ProductTemplate(models.Model):
    _inherit = "product.template"

    resource_type = fields.Selection([('garment', 'Garment'), ('logo', 'Logo')], string='Asset Type', required=True, default='garment',
        help="Please choose which type of resource,support garment or logo")

    emb_categ_id = fields.Many2one('product.emb.category', string='Product Category',
                                        help="Categories can be published on the Shop page (online catalog grid) to help "
                                        "customers find all the items within a category. To publish them, go to the Shop page, "
                                        "hit Customize and turn *Product Categories* on. A product can belong to several categories.")
    # top bottom left right front back
    image_ids = fields.Many2many(
        'product.side_image', string='Images', required=True)

    # pre-defined style
    sh_style_id = fields.Many2one(
        "sh.product.style", string="Style")

    # user input brand names
    sh_brand_id = fields.Many2one(
        "sh.product.brand", string="Brand")

    # user defined colors
    sh_color_ids = fields.Many2many(
        "sh.product.color", string="Color")

    # system pre-defined size templates
    sh_size_ids = fields.Many2many(
        "sh.product.size", string="Size")
