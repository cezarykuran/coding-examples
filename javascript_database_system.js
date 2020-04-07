bodyonload = {
	stack : [],
	
	init : function()
	 {
		$.each(bodyonload.stack, function(){if(typeof this == 'function') this()})
	 },

	push : function(f)
	 {
		bodyonload.stack.push(f);
	 }
 }


toolbar = {
    $window : null,
    visible : false,

    init : function() {
        toolbar.$window = $(window);

        toolbar.onscroll();
        toolbar.$window.scroll(toolbar.onscroll);
    },

    onscroll : function(e) {
        var scrollTop = toolbar.$window.scrollTop();

        if(scrollTop > 250) {
            if(!toolbar.visible) {
                $('#toolbar').stop().fadeIn()
                toolbar.visible = true;
            }
        }
        else {
            if(toolbar.visible) {
                $('#toolbar').stop().fadeOut()
                toolbar.visible = false;            
            }
        }
    },
}

slide = function(obj, class_vissible, class_hidden, save) {
    class_vissible || (class_vissible = 'fa-caret-up');
    class_hidden || (class_hidden = 'fa-caret-down');
    
    var jQ_container = $(obj).closest('[data-slider="container"]');
    var jQ_content = jQ_container.children('[data-slider="content"]');

    if (jQ_content.is(":hidden")) {
        //if(save) setCookie(id, 1);
        jQ_content.stop().slideDown();
        jQ_container.children('[data-slider="label"]').find('.'+class_hidden).removeClass(class_hidden).addClass(class_vissible);
    }
    else {
        //if(save) setCookie(id, 0);
        jQ_content.stop().slideUp();
        jQ_container.children('[data-slider="label"]').find('.'+class_vissible).removeClass(class_vissible).addClass(class_hidden);
    }
}


popup = {
	fade_time : 'fast',
	box_bussy : false,

	confirm : {
		hook : null,

		show: function(content, call_on_ok)
		 {
			if(popup.box_bussy) return;
			popup.box_bussy = true;

			popup.confirm.hook = call_on_ok;

			var modal = $('#popup-confirm');
            modal.find('.panel-body').text(content);

			modal.css({'visibility': 'hidden', 'display': 'block'});
			var container = modal.find('.container');
			container.css('margin-top', -parseInt(container.height()/2));
			modal.css({display: 'none', visibility: 'visible'});

			modal.fadeIn(popup.fade_time);
		 },

		onclick_ok : function()
		 {
			$('#popup-confirm').fadeOut(popup.fade_time, popup.confirm.after_hide);
		 },

		onclick_cancel : function()
		 {
			popup.confirm.hook = null;
			$('#popup-confirm').fadeOut(popup.fade_time, popup.confirm.after_hide);
		 },

		after_hide: function()
		 {
			popup.box_bussy = false;
			if(typeof popup.confirm.hook == 'function')
			 {
				popup.confirm.hook();
				popup.confirm.hook = null;
			 }
		 },
	 },

    input : {
        hook : null,

        show: function(header, call_on_ok, val) {
            if(popup.box_bussy) return;
            popup.box_bussy = true;

            popup.input.hook = call_on_ok;

            var modal = $('#popup-input');

            modal.find('.panel-heading').text(header ? header : 'Wprowadź wartość');
            $('#popup-input-data').val(val ? val : '');

            modal.css({'visibility': 'hidden', 'display': 'block'});
            var container = modal.find('.container');
            container.css('margin-top', -parseInt(container.height()/2));
            modal.css({display: 'none', visibility: 'visible'});

            modal.fadeIn(popup.fade_time);
        },

        onclick_ok : function() {
            $('#popup-input-data').val()
                && $('#popup-input').fadeOut(popup.fade_time, popup.input.after_hide);
        },

        onclick_cancel : function() {
            popup.input.hook = null;
            $('#popup-input').fadeOut(popup.fade_time, popup.input.after_hide);
        },

        after_hide: function() {
            popup.box_bussy = false;
            if(typeof popup.input.hook == 'function') {
                popup.input.hook($('#popup-input-data').val());
                popup.input.hook = null;
            }
        },
    },

	login : {
		call_onsubmit : null,
		call_after_login : null,

		show: function(call_onsubmit)
		 {
			if(popup.box_bussy) return;
			popup.box_bussy = true;

			popup.login.call_onsubmit = call_onsubmit;

			$('#popup-login').fadeIn(popup.fade_time);
		 },

		hide : function(call_after_hide)
		 {
			popup.login.call_onsubmit = null;

			$('#login-email, #login-password').val('');
			$('#login-label').text('');

			$('#popup-login').fadeOut(popup.fade_time, function(){
					popup.confirm.bussy = false;
					call_after_hide();
				});
		 },

		onsubmit : function()
		 {
			$('#login-label').text('');
			var data = {
					'email'		: $('#login-email').val(),
					'password'	: $('#login-password').val()
				};

			if(typeof popup.login.call_onsubmit == 'function')
				popup.login.call_onsubmit(data);
		 },

		error : function(err)
		 {
			$('#login-label').text(err);
		 },
	 },

	msg : {
		timeout : false,
		call_on_hide : null,

		onload : function(type, text, call_on_hide)
		 {
			bodyonload.push(function(){
					popup.msg.show(type, text, call_on_hide)
				})
		 },

		show : function(type, text, call_on_hide)
		 {
			if(popup.msg.timeout) clearTimeout(popup.msg.timeout);

			var jQ_popup = $('#popup-msg');

			jQ_popup
                .find('.alert').removeClass().addClass('alert alert-' + type)
                .text(text);
			
			popup.msg.call_on_hide = call_on_hide;

            jQ_popup.fadeIn(popup.fade_time);
			popup.msg.timeout = setTimeout(popup.msg.hide, 2000);
		 },

		hide : function()
		 {
			popup.msg.timeout = false;
			$('#popup-msg').fadeOut(popup.fade_time, popup.msg.call_on_hide);
		 }
	 },

	ajax : {
		after_show : null,
		after_hide : null,

		show : function(after_show)
		 {
			popup.ajax.after_show = after_show;
			$('#popup-ajax').stop().fadeIn(popup.fade_time, function(){if(typeof popup.ajax.after_show == 'function') popup.ajax.after_show();});
		 },

		hide : function(after_hide)
		 {
			popup.ajax.after_hide = after_hide;
			$('#popup-ajax').stop().fadeOut(popup.fade_time, function(){if(typeof popup.ajax.after_hide == 'function') popup.ajax.after_hide();});
		 },
	 }
 }

