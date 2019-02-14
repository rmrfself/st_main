/**
 * Garment upload module
 * By mike.a.zhang@gmail.com
 * +8616604114500(china)
 * Github account: rmrfself
 */
odoo.define("emb_portal.garment_upload", function (require) {
    "use strict";

    var rpc = require("web.rpc");
    var ajax = require("web.ajax");

    function GmManager() {}

    function LogoManager() {}

    function UploadManager() {}

    function GraphComposer() {
        this.cc =
            '{"S0502":["239","200","16"],"S0505":["12","8","45"],"S0508":["249","230","202"],"S0520":["253","243","218"],"S0521":["178","108","41"],"S0525":["52","72","30"],"S0526":["17","54","117"],"S0538":["17","20","8"],"S0561":["225","0","0"],"S0562":["255","180","53"],"S0567":["243","160","1"],"S0568":["230","109","0"],"S0569":["22","95","40"],"S0571":["142","108",null],"S0572":["16","10","124"],"S0580":["53","105","61"],"S0619":["233","189","150"],"S0621":["205","57","0"],"S0630":["119","113","19"],"S0640":["111","81",null],"S0643":["38","35","69"],"S1001":["249","249","255"],"S1002":["249","249","244"],"S1005":["0","0","0"],"S1011":["183","169","172"],"S1015":["225","175","154"],"S1016":["236","150","140"],"S1017":["239","223","189"],"S1019":["236","160","130"],"S1020":["240","130","120"],"S1021":["235","102","2"],"S1022":["255","247","213"],"S1023":["255","230","105"],"S1024":["255","184","0"],"S1025":["215","128","0"],"S1028":["190","195","225"],"S1029":["160","195","235"],"S1030":["166","162","198"],"S1031":["223","190","200"],"S1032":["230","140","235"],"S1033":["216","100","150"],"S1034":["198","50","60"],"S1035":["121","0","0"],"S1037":["249","0","0"],"S1039":["235","0","0"],"S1040":["135","115","117"],"S1041":["140","127","131"],"S1042":["50","30","80"],"S1043":["25","5","37"],"S1044":["29","6","47"],"S1045":["195","239","191"],"S1046":["46","131","89"],"S1047":["166","194","132"],"S1049":["66","160","33"],"S1051":["30","100","25"],"S1054":["238","190","174"],"S1055":["235","188","128"],"S1056":["175","91","0"],"S1057":["100","39","2"],"S1058":["102","53","0"],"S1059":["83","6","1"],"S1061":["255","247","185"],"S1063":["240","248","236"],"S1064":["230","180","170"],"S1065":["255","145","0"],"S1066":["255","241","128"],"S1067":["255","255","133"],"S1068":["243","219","217"],"S1070":["246","206","105"],"S1071":["249","249","234"],"S1074":["214","213","232"],"S1076":["90","90","139"],"S1077":["190","205","200"],"S1078":["255","102","0"],"S1079":["23","85","35"],"S1080":["220","130","160"],"S1081":["240","110","120"],"S1082":["247","227","187"],"S1083":["255","193","0"],"S1085":["226","207","199"],"S1086":["249","249","224"],"S1090":["22","98","95"],"S1094":["38","191","202"],"S1095":["16","209","189"],"S1096":["15","105","120"],"S1100":["194","211","125"],"S1101":["9","133","49"],"S1103":["2","20","15"],"S1104":["165","175","104"],"S1108":["250","164","164"],"S1109":["220","100","150"],"S1111":["252","203","223"],"S1112":["70","1","110"],"S1113":["240","200","180"],"S1115":["240","185","185"],"S1117":["245","169","160"],"S1119":["180","110","117"],"S1120":["240","214","210"],"S1121":["250","185","203"],"S1122":["130","40","142"],"S1124":["255","236","0"],"S1126":["220","140","23"],"S1127":["250","236","198"],"S1128":["195","148","113"],"S1129":["106","31","6"],"S1130":["85","22","2"],"S1131":["73","0","2"],"S1134":["80","125","170"],"S1135":["255","240","114"],"S1137":["255","190","0"],"S1143":["74","88","112"],"S1145":["180","225","235"],"S1147":["235","0","0"],"S1148":["255","189","189"],"S1149":["232","200","156"],"S1151":["226","226","235"],"S1154":["250","153","153"],"S1156":["99","99","39"],"S1158":["186","69","0"],"S1159":["211","157","0"],"S1162":["16","57","74"],"S1165":["223","229","235"],"S1166":["142","126","126"],"S1167":["255","210","38"],"S1168":["245","116","10"],"S1169":["156","0","0"],"S1170":["151","95","47"],"S1171":["8","24","14"],"S1172":["110","120","140"],"S1173":["89","89","29"],"S1174":["13","41","4"],"S1175":["21","45","4"],"S1176":["81","83","8"],"S1177":["137","152","18"],"S1179":["143","98","61"],"S1180":["165","137","115"],"S1181":["203","0","0"],"S1182":["2","1","20"],"S1183":["50","6","20"],"S1184":["255","102","0"],"S1185":["252","190","5"],"S1186":["91","0","0"],"S1187":["255","229","0"],"S1188":["255","0","75"],"S1189":["75","18","45"],"S1190":["160","70","86"],"S1191":["189","30","96"],"S1192":["30","130",null],"S1193":["230","175","210"],"S1194":["210","116","215"],"S1195":["55","1","80"],"S1196":["150","195","225"],"S1197":["34","15","52"],"S1198":["60","80","117"],"S1199":["42","20","63"],"S1200":["20","11","45"],"S1201":["100","139","190"],"S1202":["24","43","86"],"S1203":["174","184","195"],"S1204":["168","200","188"],"S1205":["110","144","165"],"S1206":["30","110","111"],"S1207":["128","163","136"],"S1208":["12","61","3"],"S1209":["189","209","99"],"S1210":["39","59","0"],"S1211":["149","164","144"],"S1212":["99","99","45"],"S1213":["185","160","150"],"S1214":["100","40","40"],"S1215":["80","10","30"],"S1216":["172","28","1"],"S1217":["151","31","1"],"S1218":["223","223","203"],"S1219":["152","136","140"],"S1220":["118","89","96"],"S1222":["209","219","255"],"S1223":["220","224","241"],"S1224":["240","160","185"],"S1225":["250","203","203"],"S1226":["87","54","158"],"S1227":["175","137","1"],"S1228":["150","170","139"],"S1229":["224","219","219"],"S1230":["11","65","51"],"S1231":["229","50","106"],"S1232":["25","50","7"],"S1233":["13","34","16"],"S1234":["60","27","31"],"S1235":["120","50","152"],"S1236":["234","228","228"],"S1237":["188","61","44"],"S1238":["255","131","0"],"S1239":["255","171","87"],"S1240":["116","88","108"],"S1241":["93","52","70"],"S1242":["84","58","141"],"S1243":["224","198","59"],"S1246":["255","0","0"],"S1247":["102","0","0"],"S1248":["210","230","240"],"S1249":["98","170","220"],"S1250":["39","92","112"],"S1251":["48","111","117"],"S1252":["9","161","168"],"S1253":["27","76","164"],"S1254":["230","185","245"],"S1255":["190","25","130"],"S1256":["235","130","150"],"S1257":["230","0","65"],"S1258":["240","196","160"],"S1259":["226","130","100"],"S1260":["221","171","0"],"S1262":["169","136","3"],"S1263":["179","0","0"],"S1264":["106","0","0"],"S1265":["155","107","44"],"S1266":["156","109","69"],"S1267":["134","76","49"],"S1268":["239","239","229"],"S1269":["172","135","131"],"S1270":["183","183","175"],"S1271":["60","79","49"],"S1272":["74","74","25"],"S1273":["54","54","31"],"S1274":["92","154","26"],"S1275":["224","230","200"],"S1276":["112","119","15"],"S1277":["2","118","2"],"S1278":["0","175","56"],"S1279":["147","209","108"],"S1280":["70","183","116"],"S1283":["72","61","89"],"S1284":["70","110","120"],"S1285":["19","79","69"],"S1286":["52","50","19"],"S1287":["65","85","69"],"S1288":["165","111",null],"S1289":["220","235","240"],"S1291":["114","116","131"],"S1292":["209","220","250"],"S1293":["68","35","93"],"S1294":["65","32","68"],"S1295":["130","135","140"],"S1296":["210","170","240"],"S1297":["115","90","100"],"S1298":["100","70","100"],"S1299":["65","20","70"],"S1300":["126","30","70"],"S1301":["50","0","70"],"S1302":["110","10","150"],"S1303":["250","95","127"],"S1304":["180","115","100"],"S1305":["174","198","187"],"S1306":["126","108","124"],"S1307":["219","100","120"],"S1309":["35","70",null],"S1311":["150","26","50"],"S1312":["132","0","0"],"S1313":["252","143","12"],"S1317":["255","0","0"],"S1321":["203","203","189"],"S1322":["129","137","1"],"S1325":["248","245","241"],"S1327":["213","199","195"],"S1328":["192","178","183"],"S1329":["171","160","168"],"S1331":["237","246","212"],"S1332":["134","129","5"],"S1333":["243","182","0"],"S1503":["52","150","105"],"S1508":["193","203","185"],"S1510":["122","179","29"],"S1511":["238","80","120"],"S1513":["0","122","103"],"S1515":["255","140","203"],"S1517":["1","79","58"],"S1533":["205","5","77"],"S1534":["52","125","203"],"S1535":["35","35","139"],"S1536":["8","23","5"],"S1543":["255","214","199"],"S1545":["156","100","132"],"S1549":["230","174","111"],"S1550":["108","142","135"],"S1551":["176","174",null],"S1552":["108","124","113"],"S1554":["140","116","140"],"S1558":["235","113","131"],"S1560":["224","248",null],"S1561":["181","140","199"],"S1644":["163","194","215"],"S1800":["231","144","2"],"S1801":["250","220","150"],"S1802":["255","200","150"],"S1803":["255","155","110"],"S1804":["55","90","115"],"S1805":["40","80","90"],"S1806":["160","185","195"],"S1807":["180","150","130"],"S1808":["210","175","155"],"S1809":["160","125","130"],"S1810":["100","80","85"],"S1811":["60","40","55"],"S1812":["110","45","90"],"S1813":["110","45","65"],"S1814":["175","75","105"],"S1815":["145","180","50"],"S1816":["215","245","140"],"S1817":["170","175","20"],"S1818":["200","245","140"],"S1819":["195","145","60"],"S1820":["195","140","115"],"S1821":["250","200","150"],"S1822":["150","90","55"],"S1823":["90","40",null],"S1824":["210","195","175"],"S1825":["95","150","25"],"S1826":["170","130","10"],"S1827":["255","100","60"],"S1828":["255","230","170"],"S1829":["240","235","165"],"S1830":["180","115","150"],"S1831":["145","225","45"],"S1832":["225","145","25"],"S1833":["210","95","0"],"S1834":["175","170","5"],"S1835":["110","130","5"],"S1836":["60","75","5"],"S1837":["115","90",null],"S1838":["205","170","125"],"S1839":["135","200","135"],"S0542":["255","255","0"],"S1261":["255","236","0"],"S1367":["255","180","0"],"S0836":["220","210","175"],"S0868":["235","210","120"],"S0622":["248","212","138"],"S1334":["167","138","5"],"S1244":["202","169","2"],"S1245":["178","142","0"],"S0688":["185","165","100"],"S1389":["195","185","150"],"S0610":["149","149","139"],"S1282":["146","149","3"],"S1609":["15","60","15"],"S0523":["231","144","2"],"S1320":["199","126","35"],"S0614":["139","30","1"],"S0535":["125","38","42"],"S1323":["71","2","0"],"S1324":["70","1","0"],"S0677":["255","110","0"],"S1393":["230","25","25"],"S1319":["239","0","0"],"S1315":["235","102","6"],"S1314":["240","110","12"],"S1401":["185","25","25"],"S0607":["150","60","70"],"S1310":["188","54","90"],"S1308":["154","44","80"],"S1036":["122","0","0"],"S0534":["120","20","60"],"S0670":["105","55","60"],"S1720":["140","205","175"],"S1711":["175","180",null],"S0861":["135","180",null],"S1290":["85","165",null],"S0817":["235","195",null],"S1281":["3","103","70"],"S0570":["55","140","55"],"S1718":["0","200","0"],"S0524":["34","3","39"],"S1598":["25","30","45"],"S1465":["225","225","225"],"S0501":["180","185","165"],"S1326":["238","227","225"],"S1351":["255","255","225"],"S1721":["160","145","130"],"S1330":["137","112","125"],"S1352":["40","40","40"],"S1366":["255","241","128"]}';
        this.dd = JSON.parse(cc);
        this.background = new fabric.Canvas("make-canvas", {
            selection: false,
            //preserveObjectStacking: true
            cacheobects: false,
            width: 555,
            height: 620
        });
        this.background.custom_attr = {};
        this.background.selectionColor = "rgba(0,255,0,0.3)";
    }

    var localStorage = require("web.local_storage");
    var session = require("web.session");
    var GARMENT_COLOR_KEY = "GM_COLOR";
    var POSITION = ["right", "left", "back", "front", "top", "bottom"];
    var FILE_TYPE_AI = "ai";
    var FILE_TYPE_DST = "dst";
    var ZOOM_IN_RATE = 1.1;
    var ZOOM_OUT_RATE = 0.8;

    var CANVAS_BACKGROUND_WIDTH = 555;

    $.blockUI.defaults.overlayCSS = {
        opacity: 0.1,
        "background-color": "#000"
    };

    GraphComposer.prototype = {
        init: function () {
            this._addEventListeners();
            this._displayLogoDetail();
        },
        /**
         * 1. Bind Eevent Listners To Components
         */
        _addEventListeners: function () {
            var self = this;
            var targets = $(".logo-assets").find("a");
            targets.each(function (e) {
                $(this).attr("draggable", "true");
                $(this).on("dragstart", self._onLogoDragged);
                $(this).click(function (e) {
                    self._displayLogoDetail($(this).attr("data-id"));
                });
            });

            $("#compose-box").unbind("drop");
            $("#compose-box").unbind("dragover");
            $("#compose-box").on("drop", this._onLogoDropped.bind(this));
            $("#compose-box").on("dragover", this._allowDropped);
            // set canvas event listners
            this.background.on({
                "object:moving": self._onLogoMoving.bind(this),
                "object:modified": console.log("event mock"),
                "object:added": console.log("event mock"),
                "object:removed": console.log("event mock"),
                "object:rotating": console.log("event mock"),
                "object:scaling": self._onLogoScaling.bind(this),
                "selection:cleared": self._clearEditLogoStatus.bind(this)
            });
            $("#submit-edit-ok").click(function (event) {
                self._onDesignDown();
            });
            $("#submit-edit-finish").click(function (event) {
                self._onPostDesignData();
            });
            $("#tools-box")
                .find(".closex")
                .click(function (event) {
                    $("#tools-box").slideUp();
                    return false;
                });
            $("#btn-zoom-in").click(function (event) {
                var originZoom = self.background.getZoom();
                self.background.zoomToPoint({
                        x: 200,
                        y: 200
                    },
                    originZoom * ZOOM_IN_RATE
                );
            });
            $("#btn-zoom-out").click(function (event) {
                var originZoom = self.background.getZoom();
                self.background.zoomToPoint({
                        x: 200,
                        y: 200
                    },
                    originZoom * ZOOM_OUT_RATE
                );
            });
            $('#submit-edit-finish').attr('disabled', true);
        },
        /**
         * 1.1 On logo moving event
         */
        _onLogoMoving: function (event) {
            var id = localStorage.getItem("background-image-id");
            var logoId = event.target.resourceId;
            if (id == undefined) {
                return false;
            }
            var pos = {};
            pos.left = event.target.left;
            pos.top = event.target.top;
            this._saveLogoPosDataToCanvas(id, logoId, pos);
        },
        /**
         * 1.2 On logo scaling
         */
        _onLogoScaling: function (event) {
            var id = localStorage.getItem("background-image-id");
            var logoId = event.target.resourceId;
            if (id == undefined) {
                return false;
            }
            var zoom = {};
            zoom.zoomx = event.target.zoomX;
            zoom.zoomy = event.target.zoomY;
            this._saveLogoZoomDataToCanvas(id, logoId, zoom);
        },
        /**
         * 2. Select the first logo and display in line colors.
         */
        _displayLogoDetail: function (id) {
            // check default current LOGO
            var defaultId = localStorage.getItem("current-logo-id");
            if (defaultId == null) {
                var targets = $(".logo-assets").find("a");
                if (targets.length > 0) {
                    var firstNode = targets.first();
                    defaultId = firstNode.attr("data-id");
                    localStorage.setItem("current-logo-id", defaultId);
                    this._setDefaultLogo(id || defaultId);
                }
            } else {
                this._setDefaultLogo(id || defaultId);
            }
        },
        /**
         * 3. Generate line clolor inuts
         */
        _setDefaultLogo: function (id) {
            var targets = $(".logo-assets").find("a");
            var target = $("#logo-id-" + id);
            //remove current class
            targets.each(function (item) {
                $(this)
                    .removeClass("green_border")
                    .addClass("gray_border");
            });
            target.addClass("green_border");
            this._showLineColors(target);
        },
        /**
         * 4. Display inputs of line colors
         */
        _showLineColors: function (holder) {
            var self = this;
            var img = holder.find("img").attr("src");
            var id = holder.attr("data-id");
            var encodeData = img.split(",");
            var targetData = atob(encodeData[1]);
            fabric.loadSVGFromString(targetData, function (objects, options) {
                self._previewSvgLines(id, objects, true);
            });
        },
        /**
         * 4.1 Display inputs of line colors
         */
        _previewSvgLines: function (id, objects, readonly) {
            if (_.isEmpty(objects)) {
                return false;
            }
            var container = $("#line-container");
            var onEdit = container.attr("on-edit");
            if (onEdit == "true") {
                return false;
            }
            container.html("");
            objects.map(function (item, index) {
                var subItem = $("<div>").addClass("line-color-input");
                var stepSpan = $("<span>").html("Step" + (index + 1));
                var colorInput = $("<input>")
                    .attr("name", "line_color[]")
                    .attr("item-id", id)
                    .attr("line-seq", index);
                colorInput.attr("type", "text");
                if (readonly) {
                    colorInput.attr("readonly", "true");
                }
                colorInput.addClass("form-control");
                subItem.append(stepSpan).append(colorInput);
                container.append(subItem);
            });
        },
        /**
         * 6. Set background color by selected garment image
         */
        setBackground: function (image) {
            var parent = this;
            var backgroundImg = new Image();
            var canvas = this.background;
            this._setLogoEditable(false);
            backgroundImg.onload = function () {
                var fImg = new fabric.Image(backgroundImg);
                fImg.scaleToWidth(CANVAS_BACKGROUND_WIDTH);
                canvas.setBackgroundImage(fImg, canvas.renderAll.bind(canvas), {
                    left: 0,
                    top: 0,
                    originX: "left",
                    originY: "top"
                });
            };
            backgroundImg.src = image.attr("src");
            canvas.backgroundColor = "white";
            canvas.renderAll();
            // Save current image.
            localStorage.setItem("background-image-id", image.attr('id'));
            localStorage.setItem("background-mode", 'image');
            var backgroundColor = localStorage.getItem("background-color");
            if (backgroundColor != null) {
                var toolItem = {
                    type: "color",
                    payload: backgroundColor
                };
                this._addToolBoxItem(toolItem);
            }
            // Save the background data
            var imgId = image.attr('id');
            this._saveGmtDataToCanvas(imgId, 'image', imgId);
        },
        /**
         * 7. Change background color of canvas by click color blocks;
         */
        _changeBackgroundColor: function (color) {
            this._setLogoEditable(true);
            this.background.backgroundImage = 0;
            this.background.backgroundColor = color;
            this.background.renderAll();
            var toolItem = {
                type: "color",
                payload: color
            };
            this._addToolBoxItem(toolItem);
            localStorage.setItem("background-color", color);
            localStorage.setItem("background-mode", 'color');
            var backgroundImageId = localStorage.getItem("background-image-id");
            if (backgroundImageId != null) {
                toolItem = {
                    type: "image",
                    payload: backgroundImageId
                };
                this._addToolBoxItem(toolItem);
            }
            // save it into custom data
            this._saveGmtDataToCanvas(backgroundImageId, 'color', color);
        },
        /**
         * 6.1 After clicking colors block, add a new block into canvas.
         */
        _addToolBoxItem: function (item) {
            var self = this;
            if (item == undefined || item.payload == undefined) {
                return false;
            }
            var toolsInfo = $("#tools-info");
            if (item.type == "color") {
                toolsInfo.find(".color-bar").remove();
                var colorBlock = $("<div>")
                    .css("background", item.payload);
                colorBlock.addClass("color-bar");
                colorBlock.click(function (event) {
                    $(this).addClass('current');
                    self._changeBackgroundColor(item.payload);
                });
                toolsInfo.append(colorBlock);
            }
            if (item.type == "image") {
                var backgroundImageId = item.payload;
                var backgroundImage = $('#' + backgroundImageId);
                var barImageSrc = backgroundImage.find("img").attr('src');
                var barImage = $('<img>').attr("width", '38').attr('src', barImageSrc);
                var barImagePos = $('#ava_' + backgroundImageId);
                if (barImagePos != null) {
                    barImagePos.remove();
                }
                var imgBar = $('<a>').attr('id', 'ava_' + backgroundImageId);
                imgBar.attr('class', 'image-bar-small');
                barImage.attr('width', '38');
                imgBar.html(barImage);
                imgBar.click(function (e) {
                    $(this).addClass('current');
                    self.setBackground(backgroundImage);
                });
                toolsInfo.append(imgBar);
            }
            if ($("#tools-box").is(":visible") == false) {
                $("#tools-box").slideDown();
            }
        },
        /**
         * 7. Drag the logo into canvas handler.
         */
        _onLogoDragged: function (event) {
            var dataId = $(event.target).attr("data-id");
            var dataType = $(event.target).attr("data-type");
            localStorage.setItem("drag-data-id", dataId);
            localStorage.setItem("drag-data-type", dataType);
        },
        /**
         * 7.1 Active the canvas when dragging logo
         */
        _allowDropped: function (event) {
            event.preventDefault();
            var target = $("#compose-box");
            target.addClass("green_border");
        },
        /**
         * 7.2  After dropped handler when drop the logo.
         */
        _onLogoDropped: function (event) {
            // get position
            var offsetX = event.originalEvent.offsetX;
            var offsetY = event.originalEvent.offsetY;
            var self = this;
            var target = $("#compose-box");
            target.removeClass("green_border").addClass("gray_border");
            // mock data
            var targetId = localStorage.getItem("drag-data-id");
            var targetType = localStorage.getItem("drag-data-type");
            var dragTarget = $("#logo-id-" + targetId)
                .find("img")
                .attr("src");
            var encodeData = dragTarget.split(",");
            var targetData = atob(encodeData[1]);
            var paths = fabric.loadSVGFromString(targetData, function (
                objects,
                options
            ) {
                if (targetType == FILE_TYPE_DST) {
                    objects.map(function (item, index) {
                        item.id = "logo-" + targetId + "-" + index;
                        item.class = "logo-stroke-path";
                        item.svgUid = index;
                        item.stroke = "#000000";
                        item.dataType = targetType;
                    });
                }
                if (targetType == FILE_TYPE_AI) {
                    objects.map(function (item, index) {
                        item.id = "logo-" + targetId + "-" + index;
                        item.class = "logo-stroke-path";
                        item.svgUid = index;
                        item.fill = "#000000";
                        item.dataType = targetType;
                    });
                }
                var obj = fabric.util.groupSVGElements(objects, options);
                //obj.lockScalingX = true;
                //obj.lockScalingY = true;
                obj.inner_paths = [];
                obj.resourceType = targetType;
                obj.resourceId = targetId;
                obj.cid = 1;
                //obj.subTargetCheck = true;
                //obj.selectable = true;
                obj
                    .scaleToHeight(self.background.height / 4)
                    .set({
                        left: offsetX,
                        top: offsetY,
                        borderColor: "red",
                        cornerColor: "green",
                        cornerSize: 6,
                        transparentCorners: false
                    })
                    .center()
                    .setCoords();
                self.background.add(obj).renderAll();
                // Save logo data into canvas
                var gmtId = localStorage.getItem("background-image-id");
                if (gmtId != undefined) {
                    self._saveLogoDataToCanvas(gmtId, targetId, targetType);
                }
                // End
                self._showLineColorsEx(targetId, targetType, obj._objects);
                obj.on("selected", function (event) {
                    var act = self.background.getActiveObject();
                    self._showLineColorsEx(targetId, targetType, act._objects);
                    if ($("#tools-box").is(":visible") == false) {
                        $("#tools-box").slideDown();
                    }
                });
                var canvas = self.background;
                window.fabric.util.addListener(
                    canvas.upperCanvasEl,
                    "dblclick",
                    function (event) {
                        self._onRemoveLogo();
                    }
                );
                $.notify({
                    icon: "glyphicon glyphicon-ok",
                    title: "Item Added",
                    message: "You can edit them now."
                }, {
                    type: "success"
                });
            });
            if ($("#tools-box").is(":visible") == false) {
                $("#tools-box").slideDown();
            }
            // Save current logo object into canvas
        },
        /**
         * 8.  Important: when selectting the logo in canvas, get all lines and generate new inputs of line colors
         */
        _showLineColorsEx: function (id, type, objects) {
            if (_.isEmpty(objects)) {
                return false;
            }
            var container = $("#line-container");
            container.attr("on-edit", "true");
            container.html("");
            var self = this;
            objects.map(function (item, index) {
                var subItem = $("<div>").addClass("line-color-input");
                var stepSpan = $("<span>").html("Step" + (index + 1));
                var colorInput = $("<input>")
                    .attr("name", "line_color[]")
                    .attr("item-id", id)
                    .attr("line-seq", index);
                colorInput.attr("item-type", type);
                colorInput.attr("type", "text");
                colorInput.val(item.strokeData || item.fillData);
                colorInput.addClass("form-control");
                colorInput.blur(function (event) {
                    self._onLineColorInput($(this));
                });
                subItem.append(stepSpan).append(colorInput);
                container.append(subItem);
            });
        },
        /**
         * 9.1 When input the colors , this is the handler.
         */
        _onLineColorInput: function (input) {
            var inputStr = input.val();
            if (_.isEmpty(inputStr)) {
                return false;
            }
            if (_.isEmpty(inputStr.match(/S\d+/i))) {
                $.notify({
                    icon: "glyphicon glyphicon-remove",
                    title: "Error input",
                    message: "The input value:" + inputStr + " is not valid"
                }, {
                    type: "danger"
                });
                input.val("");
            } else {
                var id = input.attr("item-id");
                input.attr('style', 'background:#FFFFFF');
                var seq = parseInt(input.attr("line-seq"));
                var type = input.attr("item-type");
                this._renderCurrentLine(id, seq, type, inputStr);
                // Save line colors into canvas

            }
        },
        /**
         * 9.2 After input line colors, rerender the canvas logos.
         */
        _renderCurrentLine: function (id, seq, type, color) {
            var self = this;
            color = color.toUpperCase();
            var colorHex = dd[color] || [255, 255, 255];
            var colorData =
                "rgb(" + colorHex[0] + "," + colorHex[1] + "," + colorHex[2] + ")";
            var currentLogo = this.background.getActiveObject();
            if (!currentLogo) {
                $.notify({
                    icon: "glyphicon glyphicon-remove",
                    title: "Error input",
                    message: "Please select the edit target before input this."
                }, {
                    type: "danger"
                });
                return false;
            }
            var objects = currentLogo._objects;
            var itemId = "logo-" + id + "-" + seq;
            // Save data into canvas
            var Gmtid = localStorage.getItem("background-image-id");
            var logoId = currentLogo.resourceId;
            objects.map(function (item) {
                if (item.id == itemId) {
                    if (type == FILE_TYPE_DST) {
                        item.set("stroke", colorData);
                        item.set("strokeData", color);
                    }
                    if (type == FILE_TYPE_AI) {
                        item.set("fill", colorData);
                        item.set("fillData", color);
                    }
                    item.set("dirty", true);
                    self._saveLogoColorDataToCanvas(Gmtid, logoId, seq, color);
                }
                return item;
            });
            this.background.renderAll();
        },
        /**
         * 10. Remove the logos by dbclicking logo in canvas.
         */
        _onRemoveLogo: function () {
            var currentLogo = this.background.getActiveObject();
            if (!currentLogo) return;
            var targetId = currentLogo.resourceId;
            this.background.remove(currentLogo);
            var container = $("#line-container");
            var inputs = container.find("input");
            if (_.isEmpty(inputs)) {
                return false;
            }
            container.attr("on-edit", "false");
            inputs.each(function (item) {
                $(this).attr("readonly", "true");
            });
            // Remove data from custom canvas data 
            var gmtId = localStorage.getItem("background-image-id");
            if (gmtId != undefined) {
                this._removeLogoDataToCanvas(gmtId, targetId);
            }
            // End
            var objects = this.background.getObjects();
            if (objects.length == 0) {
                $("#tools-box").slideUp();
            }
            $.notify({
                icon: "glyphicon glyphicon-ok",
                title: "Logo Removed",
                message: "The logo designment already removed."
            }, {
                type: "success"
            });
        },
        /**
         * 10.1. Make the inputs disabled of line colors.
         */
        _clearEditLogoStatus: function () {
            var container = $("#line-container");
            var inputs = container.find("input");
            if (_.isEmpty(inputs)) {
                return false;
            }
            container.attr("on-edit", "false");
            inputs.each(function (item) {
                $(this).attr("readonly", "true");
            });
        },
        /**
         * 11. Design down button handler
         */
        _onDesignDown: function (event) {
            var validated = this._onDdValidation();
            if (validated == false) {
                return false;
            }
            /**
             * Validate whether needing to create or update
             */
            this._determineUpdateOrNew();
            /**
             * Save the design data to local and server;
             */
            this._saveCurrentDesign();
            /**
             * Enable quantity inputs
             */
            $('#gmt-info-quantity').find('input').removeAttr('readonly');
            $('#submit-edit-finish').removeAttr('disabled');
        },
        /**
         * 11.1 Validating user inputs before design down handler.
         */
        _onDdValidation: function () {
            var self = this;
            var objects = this.background.getObjects();
            if (objects.length == 0) {
                $("#compose-box")
                    .qtip({
                        content: {
                            text: "Please drag some logo designments here."
                        },
                        position: {
                            my: "top center",
                            at: "bottom center"
                        },
                        show: {
                            event: false
                        }
                    })
                    .qtip("show");
                $('#assets_nav li:last-child a').tab('show');
                return false;
            }
            /**
             * Check the line colors input
             */
            var garmentId = $('#garment-list').attr('data-edit-id');
            var garmentEditMode = $('#garment-list').attr('data-edit-mode');
            if (garmentEditMode != 'true' || garmentId == undefined) {
                $("#garment-list")
                    .qtip({
                        content: {
                            text: "Please select on garment for your design."
                        },
                        position: {
                            my: "top center",
                            at: "bottom center"
                        },
                        show: {
                            event: false
                        }
                    })
                    .qtip("show");
                $('#assets_nav li:first-child a').tab('show');
                return false;
            }
            /**
             * Check line color input values
             */
            var objects = this.background.getObjects();
            var unCompleted = false;
            for (var i in objects) {
                var item = objects[i];
                var subItems = item._objects;
                for (var k in subItems) {
                    var tmp = subItems[k];
                    var strokeData = tmp.strokeData || tmp.fillData;
                    if (strokeData == undefined) {
                        unCompleted = true;
                    }
                }
                if (unCompleted) {
                    item.set("dirty", true);
                    self.background.setActiveObject(item);
                    self.background.renderAll();
                    break;
                }
            }
            if (unCompleted) {
                var inputs = $('#line-container').find('input');
                inputs.each(function (item) {
                    var input = $(inputs[item]);
                    if (input.val() == '') {
                        input.attr('style', 'background:#F1B4BB');
                    }
                });
                $("#compose-box")
                    .qtip({
                        content: {
                            text: "You must input all line color inputs before design down."
                        },
                        position: {
                            my: "top center",
                            at: "bottom center"
                        },
                        show: {
                            event: false
                        }
                    })
                    .qtip("show");
                return false;
            }
            return true;
        },
        /**
         * 11.2 Postdata to server.
         */
        _onPostDesignData: function (event) {
            /**
             * check count data;
             */
            var qtyFieldsEmpty = false;
            $('#gmt-info-quantity').find('input').each(function (item) {
                var val = $(this).val();
                if (parseInt(val) > 0) {
                    qtyFieldsEmpty = true;
                }
            });
            if (qtyFieldsEmpty == false) {
                $("#gmt-info-quantity")
                    .qtip({
                        content: {
                            text: "You must input all quantity fields."
                        },
                        position: {
                            my: "bottom center",
                            at: "top center"
                        },
                        show: {
                            event: false
                        }
                    })
                    .qtip("show");
                return false;
            }
            // check design checkbox status
            var ddbox = $('#ddbox');
            if (ddbox.children().length == 0) {
                return false;
            }
            var dems = $('.prv-ck-inn');
            var demsChecked = false;
            dems.each(function (item) {
                if ($(this).prop('checked')) {
                    demsChecked = true;
                }
            });
            if (demsChecked == false) {
                $("#ddbox")
                    .qtip({
                        content: {
                            text: "At least one designment is choosen."
                        },
                        position: {
                            my: "bottom center",
                            at: "top center"
                        },
                        show: {
                            event: false
                        }
                    })
                    .qtip("show");
                return false;
            }
            $(".emb_portal").block({
                message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                css: {
                    border: "none",
                    left: "90%",
                    width: "96%",
                    background: "transparent"
                }
            });
            setTimeout(function () {
                $(".emb_portal").unblock();
                $.notify({
                    icon: "glyphicon glyphicon-ok",
                    title: "Data saved.",
                    message: "Item is added successfully."
                }, {
                    type: "success"
                });
            }, 3000);

        },
        /**
         * 11.3 Validate create or update
         */
        _determineUpdateOrNew: function () {
            var result = false;
            // 01. check if container is empty
            var parentBox = $('#ddbox');
            if (parentBox.children().length == 0) {
                return true;
            }
            // 02. get background image and its POSITION

        },
        getParent: function () {
            return $("#compose-box");
        },
        /**
         * 12. when set canvas background to be color value, it is readonly.
         */
        _setLogoEditable: function (enabled) {
            var objects = this.background.getObjects();
            if (objects.length > 0) {
                objects.forEach(function (item, index) {
                    item.lockMovementX = enabled;
                    item.lockMovementY = enabled;
                    item.lockScalingX = enabled;
                    item.lockScalingY = enabled;
                    item.lockUniScaling = enabled;
                    item.lockRotation = enabled;
                });
                if (!enabled) {
                    $.notify({
                        icon: "glyphicon glyphicon-ok",
                        title: "Garment changed.",
                        message: "It is now in edit mode."
                    }, {
                        type: "success"
                    });
                } else {
                    $.notify({
                        icon: "glyphicon glyphicon-ok",
                        title: "Garment color changed.",
                        message: "Only line colors can be changed."
                    }, {
                        type: "success"
                    });
                }
            }
        },
        /**
         * 13. preview current image and save the related data;
         */
        _previewCurrentDesign: function () {
            var parent = $('#ddbox');
            if (parent.children().length == 0) {
                return false;
            }
            var dataDigist = CryptoJS.MD5(JSON.stringify(this.background.custom_attr));
            var findTarget = false;
            parent.children().each(function (item) {
                var tmp = $(this).attr('data-id');
                if (tmp != undefined && tmp == dataDigist) {
                    $(this).effect('highlight', {}, 3000);
                    findTarget = true;
                }
            });
            return findTarget;
        },
        /**
         * 13.1 add preiview designment by current one time.
         */
        _saveCurrentDesign: function () {
            if (this._previewCurrentDesign()) {
                $.notify({
                    icon: "glyphicon glyphicon-remove",
                    title: "Found the same data",
                    message: "No changes found!"
                }, {
                    type: "danger"
                });
                return false;
            }
            var parent = $('#ddbox');
            // validate current resources and check if they are the same.
            var garmentId = $('#garment-list').attr('data-edit-id');
            var objects = this.background.getObjects();
            var logoIds = [];
            objects.forEach(function (item) {
                logoIds.push(item.resourceId);
            });
            var img = $('<img>');
            var dataUrl = this.background.toDataURL('png');
            img.attr('src', dataUrl);
            var imgHolder = $('<div>').addClass('dd-prv-block');
            // add digist
            var dataDigist = CryptoJS.MD5(JSON.stringify(this.background.custom_attr));
            imgHolder.attr('data-id', dataDigist);
            imgHolder.attr('data-garment-id', garmentId);
            imgHolder.attr('logo-ids', logoIds.join(','));
            // add checkbox
            var checked = $('<input>').attr('type', 'checkbox').addClass('prv-ck-inn').attr("checked", 'checked');
            var toolbar = $('<div>').addClass('dd-prv-op');
            toolbar.append(checked);
            var removeLink = $('<a>').addClass('prv-rm-link').text('remove');
            removeLink.click(function (e) {
                imgHolder.remove();
                $.notify({
                    icon: "glyphicon glyphicon-remove",
                    title: "Designment removed",
                    message: "data removed successfully!"
                }, {
                    type: "success"
                });
                if (parent.children().length == 0) {
                    parent.removeClass('ddbox-border');
                }
            });
            toolbar.append(removeLink);
            imgHolder.append(img);
            imgHolder.append(toolbar);
            parent.append(imgHolder);
            parent.addClass('ddbox-border clearfix');
        },
        /**
         * 14. Clear all design data.
         */
        _clearAllDesignData: function (id) {
            var canvas = this.background;
            // Remove all logos
            canvas.remove(...canvas.getObjects());
            // Retset selected color
            var firstImage = $('#gm-album-' + id).children()[0];
            this.setBackground($(firstImage));
            this.background.zoomToPoint({
                x: 200,
                y: 200
            }, 1);
            $('#tools-info').html('');
            // Clear all input values of line colors
            $('input[name^="line_color"]').each(function (item) {
                $(this).val('');
            });
        },
        /**
         * 15. Save data into canvas, in order to recovery.
         */
        _saveGmtDataToCanvas: function (id, type, value) {
            var holder = this._canvasDataHolder(id);
            if (holder == null) {
                return false;
            }
            if (type == 'color') {
                holder['mode'] = 'color';
                holder['color'] = value;
            }
            if (type == 'image') {
                holder['mode'] = 'image';
                holder['image'] = value;
            }
        },
        /**
         * 15.1 Get custom data from garment id
         */
        _canvasDataHolder: function (id) {
            var holder = this.background.custom_attr;
            if (holder[id] == undefined || holder[id] == null) {
                holder[id] = {};
            }
            return holder[id];
        },
        /**
         * 15.2 Save logo object into canvas
         */
        _saveLogoDataToCanvas: function (id, logoId, type) {
            var holder = this._canvasDataHolder(id);
            if (holder == null) {
                return false;
            }
            if (holder['logos'] == undefined || holder['logos'] == undefined) {
                holder['logos'] = [];
            }
            var logos = holder['logos'];
            var newObject = {
                'id': logoId,
                'type': type
            };
            if (logos.length == 0) {
                logos.push(newObject);
                return false;
            }
            var logosArr = logos.filter(function (item) {
                return item.id == logoId;
            });
            if (logosArr.length == 0) {
                logos.push(newObject);
            }
        },
        /**
         * 15.3 Remove logo data from canvas
         */
        _removeLogoDataToCanvas: function (id, logoId) {
            var holder = this._canvasDataHolder(id);
            var logos = holder['logos'];
            var logosArr = logos.filter(function (item) {
                return item.id != logoId;
            });
            holder['logos'] = logosArr;
        },
        /**
         * 15.4 Save position data into canvas of logo
         */
        _saveLogoPosDataToCanvas: function (id, logoId, pos) {
            var holder = this._canvasDataHolder(id);
            var logos = holder['logos'];
            var logosArr = logos.filter(function (item) {
                return item.id == logoId;
            });
            var cur = logosArr[0];
            cur['leflt'] = pos.left;
            cur['top'] = pos.top;
        },
        /**
         * 15.5 Save lines data into canvas of logo
         * 
         */
        _saveLogoColorDataToCanvas: function (id, logoId, index, color) {
            var holder = this._canvasDataHolder(id);
            var logos = holder['logos'];
            var logosArr = logos.filter(function (item) {
                return item.id == logoId;
            });
            var cur = logosArr[0];
            var custom_key = 'line-';
            if (cur.type == FILE_TYPE_AI) {
                custom_key = 'layer-';
            }
            var colors = cur.colors;
            if (colors == undefined || colors == null) {
                cur.colors = {};
            }
            colors = cur.colors;
            colors[custom_key + index] = color;
        },
        /**
         * 15.6 Save logo zoom data into canvas
         */
        _saveLogoZoomDataToCanvas: function (id, logoId, zoom) {
            var holder = this._canvasDataHolder(id);
            var logos = holder['logos'];
            var logosArr = logos.filter(function (item) {
                return item.id == logoId;
            });
            var cur = logosArr[0];
            cur['zoomx'] = zoom.zoomx;
            cur['zoomy'] = zoom.zoomy;
        },
    };
    /**
     * This is the color facade pattern of managing canvas.
     */
    GmManager.prototype = {
        uploadModelWin: function () {
            return new UploadManager();
        },
        graphComposer: function () {
            return new GraphComposer();
        },
        actbuttons: function () {
            return "<div class='asset-garment-act'><button type='button' class='btn select' data-toggle='button' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span>Select</button><button type='button' class='btn remove' data-toggle='confirmation' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-minus' aria-hidden='true'></span>Remove</button></div>";
        },
        startup: function (uploadWin) {
            this.composer = this.graphComposer();
            this.composer.init();
            this.loadGarmentList();
        },
        /**
         * 1. Load the designment from network.
         */
        loadGarmentList: function () {
            var self = this;
            var args = [
                [],
                ["id", "design_template", "image_ids"]
            ];
            self._blockingUi();
            rpc
                .query({
                    model: "product.garment",
                    method: "search_read",
                    args: args
                })
                .then(function (returned_value) {
                    self._refreshGarmentsData(returned_value);
                });
        },
        /**
         * 2. Refreshing the garment data list.
         */
        _refreshGarmentsData: function (_data) {
            var self = this;
            if (_.isEmpty(_data)) {
                $.notify({
                    icon: "glyphicon glyphicon-remove",
                    title: "No Data",
                    message: "No garment data retrieved!"
                }, {
                    type: "danger"
                });
                this._unBlockUi();
                return false;
            }
            localStorage.setItem("garment_list", JSON.stringify(_data));
            var parentBox = this._getGarmentListEle();
            parentBox.html("");
            for (var i in _data) {
                var item = _data[i];
                var image_ids = item.image_ids;
                var id = item.id;
                var itemHolder = $("<div>")
                    .attr("id", "gm-album-" + id)
                    .addClass("assets-group");
                itemHolder.attr("data-ids", image_ids);
                itemHolder.attr("data-id", id);
                parentBox.append(itemHolder);
                self._setDefaultGarment(id);
            }
            $(".assets-group").each(function (item) {
                var ids = $(this).attr("data-ids");
                var id = $(this).attr("data-id");
                if (id != undefined && ids != undefined) {
                    ids = ids.split(",");
                    self._getGmImages(id, ids);
                }
            });
        },
        /**
         * 3. Set default selected garment data.
         */
        _setDefaultGarment: function (id) {
            var editingHolderId = $("#garment-list").attr("data-edit-id");
            var editModeofCon = $("#garment-list").attr("data-edit-mode");
            if (editingHolderId == undefined && editModeofCon == undefined) {
                $("#garment-list").attr("data-edit-id", id);
                $("#garment-list").attr("data-edit-mode", true);
            } else {
                return false;
            }
        },
        /**
         * 4. Load image assets from network.
         */
        _getGmImages: function (id, image_ids) {
            var self = this;
            var args = [
                [
                    ["id", "in", image_ids]
                ],
                ["id", "name", "image", "content_type"]
            ];
            rpc
                .query({
                    model: "product.garment.image",
                    method: "search_read",
                    args: args
                })
                .then(function (returned_value) {
                    self._appendGmImages(id, returned_value);
                });
        },
        /**
         * 4.1 Fill in all the images.
         */
        _appendGmImages: function (id, _data) {
            var self = this;
            if (_.isEmpty(_data)) {
                return false;
            }
            var itemHolder = $("#gm-album-" + id);
            for (var i in _data) {
                var item = _data[i];
                var imgData = "data:" + item.content_type + ";base64," + item.image;
                var alink = $("<a>")
                    .attr("href", "#").attr("class", 'gmt-group-item')
                    .attr("id", "gmt-img-" + id + "-" + i)
                    .attr("data-id", id);
                var img = $("<img>")
                    .attr("width", 80)
                    .attr("src", imgData)
                    .attr("data-id", item.id)
                    .attr("data-name", item.name);
                var span = $("<span>").html(item.name);
                alink.append(img);
                alink.append(span);
                itemHolder.append(alink);
                alink.click(function (event) {
                    self._chooseGarment($(this));
                });
            }
            var actbuttons = self.actbuttons();
            itemHolder.append(actbuttons);
            var editingHolderId = $("#garment-list").attr("data-edit-id");
            var editModeofCon = $("#garment-list").attr("data-edit-mode");
            if (editingHolderId == id && Boolean(editModeofCon)) {
                self._setEditableMode(itemHolder);
                self._setHolderEditMode(id, itemHolder);
            }
            itemHolder
                .mouseenter(function (item) {
                    self._setEditableMode($(this));
                })
                .mouseleave(function (item) {
                    self._setReadableMode($(this));
                });
        },
        /**
         * 5.0 Set canvas background images.
         */
        _chooseGarment: function (holder) {
            if (this.composer == undefined) {
                this.composer = this.graphComposer();
            }
            /**
             * Check current edit mode.
             */
            var targetDataId = holder.attr('data-id');
            var editMode = $("#garment-list").attr("data-edit-mode");
            var currentEditId = $("#garment-list").attr("data-edit-id");
            if (editMode == "true" && currentEditId != targetDataId) {
                var objects = this.composer.background.getObjects();
                if (objects.length > 0) {
                    $.notify({
                        icon: "glyphicon glyphicon-remove",
                        title: "Error occur",
                        message: "Please remove all the logos in designing status or click design down button."
                    }, {
                        type: "danger"
                    });
                    return false;
                }
            }
            // set background image of canvas
            var imgHolder = holder.children().first();
            this.composer.setBackground(imgHolder);
        },
        /**
         * 5.1 Set edit mode of garment list item.
         */
        _setEditableMode: function (holder) {
            var self = this;
            var itemId = holder.attr("id");
            var id = holder.attr("data-id");
            holder.find(".asset-garment-act").slideDown();
            holder.css("border-bottom", "2px solid #4A90E2").css("cursor", "pointer");
            holder.find(".remove").unbind("click");
            holder.find(".select").unbind("click");
            holder.find(".remove").confirmation({
                onCancel: function () {
                    console.log('You didn\'t choose anything');
                },
                onConfirm: function (value) {
                    var self = this;
                    rpc
                        .query({
                            route: "/portal/remove_garment",
                            params: {
                                id: id
                            }
                        })
                        .then(function (returned_value) {
                            if (returned_value) {
                                holder.slideUp(1000).remove();
                                $.notify({
                                    icon: "glyphicon glyphicon-ok",
                                    title: "Garment removed",
                                    message: "Garment data has been uploaded successfully."
                                }, {
                                    type: "success"
                                });
                            }
                        });
                },
            });
            holder.find(".select").click(function (e) {
                var state = $(this).text();
                var actbuttons = self.actbuttons();
                if (state == "Cancel") {
                    holder.find(".asset-garment-act").remove();
                    holder.append(actbuttons).show();
                    $("#garment-list").removeAttr("data-edit-mode");
                    $("#garment-list").removeAttr("data-edit-id");
                    return false;
                }
                /**
                 * Check current edit mode.
                 */
                var editMode = $("#garment-list").attr("data-edit-mode");
                if (editMode == "true") {
                    var objects = self.composer.background.getObjects();
                    if (objects.length > 0) {
                        $.notify({
                            icon: "glyphicon glyphicon-remove",
                            title: "Error occur",
                            message: "Please remove all the logos in designing status or click design down button."
                        }, {
                            type: "danger"
                        });
                        return false;
                    }
                }
                // clear other states
                $("#garment-list")
                    .find(".assets-group")
                    .each(function (item) {
                        if ($(this).attr("id") != itemId) {
                            $(this)
                                .find(".asset-garment-act")
                                .removeClass("fixed");
                            $(this)
                                .find(".asset-garment-act")
                                .slideUp();
                            $(this).css("border-bottom", "2px solid #D8D8D8");
                            $(this).attr("data-edit-mode", false);
                            $(this)
                                .find(".asset-garment-act")
                                .remove();
                            $(this)
                                .append(actbuttons)
                                .show();
                        }
                    });
                // set current states
                self._setHolderEditMode(id, holder);
                //self.selectCurrentGarment(itemId);
            });
        },
        /**
         * 5.2 Set readable mode of a garment list item.
         */
        _setReadableMode: function (holder) {
            holder.find(".remove").unbind("click");
            holder.find(".select").unbind("click");
            if (
                holder.attr("data-edit-mode") == undefined ||
                holder.attr("data-edit-mode") == "false"
            ) {
                holder.find(".asset-garment-act").slideUp();
                holder.css("border-bottom", "2px solid #D8D8D8").css("cursor", "none");
            }
        },
        /**
         * 6. Set item edith mode.
         */
        _setHolderEditMode: function (id, holder) {
            var self = this;
            holder
                .find(".select")
                .html(
                    "<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>Cancel"
                ).hide();
            holder.find(".remove").hide();
            holder.find(".asset-garment-act").addClass("fixed");
            holder
                .find(".asset-garment-act")
                .append(
                    "<button type='button' class='btn update' data-toggle='button' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-cog' aria-hidden='true'></span>Update</button>"
                ).append(
                    "<button type='button' class='btn clear' data-toggle='confirmation' aria-pressed='false' autocomplete='off'><span class='glyphicon glyphicon-repeat' aria-hidden='true'></span>Clear</button>"
                );
            $("#garment-list").attr("data-edit-mode", true);
            $("#garment-list").attr("data-edit-id", id);
            holder.css("border-bottom", "2px solid #4A90E2");
            holder.attr("data-edit-mode", true);
            holder.find(".update").click(function (e) {
                self._updateGmtInfo(id);
            });
            holder.find(".clear").confirmation({
                rootSelector: '[data-toggle=confirmation]',
                onConfirm: function (value) {
                    self._clearGmtInfo(id);
                },
            });
            self._displayGmtInfo(id);
            self._chooseGarment(holder.children().first());
        },
        /**
         * 7. Display garment information at below box.
         */
        _displayGmtInfo: function (id) {
            var self = this;
            var cachedItems = localStorage.getItem("garment_list");
            if (cachedItems == undefined || id == null) {
                return false;
            }
            var cachedObjects = JSON.parse(cachedItems);
            var gmtDetailObj = null;
            for (var i in cachedObjects) {
                var obj = cachedObjects[i];
                if (obj.id == parseInt(id)) {
                    gmtDetailObj = obj;
                    break;
                }
            }
            var gmtDetailInfo = JSON.parse(gmtDetailObj.design_template);
            if (gmtDetailObj == null || gmtDetailInfo == undefined) {
                return false;
            }
            $("#gmt-info-name").html(gmtDetailInfo.name);
            // display colors
            var colors = gmtDetailInfo.colors;
            var colors_con = $("#gmt-info-colors");
            colors_con.html("");
            colors.forEach(function (item) {
                var colorBlock = $("<span>")
                    .css("width", "40px")
                    .css("height", "40px")
                    .css("background", item);
                colorBlock.css("display", "inline-block").css("margin", "0 6px");
                colorBlock.hover(
                    function (e) {
                        $(this).addClass("color-border-gray");
                    },
                    function (event) {
                        var sel = $(this).attr("data-select");
                        if (sel == undefined) {
                            $(this).removeClass("color-border-gray");
                        }
                    }
                );
                colorBlock.click(function (event) {
                    var blocks = $("#gmt-info-colors").find("span");
                    blocks.removeClass("color-border-gray").removeAttr("data-select");
                    $(this).attr("data-select", item);
                    $(this).addClass("color-border-gray");
                    self.composer._changeBackgroundColor(item);
                });
                colors_con.append(colorBlock);
            });
            // set size
            $("#gmt-info-size-type")
                .find("span")
                .html(gmtDetailInfo.size_tpl);
            // set description
            var desc_con = $("#gmt-info-desc");
            var desc = gmtDetailInfo.description;
            if (desc && desc.length > 0) {
                var desc_li = desc.split("\n");
                var linodes = [];
                for (var k in desc_li) {
                    var obj_tmp = "<li>" + desc_li[k] + "</li>";
                    linodes.push(obj_tmp);
                }
                if (linodes.length > 0) {
                    desc_con.find("ul").html(linodes.join(""));
                }
            }
            $("#gmt-info-supply-select")
                .select2({
                    width: "60%"
                })
                .trigger("change");
            rpc
                .query({
                    route: "/portal/size_attributes",
                    params: {
                        ids: gmtDetailInfo.sizes
                    }
                })
                .then(function (returned_value) {
                    if (_.isEmpty(returned_value)) {
                        return false;
                    }
                    self._createGmtSizeList(returned_value);
                });
        },
        /**
         * 8. Create garment size templates inputs.
         */
        _createGmtSizeList: function (_data) {
            var container = $("#gmt-info-quantity");
            container.html("");
            _data.forEach(function (item) {
                var subCon = $("<div>").addClass("col");
                var name = item.name;
                var span = $("<span>")
                    .addClass("size-name")
                    .html(name);
                var input = $("<input>").attr(
                    "name",
                    "quantity-" + name + "-" + item.id
                );
                input.val('0').attr('readonly', true);
                input
                    .attr("type", "text")
                    .attr("id", "quantity-" + item.id)
                    .addClass("form-control");
                subCon.append(span).append(input);
                container.append(subCon);
            });
        },
        /**
         * 9. Set single garment item info to Edit popup windown.
         */
        _updateGmtInfo: function (id) {
            var itemIds = JSON.parse(localStorage.getItem("garment_list"));
            var selectData = null;
            for (var i in itemIds) {
                var data = itemIds[i];
                if (data.id == parseInt(id)) {
                    selectData = data;
                    break;
                }
            }
            if (selectData) {
                var curImageCon = $("#gm-album-" + id);
                var images = curImageCon.find("img").map(function (item) {
                    var pos = $(this).attr("data-name");
                    var value = this.src;
                    return {
                        [pos]: value
                    };
                });
                this.uploadModelWin()._preInputGmtInfo(selectData, images);
            }
        },
        /**
         * 10. Clear all designed inputs
         */
        _clearGmtInfo: function (id) {
            // Reset logo editor box
            this.composer._clearAllDesignData(id);
            // Clear all input quantity count values
            $('input[name^="quantity-"]').each(function (item) {
                $(this).val(0);
            });
            return false;
        },
        _getGarmentListEle: function () {
            return $("#garment-list");
        },
        _blockingUi: function () {
            var gmlist = this._getGarmentListEle();
            $("#garment-list").block({
                message: "<img src='/emb_portal/static/src/images/grid.svg' height='30' width='30' style='margin-right:10px' />loading..",
                css: {
                    border: "none",
                    left: "90%",
                    width: "96%",
                    background: "transparent"
                }
            });
        },
        _unBlockUi: function () {
            var gmlist = this._getGarmentListEle();
            gmlist.unblock();
        }
    };
    /**
     * Upload or edit pop up window.
     */
    UploadManager.prototype = {
        init: function () {
            this._getCategoryList();
            this._getBrandList();
            this._bindColorPickerEvent();
            this._getSizeAttrs();
            this._bindImageUploadEvents();
            this._bindSubmitEvents();
        },
        _bindSubmitEvents: function () {
            var self = this;
            $("#gmt-submit-btn").click(function (e) {
                self._postGmtData();
            });
            $("#gmt-cancel-btn").click(function (e) {
                $("#gmt-upload-modal").modal("toggle");
                self._clearUpInputs();
            });
        },
        _postGmtData: function () {
            var self = this;
            // If input is invalid, then show failed message.
            if (self._doValidation()) {
                return false;
                // $.notify({
                //     title: "Failed:",
                //     message: "This plugin has been provided to you by Robert McIntosh aka mouse0270"
                // });
            }
            self._blockingUi();
            // get images data
            var imageMap = {};
            $(".upload-link").each(function (item) {
                var holder = $(this);
                var pos = holder.attr("data-tag");
                var img = holder.find("img");
                if (img != null) {
                    var data = $(img).attr("src");
                    if (data != null) {
                        var trimData = data.substr(data.indexOf(",") + 1);
                        var contentType = self._base64MimeType(data);
                        imageMap[pos] = {
                            data: trimData,
                            type: contentType
                        };
                    }
                }
            });
            if (_.isEmpty(imageMap)) {
                this._imgUploadFailed();
                return false;
            }
            // get colors
            var colors = $("input[name='colors[]']")
                .map(function () {
                    return $(this).val();
                })
                .get();
            // get size attributes
            var size_tpl = $("#gmt-size-tpl").val();
            var sizeAttrs = [];
            $("#size-attrs")
                .find("input")
                .each(function (item) {
                    if ($(this).is(":checked")) {
                        sizeAttrs.push($(this).val());
                    }
                });
            var post_name = $("#gmt-brand")
                .val()
                .trim();
            var post_style = $("#gmt-style")
                .val()
                .trim();
            var post_categ = $("#gmt-category").val();
            var post_brand = $("#gmt-brand")
                .val()
                .trim();
            var post_images = imageMap;
            var post_sizes = sizeAttrs;
            var post_desc = $("#gmt-desc")
                .val()
                .trim();
            var gmt_id = $("#gmt-id").val();
            var cachedPostData = {};
            cachedPostData.name = post_name;
            cachedPostData.style = post_style;
            cachedPostData.category_id = post_categ;
            cachedPostData.brand = post_brand;
            cachedPostData.images = post_images;
            cachedPostData.colors = colors;
            cachedPostData.size_tpl = size_tpl;
            cachedPostData.sizes = post_sizes;
            cachedPostData.desc = post_desc;
            cachedPostData.gmt_id = gmt_id;
            var postUrl = "/portal/garments/create";
            var debugStr = session.debug ? "?debug=true" : "";
            ajax
                .jsonRpc(postUrl + debugStr, "call", cachedPostData)
                .always(function () {
                    if ($.blockUI) {
                        $.unblockUI();
                    }
                })
                .done(function (data) {
                    self._clearUpInputs();
                    setTimeout(function () {
                        $("#gmt-upload-modal").modal("toggle");
                        $.notify({
                            icon: "glyphicon glyphicon-ok",
                            title: "Data Saved",
                            message: "Garment data has been uploaded successfully."
                        }, {
                            type: "success"
                        });
                    }, 2000);
                    GmManager.prototype.loadGarmentList();
                })
                .fail(function () {
                    setTimeout(function () {
                        $.notify({
                            icon: "glyphicon glyphicon-remove",
                            title: "Data Is Not Saved",
                            message: "Failed to save your data,please try again"
                        }, {
                            type: "danger"
                        });
                    }, 3000);
                    self._updateLocalData(false);
                });
        },
        _clearUpInputs: function () {
            this._unBlockUi();
            $("#gmt-id").val("");
            $("#gmt-category").select2("val", "");
            $("#gmt-size-tpl").select2("val", "");
            $("#gmt-style").val("");
            $("#gmt-name").val("");
            $("#gmt-brand").val("");
            $(".upload-link").each(function (item) {
                $(this)
                    .addClass("glyphicon glyphicon-open")
                    .attr("style", "top:20px");
                this.innerHTML = "";
                var tag = $(this).attr("data-tag");
                $("#gmt-img-" + tag).val("");
                $("#gmt-r-" + tag).removeClass("glyphicon glyphicon-trash");
            });

            $("#gmt-colors").html("");
            $("#size-attrs")
                .find("input")
                .each(function (item) {
                    if ($(this).is(":checked")) {
                        $(this).attr("checked", false);
                    }
                });
            $("#gmt-desc").val("");
        },
        _updateLocalData: function (_data) {
            if (_data == false) {
                return localStorage.removeItem("garment_data");
            }
            localStorage.setItem("garment_data", JSON.stringify(_data));
        },
        _doValidation: function () {
            var invalidInput = false;
            // Validate branch name
            var eleBn = $("#gmt-brand");
            var brandName = eleBn.val().trim();
            var nameRule = /^[A-Za-z0-9@_-]+$/;
            if (brandName == "") {
                this._brandSetFailed();
                invalidInput = true;
            }
            // upload image vaidate
            var emptyImage = false;
            $(".upload-link").each(function (item) {
                if (this.innerHTML != "") {
                    emptyImage = true;
                }
            });
            if (!emptyImage) {
                this._imgUploadFailed();
                invalidInput = true;
            }
            // validate garment color
            var gmtColors = $("#gmt-colors");
            if (gmtColors.children().length == 0) {
                this._colorsSetFailed();
                invalidInput = true;
            }
            // validate site attr
            var emptyChecked = false;
            $("#size-attrs")
                .find("input")
                .each(function (item) {
                    if ($(this).is(":checked")) {
                        emptyChecked = true;
                    }
                });
            if (!emptyChecked) {
                this._sizeSetFailed();
                invalidInput = true;
            }
            // validate description
            var desc = $("#gmt-desc").val();
            if (/^\s*$/.test(desc)) {
                //this._descEmptyMessage();
                //invalidInput = true;
            }
            return invalidInput;
        },
        // 01. setup categories
        _getCategoryList: function () {
            var self = this;
            var args = [
                [],
                ["id", "name"]
            ];
            rpc
                .query({
                    model: "product.category",
                    method: "search_read",
                    args: args
                })
                .then(function (returned_value) {
                    self._setCategoryData(returned_value);
                });
        },
        _setCategoryData: function (_data) {
            var eleCategory = this._getCategoryEle();
            for (var key in _data) {
                var option = _data[key];
                var newOption = new Option(option.name, option.id, false, false);
                eleCategory.append(newOption);
            }
            eleCategory.select2();
            eleCategory.trigger("change");
        },
        // 02. Bind color events
        _bindColorPickerEvent: function () {
            var container = this._getGmtColorsEle();
            // init container
            container.children().each(function (item) {
                $(this).on("click", function () {
                    $(this).remove();
                });
            });
            var self = this;
            rpc
                .query({
                    route: "/portal/color_list",
                    params: []
                })
                .then(function (returned_value) {
                    if (_.isEmpty(returned_value)) {
                        return false;
                    }
                    self._setupSpectrum(returned_value, container);
                });
        },
        _setupSpectrum: function (_data, container) {
            var picker = this._getColorPickerEle();
            /**
             * Initized picker events
             */
            var colors = _data.map(function (item) {
                return item.name;
            });
            picker.spectrum({
                showPaletteOnly: true,
                togglePaletteOnly: true,
                togglePaletteMoreText: "more",
                togglePaletteLessText: "less",
                hideAfterPaletteSelect: true,
                preferredFormat: "hex",
                color: "blanchedalmond",
                showInput: true,
                showAlpha: true,
                palette: colors,
                change: function (color) {
                    var colorBlock = $("<span>")
                        .css("width", "40px")
                        .css("height", "40px")
                        .css("background", color.toHexString());
                    colorBlock.css("display", "inline-block").css("margin", "0 6px");
                    var inputNode = $("<input>")
                        .attr("name", "colors[]")
                        .attr("type", "hidden")
                        .val(color.toHexString());
                    colorBlock.append(inputNode);
                    container.show().append(colorBlock);
                    colorBlock.on("click", function () {
                        $(this).remove();
                    });
                }
            });
        },
        // 03. Get brand list
        _getBrandList: function () {
            $(".typeahead").typeahead({
                items: 5,
                minLength: 3,
                delay: 10,
                source: function (query, process) {
                    rpc
                        .query({
                            model: "product.garment.brand",
                            method: "search_read",
                            args: [
                                [],
                                ["name"]
                            ]
                        })
                        .then(function (returned_value) {
                            process(returned_value);
                        });
                }
            });
        },
        // 04. Set size template
        _getSizeAttrs: function () {
            var self = this;
            rpc
                .query({
                    route: "/portal/size_template",
                    params: []
                })
                .then(function (returned_value) {
                    if (_.isEmpty(returned_value)) {
                        return false;
                    }
                    self._fetchSizeAttributes(returned_value);
                });
        },
        _fetchSizeAttributes: function (_data) {
            var eleSizeTpl = this._getSizeTplEle();
            var attrs = this._getSizeAttrsEle();
            var sizeTpl = Object.keys(_data);
            for (var key in sizeTpl) {
                var option = sizeTpl[key];
                var newOption = new Option(option, option, false, false);
                eleSizeTpl.append(newOption);
            }
            eleSizeTpl.select2({
                minimumResultsForSearch: -1
            });
            eleSizeTpl.on("change", function (e) {
                attrs.html("");
                var id = $(this).val();
                var attrData = _data[id];
                for (var i in attrData) {
                    var v = attrData[i];
                    var p = $("<div>").attr("class", "col-sm-2");
                    var l = $("<label>").attr("class", "checkbox-inline");
                    var cb = $("<input>").attr("type", "checkbox");
                    var v = attrData[i];
                    cb.val(v.id);
                    l.text(v.text);
                    p.append(cb).append(l);
                    attrs.append(p);
                }
                // add select all link
                var selAll = $('<a>').addClass('sel-all').html('select all').attr('href','#');
                selAll.click(function(e) {
                    var selfl = $(this);
                    if(selfl.text() == 'cancel all') {
                        selfl.parent().find('input:checkbox').removeAttr('checked');
                        selfl.text('select all');
                    } else {
                        selfl.parent().find('input:checkbox').prop("checked",true);
                        selfl.text('cancel all');
                    }
                });
                attrs.append(selAll);
            });
            eleSizeTpl.trigger("change");
        },
        _bindImageUploadEvents: function () {
            var self = this;
            var p = ["right", "left", "back", "front", "top", "bottom"];
            p.map(function (item) {
                $("#gmt-link-" + item).click(function (e) {
                    $("#gmt-img-" + item).click();
                });
                $("#gmt-r-" + item).click(function (e) {
                    $("#gmt-link-" + item)
                        .children()
                        .each(function (item) {
                            $(this).remove();
                        });
                    $("#gmt-link-" + item)
                        .attr("class", "glyphicon glyphicon-open upload-link")
                        .attr("style", "top:20px");
                    $("#gmt-r-" + item).css("display", "none");
                    $("#gmt-img-" + item).val("");
                });
                $("#gmt-img-" + item).on("change", function (e) {
                    if ($(this).val() == "") {
                        self._imgUploadFailed();
                        return false;
                    }
                    $("#gmt-r-" + item).css("display", "inline");
                    self._gmtImgPreview(this, $("#gmt-link-" + item));
                });
            });
        },
        _gmtImgPreview: function (input, placeToInsertImagePreview) {
            if (input.files) {
                var filesAmount = input.files.length;
                for (var i = 0; i < filesAmount; i++) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        $($.parseHTML("<img>"))
                            .attr("src", event.target.result)
                            .attr("width", "60")
                            .attr("height", "60")
                            .appendTo(placeToInsertImagePreview);
                    };
                    reader.readAsDataURL(input.files[i]);
                    placeToInsertImagePreview.css("top", 0);
                    placeToInsertImagePreview
                        .removeClass("glyphicon-open")
                        .removeClass("glyphicon");
                }
            }
        },
        _preInputGmtInfo: function (_data, _images) {
            var id = _data["id"];
            var gmt_info = JSON.parse(_data["design_template"]);
            $("#gmt-id").val(id);
            $("#gmt-category").select2("val", gmt_info.category_id);
            $("#gmt-size-tpl").select2("val", gmt_info.size_tpl);
            $("#gmt-style").val(gmt_info.style);
            $("#gmt-name").val(gmt_info.name);
            $("#gmt-brand").val(gmt_info.brand);
            // images
            var poss = {};
            _images.each(function (i) {
                poss = $.extend(poss, _images[i]);
            });
            $(".upload-link").each(function (item) {
                $(this)
                    .removeClass("glyphicon glyphicon-open")
                    .attr("style", "top:0");
                var tag = $(this).attr("data-tag");
                if (poss[tag]) {
                    var img = $("<img>")
                        .attr("src", poss[tag])
                        .attr("width", 60)
                        .attr("height", 60);
                    $(this).html(img);
                    $("#gmt-r-" + tag)
                        .addClass("glyphicon glyphicon-trash")
                        .show();
                }
            });
            var colors = gmt_info.colors;
            var colors_con = $("#gmt-colors");
            colors_con.html("");
            colors.forEach(function (item) {
                var colorBlock = $("<span>")
                    .css("width", "40px")
                    .css("height", "40px")
                    .css("background", item);
                colorBlock.css("display", "inline-block").css("margin", "0 6px");
                var inputNode = $("<input>")
                    .attr("name", "colors[]")
                    .attr("type", "hidden")
                    .val(item);
                colorBlock.append(inputNode);
                colors_con.show().append(colorBlock);
                colorBlock.on("click", function () {
                    $(this).remove();
                });
            });
            // set size tpl
            var sizes = gmt_info.sizes;
            var size_tpl = gmt_info.size_tpl;
            $("#gmt-size-tpl")
                .select2("val", size_tpl)
                .trigger("change");
            $("#size-attrs")
                .find("input")
                .each(function (item) {
                    if (sizes.indexOf($(this).val()) > -1) {
                        $(this).attr("checked", true);
                    }
                });
            $("#gmt-desc").val(gmt_info.description);
            $("#gmt-upload-modal").modal("toggle");
        },
        _blockingUi: function () {
            $("#gmt-upload").block({
                message: $("#gmt-upload-loader"),
                css: {
                    border: "none",
                    left: "90%",
                    width: "96%",
                    background: "transparent"
                }
            });
        },
        _unBlockUi: function () {
            $("#gmt-upload").unblock();
        },
        _descEmptyMessage: function () {
            $("#gmt-desc")
                .qtip({
                    content: {
                        text: "Please input some description."
                    },
                    position: {
                        my: "bottom center",
                        at: "top center"
                    },
                    show: {
                        event: false
                    }
                })
                .qtip("show");
        },
        _brandSetFailed: function () {
            $("#gmt-brand")
                .qtip({
                    content: {
                        text: "Please input valid name"
                    },
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    show: {
                        event: false
                    }
                })
                .qtip("show");
        },
        _imgUploadFailed: function () {
            $(".upload-link")
                .first()
                .qtip({
                    content: {
                        text: "At least one image."
                    },
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    show: {
                        event: false
                    }
                })
                .qtip("show");
        },
        _colorsSetFailed: function () {
            $("#gmt-color-picker")
                .first()
                .qtip({
                    content: {
                        text: "please choose your color."
                    },
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    show: {
                        event: false
                    },
                    hide: {
                        delay: 1000
                    }
                })
                .qtip("show");
        },
        _sizeSetFailed: function () {
            $("#size-attrs")
                .find("input")
                .first()
                .qtip({
                    content: {
                        text: "At least one size value specified."
                    },
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    show: {
                        event: false
                    }
                })
                .qtip("show");
        },
        _base64MimeType: function (encoded) {
            var result = false;
            if (typeof encoded !== "string") {
                return result;
            }
            var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (mime && mime.length) {
                result = mime[1];
            }
            return result;
        },
        _getCategoryEle: function () {
            return $("#gmt-category");
        },
        _getBrandEle: function () {
            return $("#gmt-brand");
        },
        _getColorPickerEle: function () {
            return $("#gmt-color-picker");
        },
        _getGmtColorsEle: function () {
            return $("#gmt-colors");
        },
        _getSizeTplEle: function () {
            return $("#gmt-size-tpl");
        },
        _getSizeAttrsEle: function () {
            return $("#size-attrs");
        }
    };

    $(document).ready(function () {
        var garmentManager = new GmManager();
        var uploadModelWin = new UploadManager();
        garmentManager.startup(uploadModelWin);
        uploadModelWin.init();

        var upload_window = $("gmt-upload-modal");
        if (!upload_window.length) {
            return $.Deferred().reject("DOM doesn't contain garment_upload elements");
        }
    });
});