;(function(){
    "use strict";
    var $form_add_task = $('.add-task')
    , $task_delete_trigger
    ,$task_detail
    ,$task_detail_trigger
    ,$task_detail = $('.task-detail')
    ,$task_detail_mask = $('.task-detail-mask')
    , task_list = []
    ,current_index
    ,$update_form
    ,$task_detail_content
    ,$task_detail_content_input
    ,$checkbox_complete

   
    ;


    init();

    $form_add_task.on('submit', on_add_task_form_submit)
    $task_detail_mask.on('click', hide_task_detail)

    function on_add_task_form_submit(e){
        var new_task = {},$input;
        // 禁用默认行为
        e.preventDefault();
        // 获取新task的值
        $input = $(this).find('input[name = content]');
        new_task.content = $input.val();
        // 如果新task值为空，则返回，否则继续执行
        if (!new_task.content) return;
        // 存入新task
        if(add_task(new_task)){
            $input.val(null);           
        }
    
    }

    function listen_task_detail(){
        var index;
        $('.task-item').on('dblclick',function(){
            index = $(this).data('index');
            show_task_detail(index);
        })

        $task_detail_trigger.on('click',function(){
        var  $this = $(this);
        //找到删除按钮所在的task元素
        var $item = $this.parent().parent();
        var index = $item.data('index');
        show_task_detail(index);

        })
    }
    //查看task详情
    function show_task_detail(index){
        //生成详情模板
        render_task_detail(index);
        current_index = index;
        //显示详情模板（默认隐藏）
        $task_detail.show();
        //显示详情模板masak（默认隐藏）
        $task_detail_mask.show();
    }
    //更新task
    function update_task(index,data){
        if (!index || !task_list[index]) return;

        task_list[index] = $.extend({},task_list[index],data);
        refresh_task_list();
    }
    //隐藏task详情
    function hide_task_detail(){
        $task_detail.hide();
        $task_detail_mask.hide();
    }
    //渲染指定的详细
    function render_task_detail(index){
        if (index===undefined || !task_list[index]) return;
        var item = task_list[index];
        var tpl = 
        '<form>' + 
            '<div  class="content">' + 
            item.content +
            '</div>' +
            '<div class = "input_item">' + 
            '<input style = "display: none;" type = "text"  name = "content" value = "'+ (item.content || '')+'">' + 
            '</div>' +
           ' <div>' +
                '<div class="desc input_item">' +
                ' <textarea name = "desc">'+( item.desc || '') + '</textarea>' +
                '</div>' +
            '</div>' +
            '<div class="remind input_item">' +
                '<input name = "remind_date" type="date" value = "'+ item.remind_date + '">' +
            '</div>' +
            '<div class = "input_item">' +
                     '<button type="submit">更新</button>' +
                '</div>' +
        '</form>';  
        //清空task详情模板
        $task_detail.html(null);
        //用新模板替换
        $task_detail.html(tpl);
        //选中form元素，之后使用其监听submit事件
        $update_form = $task_detail.find('form');
        //选中task内容元素
        $task_detail_content = $update_form.find('.content');
        //选中task input元素
        $task_detail_content_input = $update_form.find('[name = content]');

        //双击内容元素显示input，隐藏自己
        $task_detail_content.on('dblclick',function(){
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })

    $update_form.on('submit',function(e){
             // 禁用默认行为
            e.preventDefault();
            var data = {};
            //获取表单中input的值
            data.content = $(this).find('[name = content]').val();
            data.desc = $(this).find('[name = desc]').val();
            data.remind_date = $(this).find('[name = remind_date]').val();
            // console.log(data);
            //
            update_task(index,data);
            hide_task_detail();
            })
        }
        //查找并监听所以删除按钮的点击事件       
    function listen_task_delete(){
            $task_delete_trigger.on('click',function(){
            var  $this = $(this);
            //找到删除按钮所在的task元素
            var $item = $this.parent().parent();
            var index = $item.data('index');
            //确认删除
            var tmp = confirm('确定删除?');
            tmp ? delete_task(index):null;
    
            })
        }
        //监听完成task事件       
    function listen_checkbox_complete(){
            $checkbox_complete.on('click',function(){
                var $this = $(this);
                var $index = $this.parent().parent().data('index');
                var item = get(index);
                if (item.complete)
                    update_task(index,{complete:false});
                else
                    update_task(index,{complete:true});

                   
    
            })
        }
    function get(index){
             return store.get('task_list')[index];
    }
    function add_task(new_task){

        // 将新task推入task_list
        task_list.push(new_task);
        refresh_task_list(); 
        return true;   
        //  refresh_task_list();
       
     }
     //刷新localstorage并且渲染模板
     function refresh_task_list(){   
        store.set('task_list',task_list);
        render_task_list();

    }
     //找到删除一条task元素
     function delete_task(index){
         //如果没有index或者index不存在则直接返回
        if (index===undefined || !task_list[index]) return;//考虑到0
        delete task_list[index];
        // 更新localstorage
        refresh_task_list(); 
    }  
    function init(){
        task_list = store.get('task_list')||[];
        if (task_list.length)
        render_task_list();
     }
        //渲染全部task模板
     function render_task_list(){
        // console.log('1',1);
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = []; 
        for (var i = 0;i < task_list.length;i++){
            var item = task_list[i];
            if (item && item.complete)
                complete_items.push(item);
            else
                var $task = render_task_item(item,i);
                $task_list.prepend($task);
        }
        for (var j = 0;j< complete_items.length;j++){
            $task = render_task_item(item,j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete')
        $task_detail_trigger = $('.action.detail')
        $checkbox_complete = $('.task-list.complete[type = checkbox]')
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
     }
     //渲染单条task模板
    function render_task_item(data,index){
        if (!data||!index) return;
        var list_item_tpl = 
        '<div class="task-item" data-index="'+ index +'">'+
        '<span><input class = "complete" '+ (data.complete ? 'checked':'') +'type="checkbox"></span>'+
        '<span class="task-content">' + data.content + '</span>'+
        '<span class="fr">'+
        '<span class="action delete"> 删除 </span>'+
        '<span class="action detail"> 详细 </span>'+
        '</span>' +
        '</div> ';
        return $(list_item_tpl);
    }


})();

