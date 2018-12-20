## Business sequence

![](https://github.com/rmrfself/st_main/blob/master/sequence.png?raw=true)


## Build target

### Design box

![](https://github.com/rmrfself/st_main/blob/master/st_main.png?raw=true)

### Cart list

![](https://github.com/rmrfself/st_main/blob/master/cart-detail.jpg?raw=true)

## odoo 版本

v11

## 中文参考文档

https://www.odoo.com/documentation/11.0/  



## 分支使用说明

master  ---> porduct 生产环境

staging ---> 集成测试环境

develop ---> code review / pull-request base 分支

feature/1...n --> 开发分支

## 环境构建

### 本地开发环境

```
git clone https://github.com/rmrfself/st_main.git

```

Postgresql9.6 + 

Pyhon3.6 +

启动命令

PS: 数据库 odoo_erp_v5 (数据库可以在指令执行过程中创建， 如果使用新的数据库，指定一个新的名称，比如 odoo_erp_v6)

```
./odoo-bin  -d odoo_erp_v5   --db_user odoo_master --db_password abcd@1234 --db_host localhost --db_port 5432 --addons-path="odoo/addons,odoo/extra-addons" --db-filter=odoo_erp_v5  --save --dev=reload
```

### 测试环境

https://cloud.google.com/sdk/gcloud/


## 生产环境服务部署


## 测试流程

```
[
                    ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                    ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                    ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                    ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                    ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                    ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                    ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                    ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                ]
                ```





