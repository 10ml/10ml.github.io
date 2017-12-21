//设置cookie
function setCookie(c_name, value,t) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() + t);
    document.cookie = c_name + "=" + escape(value) + (";expires=" + exdate.toGMTString());
}
// 获取cookie
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
};

var randData = function(switch_type,content_source,data_source,datacookie){
    var returnArr = '';
    data_source = data_source.switch_type == 1 ?data_source:data_source.data[0];//内容切换方式 1 页面刷新时切换 ，2 窗口内定时切换（轮播）

    if(content_source == 2 ){//推荐位内容源2 列表随机，3指定id
        var ad_id;
        if(getCookie(datacookie) == ''){//
            ad_id = '';
        }else{
            ad_id = getCookie(datacookie);
        }
        if(data_source.data.length > 1){
            var l = data_source.data.length,
                dataArr = [];
            for(var s = 0 ; s < l ; s ++){
                if (data_source.data[s].ad_id != ad_id){
                    dataArr.push(data_source.data[s]);
                }
            }
            l = parseInt(Math.random()*dataArr.length);
            returnArr = dataArr[l];
        }else{
            returnArr = data_source.data[0];
        }
        ad_id = returnArr.ad_id;
        setCookie(datacookie,ad_id,9999999999999999);
    }else{
        returnArr = data_source;
    }
    return returnArr;
};

var scrollData = function(switch_type,content_source,data_source){
    var returnArr =[{}],temArr = new Array(),sourArr = data_source.data;

    if(switch_type == 2){//窗口内定时切换
        returnArr.switch_time = data_source.switch_time;

        if(content_source ==1 ){//顺序轮播
        }else{//随机轮播
            var len = sourArr.length;
            for(var i = 0 ; i < len ; i ++ ){
                var r = parseInt(Math.random()*sourArr.length);
                temArr.push(sourArr[r]);
                sourArr.splice(r,1);
            }
            sourArr = temArr;
        }
        returnArr.data = sourArr;
    }
    return returnArr;
};