ajax = {
	bussy : false,
	responses : null,
	call : null,

	request : function(method, url, data, call, responses)
	 {
		if(ajax.bussy) return;
		ajax.bussy = true;

		popup.ajax.show();

		ajax.call = call;
		ajax.responses = responses;
        
        var settings = {
            'method'    : !method
                              ? 'POST'
                              : method.toUpperCase(),
            'url'       : url,
            'data'      : data,
            'dataType'  : 'json',
            'cache'     : false,
            'success'   : ajax.on_success,
            'error'     : ajax.on_fail,
        }

        if(data instanceof FormData) {
            settings.data.append('ajax', true);
            $.extend(settings, {
                processData: false,
                contentType: false,              
            });
        }
        else {
            settings.data.ajax = true;
        }
            
		$.ajax(settings);
	 },

	on_success : function(data, textStatus, jqXHR)
	 {
		popup.ajax.hide(function(){
				ajax.bussy = false;

				if(typeof ajax.call == 'function' && (!ajax.responses || $.inArray(data.response, ajax.responses) != -1))
					ajax.call(data);
				else
					switch(data.response)
					 {
						case 'offline':
						case 'location':
							if(typeof data.notice == 'undefined')
								document.location = data.content;
							else
								popup.msg.show('success', data.notice, function(){document.location = data.content;});
							break;

						case 'reload':
							if(typeof data.notice == 'undefined')
								document.location.reload();
							else
								popup.msg.show('success', data.notice, function(){document.location.reload();});
							break;
	
						case 'ok':
							popup.msg.show('success', data.content);
							break;

						case 'error':
							popup.msg.show('danger', data.content);
							break;

						default:
							popup.msg.show('danger', 'Błąd ajax - nieznany typ odpowiedzi');
					 }
			});
	 },

	on_fail : function(jqXHR, textStatus, errorThrown)
	 {
		popup.ajax.hide(function(){
				ajax.bussy = false;
				popup.msg.show('danger', 'Wystąpił błąd w komunikacji (sprawdź połączenie z internetem).');
			});
	 }
 }


access = {
	url_login : '',
	url_logout : '',
	url_ping : '',

	page : function()
	 {
		access.login(function(data){location=data.content});
	 },

	gate : function(call_when_online)
	 {
		ajax.request('POST', access.url_ping, {}, function(data) {
				if(data.response == 'online')
					call_when_online();
				else
					access.login(call_when_online);
			});
	 },

	login : function(call_after_login)
	 {
		popup.login.show(
				function(login_data){
						ajax.request('POST', access.url_login, login_data, function(data){
								if(data.response == 'ok')
									popup.login.hide(function(){
											call_after_login(data)
										});
								else
									popup.login.error('Błąd logowania');							
							}, ['ok', 'error']);
					}
			);
	 },

	logout : function()
	 {
		popup.confirm.show('Czy chcesz sie wylogować?', function(){
				ajax.request('POST', access.url_logout, {});
			});
	 },
 }

panels = {
	category : function(obj, category)
	 {
		var jQ_obj = $(obj);
		if(jQ_obj.hasClass('active')) return;

		// buttons activity
		$('#panels-categories').children().removeClass('active');
		jQ_obj.addClass('active');

		// panels
		if(category == 'all')
			$('#panels-content').children(':hidden').show();
		else
			$('#panels-content').children().each(function(){
					var jQ_panel = $(this);
					var categories = jQ_panel.attr('data-panel-categories');

					if(!categories || $.inArray(category, categories.split(' ')) === -1)
						jQ_panel.hide();
					else
						jQ_panel.show();
				});
	 },

	search : function()
	 {
		var search_text = $('#panels-search-text').val();
		if(!search_text) return;
		search_text = search_text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

		// buttons
		$('#panels-categories').children().removeClass('active');

		// panels
		$('#panels-content').children().each(function(){
				var jQ_panel = $(this);
				var text = jQ_panel.attr('data-panel-text');

				if(!text || text.toLowerCase().search(search_text.toLowerCase()) == -1)
					jQ_panel.hide();
				else
					jQ_panel.show();
			});
	 },
 }

