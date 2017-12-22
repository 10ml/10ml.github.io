//获得参数
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return unescape(pair[1]);}
    }
    return(false);
}


if(window.history.state){
    $('.goods-list').html(window.history.state.list);
    var page = window.history.state.page;
}else{
    var page = 1;
}
var cat_id = getQueryVariable('cid') || 0;
console.log('cat_id:', cat_id);
var isFinish = false;
var isLoading = false;
var $pullUp = null;
var needLoadMore = false;

var maxScrollY = 0;
var windowHeight = 0;
var tPaht= "https://center.nepo.cf/api/tb-goods";
var list_tpl = '<% _.forEach(datas, function(data) { %>' +
        '<div class="goods-item">' +
        '<a data-gid="<%- data.id %>" href="./show.html?image=<%- data.pic_url %>&word=<%- data.token %>"  class="img">' +
        '<span class="coupon-wrapper  theme-bg-color-1">券 <i>￥</i><b><%- data.coupon_amount %></b></span>' +
        '<span class="today-wrapper"><b>NEW</b></span><img class="lazy" src="./images/rolling.gif?v=201712091615"  data-original="<%- data.pic_url %>" alt="" />' +
        '</a>' +
        '<a  data-gid="<%- data.id %>" href="./show.html?image=<%- data.pic_url %>&word=<%- data.token %>" class="title">' +
        '<div class="text"><%- data.title %></div>' +
        '</a>' +
        '<div class="price-wrapper">' +
        '<span class="text">券后</span>' +
        '<span class="price">￥<%- data.coupon_price %></span>' +
        '<div class="sold-wrapper">' +
        '<span class="sold-num"><%- data.biz30day %></span>' +
        '<span class="text">人已买</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<% }); %>';
var cat_tpl = '<% _.forEach(datas, function(name,index) { %>' +
        '<li class="cat-item">' +
        '<a rel="external" href="./?cid=<%- index %>" data-cid="<%- index %>"><%- name %></a>' +
        '</li>' +
        '<% }); %>';

$(document).ready(function () {
    maxScrollY = $(document).height();
    windowHeight = $(window).height();
    $(window).on('resize', function () {
        windowHeight = $(window).height();
    });
    $(window).scroll(function (e) {
        if (isFinish || isLoading) {
            return;
        }
        var y = $(document).scrollTop();
        maxScrollY = $(document).height();
        windowHeight = $(window).height();
        if (Math.abs(maxScrollY - windowHeight - y) > 100) {
            return;
        }
        var $wrapper = $(this);
        if (!$pullUp) {
            $pullUp = $wrapper.find('.pullup-goods');
        }
        var data = null;
        getData($wrapper, data, 1);
    });

    function getData($wrapper, data, direction) {
        if (isFinish) {
            return;
        }
        isLoading = true;
        if (!$pullUp) {
            $pullUp = $wrapper.find('.pullup-goods');
        }
        var labelTag = '.pullup-goods .label';
        $.ajax(tPaht,{
            data: {page: page, date:"",cat_id:cat_id,cac_id:'cXVlcnlUaGVuRmV0Y2g7NDszNjc4MjM1MzA6VlV4N2Y1ZndSYXlHMWdNS0FNazZRQTszNjc3NjIxNDg6cjhHOTVnQmlUeE9EblZnVHE5MjBPZzszNjc4MjkwNzE6dFVLLXNYenpUYktKenR3MkpGLW9ZUTszNjc3NzMyNzU6Qk85ZC02YmNTc0NaWkdVQmtvYTh1UTswOw=='},
            dataType: 'json',
            type: 'get',
            error: function (xhr, type, errorThrown) {
                getData($wrapper, data, direction);
            },
            success: function (result, status, xhr) {
                needLoadMore = false;

                if (page <= result['_meta']['pageCount']) {
                    /*if(result.data.pageStatus === false){
                        isLoading = false;
                        $('.pullup-goods .label').html('没有更多商品啦');
                        isFinish = true;
                    }*/
                    var tpl = _.template(list_tpl);
                    $('.goods-list').append(tpl({datas:result['items']}));
//                        myScroll.refresh();
                    $("img.lazy").lazyload();
                    aClick();
                    maxScrollY = $(document).height();
                    isLoading = false;
                    page++;
                    $('.goods-list').attr('data-page',page);
                    //$(labelTag).html('上拉加载更多商品');
                } else {
//                      myScroll.refresh();
                    maxScrollY = $(document).height();
                    isLoading = false;
                    $(labelTag).html('没有更多商品啦');
                    isFinish = true;
                }
            }
        });
    }
    $(window).trigger('scroll');

    (function () {
        $.ajax(tPaht+'/category',{
            data: {page: page, date:"",cat_id:0,cac_id:'cXVlDDASDASASDcnlUaGVuRmV0Y2g7NDszNjc4MjM1MzA6VlV4N2Y1ZndSYXlHMWdNS0FNazZRQTszNjc3NjIxNDg6cjhHOTVnQmlUeE9EblZnVHE5MjBPZzszNjc4MjkwNzE6dFVLLXNYenpUYktKenR3MkpGLW9ZUTszNjc3NzMyNzU6Qk85ZC02YmNTc0NaWkdVQmtvYTh1UTswOw=='},
            dataType: 'json',
            type: 'get',
            error: function (xhr, type, errorThrown) {
                getCat();
            },
            success: function (result, status, xhr) {
                //$("#cat-tpl").html()
                var tpl = _.template(cat_tpl);
                console.log('cat-tpl:', tpl);
                $('.main-cat').html(tpl({datas:result}));
            }
        });
    })()
});
$("img.lazy").lazyload();