$(document).ready(function (e) {
    var ggwUrl = $('.index-wrapper').data('ggwurl');
$.ajax({
    type: "POST",
    url: ggwUrl,
    data:{a:'c'},
    dataType: 'json',
    success: function (res) {
        if(res.status == 0){
            if(res.data.length> 0){
                //优惠快报
                if(res.data[0].cms_wap_yhkb){
                    if(res.data[0].cms_wap_yhkb.data.length>0) {
                        var oDomYhkb = res.data[0].cms_wap_yhkb.data,
                            yhkbList = '';
                            for(var i = 0 ; i < oDomYhkb.length ; i++){
                                yhkbList += '<li><a data-kbid="'+oDomYhkb[i].ad_id+'" href="' + oDomYhkb[i].href + '"><span>' + oDomYhkb[i].flash_title + '</span>\
                                    ' + oDomYhkb[i].flash_content + '</a>\
                                    </li>';
                            }
                        var yhkbDom = '<div class="yhkb-wrap" data-speed="'+res.data[0].cms_wap_yhkb.switch_time+'">\
                                            <span class="yhkb_icon"></span>\
                                            <div class="yhkb-list">\
                                                <ul>\
                                                ' + yhkbList + '\
                                                </ul>\
                                            </div>\
                                        </div>';
                        $('.index-wrapper').append(yhkbDom);
                        if(oDomYhkb.length > 1 && $('.yhkb-wrap').length>0){
                            var yhkb_auto = function() {
                                var top = parseInt($('.yhkb-list').css('top'));
                                yhkb_sroll(top);
                            }
                            var yhkb_sroll = function(n){
                                var num = $('.yhkb-list ul li').length,
                                    itemHeight = $('.yhkb-list ul li').eq(0).height();
                                var top = n-itemHeight;
                                $('.yhkb-list').animate({top: top+"px"},300,function(){
                                    if(top > (1-num) * itemHeight){
                                    }else{
                                        top = itemHeight*(1-num/2);
                                        $('.yhkb-list').css('top',top+"px");
                                    }
                                });
                            };
                            if($('.yhkb-list ul li').length > 1){
                                var htmlDom = $('.yhkb-list ul').html(),
                                    timer = null,rollTime;
                                $('.yhkb-list ul').html(htmlDom+htmlDom);
                                rollTime = res.data[0].cms_wap_yhkb.switch_time;
                                timer = setInterval(yhkb_auto,rollTime);
                            }
                        }
                    }
                }

                //弹出
                if(res.data[0].cms_wap_index){
                    if(res.data[0].cms_wap_index.data.length>0) {
                        var oDomIndex = res.data[0].cms_wap_index,
                            closeBtn = oDomIndex.close_btn == 1 ? '<span class="ggw_fm_close"></span>' : '',//是否打开关闭功能
                            oDomCok = oDomIndex.close_after == 1 ? "ggw_cok" : "";

                            var oDomdata = randData(oDomIndex.switch_type,oDomIndex.content_source,oDomIndex,'cms_wap_sort_index');


                            var htmlStrFm = '<div class="ggw_fm cms_ggw ' + oDomCok + '" data-cok="cms_wap_index"><div class="ggw_fm_main"><a href="' + oDomdata.href + '" ><img src="' + oDomdata.img_url + '" alt=""></a>' + closeBtn + '</div><div class="ggw_fm_cover"></div></div>';
                        if (oDomIndex.close_after == 1) {
                            if (getCookie('cms_wap_index') != 0 || getCookie('cms_wap_index') == '') {
                                $('body').append(htmlStrFm);
                            }
                        } else {
                            setCookie('cms_wap_index','0',1);
                            $('body').append(htmlStrFm);
                        }
                    }
                }

                //右侧
                if(res.data[0].cms_wap_right){
                    if(res.data[0].cms_wap_right.data.length>0) {
                        var oDomRight = res.data[0].cms_wap_right,
                            oDomCok = oDomRight.close_after == 1 ? "ggw_cok ggw_clo" : oDomRight.close_after == 2?"ggw_clo":"";//1为今日不再打开，2为下次打开，3为不关闭

                        var oDomDataRight = randData(oDomRight.switch_type,oDomRight.content_source,oDomRight,'cms_wap_sort_right');
                        var htmlStrFr = '<div class="ggw_fr cms_ggw ' + oDomCok + '" data-cok="cms_wap_right"><div class="ggw_fr_main"><a href="' + oDomDataRight.href + '"><img src="' + oDomDataRight.img_url + '" alt=""></a></div></div>';

                        if (oDomRight.close_after == 1) {
                            if (getCookie('cms_wap_right') != 0 || getCookie('cms_wap_right') == '') {
                                $('body').append(htmlStrFr);
                            }
                        } else {
                            setCookie('cms_wap_right','0',1);
                            $('body').append(htmlStrFr);
                        }
                    }
                }

                //轮播
                if(res.data[0].cms_wap_roll){
                    if(res.data[0].cms_wap_roll.data.length>0) {
                        var oDomScroll = res.data[0].cms_wap_roll,
                            oDomCok = oDomScroll.close_after == 1 ? "ggw_cok ggw_clo" : oDomScroll.close_after == 2?"ggw_clo":"";//1为今日不再打开，2为下次打开，3为不关闭


                            if(oDomScroll.switch_type == 1){//刷新时随机切换
                                var oDomDataScroll = randData(oDomScroll.switch_type,oDomScroll.content_source,oDomScroll,'cms_wap_sort_scroll');
                                var htmlStrFroll = '<div class="ggw_fm_swiper ' + oDomCok + '" data-cok="cms_wap_roll" style="width: 100%;margin: 0 auto;position: relative; overflow: hidden; z-index: 1;"><div class="swiper-wrapper"><div class="ggw_fm_swiper_slide swiper-slide"><a href="'+oDomDataScroll.href+'" ><img style="width: 100%;" src="'+oDomDataScroll.img_url+'"/></a></div></div></div>';

                            }else{//轮播
                                var oDomDataScroll = scrollData(oDomScroll.switch_type,oDomScroll.content_source,oDomScroll),
                                    swipDom = '',
                                    swipData = oDomDataScroll.data;
                                for(var i = 0 ; i < swipData.length ; i++){
                                    swipDom += '<div class="ggw_fm_swiper_slide swiper-slide"><a href="'+swipData[i].href+'" ><img style="width: 100%;" src="'+swipData[i].img_url+'"/></a></div>';
                                }
                                var htmlStrFroll = '<div class="ggw_fm_swiper ' + oDomCok + '" data-time="'+oDomDataScroll.switch_time+'" data-cok="cms_wap_roll" id="ggw_fm_swiper" style="width: 100%;margin: 0 auto;position: relative; overflow: hidden; z-index: 1;"><div class="swiper-wrapper">' + swipDom +'</div></div>';
                            }

                        if (oDomScroll.close_after == 1) {
                            if (getCookie('cms_wap_roll') != 0 || getCookie('cms_wap_roll') == '') {
                                $(htmlStrFroll).insertBefore($('.shoufa-wrapper'));
                            }
                        } else {
                            setCookie('cms_wap_roll','0',1);
                            $(htmlStrFroll).insertBefore($('.shoufa-wrapper'));

                        }
                    }
                }
            }
        }
    }
    }).then(
        function(){
            var sttleText = '<style>.cms_ggw img {width: 100%;}.ggw_fm_cover {position: fixed;width: 100%;height:100%;top:0;left: 0;background: #000;opacity: .7;z-index: 9999990;}.ggw_fm_main {position: fixed;width: 60%;top:50%;height: 0;margin-top: -40%;left: 20%;z-index: 9999991;}.ggw_fm_main a {display: block;}.ggw_fm_main a img {vertical-align: top;}.ggw_fm_main .ggw_fm_close {position: absolute;top:0;right:0;width:30px;height:30px;}.ggw_fr {position: fixed;width: 80px;height:80px;top:50%;margin-top: -35px;right:0;z-index:9999;overflow: hidden;}.ggw_fr_main {display: block;overflow: hidden;}</style>';
            $('body').append(sttleText);

            if ($('.ggw_fm').length > 0) {
                $('body').css('overflow','hidden');
            }

            var timeStamp = new Date() ;
            timeStamp.setHours('23');
            timeStamp.setMinutes('59');
            timeStamp.setSeconds('60');

            $('.ggw_cok a').click(function(){
                document.cookie = $(this).parents('.ggw_cok').data('cok') + "=" + escape(0) + (";expires=" + timeStamp.toGMTString());
            });
            $('.ggw_cok .ggw_fm_close').click(function(){
                document.cookie = $(this).parents('.ggw_cok').data('cok') + "=" + escape(0) + (";expires=" + timeStamp.toGMTString());
            });

            $('.ggw_fm_close').on('click',function(){
                $('.ggw_fm').remove();
                $('body').css('overflow','');
            });
            $('.ggw_fm_main a').on('click',function(e){
                var url = $(this).attr('href');
                $('.ggw_fm').remove();
                $('body').css('overflow','');
                e.preventDefault();
                aClick()
                setTimeout(function(){
                    window.location.href = url;
                },10);
            });
            $('.ggw_clo a').on('click',function(e){
                var url = $(this).attr('href');
                $(this).parents('.ggw_clo').remove();
                e.preventDefault();
                aClick()
                setTimeout(function(){
                    window.location.href = url;
                },10);
            });

            //轮播推荐位
            if($('#ggw_fm_swiper').length>0 && $('.ggw_fm_swiper').data('time') != 0 && $('.ggw_fm_swiper_slide').length > 1){
                var mySwiperGgw = new Swiper('.ggw_fm_swiper', {
                    loop: true,
                    autoplay: $('.ggw_fm_swiper').data('time')
                });
                document.getElementById('ggw_fm_swiper').ontouchend = function(e){
                    mySwiperGgw.startAutoplay();
                }
                document.getElementById('ggw_fm_swiper').ontouchstart = function(e){
                    mySwiperGgw.stopAutoplay();
                }
            }

            window.onresize = function(){
                $('.ggw_fm_swiper_slide').height($('.ggw_fm_swiper').width()/4);
                $('.ggw_fm_swiper').height($('.ggw_fm_swiper').width()/4);
            }
            $('.ggw_fm_swiper_slide').height($('.ggw_fm_swiper').width()/4);
            $('.ggw_fm_swiper').height($('.ggw_fm_swiper').width()/4);
        }
   );


});