ajaxrm = {
	jQ_target : null,

	post : function(caller, container, url, confirm)
	 {
        if(typeof container == 'string' && container.substr(0,1) == '.') {
            ajaxrm.jQ_target = $(caller).closest(container);          
        }
        else
		switch(container)
		 {
			case 'div':
			case 'form':
			case 'li':
			case 'tr':
				ajaxrm.jQ_target = $(caller).closest(container);
				break;

			case 'attachment':
			case 'panel':
			case 'fake-table':
			case 'fake-table-group':
			case 'fake-table-row':
            case 'client-edit-email':              
				ajaxrm.jQ_target = $(caller).closest('.' + container);
				break;
			
			default:
				ajaxrm.jQ_target = $(caller);
		 }
 		
		if(confirm)
			popup.confirm.show(confirm, function(){
					access.gate(function(){
							ajax.request('POST', url, {}, function(data){
									ajaxrm.jQ_target.slideUp('normal', function(){$(this).remove()});
									popup.msg.show('success', data.content);
								}, ['ok']);
						});
				});
		else
			access.gate(function(){
					ajax.request('POST', url, {}, function(data){
							ajaxrm.jQ_target.slideUp('normal', function(){$(this).remove()});
							popup.msg.show('success', data.content);
						}, ['ok']);
				});
	 },
 }
 

