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





