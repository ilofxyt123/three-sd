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
                        main.loader.haveLoad+=1;
                        console.log((main.loader.haveLoad+webgl.loader.haveLoad)/(119+webgl.loader.total))
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
        this.camera = new THREE.PerspectiveCamera(45,this.width/this.height,1,230000);
        this.camera.position.set(0,300,10000);

        this.renderer = new THREE.WebGLRenderer({
            antialias:true,
            alpha:true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width,this.height);
        this.renderer.setClearColor(0x000000,1);//黑色
        this.container.append(this.renderer.domElement);


        this.raycaster = new THREE.Raycaster();

        this.tasks = [];
    };

    three.loadTexture = function(config){
        console.log(config)
        config = config ? config : {};
        config.url = config.url ? config.url : "";
        config.wrapS = typeof config.wrapS == "boolean" ? config.wrapS :false;
        config.wrapT = typeof config.wrapT == "boolean" ? config.wrapT :false;
        config.SuccessCallback = typeof config.SuccessCallback == "function" ? config.SuccessCallback :undefined;

        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load(config.url,config.SuccessCallback,undefined,function(){});
        if(config.wrapS){
            texture.wrapS = THREE.RepeatWrapping;
        }
        if(config.wrapT){
            texture.wrapT = THREE.RepeatWrapping;
        }
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
        light.position.x = 100;
        light.position.y = 100;
        light.position.z = 0;
        return light;
    };//聚光灯
    three.getPointLightHelper = function(spotLight){
        if(spotLight instanceof THREE.Light){
            return new THREE.SpotLightHelper(spotLight);
        }
    };//增加聚光灯辅助工具,便与调试,return一个helper实例
    three.getDirectionalLight = function(config){
        config = config ? config : {};
        config.color = config.color ? config.color : 0xffffff;//颜色
        config.intensity = config.intensity ? config.intensity : 1;//光线强度

        var light = new THREE.DirectionalLight(config.color,config.intensity);

        if(config.position){
            light.position.set(config.position.x,config.position.y,config.position.z);
        }
        return light;
    };//平行方向光,return光线实例
    three.getAmbientLight = function(config){
        config = config ? config : {};
        config.color = config.color ? config.color : 0xffffff;//颜色
        var light = new THREE.AmbientLight(config.color);

        return light;
    };//环境光,return光线实例


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

        this.person = {
            direction:1,//1代表向前
            speed:1,
        };//第一视角

        this.path = "images/scene/";
        this.galleryData = [
            {
                index:0,
                url:this.path+"0.png",
                size:{x:300,y:300},
                position:{x:0,y:0,z:0},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
            {
                index:43,
                url:this.path+"43.png",
                size:{x:527,y:453},
                position:{x:0,y:0,z:-5000},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
            {
                index:44,
                url:this.path+"44.png",
                size:{x:230,y:800},
                position:{x:0,y:0,z:-10000},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
            {
                index:45,
                url:this.path+"45.png",
                size:{x:501,y:535},
                position:{x:0,y:0,z:-15000},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
            {
                index:46,
                url:this.path+"46.png",
                size:{x:501,y:441},
                position:{x:0,y:0,z:-20000},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
            {
                index:47,
                url:this.path+"47.png",
                size:{x:1267,y:435},
                position:{x:0,y:0,z:-25000},
                rotate:{x:0,y:0,z:0},
                scale:{x:1,y:1,z:1},
            },
        ];//画廊
        this.galleryGroup = undefined;

        this.floorData = {

        };//地板
        this.floorGroup = undefined;

        this.loader = {
            haveLoad:0,
            total:0,
        }
    };

    webgl.init = function(){
        this.galleryGroup = new THREE.Group();
        this.galleryGroup.name = "gallery";
        this.galleryGroup.position.set(0,300,0);

        this.floorGroup = new THREE.Group();
        this.floorGroup.name = "floor";
        this.floorGroup.position.set(0,0,0);
        this.floorGroup.rotation.set(-Math.PI/2,0,0);


        three.scene.add(this.galleryGroup);//画廊加入场景
        three.scene.add(this.floorGroup);//地板加入场景

        this.loader.total = this.galleryData.length;

        // this.setDebug();

        // if(this.debug){
        //     this.person.direction = 0;
            this.fps = three.addFps();
        // }


        for(var i =0; i<this.galleryData.length;i++){
            var texture = three.loadTexture({
                url:this.galleryData[i].url,
                wrapT:true,
                wrapS:true,
                SuccessCallback:function(){
                    console.log("加载完第"+i+"张纹理");
                    webgl.loader.haveLoad++;
                    if(main.loader.haveLoad){
                        main.loadCallBack();
                    }
                }
            });
            var planeGeo = three.getPlaneGeo({
                width:this.galleryData[i].size.x,
                height:this.galleryData[i].size.y,
            });
            var material = new THREE.MeshBasicMaterial({map:texture,transparent:true});
            var mesh = new THREE.Mesh(planeGeo,material);
            mesh.position.set(this.galleryData[i].position.x,this.galleryData[i].position.y,this.galleryData[i].position.z);
            mesh.scale.set(this.galleryData[i].scale.x,this.galleryData[i].scale.y,this.galleryData[i].scale.z);
            console.log(mesh);
            this.galleryGroup.add(mesh);
        }

        this.createFloor();
    };
    webgl.render = function(){
        // if(this.debug){//debug模式下，镜头不会自动向前移动
            this.fps.update();
        // }

        /*控制前进后退*/
        switch(this.person.direction){
            case 0:
                break;
            case 1:
                three.camera.position.z -= this.person.speed;
                if(three.camera.position.z<=-25000 || three.camera.position.z>=10000){
                    this.person.speed *= -1;
                }
                break;
            case 2:
                if(three.camera.position.z>=10000){
                    this.person.direction = 1;
                }
                three.camera.position.z += this.person.speed;
        };


    };
    webgl.setPersonDirectionAhead = function(){
        this.person.direction = 1;
    };
    webgl.setPersonDirectionBack = function(){
        this.person.direction = 2;
    };
    webgl.setDebug = function(){
        this.debug = true;
    };
    webgl.createFloor = function(){
        var plane = three.getPlaneGeo({
            width:1
        });
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
            total:0,
        };

    };
    /***********************流程***********************/
    main.init=function(){
        three.init();

        this.loader.total  = this.ImageList.length

        webgl.init();

        this.loader.total = this.ImageList.length + webgl.loader.total;

    };
    main.start=function(){
        Utils.preloadImage(this.ImageList,function(){
            if(webgl.loader.haveLoad == webgl.loader.total){
                main.loadCallBack();
            }
        });

    };
    main.loadCallBack = function(){
        this.addEvent();
        this.startRender();
        console.log("图片加载完成，执行了回调");
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

        three.container.on({
            touchstart:function(e){
                main.touch.StartY = e.originalEvent.changedTouches[0].pageY;
                main.touch.lastY = e.originalEvent.changedTouches[0].pageY;
            },
            touchmove:function(e){
                webgl.person.direction = 0;
                if(main.touch.touchAllow){
                    if((e.originalEvent.changedTouches[0].pageY-main.touch.lastY)<-3){//手指向上滑动
                        three.camera.position.z += 50;
                    }

                    if((e.originalEvent.changedTouches[0].pageY-main.touch.lastY)>3){//手指向上滑动
                        three.camera.position.z -= 50;
                    }

                    main.touch.lastY = e.originalEvent.changedTouches[0].pageY;
                }
            },
            touchend:function(e){
                if(main.touch.touchAllow){
                    if((e.originalEvent.changedTouches[0].pageY-main.touch.StartY)<-30){//手指向上滑动
                        webgl.setPersonDirectionBack();
                    }
                    if((e.originalEvent.changedTouches[0].pageY-main.touch.StartY)>30){
                        webgl.setPersonDirectionAhead();
                    }
                }
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



