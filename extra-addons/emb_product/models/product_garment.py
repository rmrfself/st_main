# -*- coding: utf-8 -*-
# Produced by mike.a.zhang@gmail.com.
#	<!-- ================= -->
#	<!-- ST Order Project -->
#	<!-- =================  -->

from odoo import models, api, tools, fields


# User defined product templated base class
class ProductGarment(models.Model):
    _name = "product.garment"