jsform ={

    /* extensions */
    tinymce : {
        create : function(id_obj, css) {
            tinymce.init({
                    selector: "textarea#"+id_obj,
                    theme: "modern",
                    content_css : css,
                //	width: 300,
                    height: $('#' + id_obj).height(),
                    plugins: [
                            "autolink link image lists charmap print preview hr anchor ",
                            "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime nonbreaking",
                            "table textcolor"
                            // !newdocument !template advlist emoticons save pagebreak spellchecker directionality media paste contextmenu
                        ],
                    entity_encoding : "raw",
                    fullpage_default_encoding: "UTF-8",
                    //extended_valid_elements: "button[onclick]",
                    toolbar: [
                            "newdocument | undo redo | cut copy paste selectall | pastetext pasteword | searchreplace | visualchars visualblocks code | preview print | fullscreen",
                            "styleselect | fontselect fontsizeselect | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link charmap hr table image | removeformat",
                        ],
                    menubar : false,
                    browser_spellcheck : true,
                    language : 'pl'
                /*,
                    style_formats: [ {title: 'Bold text', inline: 'b'}, {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}}, {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}}, {title: 'Example 1', inline: 'span', classes: 'example1'}, {title: 'Example 2', inline: 'span', classes: 'example2'}, {title: 'Table styles'}, {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
                    ]
                */
                });
          },

        data : function(form, is_jQ) {
            var form_data ={};

            if(typeof tinyMCE != 'undefined') {
                $.each(tinyMCE.editors, function(){
                        if(this.targetElm.name) form_data[this.targetElm.name] = this.getContent();
                    });
              }
            
            return form_data;
          },
        
        submit : function(form, is_jQ){}
      },

    datetimepicker : {
        create : function(id_obj) {
            $('#' + id_obj).datetimepicker({
                        firstDay: 1,
                        //changeMonth: true,
                        //changeYear: true,
                        showButtonPanel: true,
                            currentText: 'Teraz',
                            closeText: 'OK',
                        //numberOfMonths: [1,2,3],
                        //showWeek: true,
                        gotoCurrent: true,
                        //minDate: 0,
                        //maxDate: 62,
                        dateFormat: "yy/mm/dd",
                        timeFormat: 'HH:mm',
                        //beforeShow: function (input, inst){},
                    });
          },

        clear : function(id_obj) {
            $('#' + id_obj).val('');
          }
      },


    /* inputs */
    fi : {
        onclick : function(fi, label) {
            var jQ_fi = $(fi);

            if(jQ_fi.attr('data-fi') == 'radio' && jQ_fi.attr('data-fi-chkd') == '1') {
                return false;
            }

            if(jQ_fi.attr('data-fi') == 'radio') {
                jQ_fi.closest('form')
                    .find('[data-fi-name="' + jQ_fi.attr('data-fi-name') + '"]')
                    .attr('data-fi-chkd', '');

                jQ_fi.attr('data-fi-chkd', '1');
            }
            else if(jQ_fi.attr('data-fi-chkd')) {              
                jQ_fi.attr('data-fi-chkd', '');
            }
            else {
                jQ_fi.attr('data-fi-chkd', '1');              
            }

            if(label) {
                if(typeof label != 'string') label = jQ_fi.text();
                jQ_fi.closest('form')
                    .find('[data-fi-label="' + jQ_fi.attr('data-fi-name') + '"]')
                    .text(label);
            }
            return true;
        },

        onselect : function(fi, value, label, dropdown) {
            var jQ_fi = $(fi);
            var jQ_fi_select = jQ_fi.closest('[data-fi="select"]');
            
            if(jQ_fi_select.attr('data-fi-value') == value)
                return false;
            
            jQ_fi_select.attr('data-fi-value', value);

            if(label){
                if(typeof label != 'string') label = jQ_fi.text();
                jQ_fi_select.children('button').children('span').text(label);
            }

            if(dropdown){
                jQ_fi.closest('ul').children().removeClass('active');
                jQ_fi.closest('li').addClass('active');
            }
            
            return true;
          },

        data : function(form, is_jQ) {
            var form_data ={};

            var jQ_form = is_jQ ? form : $(form);
            jQ_form.find('[data-fi]').each(function(){
                    var jQ_fi = $(this);
                    var name = jQ_fi.attr('data-fi-name');
                    var name_length = name ? name.length : 0;

                    if(name && (jQ_fi.attr('data-fi') == 'select' || jQ_fi.attr('data-fi-chkd'))) {
                        if(name_length > 2 && name.indexOf('[]') == name_length -2) {
                            if(typeof form_data[name] == 'undefined') form_data[name] = [];
                            form_data[name].push(jQ_fi.attr('data-fi-value'));
                          }
                        else form_data[name] = jQ_fi.attr('data-fi-value');
                      }
                });

            return form_data;
          },

        submit : function(form, is_jQ) {
            var jQ_form = is_jQ ? form : $(form);
            jQ_form.find('[data-fi]').each(function(){
                    var jQ_fi = $(this);
                    if(jQ_fi.attr('data-fi-name') && (jQ_fi.attr('data-fi') == 'select' || jQ_fi.attr('data-fi-chkd')))
                        jQ_form.prepend(
                                $(document.createElement("input"))
                                    .attr('type', 'hidden')
                                    .attr('name', jQ_fi.attr('data-fi-name'))
                                    .attr('value', jQ_fi.attr('data-fi-value'))
                            );
                });
         },
    },


    /* libs */
    lib_filters : {
        data : {},
        data_filter : null,

        init: function() {
            $.each(jsform.lib_filters.data, function(group_id, group) {
                        // skip children
                        if(group['parent-id'] || typeof group['autoload'] != 'undefined' && group['autoload'] == 'no')
                            return true;

                        // root
                        jsform.lib_filters.group_html_load(group_id);
                        jsform.lib_filters.process_active(group_id, true);
                    }
                );
        },

        onclick_show: function(obj, group_id, id_content) {
            if(this.data[group_id].content[id_content].active) return;

            // deactivate old
            this.process_active(group_id, false);
            $.each(this.data[group_id].content, function(){this.active = 0;});

            // activate new
            this.data[group_id].content[id_content].active = 1;
            this.process_active(group_id, true);

            $('#' + this.data[group_id].container).children().each(function(){$(this).attr('data-active', '')});
            $(obj).attr('data-active', '1');
        },

        onclick_checkbox : function(obj, group_id, content_id) {
            jQ_obj = $(obj);

            while(typeof jQ_obj.attr('data-fi') == 'undefined')
                jQ_obj = jQ_obj.parent();

            if(jQ_obj.attr('data-fi-chkd')) {
                jQ_obj.attr('data-fi-chkd', '');
                this.data[group_id].content[content_id].chkd = 0;
                this.chkbox_clear_children(group_id, content_id);
              }
            else {
                jQ_obj.attr('data-fi-chkd', '1');
                this.data[group_id].content[content_id].chkd = 1;
                this.chkbox_select_parents(group_id);
              }
            return false;
        },

        onclick_clear_all : function(group_id) {
            // content
            $.each(jsform.lib_filters.data[group_id].content, function(content_id, content) {
                        // skip
                        if(!content.chkd) return true;

                        // clear
                        content.chkd = 0;
                        jsform.lib_filters.chkbox_clear_children(group_id, content_id);
                    }
                );

            // update html
            $('#' + jsform.lib_filters.data[group_id].container).find('li').attr('data-fi-chkd', '');
          },

        chkbox_select_parents : function(group_id) {
            // no parents
            if(!this.data[group_id]['parent-id']) return;

            var parent_id = this.data[group_id]['parent-id'];
            var parent_content_id = this.data[group_id]['parent-content-id'];

            // find parent content
            $.each(this.data[parent_id].content, function(content_id){
                    // continue
                    if(this.id != parent_content_id) return true;

                    // skip
                    if(this.chkd) return false;

                    // select
                    this.chkd = 1;
                    $('#' + jsform.lib_filters.data[parent_id].container)
                            .find("li[data-group-id='"+parent_id+"'][data-content-id='" + content_id + "']")
                            .attr('data-fi-chkd', '1');
                    // next
                    jsform.lib_filters.chkbox_select_parents(parent_id);
                    return false;
                });
          },

        chkbox_clear_children : function(group_id, content_id, visible) {
            // no children
            if(!jsform.lib_filters.data[group_id].content[content_id].children) return;

            // boost
            if(typeof visible == 'undefined')
                visible = jsform.lib_filters.data[group_id].content[content_id].active;

            // search children
            $.each(jsform.lib_filters.data, function(child_id, child) {
                        //continue
                        if(group_id != child['parent-id'] || jsform.lib_filters.data[group_id].content[content_id].id != child['parent-content-id']) return true;

                        $.each(child.content, function(child_content_id, child_content) {
                                    // skip
                                    if(!child_content.chkd) return true;

                                    // next
                                    jsform.lib_filters.chkbox_clear_children(child_id, child_content_id, visible && child_content.active);

                                    // clear chkd
                                    child_content.chkd = 0;

                                    // refresh if visible (boost)
                                    if(visible) $('#'+child.container).find('li').attr('data-fi-chkd', '');
                                }
                            );
                    }
                );
          },

        process_active : function(group_id, show) {
            $.each(jsform.lib_filters.data[group_id].content, function(content_id, content) {
                        //continue
                        if(!content.active) return true;

                        // break
                        if(!content.children) return false;

                        // label
                        if(show) $('#' + jsform.lib_filters.data[group_id].container+'-label').text(content.name);

                        // search children
                        $.each(jsform.lib_filters.data, function(child_id, child) {
                                    //continue
                                    if(group_id != child['parent-id'] || content.id != child['parent-content-id']) return true;

                                    // active next
                                    jsform.lib_filters.process_active(child_id, show);

                                    if(show)
                                        jsform.lib_filters.group_html_load(child_id);
                                    else
                                        jsform.lib_filters.group_html_remove(child_id);										
                                }
                            );
                        return false;
                    }
                );		
          },

        group_html_load : function(group_id) {
            if(typeof this.data[group_id] == 'undefined'){
               return;
            }

            var container = this.data[group_id].container;

            // label
            if(typeof this.data[group_id].label != 'undefined')
                $('#'+container+'-label').text(this.data[group_id].label);

            // button
            $('#'+container+'-button').attr('onclick', "jsform.lib_filters.onclick_clear_all('"+group_id+"')");

            // content
            var jQ_container = $('#' + container);
            $.each(this.data[group_id].content, function(content_id, content) {
                        var i_onclick = "";
                        if(content.children)
                            i_onclick = "jsform.lib_filters.onclick_checkbox(this,'" + group_id + "','" + content_id + "');";

                        var jQ_li = $(document.createElement("li"))
                                .attr('title', content.name)
                                .attr('data-fi', '')
                                .attr('data-group-id', group_id)
                                .attr('data-content-id', content_id)
                                .append([
                                        $(document.createElement("i"))
                                            .addClass('fa fa-fw fa-square-o')
                                            .attr('onclick', i_onclick),
                                        $(document.createElement("i"))
                                            .addClass('fa fa-fw fa-check-square-o')
                                            .attr('onclick', i_onclick),
                                        $(document.createElement("span"))
                                            .text(content.name)
                                    ]);

                        if(content.active)
                            jQ_li.attr('data-active', '1');

                        if(content.chkd)
                            jQ_li.attr('data-fi-chkd', '1');
                        else
                            jQ_li.attr('data-fi-chkd', '');

                        if(content.children)
                            jQ_li.attr('onclick', "console.log('onclick LI'); jsform.lib_filters.onclick_show(this,'"+group_id+"','"+content_id+"')");
                        else
                            jQ_li.attr('onclick', "console.log('onclick LI'); jsform.lib_filters.onclick_checkbox(this,'"+group_id+"','"+content_id+"')");
                        
                        jQ_container.append(jQ_li);
                      }
                );
          },

        group_html_remove : function(group_id){
            $('#' + jsform.lib_filters.data[group_id].container).children().remove();
        },

        data_filter_check : function(id){
            if(jsform.lib_filters.data_filter == null || jsform.lib_filters.data_filter == false) {
                return true;
            }
            if(!jsform.lib_filters.data_filter.length) {
                return false;
            }
            
            for(var i=0; i<jsform.lib_filters.data_filter.length; i++){
                if(id.substr(0, jsform.lib_filters.data_filter[i].length) == jsform.lib_filters.data_filter[i]){
                    return true;
                }
            }
            return false;
        },

        data : function(){
            var f_data ={};
            $.each(jsform.lib_filters.data, function(id, input){
                if(!jsform.lib_filters.data_filter_check(id)){
                    return true;
                }
                $.each(input.content, function(){
                    if(this.chkd) {
                        if(typeof f_data[id] == 'undefined') f_data[id] = [];
                        f_data[id].push(this.id);
                      }
                })
            });
            return f_data;
        },

        submit : function(form, is_jQ){
            var jQ_form = is_jQ ? form : $(form);
            $.each(jsform.lib_filters.data, function(id, input){
                if(!jsform.lib_filters.data_filter_check(id)){
                    return true;
                }
                $.each(input.content, function(){
                        if(this.chkd)
                            jQ_form.prepend(
                                $(document.createElement("input"))
                                    .attr('type', 'hidden')
                                    .attr('name', id + '[]')
                                    .attr('value', this.id)
                              );
                    });
            });
        },

        source : {
            tl_ptype : '',

            source_toggle_click : function(btn) {
                if(!jsform.fi.onclick(btn)) {
                    return;
                }

                var $btn = $(btn);
                var source = $btn.attr('data-fi-value');
                
                if(source == 'telemarketing'){
                    if(jsform.lib_filters.source.tl_ptype) {
                        jsform.lib_filters.data_filter = ['TELEMARKETING-CALLS-'+jsform.lib_filters.source.tl_ptype];
                    }
                    else {
                        jsform.lib_filters.data_filter = [];
                    }
                }
                else{
                    jsform.lib_filters.data_filter = ['UBASE', 'TERC'];          
                }

                var $container = $btn.closest('[data-source-container]');
                $container.children('[data-source]').each(function(){
                        var $obj = $(this);
                        $obj.stop();
                        var text = $obj.attr('data-source');
                        if(!text || text.search(source) == -1)
                            $obj.slideUp();
                        else
                            $obj.slideDown();
                    });
            },

            telemarketing_lists_select : function(obj, value, label, type){
                if(!jsform.fi.onselect(obj, value, label, true)) {
                    return;                  
                }

                jsform.lib_filters.source.tl_ptype = type;
                
                $('#TELEMARKETING_CALLS_STATUSES').children().remove();
                jsform.lib_filters.data_filter = ['TELEMARKETING-CALLS-'+type];
                jsform.lib_filters.group_html_load('TELEMARKETING-CALLS-'+type);

            },

            products : {
                select : function(obj) {
                    var jQ_obj = $(obj);
                    var obj_value = jQ_obj.attr('data-product-value');

                    if(!jsform.fi.onselect(obj, obj_value, jQ_obj.attr('data-product-label'), true))
                        return;

                    var jQ_obj_product_container = jQ_obj.closest('[data-product="container"]');
                    var jQ_force = jQ_obj_product_container.parent().children('[data-product="force"]');

                    if(obj_value != '0'){
                        jQ_obj_product_container.parent().children('[data-product="container"]').each(function(){
                                var jQ_product_container = $(this);

                                if(jQ_product_container.is(jQ_obj_product_container)){
                                    jQ_product_container.children('[data-product="import"]').children('a')
                                        .attr('href', jQ_obj.attr('data-product-url'))
                                        .removeClass('disabled');
                                }
                                else{
                                    var jQ_obj_default = jQ_product_container.find('ul li a[data-product-value="0"]')

                                    if(jsform.fi.onselect(jQ_obj_default, jQ_obj_default.attr('data-product-value'), jQ_obj_default.attr('data-product-label'), true)){
                                        jQ_product_container.children('[data-product="import"]').children()
                                            .attr('href', '#')
                                            .addClass('disabled');
                                    }
                                }
                            });
                        
                        jQ_force.css('display') == 'none'
                            && jQ_force.stop().slideDown();
                    }
                    else{
                        jQ_obj_product_container.children('[data-product="import"]').children()
                            .attr('href', '#')
                            .addClass('disabled');

                        jQ_force.css('display') != 'none'
                            && jQ_force.stop().slideUp();
                    }

                },

                onclick : function(a) {
                    if(!$(a).hasClass('disabled')) window.location = a.href;
                },          
            }
        }        
    },

    lib_simc_search : {
        url_ajax : '',
        W : 0,

        onclick_W : function(obj, W) {
            if(jsform.lib_simc_search.W == W) return;

            jsform.fi.onclick(obj);

            jsform.lib_simc_search.W = W;
            jsform.lib_simc_search.find();		
          },

        onkeypress : function(e) {
            if(e.keyCode == 13) {
                jsform.lib_simc_search.find();
                return false;
              }
          },
        
        find : function() {
            var text = $('#LIB-SIMC-SEARCH-TEXT').val();
            if(text.length < 2) return;
            access.gate(function(){
                    ajax.request('POST', jsform.lib_simc_search.url_ajax,{'text' : text, 'W' : jsform.lib_simc_search.W}, function(data){
                            var jQ_ul = $('#LIB-SIMC-SEARCH-LIST');
                            jQ_ul.children().remove();
                            if(data.content.length == 0)
                                jQ_ul.append(
                                        $(document.createElement("li")).text('Nie znaleziono miejscowości')
                                    );
                            else
                                $.each(data.content, function(){
                                        jQ_ul.append(
                                                $(document.createElement("li"))
                                                    .attr('title', this.city)
                                                    .attr('data-fi', 'radio')
                                                    .attr('data-fi-name', 'LIB-SIMC-SEARCH-SYM')
                                                    .attr('data-fi-value', this.SYM)
                                                    .attr('data-fi-chkd', '')
                                                    .attr('onclick', "jsform.fi.onclick(this)")
                                                    .append([
                                                            $(document.createElement("i")).addClass('fa fa-fw fa-circle-o'),
                                                            $(document.createElement("i")).addClass('fa fa-fw fa-circle'),
                                                            $(document.createElement("span")).text(this.city)
                                                        ])
                                            );
                                    });
                        }, ['ok']);
                });
          },
      },


    /* form objects */

    client_categories : {
        data : [],

        init : function(edit) {
            if(edit) jsform.client_categories.categories_load(0);
            else {
                var jQ_UBASES = $('#ID_UBASES');
                var jQ_li;

                var n, n_max, n_load;
                for(n = 0, n_max = jsform.client_categories.data.length; n < n_max; n++) {
                    if(jsform.client_categories.data[n].chkd) n_load = n;

                    jQ_li = $(document.createElement("li"))
                                .attr('title', jsform.client_categories.data[n].UBASE)
                                .attr('data-fi', 'radio')
                                .attr('data-fi-name', 'ID_UBASE')
                                .attr('data-fi-value', jsform.client_categories.data[n].ID_UBASE)
                                .attr('data-n', n)
                                .attr('onclick', "jsform.client_categories.onclick(this)")
                                .append([
                                        $(document.createElement("i")).addClass('fa fa-fw fa-circle-o'),
                                        $(document.createElement("i")).addClass('fa fa-fw fa-circle'),
                                        $(document.createElement("span"))
                                            .text(jsform.client_categories.data[n].UBASE)
                                    ]);

                    if(jsform.client_categories.data[n].chkd)
                        jQ_li.attr('data-fi-chkd', '1');
                    else
                        jQ_li.attr('data-fi-chkd', '');
                        
                    jQ_UBASES.append(jQ_li);
                  }

                jsform.client_categories.categories_load(n_load);
              }
          },

        onclick : function(obj) {
            jsform.fi.onclick(obj);

            var n_load = $(obj).attr('data-n');
            jsform.client_categories.categories_load(n_load);
          },

        categories_load : function(n_load) {
            $('#CATEGORY_NAME').text(jsform.client_categories.data[n_load]['CATEGORY_NAME']);

            var jQ_ID_CATEGORY = $('#ID_CATEGORY');
            jQ_ID_CATEGORY.children().remove();

            var n, n_max, category, jQ_li;
            for(n = 0, n_max = jsform.client_categories.data[n_load].CATEGORIES.length; n < n_max; n++) {
                category = jsform.client_categories.data[n_load].CATEGORIES[n];
                jQ_li = $(document.createElement("li"))
                            .attr('title', category.CATEGORY)
                            .attr('data-fi', 'radio')
                            .attr('data-fi-name', 'ID_CATEGORY')
                            .attr('data-fi-value', category.ID_CATEGORY)
                            .attr('onclick', "jsform.fi.onclick(this)")
                            .append([
                                    $(document.createElement("i")).addClass('fa fa-fw fa-circle-o'),
                                    $(document.createElement("i")).addClass('fa fa-fw fa-circle'),
                                    $(document.createElement("span")).text(category.CATEGORY)
                                ]);

                if(category.chkd)
                    jQ_li.attr('data-fi-chkd', '1');
                else
                    jQ_li.attr('data-fi-chkd', '');

                jQ_ID_CATEGORY.append(jQ_li);
              }
          }
      },
    
    attachments : {
        input_file_add : function(button) {
            var jQ_attachments = $('#attachments');

            $('#attachments').append(
                    $(document.createElement("div"))
                        .addClass('form-control')
                        .append([
                                $(document.createElement("button"))
                                    .addClass('btn btn-default btn-xs pull-right')
                                    .attr('type', 'button')
                                    .attr('onclick', 'jsform.attachments.input_file_clr(this);')
                                    .append($(document.createElement("i")).addClass('fa fa-eraser')),
                                $(document.createElement("input"))
                                    .attr('type', 'file')
                                    .attr('name', 'ATTACHMENTS[]')
                                    .prop('multiple', true)
                                    .attr('onchange', 'jsform.attachments.input_file_onchange(this);'),
                                $(document.createElement("div"))
                                    .addClass('attachments-list'),
                            ])
                );
         },

        input_file_clr : function(button) {
            var jQ_group = $(button).parent();
            jQ_group.children('input').val('');
            jQ_group.children('.attachments-list').children().remove();
         },

        input_file_onchange : function(input_file) {
            var jQ_input_file = $(input_file);
            var iQ_input_file_list = jQ_input_file.parent().children('.attachments-list');

            iQ_input_file_list.children().remove();
            $.each(jQ_input_file.prop('files'), function(id) {
                        iQ_input_file_list.append([
                                $(document.createElement("span"))
                                    .addClass('attachment')
                                    .append([
                                            $(document.createElement("i")).addClass('fa fa-file-o'),
                                            $(document.createElement("span")).text(' ' + this.name)
                                        ]),
                                ' ',
                            ]);
                    }
                );
          },

     },

    onselect_person_title : function(obj_id, title) {
        var $obj = $("#" + obj_id);
        if(!$obj.val()){
            $obj.val(title);
            $obj.select();
        }
      },
 
    onselect_person_status : function(obj, value, remind) {
        jsform.fi.onselect(obj, value, true, true);

        //$('#REMIND').prop('disabled', remind ? false : true);
        if(remind)
            $('#REMIND').prop('disabled', false).focus();
        else
            $('#REMIND').prop('disabled', true);
      },

    onclick_users_ga : function(obj) {
        //jsform.fi.onclick(obj);
        var jQ_obj = $(obj);

        if(jQ_obj.attr('data-fi-chkd')) {
            jQ_obj.attr('data-fi-chkd', '');
            jQ_obj.closest('li').children('ul').find('[data-fi-chkd="1"]').attr('data-fi-chkd', '');
          }
        else {
            do{
                jQ_obj.attr('data-fi-chkd', '1');
                jQ_obj = jQ_obj.closest('ul').parent().children('[data-fi-chkd=""]');
              }
            while(jQ_obj.length);
          }
      },

    onclick_contact_type : function(idObj, showObj){
        var $obj = $('#' + idObj);
        if(showObj && !$obj.is(':visible')){
            $obj.slideDown();
        }
        else if(!showObj && $obj.is(':visible')){
            $obj.slideUp();
        }
    },


    /* form execution */
    submit : function(obj, extra, target_value, find_form) {
        access.gate(function(){
                var jQ_form = find_form ? $(obj).closest('form') : $(obj);

                jQ_form.find('input:file')
                    .filter(function(){return this.files.length == 0}).prop('disabled', true);

                if(extra) {
                    extra = extra.split(' ');
                    if($.inArray('fi', extra) != -1) jsform.fi.submit(jQ_form, true);
                    if($.inArray('filters', extra) != -1) jsform.lib_filters.submit(jQ_form, true);
                  }

                if(target_value) {
                    jQ_form.prepend(
                        $(document.createElement("input"))
                            .attr('type', 'hidden')
                            .attr('name', 'target')
                            .attr('value', target_value)
                      );
                  }
                jQ_form.removeAttr('onsubmit').submit();
                //jQ_form.get(0).submit();
            });
      },

    target : function(obj, extra, target_value) {
        //jQ_form.attr('target', '_blank');
        //jQ_form.submit();
        //jQ_form.removeAttr('target');

        access.gate(function(){
                var jQ_form = $(obj).closest('form');
                var form_data ={};

                jQ_form.find('input select textarea').each(function(){
                        if(this.name
                                    && (this.type != 'checkbox' && this.type != 'radio' || this.checked)
                                    && (this.type != 'file')
                                )
                            form_data[this.name] = this.value;
                    });

                if(extra) {
                    extra = extra.split(' ');
                    if($.inArray('fi', extra) != -1) form_data = $.extend(form_data, jsform.fi.data(jQ_form, true));
                    if($.inArray('filters', extra) != -1) form_data = $.extend(form_data, jsform.lib_filters.data(jQ_form, true));
                    if($.inArray('tinymce', extra) != -1) form_data = $.extend(form_data, jsform.tinymce.data(jQ_form, true));
                  }

                if(target_value) form_data['target'] = target_value;

                window.open(jQ_form.attr('action') + '?' + $.param(form_data));
            });		
      },

    ajax : function(obj, extra, target_value, find_form) {
        access.gate(function(){                
                if(typeof window.FormData == 'undefined') {
                    popup.msg.show('danger', 'Przeglądarka nie obsługuje obiektu FormData!');
                    return false;
                }

                var fd = new FormData();
                var jQ_form = find_form ? $(obj).closest('form') : $(obj);

                jQ_form.find('input, select, textarea').each(function(){
                        if(!this.name) return;
                        if(this.type == 'file') {
                            if(this.files.length > 0)
                              var n = this.name;
                              $.each(this.files, function(){fd.append(n, this)})
                        }
                        else fd.append(this.name, this.value);
                    });

                if(extra) {
                    extra = extra.split(' ');
                    if($.inArray('fi', extra) != -1) $.each(jsform.fi.data(jQ_form, true), function(n, v) {fd.append(n,v)})
                    if($.inArray('filters', extra) != -1) $.each(jsform.lib_filters.data(jQ_form, true), function(n, v) {fd.append(n,v)})
                    if($.inArray('tinymce', extra) != -1) $.each(jsform.tinymce.data(jQ_form, true), function(n, v) {fd.append(n,v)})
                  }

                if(target_value) fd.append('target',target_value);
                    
                var jQ_alert = jQ_form.find('.alert');
                jQ_alert.slideUp('fast');

                ajax.request(jQ_form.attr('method'), jQ_form.attr('action'), fd, function(data){
                        if(typeof data.content == 'string')
                            jQ_alert.find('.alert-content').text(data.content);
                        else {
                            var jQ_alert_content = jQ_alert.find('.alert-content').text('');
                            console.log(typeof data.content);
                            if(typeof data.content == 'object')
                                $.each(data.content, function(){
                                        jQ_alert_content.append(
                                                $(document.createElement("p")).text(this)
                                            );
                                    });
                            else $(document.createElement("p")).text(data.content);
                          }
                        jQ_alert.stop().slideDown('fast');
                    }, ['error']);
            });
      },
}


