# -*- coding: utf-8 -*-
# Produced by mike.a.zhang@gmail.com.
#	<!-- ================= -->
#	<!-- ST Order Project -->
#	<!-- =================  -->

{
    "name" : "ST Product",
    "author" : "mike.a.zhang@gmail.com",
    "website": "mikezhang",
    "category": "Extra Tools",
    "summary": "This module will help to give style size color and brand configuration in products. This will help in searching as well.",
    "description": """
    
This module will help to give style, size, color and brand configuration in products. 
This will help in searching as well. 
You can easily filter and search products by style, size, color and brand.

                    """,
    "version":"11.0.1",
    "depends" : ["base","product","sale","sales_team","sale_management"],
    "application" : True,
    "data" : [
                'security/ir.model.access.csv',
                'views/product_view.xml',
            ],                                   
    "auto_install":False,
    "installable" : True,
    "price": 0,
    "currency": "EUR"
}
