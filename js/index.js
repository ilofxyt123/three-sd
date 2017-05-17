(function(win){
    $.fn.extend({
        fiHandler:function(e){
            e.stopPropagation();
            this.removeClass("opacity "+this.tp.cls);
            if(this.tp.cb){this.tp.cb();};
            this.off("webkitAnimationEnd");
            this.tp.cb = undefined;
            this.tp.duration = this.tp.cls = "";
        },
        foHandler:function(e){
            e.stopPropagation();
            this.addClass("none").removeClass(this.tp.cls);
            if(this.tp.cb){this.tp.cb();};
            this.off("webkitAnimationEnd");
            this.tp.cb = undefined;
            this.tp.duration = this.tp.cls = "";
        },
        fi:function(cb){
            this.tp = {
                cb:undefined,
                duration:"",
                cls:"",
            };
            this.tp.cls = "ani-fadeIn";
            if(arguments){
                for(var prop in arguments){
                    switch(typeof arguments[prop]){
                        case "function":
                            this.tp.cb = arguments[prop];
                            break;
                        case "number":
                            this.tp.duration = arguments[prop];
                            this.tp.cls += this.tp.duration;
                            break;
                    }
                }
            }
            this.on("webkitAnimationEnd", this.fiHandler.bind(this)).addClass("opacity " + this.tp.cls).removeClass("none");
            return this;
        },
        fo:function(cb){
            this.tp = {
                cb:undefined,
                duration:"",
                cls:"",
            };
            this.tp.cls = "ani-fadeOut";
            if(arguments){
                for(var prop in arguments){
                    switch(typeof arguments[prop]){
                        case "function":
                            this.tp.cb = arguments[prop];
                            break;
                        case "number":
                            this.tp.duration = arguments[prop];
                            this.tp.cls += this.tp.duration;
                    }
                }
            }
            this.on("webkitAnimationEnd",this.foHandler.bind(this)).addClass(this.tp.cls);
            return this;
        }
    });
    var Utils = new function(){
        this.preloadImage = function(ImageURL,callback,realLoading){

            var rd = realLoading||false;
            var i,j,haveLoaded = 0;
            for(i = 0,j = ImageURL.length;i<j;i++){
                (function(img, src) {
                    img.onload = function() {
                        haveLoaded++;
                        main.loader.haveLoad+=1;
                        // console.log((main.loader.haveLoad+webgl.loader.haveLoad)/(main.loader.total+webgl.loader.total))
                        var num = Math.ceil(haveLoaded / ImageURL.length* 100);
                        if(rd){
                            $(".num").html("- "+num + "% -");
                        }
                        if (haveLoaded == ImageURL.length && callback) {
                            setTimeout(callback, 500);
                        }
                    };
                    img.onerror = function() {};
                    img.onabort = function() {};

                    img.src = src;
                }(new Image(), ImageURL[i]));
            }
        },//图片列表,图片加载完后回调函数，是否需要显示百分比
        this.lazyLoad = function(){
            var a = $(".lazy");
            var len = a.length;
            var imgObj;
            var Load = function(){
                for(var i=0;i<len;i++){
                    imgObj = a.eq(i);
                    imgObj.attr("src",imgObj.attr("data-src"));
                }
            };
            Load();
        },//将页面中带有.lazy类的图片进行加载
        this.browser = function(t){
            var u = navigator.userAgent;
            var u2 = navigator.userAgent.toLowerCase();
            var p = navigator.platform;
            var browserInfo = {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                iosv: u.substr(u.indexOf('iPhone OS') + 9, 3),
                weixin: u2.match(/MicroMessenger/i) == "micromessenger",
                taobao: u.indexOf('AliApp(TB') > -1,
                win: p.indexOf("Win") == 0,
                mac: p.indexOf("Mac") == 0,
                xll: (p == "X11") || (p.indexOf("Linux") == 0),
                ipad: (navigator.userAgent.match(/iPad/i) != null) ? true : false
            };
            return browserInfo[t];
        },//获取浏览器信息
        this.g=function(id){
            return document.getElementById(id);
        },
        this.E=function(selector,type,handle){
            $(selector).on(type,handle);
        }
        this.limitNum=function(obj){//限制11位手机号
            var value = $(obj).val();
            var length = value.length;
            //假设长度限制为10
            if(length>11){
                //截取前10个字符
                value = value.substring(0,11);
                $(obj).val(value);
            }
        };
    };
    var Media = new function(){
        this.mutedEnd = false;
        this.WxMediaInit=function(){
            var _self = this;
            if(!Utils.browser("weixin")){
                this.mutedEnd = true;
                return;
            }
            if(!Utils.browser("iPhone")){
                _self.mutedEnd = true;
                return;
            }
            document.addEventListener("WeixinJSBridgeReady",function(){
                var $media = $(".iosPreload");
                $.each($media,function(index,value){
                    _self.MutedPlay(value["id"]);
                    if(index+1==$media.length){
                        _self.mutedEnd = true;
                    }
                });
            },false)
        },
        this.MutedPlay=function(string){
            var str = string.split(",");//id数组
            var f = function(id){
                var media = Utils.g(id);
                media.volume = 0;
                media.play();
                // setTimeout(function(){
                media.pause();
                media.volume = 1;
                media.currentTime = 0;
                // },100)
            };
            if(!(str.length-1)){
                f(str[0]);
                return 0;
            }
            str.forEach(function(value,index){
                f(value);
            })
        },
        this.playMedia=function(id){
            var _self = this;
            var clock = setInterval(function(){
                if(_self.mutedEnd){
                    Utils.g(id).play()
                    clearInterval(clock);
                }
            },20)
        }
    };
    Media.WxMediaInit();

    var three = new function(){
        this.container;
        this.scene;
        this.camera;
        this.renderer;
        this.width;
        this.height;

        this.loadTool = {
            total:undefined,
            haveLoad:0,
            completePercent:0
        };

        this.FPS = undefined;//FPS监测器实例
        this.raycaster;//射线实例
        this.orbit;//鼠标控制器实例

        this.path = {
            texture:"texture/",
            model:"models/",
        };

    };
    three.init = function(){
        this.container = $("#WebGL");
        this.width = this.container.width();
        this.height = this.container.height();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45,this.width/this.height,1,410000);
        this.camera.position.set(0,400,5000);

        this.renderer = new THREE.WebGLRenderer({
            antialias:true,
            alpha:true,
        });
        // this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = true;
        // this.renderer.autoClearDepth = false;
        this.renderer.setSize(this.width,this.height);
        this.renderer.setClearColor(0x000000,1);//黑色
        this.container.append(this.renderer.domElement);


        this.raycaster = new THREE.Raycaster();

        this.tasks = [];
    };

    three.loadTexture = function(config){
        config = config ? config : {};
        config.url = config.url ? config.url : "";
        config.name = config.name ? config.name : "";
        config.wrapS = typeof config.wrapS == "boolean" ? config.wrapS :false;
        config.wrapT = typeof config.wrapT == "boolean" ? config.wrapT :false;
        config.SuccessCallback = typeof config.SuccessCallback == "function" ? config.SuccessCallback :function(){};

        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load(config.url,function(texture){config.SuccessCallback(texture)},undefined,function(){});
        if(config.wrapS){
            texture.wrapS = THREE.RepeatWrapping;
        }
        if(config.wrapT){
            texture.wrapT = THREE.RepeatWrapping;
        }
        texture.name = config.name;
        return texture;

    };

    three.getSpotLight = function(config){
        config = config ? config : {};
        config.color = config.color ? config.color : 0xffffff;//灯光颜色
        config.intensity = config.intensity ? config.intensity : 1;//灯光强度
        config.distance = config.distance ? config.distance : 100;//灯光的照射长度
        config.angle = config.angle ? config.angle : Math.PI/3;//灯光角度，默认60度对应的弧度
        config.exponent = config.exponent ? config.exponent : 10;//灯光衰减速度，默认是10

        var light = new THREE.SpotLight(config.color,config.intensity,config.distance,config.angle,config.exponent);
        if(config.position){
            light.position.x = config.position.x;
            light.position.y = config.position.y;
            light.position.z = config.position.z;
        }

        return light;
    };
    three.getSpotLightHelper = function(spotLight){
        if(spotLight instanceof THREE.Light){
            return new THREE.SpotLightHelper(spotLight);
        }
    };//照明弹辅助工具,便与调试,return一个helper实例
    three.getPointLight = function(config){//丢在空中的照明弹,单点发光，不产生阴影
        config = config ? config : {};
        config.color = config.color ? config.color : 0xff0000;//颜色
        config.intensity = typeof config.intensity == "number" ? config.intensity : 1 ;//光照强度
        config.distance = typeof config.distance == "number" ? config.distance : 100 ;//光照影响的距离
        config.position = config.position ? config.position :{x:0,y:0,z:0};//光源位置
        config.visible = typeof config.visible == "boolean" ? config.visible : true;

        console.log(config)
        var light = new THREE.PointLight(config.color,config.intensity,config.distance);
        light.position.set(config.position.x,config.position.y,config.position.z);
        light.visible = config.visible;
        return light;
    };
    three.getDirectionalLight = function(config){
        config = config ? config : {};
        config.color = config.color ? config.color : 0xffffff;//颜色
        config.intensity = typeof config.intensity == "number" ? config.intensity : 1;//光线强度

        var light = new THREE.DirectionalLight(config.color,config.intensity);

        if(config.position){
            light.position.set(config.position.x,config.position.y,config.position.z);
        }
        return light;
    };//平行方向光,return光线实例
    three.getAmbientLight = function(config){
        config = config ? config : {};
        config.color = config.color ? config.color : 0x0c0c0c;//颜色
        var light = new THREE.AmbientLight(config.color);

        return light;
    };//环境光,return光线实例

    three.getSpriteMaterial = function(config){
        config = config ? config : {};
        config.opacity = typeof config.opacity == "number" ? config.opacity : 1;
        config.transparent = typeof config.transparent == "boolean" ? config.transparent : true;
        config.useScreenCoordinates = typeof config.useScreenCoordinates == "boolean" ? config.useScreenCoordinates : true;

        var material = new THREE.SpriteMaterial({
            opacity:config.opacity,
            transparent:config.transparent,
            useScreenCoordinates:config.useScreenCoordinates,
        });

        return material;

    };

    three.getSphereGeometry = function(config){
        config = config ? config : {};
        config.R = config.R ? config.R : 50;//球体半径,说明:在2:1的长图素材中，r取值为short/PI
        config.Ws = config.Ws ? config.Ws :8;//分段数
        config.Hs = config.Hs ? config.Hs :6;//分段数
        config.phiStart = config.phiStart ? config.phiStart : 0;//0-2PI,x轴起点
        config.phiLength = config.phiLength ? config.phiLength : 2*Math.PI;//0-2PI,2PI代表画整个球
        config.thetaStart = config.thetaStart ? config.thetaStart : 0;//0-PI,y轴起点
        config.thetaLength = config.thetaLength ? config.thetaLength : Math.PI;//0-PI,0.5PI代表上半个球

        var geometry = new THREE.SphereGeometry(config.R,config.Ws,config.Hs,config.phiStart,config.phiLength,config.thetaStart,config.thetaLength);
        return geometry;
    };

    three.getSkyByCubeGeo = function(config){
        config = config ? config : {};
        config.size = config.size ? config.size : 1024;
        config.format = config.format ? config.format : ".jpg";
        config.urls = config.urls ? config.urls : [
            this.path.texture+"right"+config.format,
            this.path.texture+"left"+config.format,
            this.path.texture+"up"+config.format,
            this.path.texture+"down"+config.format,
            this.path.texture+"front"+config.format,
            this.path.texture+"back"+config.format,
        ];

        var materials = [];
        for(var i = 0;i<config.urls.length;i++){
            materials.push(new THREE.MeshBasicMaterial({
                map:this.loadTexture({url:config.urls[i]}),
                side:THREE.BackSide
            }))
        }

        var mesh = new THREE.Mesh(new THREE.CubeGeometry(config.size,config.size,config.size),new THREE.MeshFaceMaterial(materials));//天空盒Mesh已经生成
        return mesh;
    };//六面立方体CubeGeometry+多面材质组合MeshFaceMaterial,return mesh
    three.getCubeGeo = function(config){
        //默认创建一个长宽高100的立方体，分段数为1
        config = config ? config : {};
        config.sizeX = config.sizeX ? config.sizeX : 100;//X方向大小
        config.sizeY = config.sizeY ? config.sizeY :100;//Y方向大小
        config.sizeZ = config.sizeZ ? config.sizeZ :100;//Z方向大小
        config.Xs = config.Xs ? config.Xs : 1;
        config.Ys = config.Ys ? config.Ys : 1;
        config.Zs = config.Zs ? config.Zs : 1;

        var geometry = new THREE.CubeGeometry(config.sizeX,config.sizeY,config.sizeZ,config.Xs,config.Ys,config.Zs);
        return geometry;
    };//return geometry
    three.getPlaneGeo = function(config){
        config = config ? config : {};
        config.width = config.width ? config.width : 50;//平面默认宽50
        config.height = config.height ? config.height : 50;//平面默认高50
        config.Ws = config.Ws ? config.Ws : 1;//平面默认X方向段数为1
        config.Hs = config.Hs ? config.Hs : 1;//平面默认Y方向段数为1

        var planeGeo = new THREE.PlaneGeometry(config.width,config.height,config.Ws,config.Hs);
        return planeGeo;
    };
    three.getSphereSkyMesh = function(config){
        config = config ? config : {};
        config.R = config.R ? config.R : 50;//球体半径,说明:在2:1的长图素材中，r取值为short/PI
        config.Ws = config.Ws ? config.Ws :8;//分段数
        config.Hs = config.Hs ? config.Hs :6;//分段数
        config.phiStart = config.phiStart ? config.phiStart : 0;//0-2PI,x轴起点
        config.phiLength = config.phiLength ? config.phiLength : 2*Math.PI;//0-2PI,2PI代表画整个球
        config.thetaStart = config.thetaStart ? config.thetaStart : 0;//0-PI,y轴起点
        config.thetaLength = config.thetaLength ? config.thetaLength : Math.PI;//0-PI,0.5PI代表上半个球
        config.texture = config.texture ? config.texture : new THREE.Texture();

        var geometry = new THREE.SphereGeometry(config.R,config.Ws,config.Hs,config.phiStart,config.phiLength,config.thetaStart,config.thetaLength);
        var material = new THREE.MeshBasicMaterial({
            map:config.texture,
            side:THREE.DoubleSide
        })
        var mesh = new THREE.Mesh(geometry,material);
        return mesh;
    };


    three.getOrbitControls = function(config){
        config = config ? config : {};
        return new THREE.OrbitControls(this.camera,this.renderer.domElement);
    };
    three.addPerspectiveCameraHelper = function(camera){
        camera = camera ? camera : this.camera;
        var helper = new THREE.CameraHelper(camera);
        this.scene.add(helper);
        return helper;
    };
    three.addFps = function(){
        var s = new Stats();
        s.setMode(0);
        s.domElement.style.position = 'absolute';
        s.domElement.style.left = '0px';
        s.domElement.style.top = '0px';
        document.getElementById("FPS").appendChild(s.domElement);
        return s;
    };//return Stats实例
    three.getObjectByName = function(config){
        config = config ? config : {};
        config.name = config.name ? config.name : (function(){console.error("getObjectByName时缺少name");}())
        config.scene = config.scene ? config.scene : this.scene;

        return config.scene.getObjectByName(config.name)
    };//return scene.children
    three.raycasterResult = function(config){//返回点到的第一个
        config = config ? config :{};
        config.coords = config.coords ? config.coords : new THREE.Vector2();
        config.searchFrom = config.searchFrom ? config.searchFrom : this.scene;
        config.recursive = config.recursive ? config.recursive : false;//是否需要递归查找到子对象
        config.needGroup = config.needGroup ? config.needGroup : false;//是否需要返回整个模型group

        config.coords.x = (config.coords.x/this.width)*2-1;
        config.coords.y = 2 * -(config.coords.y / this.height) + 1;

        this.raycaster.setFromCamera(config.coords,this.camera);
        var result;
        result = this.raycaster.intersectObjects(config.searchFrom,config.recursive);
        if(result.length>0){//有点到东西
            if(config.needGroup){//需要返回整个模型Group
                if(result[0].object.parent && result[0].object.parent instanceof THREE.Group){
                    result = result[0].object.parent;
                }
            }
            else{
                result = result[0];
            }
        }
        else{
            result = undefined;
        }
        return result;
    };
    three.getTime = function(){
        return new Date().getTime();
    };//return 时间戳1213432534213123
    three.getTouchCoords = function(event){
        return {x:event.offsetX,y:event.offsetY};
    };//传入touch回调参数,return{x:0,y:0}

    three.render = function(){
        this.renderer.render(this.scene,this.camera);
    };
    three.onresize = function(){
        this.width = this.container.width();
        this.height = this.container.height();

        this.camera.aspect = this.width/this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width,this.height);
    };

    var debugSettins = new function(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
    };
    debugSettins.redraw = function(){
        three.camera.lookAt({x:this.x,y:this.y,z:this.z});
    };
    var webgl = new function(){
        /*debug模式
        * 增加fps工具:webgl.fps = three.addFps()
        * 关闭镜头的自动向前功能:webgl.person.direction = 0,
        *
        *
        * */
        this.debug = false;

        this.fps = undefined;//左上角fps
        this.orbit = undefined;//键盘+鼠标控制器

        //第一视角
        this.person = {
            direction:0,//1代表向前,-1代表后退
            speed:-20,
            touchAllow:true,
            pause:false,
            start:false,
            end:false,
        };

        //图片资源路径
        this.path = "images/scene/";

        //画廊
        this.galleryData = {
            tree1:{
                name:"tree1",
                index:0,
                url:this.path+"0.png",
                size:{x:1000,y:1428},//图片大小
                position:{x:0,y:0,z:0},//在当前group中的相对位置
                rotation:{x:0,y:0,z:0},//相对自身的中心旋转
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,//loading完后赋值
                needTouch:false,
                space:8000,//占用空间
                globalZ:0,

                number:2,
                cloneData:[
                    {
                        position:{x:-300,y:600,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                    {
                        position:{x:500,y:700,z:-3000},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    }
                ],
            },
            zmqh:{
                name:"zmqh",
                index:1,
                url:this.path+"1.png",
                size:{x:527,y:453},
                position:{x:0,y:0,z:-1000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    }
                ],
            },

            oldman:{
                name:"oldman",
                index:2,
                url:this.path+"3.png",
                size:{x:230,y:800},
                position:{x:0,y:0,z:-8000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:1000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    }
                ],
            },
            tree2:{
                name:"tree2",
                index:3,
                url:this.path+"2.png",
                size:{x:777,y:1011},//加载几何体时候用的大小
                position:{x:0,y:0,z:-9000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:6000,//占用空间
                globalZ:0,

                number:2,
                cloneData:[
                    {
                        position:{x:-400,y:500,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                    {
                        position:{x:500,y:700,z:-1500},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    }
                ],
            },

            cloud1:{
                name:"cloud1",
                index:4,
                url:this.path+"5.png",
                size:{x:1267,y:435},
                position:{x:-300,y:-300,z:-15000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:500,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            tree3:{
                name:"tree3",
                index:4,
                url:this.path+"2.png",
                size:{x:777,y:1011},
                position:{x:-400,y:0,z:-15500},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:500,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            deer:{
                name:"deer",
                index:4,
                url:this.path+"4.png",
                size:{x:542,y:699},
                position:{x:0,y:-200,z:-16000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:1000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            tree4:{
                name:"tree4",
                index:4,
                url:this.path+"0.png",
                size:{x:1000,y:1428},
                position:{x:150,y:0,z:-17000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:8000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },

            oilLight:{
                name:"oilLight",
                index:4,
                url:this.path+"6.png",
                size:{x:384,y:800},
                position:{x:0,y:0,z:-25000},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:8000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },

            cloud2:{
                name:"cloud2",
                index:4,
                url:this.path+"5.png",
                size:{x:1267,y:435},
                position:{x:350,y:-300,z:-33000},
                rotation:{x:0,y:0,z:0},
                scale:{x:-1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:500,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            tree5:{
                name:"tree5",
                index:4,
                url:this.path+"0.png",
                size:{x:1000,y:1428},
                position:{x:300,y:150,z:-33500},
                rotation:{x:0,y:0,z:0},
                scale:{x:-1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:1000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            house1:{
                name:"house1",
                index:4,
                url:this.path+"7.png",
                size:{x:415,y:225},
                position:{x:-250,y:0,z:-34500},
                rotation:{x:0,y:0,z:0},
                scale:{x:4,y:4,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:200,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            house2:{
                name:"house2",
                index:4,
                url:this.path+"8.png",
                size:{x:203,y:126},
                position:{x:100,y:-200,z:-34500},
                rotation:{x:0,y:0,z:0},
                scale:{x:4,y:4,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            tree6:{
                name:"tree6",
                index:4,
                url:this.path+"0.png",
                size:{x:750,y:952},
                position:{x:-450,y:150,z:-34700},
                rotation:{x:0,y:0,z:0},
                scale:{x:-1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:8000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },

            circle1:{
                name:"circle1",
                index:4,
                url:this.path+"10.png",
                size:{x:650,y:767},
                position:{x:0,y:0,z:-42700},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            circle2:{
                name:"circle2",
                index:4,
                url:this.path+"11.png",
                size:{x:867,y:987},
                position:{x:0,y:-50,z:-42700},
                rotation:{x:0,y:0,z:0},
                scale:{x:0.36,y:0.36,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            Edison:{
                name:"Edison",
                index:4,
                url:this.path+"9.png",
                size:{x:953,y:1039},
                position:{x:0,y:-50,z:-42700},
                rotation:{x:0,y:0,z:0},
                scale:{x:0.21,y:0.21,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:8000,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },


            lightOuter:{
                name:"lightOuter",
                index:4,
                url:this.path+"13.png",
                size:{x:565,y:736},
                position:{x:0,y:-100,z:-50700},
                rotation:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            light1:{
                name:"light1",
                index:4,
                url:this.path+"12.png",
                size:{x:565,y:736},
                position:{x:0,y:-100,z:-50700},
                rotation:{x:0,y:0,z:0},
                scale:{x:0.3,y:0.3,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },
            lightPoint:{
                name:"lightPoint",
                index:4,
                url:this.path+"14.png",
                size:{x:565,y:736},
                position:{x:0,y:-100,z:-50700},
                rotation:{x:0,y:0,z:0},
                scale:{x:0.001,y:0.001,z:1},
                group:"gallery1",
                mesh:undefined,
                needTouch:false,
                space:0,//占用空间
                globalZ:0,

                number:1,
                cloneData:[
                    {
                        position:{x:0,y:0,z:0},
                        rotation:{x:0,y:0,z:0},
                        scale:{x:1,y:1,z:1},
                    },
                ],
            },



            // stone1:{//3
            //     name:"stone1",
            //     index:5,
            //     url:this.path+"45.png",
            //     size:{x:501,y:535},
            //     position:{x:0,y:0,z:-15000},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery1",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:5000,//占用空间
            //     globalZ:0,
            //
            //     number:1,
            //     cloneData:[
            //         {
            //             position:{x:0,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
            // stone2:{//4
            //     name:"stone2",
            //     index:46,
            //     url:this.path+"46.png",
            //     size:{x:501,y:441},
            //     position:{x:0,y:0,z:-20000},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery1",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:5000,//占用空间
            //     globalZ:0,
            //
            //     number:2,
            //     cloneData:[
            //         {
            //             position:{x:-300,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         },
            //         {
            //             position:{x:300,y:0,z:-1000},
            //             rotation:{x:0,y:Math.PI,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
            // cloud1:{//5
            //     name:"cloud1",
            //     index:47,
            //     url:this.path+"47.png",
            //     size:{x:1267,y:435},
            //     position:{x:0,y:0,z:-25000},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery1",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:5000,//占用空间
            //     globalZ:0,
            //
            //     number:1,
            //     cloneData:[
            //         {
            //             position:{x:0,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
            // blueLight:{//6
            //     name:"blueLight",
            //     index:48,
            //     url:this.path+"spotLight3.png",
            //     size:{x:737,y:735},
            //     position:{x:0,y:0,z:0},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery2",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:5000,//占用空间
            //     globalZ:0,
            //
            //     number:1,
            //     cloneData:[
            //         {
            //             position:{x:0,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
            // pic7:{//7
            //     name:"49",
            //     index:49,
            //     url:this.path+"spriteRed.png",
            //     size:{x:720,y:828},
            //     position:{x:0,y:0,z:0},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery3",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:5000,//占用空间
            //     globalZ:0,
            //
            //     number:1,
            //     cloneData:[
            //         {
            //             position:{x:0,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
            // pic8:{//8
            //     name:"pic8",
            //     index:50,
            //     url:this.path+"spriteBlue.png",
            //     size:{x:784,y:736},
            //     position:{x:0,y:0,z:-5000},
            //     rotation:{x:0,y:0,z:0},
            //     scale:{x:1,y:1,z:1},
            //     group:"gallery3",
            //     mesh:undefined,
            //     needTouch:false,
            //     space:0,//占用空间
            //     globalZ:0,
            //
            //     number:1,
            //     cloneData:[
            //         {
            //             position:{x:0,y:0,z:0},
            //             rotation:{x:0,y:0,z:0},
            //             scale:{x:1,y:1,z:1},
            //         }
            //     ],
            // },
        };
        this.gallery = {
            gallery1:{
                index:1,
                name:"gallery1",
                obj:undefined,//init后被赋值
                space:0,//占用空间,z方向,计算后调整
                position:{x:0,y:500}
            },
            gallery2:{
                index:2,
                name:"gallery2",
                obj:undefined,
                space:0,
                position:{x:0,y:500}
            },
            gallery3:{
                index:3,
                name:"gallery3",
                obj:undefined,
                space:0,
                position:{x:0,y:500}
            },
            gallery4:{
                index:4,
                name:"gallery4",
                obj:undefined,
                space:0,
                position:{x:0,y:500}
            },
        };
        this.sceneSize = 0;

        //地板
        this.floorData = {

        };
        this.floorGroup = undefined;

        //透视天空
        this.skyData = {
            sky1:{
                name:"sky1",
                url:this.path+"sky/"+"skybg1.jpg",
                mesh:undefined,
                group:"skyGroup1",
                size:{x:64000,y:105000},
                position:{x:0,y:0,z:-150000}
            },
            sky2:{
                name:"sky2",
                url:this.path+"sky/"+"skybg2.jpg",
                mesh:undefined,
                group:"skyGroup2",
                size:{x:204800,y:204800},
                position:{x:0,y:0,z:-200000}
            }
        };
        this.skyGroup1 = undefined;
        this.skyGroup2 = undefined;
        this.skyGroup3 = undefined;

        //平面背景
        this.bgData = {
            bg1:{
                name:"bg1",
                url:this.path+"sky/"+"skybg1.jpg",
                texture:undefined,
            },
            bg2:{
                name:"bg2",
                url:this.path+"sky/"+"skybg4.jpg?v2",
                texture:undefined,
            }
        };

        //平面光晕
        this.spriteData = {
            sprite1:{
                name:"sprite1",
                url:this.path + "spriteRed.png",
                obj:undefined,
                size:{x:360,y:414},
                opacity:0.8,
            },
            // sprite2:{
            //     name:"sprite2",
            //     url:this.path + "spriteBlue.png",
            //     obj:undefined,
            //     size:{x:784,y:736},
            //     opacity:0.5,
            // }
        };
        this.OrthoCamera = undefined;
        this.OrthoScene = undefined;

        this.loader = {
            haveLoad:0,
            total:0,
            complete:false
        };


    };

    webgl.init = function(){
        this.loader.total = Object.keys(this.galleryData).length;

        //n个画廊容器属性设置
        for(var prop in this.gallery){
            this.gallery[prop].obj = new THREE.Group();
            this.gallery[prop].obj.name = this.gallery[prop].name;
            three.scene.add(this.gallery[prop].obj);//n个画廊加进场景
        }

        //n个画廊长度分别设置、对每一个画廊物体设置全局位置globalZ
        for(var prop in this.galleryData){//遍历画廊中物体占据的z方向空间

            //n个画廊总长度
            this.galleryData[prop].globalZ = -this.sceneSize;
            this.sceneSize += this.galleryData[prop].space;
            //某个画廊长度
            this.gallery[this.galleryData[prop].group].space += this.galleryData[prop].space;
        }

        //平面相机
        this.OrthoCamera = new THREE.OrthographicCamera(-three.width/2,three.width/2,three.height/2,-three.height/2,1,20000);
        this.OrthoCamera.position.set(0,0,10000)
        this.OrthoScene = new THREE.Scene();
        this.OrthoScene.name = "OrthoScene";

        //n个画廊位置分别调整
        for(var prop in this.gallery){
            var z=0;
            for(var i = this.gallery[prop].index;i>1;i--){
                z += this.gallery["gallery"+(i-1)].space;
            }
            this.gallery[prop].obj.position.set(this.gallery[prop].position.x,this.gallery[prop].position.y,-z);
        }



        //地板容器
        this.floorGroup = new THREE.Group();
        this.floorGroup.name = "floor";
        this.floorGroup.position.set(0,0,0);
        this.floorGroup.rotation.set(-Math.PI/2,0,0);

        this.skyGroup1 = new THREE.Group();
        this.skyGroup1.name = "sky1";
        this.skyGroup2 = new THREE.Group();
        this.skyGroup2.name = "sky2";
        this.skyGroup3 = new THREE.Group();
        this.skyGroup3.name = "sky3";

        three.scene.add(this.floorGroup);//地板加入场景
        three.scene.add(this.skyGroup1);//第一个天空加入场景

        this.setDebug();

        if(this.debug){
            // this.person.direction = 0;
            this.fps = three.addFps();

            var gui = new dat.GUI();
            gui.add(debugSettins, 'x', -100, 100).onChange(debugSettins.redraw);
            gui.add(debugSettins, 'y', -100, 100).onChange(debugSettins.redraw);
            gui.add(debugSettins, 'z', -100, 100).onChange(debugSettins.redraw);
                //往菜单中添加x、y、z三个参数
                //定义参数变化范围是 -100~100
                //定义参数变化时调用redraw()函数
        }



        //添加地板
        // this.createFloor();

        //添加背景
        // this.createSky();

        for(var prop in this.bgData){
            var texture = three.loadTexture({
                url:this.bgData[prop].url,
            });
            texture.name = this.bgData[prop].name;
            console.log(texture)
            this.bgData[prop].texture = texture;
        }
        console.log(webgl.bgData);
        three.scene.background = this.bgData.bg1.texture;



        //添加粒子
        this.createPoints();

        //添加光晕
        this.createSprite();

        //添加光线
        var ambientLight = three.getAmbientLight({
            color:0xffffff
        });
        three.scene.add(ambientLight);

        //加个光球
        var sunLight = three.getPointLight({
            color:"#ddddaa",
            intensity:10,
            position:{x:0,y:0,z:0},
            distance:280000
        });
        var geo = three.getSphereGeometry({
            R:500,
            Ws:20,
            Hs:20
        });
        var material = new THREE.MeshLambertMaterial({color:"rgba(46,69,119)"});
        var mesh = new THREE.Mesh(geo,material);
        mesh.position.set(0,500,-25000);
        mesh.name = "sun";
        mesh.add(sunLight);
        // three.scene.add(mesh);



    };
    webgl.load = function(){
        //图片添加到scene中
        var galleryData = this.galleryData;
        for(var prop in galleryData){
            var planeGeo = three.getPlaneGeo({
                width:galleryData[prop].size.x,
                height:galleryData[prop].size.y,
            });
            // var material = new THREE.MeshBasicMaterial({transparent:true});
            var material = new THREE.MeshLambertMaterial({transparent:true,side:THREE.DoubleSide});

            var texture = three.loadTexture({
                url:galleryData[prop].url,
                wrapT:true,
                wrapS:true,
                SuccessCallback:function(texture){
                    webgl.loader.haveLoad++;
                    // console.log("加载完第"+webgl.loader.haveLoad+"张纹理");
                    // console.log((webgl.loader.haveLoad+main.loader.haveLoad)/(main.loader.total+webgl.loader.total))
                    if(webgl.loader.haveLoad == webgl.loader.total){webgl.loader.complete = true;}
                    if(main.loader.complete){
                        main.loadCallBack();
                    }
                }
            });
            material.map = texture;
            var mesh = new THREE.Mesh(planeGeo,material);

            if(galleryData[prop].number>1){//是否需要克隆
                var group = new THREE.Group();
                group.name = galleryData[prop].name;

                var cloneData = galleryData[prop].cloneData;//数组
                for(var i = 0 ;i<galleryData[prop].number;i++){
                    var cloneMesh = mesh.clone();
                    cloneMesh.position.set(cloneData[i].position.x,cloneData[i].position.y,cloneData[i].position.z);
                    cloneMesh.rotation.set(cloneData[i].rotation.x,cloneData[i].rotation.y,cloneData[i].rotation.z);
                    cloneMesh.scale.set(cloneData[i].scale.x,cloneData[i].scale.y,cloneData[i].scale.z);
                    group.add(cloneMesh);
                }
                group.position.set(galleryData[prop].position.x,galleryData[prop].position.y,galleryData[prop].position.z);
                group.rotation.set(galleryData[prop].rotation.x,galleryData[prop].rotation.y,galleryData[prop].rotation.z);
                group.scale.set(galleryData[prop].scale.x,galleryData[prop].scale.y,galleryData[prop].scale.z);
                three.scene.add(group);
                this.galleryData[prop].mesh = group;
                continue;
            }

            mesh.position.set(galleryData[prop].position.x,galleryData[prop].position.y,galleryData[prop].position.z);
            mesh.rotation.set(galleryData[prop].rotation.x,galleryData[prop].rotation.y,galleryData[prop].rotation.z);
            mesh.scale.set(galleryData[prop].scale.x,galleryData[prop].scale.y,galleryData[prop].scale.z);
            mesh.name = galleryData[prop].name;
            this.galleryData[prop].mesh = mesh;
            this.gallery[galleryData[prop].group].obj.add(mesh);
        }
    };
    webgl.render = function(){
        if(this.person.start&&!this.person.end){
            if(this.debug){//debug模式下，镜头不会自动向前移动
                this.fps.update();
            }

                /*控制前进后退*/
                if(!this.person.pause&&!this.person.end){
                    // switch(this.person.direction){
                    //     case 0:
                    //         break;
                    //     case 1:
                    //         three.camera.position.z -= this.person.speed;
                    //         if(three.camera.position.z<=-this.sceneSize){
                    //             this.person.direction = -1;
                    //         }
                    //         break;
                    //     case -1:
                    //         if(three.camera.position.z>=5000){
                    //             this.person.direction = 1;
                    //         }
                    //         three.camera.position.z += this.person.speed;
                    // };
                    webgl.person.direction = webgl.person.speed ? webgl.person.speed/Math.abs(webgl.person.speed) : 0;
                    if(three.camera.position.z+this.person.speed>=5000){//回到起点就暂停
                        three.camera.position.z = 5000;
                        webgl.person.pause = true;
                    }
                    if((three.camera.position.z+this.person.speed)>-this.sceneSize||(three.camera.position.z+this.person.speed)<5000){
                        three.camera.position.z+=this.person.speed;
                    }
                    if((three.camera.position.z+this.person.speed) <-this.sceneSize){
                        three.camera.position.z = -this.sceneSize;
                        this.person.end = true;
                        console.log("end")
                    }
                    console.log(three.camera.position.z)
                }

                switch(webgl.person.direction){
                    case 0:
                        break;
                    case 1://后退
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree1.globalZ)&&(three.camera.position.z<= this.galleryData.tree1.globalZ)){
                            console.log(this.galleryData.tree1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.zmqh.globalZ)&&(three.camera.position.z<= this.galleryData.zmqh.globalZ)){
                            console.log(this.galleryData.zmqh.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.oldman.globalZ)&&(three.camera.position.z<= this.galleryData.oldman.globalZ)){
                            console.log(this.galleryData.oldman.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree2.globalZ)&&(three.camera.position.z<= this.galleryData.tree2.globalZ)){
                            console.log(this.galleryData.tree2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.cloud1.globalZ)&&(three.camera.position.z<= this.galleryData.cloud1.globalZ)){
                            console.log(this.galleryData.cloud1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree3.globalZ)&&(three.camera.position.z<= this.galleryData.tree3.globalZ)){
                            console.log(this.galleryData.tree3.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.deer.globalZ)&&(three.camera.position.z<= this.galleryData.deer.globalZ)){
                            console.log(this.galleryData.deer.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree4.globalZ)&&(three.camera.position.z<= this.galleryData.tree4.globalZ)){
                            console.log(this.galleryData.tree4.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.oilLight.globalZ)&&(three.camera.position.z<= this.galleryData.oilLight.globalZ)){
                            console.log(this.galleryData.oilLight.name);
                            break;
                        }

                        if(((three.camera.position.z + this.person.speed) > this.galleryData.cloud2.globalZ)&&(three.camera.position.z<= this.galleryData.cloud2.globalZ)){
                            console.log(this.galleryData.cloud2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree5.globalZ)&&(three.camera.position.z<= this.galleryData.tree5.globalZ)){
                            console.log(this.galleryData.tree5.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.house1.globalZ)&&(three.camera.position.z<= this.galleryData.house1.globalZ)){
                            console.log(this.galleryData.house1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.house2.globalZ)&&(three.camera.position.z<= this.galleryData.house2.globalZ)){
                            console.log(this.galleryData.house2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) > this.galleryData.tree6.globalZ)&&(three.camera.position.z<= this.galleryData.tree6.globalZ)){
                            console.log(this.galleryData.tree6.name);
                            break;
                        }
                    case -1://向前
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree1.globalZ)&&(three.camera.position.z >= this.galleryData.tree1.globalZ)){
                            console.log(this.galleryData.tree1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.zmqh.globalZ)&&(three.camera.position.z >= this.galleryData.zmqh.globalZ)){
                            console.log(this.galleryData.zmqh.name);
                            break;
                        }

                        if(((three.camera.position.z + this.person.speed) < this.galleryData.oldman.globalZ)&&(three.camera.position.z >= this.galleryData.oldman.globalZ)){
                            console.log(this.galleryData.oldman.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree2.globalZ)&&(three.camera.position.z >= this.galleryData.tree2.globalZ)){
                            console.log(this.galleryData.tree2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.cloud1.globalZ)&&(three.camera.position.z >= this.galleryData.cloud1.globalZ)){
                            console.log(this.galleryData.cloud1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree3.globalZ)&&(three.camera.position.z >= this.galleryData.tree3.globalZ)){
                            console.log(this.galleryData.tree3.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.deer.globalZ)&&(three.camera.position.z >= this.galleryData.deer.globalZ)){
                            console.log(this.galleryData.deer.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree4.globalZ)&&(three.camera.position.z >= this.galleryData.tree4.globalZ)){
                            console.log(this.galleryData.tree4.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.oilLight.globalZ)&&(three.camera.position.z >= this.galleryData.oilLight.globalZ)){
                            console.log(this.galleryData.oilLight.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.cloud2.globalZ)&&(three.camera.position.z >= this.galleryData.cloud2.globalZ)){
                            console.log(this.galleryData.cloud2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree5.globalZ)&&(three.camera.position.z >= this.galleryData.tree5.globalZ)){
                            console.log(this.galleryData.tree5.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.house1.globalZ)&&(three.camera.position.z >= this.galleryData.house1.globalZ)){
                            console.log(this.galleryData.house1.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.house2.globalZ)&&(three.camera.position.z >= this.galleryData.house2.globalZ)){
                            console.log(this.galleryData.house2.name);
                            break;
                        }
                        if(((three.camera.position.z + this.person.speed) < this.galleryData.tree6.globalZ)&&(three.camera.position.z >= this.galleryData.tree6.globalZ)){
                            console.log(this.galleryData.tree6.name);
                            break;
                        }

                }



                //到点切换
                // switch(three.camera.position.z){
                //     case this.galleryData.tree1.globalZ :
                //         console.log(this.galleryData.tree1.name);
                //         break;
                //     case this.galleryData.zmqh.globalZ :
                //         console.log(this.galleryData.zmqh.name);
                //         break;
                //     case this.galleryData.oldman.globalZ :
                //         console.log(this.galleryData.oldman.name);
                //         break;
                //     case this.galleryData.tree2.globalZ :
                //         console.log(this.galleryData.tree2.name);
                //         break;
                //     case this.galleryData.cloud1.globalZ :
                //         console.log(this.galleryData.cloud1.name);
                //         break;
                //     case this.galleryData.tree3.globalZ :
                //         console.log(this.galleryData.tree3.name);
                //         break;
                //     case this.galleryData.deer.globalZ:
                //         console.log(this.galleryData.deer.name);
                //         if(this.person.direction == 1){
                //             // three.scene.remove(this.skyGroup1);
                //             // three.scene.add(this.skyGroup2);
                //             // three.scene.background = this.bgData.bg2.texture;
                //         }
                //         if(this.person.direction == -1){
                //             // three.scene.remove(this.skyGroup2);
                //             // three.scene.add(this.skyGroup1);
                //             // three.scene.background = this.bgData.bg1.texture;
                //         }
                //
                //         break;
                //     case this.galleryData.tree4.globalZ :
                //         console.log(this.galleryData.tree4.name);
                //         break;
                //     case this.galleryData.oilLight.globalZ :
                //         console.log(this.galleryData.oilLight.name);
                //         break;
                //     case this.galleryData.light1.globalZ+500 :
                //         console.log(this.galleryData.light1.name);
                //         this.person.pause = true;
                //         if(this.person.direction == 1){
                //             this.galleryData.lightPoint.mesh.scale.x+=0.05;
                //             this.galleryData.lightPoint.mesh.scale.y+=0.05;
                //
                //             if(this.galleryData.lightPoint.mesh.scale.x >= 5){
                //                 this.person.pause = false;
                //                 three.scene.background = this.bgData.bg2.texture;
                //             }
                //             break;
                //         }
                //         if(this.person.direction == -1){
                //             this.galleryData.lightPoint.mesh.scale.x-=0.05;
                //             this.galleryData.lightPoint.mesh.scale.y-=0.05;
                //             if(this.galleryData.lightPoint.mesh.scale.x <= 0.01){
                //                 // this.galleryData.lightPoint.mesh.scale.x = 0
                //                 this.person.pause = false;
                //                 three.scene.background = this.bgData.bg1.texture;
                //             }
                //             break;
                //         }
                //
                //     case this.galleryData.light1.globalZ :
                //         console.log(this.galleryData.light1.name);
                //         if(this.person.direction == 1){
                //             three.scene.background = this.bgData.bg2.texture;
                //             break;
                //         }
                //         if(this.person.direction == -1){
                //             three.scene.background = this.bgData.bg1.texture;
                //         }
                //
                //
                // }



        }


        // this.galleryData.blueLight.mesh.rotation.z +=0.005*this.person.direction;
        // this.galleryData.stone1.mesh.rotation.z += 0.002*this.person.direction;
        // this.galleryData.stone2.mesh.rotation.z += 0.002*this.person.direction;

        // three.renderer.clearDepth();
        // three.renderer.render(this.OrthoScene,this.OrthoCamera);
    };
    webgl.setPersonDirectionAhead = function(){
        this.person.direction = 1;
    };
    webgl.setPersonDirectionBack = function(){
        this.person.direction = -1;
    };
    webgl.setDebug = function(){
        this.debug = true;
    };

    webgl.createSky = function(){

        var skyData = this.skyData;//skyData被修改，不会影响到this.skyData

        for(var prop in skyData){
            var planegeo = three.getPlaneGeo({
                width:skyData[prop].size.x,
                height:skyData[prop].size.y
            });
            var material = new THREE.MeshBasicMaterial();

            var texture = three.loadTexture({
                url:skyData[prop].url,
                name:skyData[prop].name,
                SuccessCallback:function(texture){

                }
            });

            material.map = texture;
            var mesh = new THREE.Mesh(planegeo,material);
            webgl.skyData[prop].mesh = mesh;//存在sky1Data/sky2Data中
            webgl[skyData[prop].group].add(mesh);//添加到对应的skyGroup
            webgl[skyData[prop].group].position.set(0,0,skyData[prop].position.z);

        }
    };
    webgl.createFloor = function(){
        var plane = three.getPlaneGeo({
            width:640,
            height:100
        });
        var material = new THREE.MeshBasicMaterial();
        var long = -(this.loader.total-1)*5000;//路径总长度
        three.loadTexture({
            url:this.path+"road.png",
            SuccessCallback:function(texture){
                material.map = texture;
                var mesh = new THREE.Mesh(plane,material);
                mesh.rotation.set(-Math.PI/2,0,0);
                for(var i =10000;i>long;i-=250){
                    var road = mesh.clone();
                    road.position.set(0,0,i);
                    three.scene.add(road);
                }

            }
        })
    };
    webgl.createPoints = function(){

    };
    webgl.createSprite = function(){

        var width = three.width/2;
        var height = three.height/2;

        for(var prop in this.spriteData){
            var texture = three.loadTexture({
                url:this.spriteData[prop].url
            });
            var material = three.getSpriteMaterial({
                transparent:true,
                opacity:this.spriteData[prop].opacity,
            });
            material.map = texture;
            var sprite = new THREE.Sprite(material);
            sprite.name = this.spriteData[prop].name;
            sprite.position.set(-(width-this.spriteData[prop].size.x/2),three.height/2-this.spriteData[prop].size.y/2,-5000)
            // sprite.position.set(0,0,0);
            sprite.scale.set(this.spriteData[prop].size.x,this.spriteData[prop].size.y,1);
            this.OrthoScene.add(sprite);
        }
    };

    var main = new function(){

        this.router;//管理页面跳转
        this.pages = {
            pvideo:"pvideo",
            pend1:"pend1"
        };//需要被记录的页面

        this.touch ={
            ScrollObj:undefined,
            isScroll:false,
            limitUp:0,
            limitDown:undefined,
            overlimit:false,
            StartY:0,
            lastY:0,
            NewY:0,
            addY:0,
            scrollY:0,
            touchAllow:true,
            direactionX:1,//向右
            directionY:1//向上
        };


        this.bgm ={
            obj:document.getElementById("bgm"),
            id:"bgm",
            isPlay:false,
            button:$(".music-btn")
        };
        this.V = {//视频
            id:"video",
            currentTime:0,
            isPlay:false,
            obj:document.getElementById("video")
        };

        this.picUrl = "images/";//图片路径
        this.ImageList = [
            this.picUrl+"barrageBtn.png",
            this.picUrl+"bg.jpg",
            this.picUrl+"bo.gif",
            this.picUrl+"button-0.png",
            this.picUrl+"button-1.png",
            this.picUrl+"button-2.png",
            this.picUrl+"button-3.png",
            this.picUrl+"esc.png",
            this.picUrl+"esc-1.png",
            this.picUrl+"f.gif",
            this.picUrl+"fenxiang.png",
            this.picUrl+"fillBtn.png",
            this.picUrl+"jiantou.png",
            this.picUrl+"loadgif.gif",
            this.picUrl+"logo.png",
            this.picUrl+"music_btn.png",
            this.picUrl+"otttl.png",
            this.picUrl+"p0-text-1.png",
            this.picUrl+"p0-text-2.png",
            this.picUrl+"p0-text-3.png",
            this.picUrl+"p0-text-4.png",
            this.picUrl+"p0-text-5.png",
            this.picUrl+"p0-text-6.png",
            this.picUrl+"p0-text-7.png",
            this.picUrl+"p0-text-8.png",
            this.picUrl+"p0-text-9.png",
            this.picUrl+"p0-text-10.png",
            this.picUrl+"p0-text-11.png",
            this.picUrl+"p0-text-12.png",
            this.picUrl+"p0-text-13.png",
            this.picUrl+"p0-text-14.png",
            this.picUrl+"p0-text-15.png",
            this.picUrl+"p0-text-16.png",
            this.picUrl+"p0-text-17.png",
            this.picUrl+"p1-1.jpg",
            this.picUrl+"p1-2.jpg",
            this.picUrl+"p1-3.jpg",
            this.picUrl+"p1-4.jpg",
            this.picUrl+"p1-5.jpg",
            this.picUrl+"p1-6.jpg",
            this.picUrl+"p1-7.jpg",
            this.picUrl+"p1-button-2.png",
            this.picUrl+"p1-img-1.png",
            this.picUrl+"p1-text-1.png",
            this.picUrl+"p1-text-2.png",
            this.picUrl+"p2-button-1.png",
            this.picUrl+"p2-button-2.png",
            this.picUrl+"p2-button-3.png",
            this.picUrl+"p2-button-4.png",
            this.picUrl+"p2-button-5.png",
            this.picUrl+"p2-button-6.png",
            this.picUrl+"p2-button-7.png",
            this.picUrl+"p2-button-8.png",
            this.picUrl+"p2-img-1.png",
            this.picUrl+"p2-text-1.png",
            this.picUrl+"p2-text-2.png",
            this.picUrl+"p2-text-3.png",
            this.picUrl+"p2_img_4.png",
            this.picUrl+"p2_img_5.png",
            this.picUrl+"p2_img_6.png",
            this.picUrl+"p3-button-1.png",
            this.picUrl+"p3-button-2.png",
            this.picUrl+"p3-img-1.png",
            this.picUrl+"p3-img-2.png",
            this.picUrl+"p3-img-3.png",
            this.picUrl+"p3-img-4.png",
            this.picUrl+"p3-img-5.png",
            this.picUrl+"p3-img-6.png",
            this.picUrl+"p3-img-7.png",
            this.picUrl+"p3-img-8.png",
            this.picUrl+"p3-img-9.png",
            this.picUrl+"p3-text-1.png",
            this.picUrl+"p3-text-2.png",
            this.picUrl+"p3-text-3.png",
            this.picUrl+"p3-text-4.png",
            this.picUrl+"p3-text-5.png",
            this.picUrl+"p3-text-6.png",
            this.picUrl+"p3-text-7.png",
            this.picUrl+"p4-button-1.png",
            this.picUrl+"p4-img-1.png",
            this.picUrl+"p4-text-1.png",
            this.picUrl+"p5-img-1.png",
            this.picUrl+"p5-img-2.png",
            this.picUrl+"p5-img-3.png",
            this.picUrl+"p5-img-4.png",
            this.picUrl+"p5-img-5.png",
            this.picUrl+"p5-text-1.png",
            this.picUrl+"p5-text-2.png",
            this.picUrl+"p6-img-1.png",
            this.picUrl+"p7-button-2.png",
            this.picUrl+"p7-img-1.png",
            this.picUrl+"p7-text-1.png",
            this.picUrl+"p7-text-2.png",
            this.picUrl+"p8.jpg",
            this.picUrl+"p9.jpg",
            this.picUrl+"p9-button.png",
            this.picUrl+"p10.jpg",
            this.picUrl+"p11-img-1.png",
            this.picUrl+"p11-text-1.png",
            this.picUrl+"phone.png",
            this.picUrl+"poster.png",
            this.picUrl+"prztitle.png",
            this.picUrl+"tankuang.png",
            this.picUrl+"text.png",
            this.picUrl+"text-1.png",
            this.picUrl+"try.png",
            this.picUrl+"trytext.png",
            this.picUrl+"voiceBtn.png",
            this.picUrl+"vplayBtn.png",
            this.picUrl+"weile.png",
            this.picUrl+"yinbo.gif",
            this.picUrl+"yinbo.png",
            this.picUrl+"yinboxiao.png"
        ];
        
        this.RAF = undefined;

        this.loader = {
            haveLoad:0,
            total:this.ImageList.length,
            complete:false
        };

    };
    /***********************流程***********************/
    main.init=function(){
        three.init();
        webgl.init();
    };
    main.start=function(){
        Utils.preloadImage(this.ImageList,function(){
            main.loader.complete = true;
            if(webgl.loader.complete){
                main.loadCallBack();
            }
        });
        webgl.load();
    };
    main.loadCallBack = function(){
        this.addEvent();
        this.startRender();
    };
    main.top = function(){
        $(".top").removeClass("none");
    };//顶部条,logo+btn
    main.loadleave = function(){
        $(".P_loading").fo();
    };//关闭loading页
    main.p1 = function(){};//打开p1页
    main.p1leave = function(){};//关闭p1页
    main.p2 = function(){};//打开p2页
    main.p2leave = function(){};//关闭p2页
    main.p3 = function(){};//打开p3页
    main.p3leave = function(){};//关闭p3页
    main.prule = function(){
        $(".P_rule").fi();
        main.scrollInit(".rule-txt",0)
    };//打开规则页
    main.prulelaeve = function(){
        $(".P_rule").fo(function(){
            $(".rule-txt")[0].style.webkitTransform="translate3d(0,0,0)";
        });
    };//关闭规则页
    main.pshare = function(){
        $(".P_share").fi();
    };//分享页
    /***********************流程***********************/

    /***********************功能***********************/
    main.scrollInit=function(selector){
        this.touch.ScrollObj = $(selector);
        this.touch.container = $(selector).parent();
        this.touch.StartY = 0;
        this.touch.NewY = 0;
        this.touch.addY = 0;
        this.touch.scrollY = 0;
        this.touch.limitDown = this.touch.ScrollObj.height() < this.touch.container.height() ? 0 :(this.touch.container.height()-this.touch.ScrollObj.height());
    };
    main.playbgm=function(){
        Media.playMedia(this.bgm.id);
        this.bgm.button.addClass("ani-bgmRotate");
        this.bgm.isPlay = true;
    };//开启背景音乐，连带开关状态
    main.pausebgm=function(){
        this.bgm.obj.pause();
        this.bgm.button.removeClass("ani-bgmRotate");
        this.bgm.isPlay = false;
    };//停止背景音乐，连带开关状态

    main.startRender = function(){
        var loop = function(){
            three.render();
            webgl.render();
            main.RAF = window.requestAnimationFrame(loop)
        };
        loop();
    };//循环渲染开启
    main.stopRender = function(){
        window.cancelAnimationFrame(main.RAF);
    };//循环渲染关闭
    main.addEvent=function(){
        document.ontouchmove = function(e){
            e.preventDefault();
        };

        window.onresize = function(){
            three.onresize();
        };
        three.container.on({
            touchstart:function(e){
                if(!webgl.person.touchAllow){return;}
                main.touch.StartY = e.originalEvent.changedTouches[0].pageY;
                main.touch.lastY = e.originalEvent.changedTouches[0].pageY;
            },
            touchmove:function(e){
                if(!webgl.person.touchAllow){return;}
                if(!webgl.person.start){webgl.person.start = true;};
                // webgl.person.pause = true;
                if((e.originalEvent.changedTouches[0].pageY-main.touch.lastY)<-3){//手指向上滑动
                    // if(three.camera.position.z<5000){
                    //     three.camera.position.z += 200;
                    // }
                    webgl.person.speed = webgl.person.speed>=50?50:(webgl.person.speed+2);

                }
                else if((e.originalEvent.changedTouches[0].pageY-main.touch.lastY)>3){//手指向下滑动
                    // three.camera.position.z -= 200;
                    if(webgl.person.pause){webgl.person.pause = false;webgl.person.speed = -20}
                    webgl.person.speed = (webgl.person.speed<=-50)?-50:(webgl.person.speed-2);
                }

                main.touch.lastY = e.originalEvent.changedTouches[0].pageY;
            },
            touchend:function(e){
                // if(webgl.person.touchAllow){
                //     if((e.originalEvent.changedTouches[0].pageY-main.touch.StartY)<-30){//手指向上滑动
                //         if(three.camera.position.z<5000){
                //             webgl.person.pause = false;
                //             webgl.setPersonDirectionBack();
                //         }
                //     }
                //     if((e.originalEvent.changedTouches[0].pageY-main.touch.StartY)>30){
                //         webgl.person.pause = false;
                //         webgl.setPersonDirectionAhead();
                //     }
                // }
            },
        });
        $(window).on("orientationchange",function(e){
            if(window.orientation == 0 || window.orientation == 180 )
            {
                $(".hp").hide();
            }
            else if(window.orientation == 90 || window.orientation == -90)
            {
                $(".hp").show();
            }
        });
    };//所有事件的绑定
    main.scrollInit = function(selector,start){
        this.touch.ScrollObj = $(selector);
        this.touch.container = $(selector).parent();
        this.touch.StartY = 0;
        this.touch.NewY = 0;
        this.touch.addY = 0;
        this.touch.scrollY = 0;
        this.touch.limitDown = this.touch.ScrollObj.height()<this.touch.container.height()?0:(this.touch.container.height()-this.touch.ScrollObj.height());
    };//滚动插件初始化
    main.back = function(){
        switch(this.router){
            case "pvideo":
                main.pvideo();
                break;
            case "pend1":
                main.pend1();
                break;
            default:
                main.pvideo();
                break;
        }
    };//返回前一页
    /***********************功能***********************/

    /***********************辅助公式***********************/
    main.easeInOut=function(nowTime,startPosition,delta,duration){
        return 1 > (nowTime /= duration / 2) ? delta / 2 * nowTime * nowTime + startPosition : -delta / 2 * (--nowTime * (nowTime - 2) - 1) + startPosition
    };
    main.easeOut=function(nowTime,startPosition,delta,duration){
        return -delta*(nowTime/=duration)*(nowTime-2)+startPosition;
    };
    main.min = function(a,b){
        return (a>b?b:a);
    };//获取较小的数
    main.getObjLength = function(obj){
        var l = 0;
        for(var prop in obj){
            l++;
        };
        return l;
    };
    /***********************辅助公式***********************/

    /***********************微信语音api***********************/

    /***********************微信语音api***********************/
    win.main = main;
    win.iCreative = {
        three:three,
        webgl:webgl,
    }
/*-----------------------------事件绑定--------------------------------*/
}(window));
$(function(){
    main.init();
    main.start();
});



