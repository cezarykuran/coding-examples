/*!
 * Copyright 2014-2016 441.FM
 *
 * jQuery insertAtCaret()
 * http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery
 * 
 * Chat BBcode & smiles based on AJAX_Chat
 * AJAX_Chat
 * author Sebastian Tschan
 * copyright (c) Sebastian Tschan
 * license Modified MIT License
 * link https://blueimp.net/ajax/
 */


jQuery.fn.extend({
    insertAtCaret: function(myValue) {
        return this.each(function(i) {
            if (document.selection) {
                //For browsers like Internet Explorer
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else if (this.selectionStart || this.selectionStart == '0') {
                //For browsers like Firefox and Webkit based
                var startPos = this.selectionStart;
                var endPos = this.selectionEnd;
                var scrollTop = this.scrollTop;
                this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
                this.focus();
                this.selectionStart = startPos + myValue.length;
                this.selectionEnd = startPos + myValue.length;
                this.scrollTop = scrollTop;
            }
            else {
              this.value += myValue;
              this.focus();
            }
        });
    }
});

bodyonload = {
	stack : [],

	init : function()
	 {
        //console.log('bodyonload.init()');
		$.each(bodyonload.stack, function(){if(typeof this == 'function') this()})
	 },

	push : function(f)
	 {
		bodyonload.stack.push(f);
	 }
 };



function cookieSet(name, value, expires, domain)
 {
	var cookieStr = escape(name) + "=";
	if (typeof value != "undefined") cookieStr += escape(value);

	if (!expires)
	 {
		expires = new Date();
		expires.setTime(expires.getTime()+365*24*3600000);
	 }
	cookieStr += "; expires="+ expires.toGMTString() +"; path=/";

	if(domain) cookieStr +='; domain='+domain;  

	document.cookie = cookieStr;

	return cookieGet(name) != null;
 }

function cookieGet(name)
 {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++)
	 {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if(c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length, c.length);
	 }
	return null;
 }


popupTTY = {
    active : false,
    timer : null,
    messages : [],

    init : function() {
        popupTTY.active = true;
        if(popupTTY.messages.length > 0 && !popupTTY.timer) {
            popupTTY.refresh();
        }
    },
    
    queue : function(content, type) {
        if(content) {
            popupTTY.messages.push({content: content, type: type});
            
            if(popupTTY.active && !popupTTY.timer) {
                popupTTY.refresh();
            }
        }
    },

    refresh : function() {
        var $ttyContainer = $('#popup-tty > .container > .popup-tty-container');

        $ttyContainer.children().each(function(){
            var $ttyWindow = $(this);

            var ttl = parseInt($ttyWindow.attr('data-ttl')) -1;
            if(ttl > 0) {
                $ttyWindow.attr('data-ttl', ttl);
            }
            else {
                $ttyWindow.fadeOut('normal', function(){$(this).remove()});               
            }
        });

        if(popupTTY.messages.length > 0) {
            var message;
            while(message = popupTTY.messages.pop()) {
                var $ttyWindow = $(document.createElement('DIV'))
                    .addClass('popup-tty-window')
                    .text(message.content);

                if(message.type == 'error') {
                    $ttyWindow
                        .addClass('popup-tty-window-error')
                        .attr('data-ttl', '10');
                }
                else {
                    $ttyWindow
                        .attr('data-ttl', '6');
                }

                $ttyContainer.prepend($ttyWindow);
                $ttyWindow.fadeIn();
            };                
        }
        
        if($ttyContainer.children().length) {
            popupTTY.timer = setTimeout(popupTTY.refresh, 500);
            $('#popup-tty').show();
        }
        else{
            popupTTY.timer = null;
            $('#popup-tty').hide();
        }
    },
}


popupBox = {
    bussy : false,
    
    yt : {
        show : function(url) {
            if(popupBox.bussy) {
                return;
            }
            popupBox.bussy = true;

            
            var $popupBox = $('#popup-box')
                .css('visibility', 'hidden')
                .css('display', 'block');

            var popupBoxWindowWidth = $('#popup-box-window').width();

            $popupBox
                .css('display', 'none')
                .css('visibility', 'visible');
            
            var videoWidth = popupBoxWindowWidth;
            var videoHeight = popupBoxWindowWidth * 9 / 16;

            var video = document.createElement('iframe');
            video.width = videoWidth;
            video.height = videoHeight;
            video.src = url;
            video.setAttribute('allowFullScreen', '');

            if(widgets.player.me && !widgets.player.me.paused) {
                widgets.player.pause();
                $(video).on('remove', widgets.player.play);
            }

            $('#popup-box').find('.popup-box-results')
                .append(video);
            
            popupBox.show('yt results');
        }
    },
    
    confirm : {
        callOnOk : null,

        show : function(title, content, callOnOk) {
            if(popupBox.bussy) {
                return;
            }
            popupBox.bussy = true;

            this.callOnOk = callOnOk;

            $('#popup-box-window > .popup-box-title > .popup-box-confirm').text(title);
            $('#popup-box-window > .popup-box-form > .popup-box-confirm > .popup-box-overflow').text(content);

            popupBox.show('confirm');
        },

        onClickOk : function() {
            if(typeof this.callOnOk == 'function') {
                this.callOnOk(); 
            }
            popupBox.hide();
        },    
    },

    input : {
        callOnOk : null,

        show : function(title, callOnOk) {
            if(popupBox.bussy) {
                return;
            }
            popupBox.bussy = true;

            this.callOnOk = callOnOk;

            $('#popup-box-window > .popup-box-title > .popup-box-input').text(title);

            popupBox.show('input');
        },
        
        onKeyDown : function(e) {
            if(e.keyCode == 13 && !e.shiftKey)  {
                popupBox.input.onClickOk();

                typeof e.preventDefault == 'function'
                   && e.preventDefault();
                return false;
            }
            return true;
        },
        
        onClickOk : function() {
            if(typeof this.callOnOk == 'function') {
                this.callOnOk($('#popup-input-data').val()); 
            }
            popupBox.hide();
        },    
    },

    toplist : {
        url : '',
        $form : null,

        show : function() {
            $('#navbar-collapse-menu').collapse('hide');
            if(popupBox.bussy) {
                return;
            }

            popupBox.bussy = true;
            popupBox.show('toplist');
        },

        submit : function() {
            popupBox.toplist.$form
                || (popupBox.toplist.$form = $('#popup-box-window > .popup-box-form > .popup-box-toplist'));

            var data = {};
            popupBox.toplist.$form
                .find('input')
                .each(function(){
                    var jqInput = $(this);
                    data[jqInput.attr('name')] = jqInput.val();                        
                });

            ajax.request('post', popupBox.toplist.url, data, popupBox.toplist.ajaxSuccess, ['ok', 'error'], popupBox.toplist.$form);
        },

        ajaxSuccess : function(data) {
            data.extra && data.extra.limitExceeded
                ? $('#toplistPropos').addClass('disabled')
                : $('#toplistPropos').removeClass('disabled');

            if(data.extra && data.extra.formErrors) {
                var $formGroups = popupBox.toplist.$form.find('.form-group');

                $formGroups
                    .removeClass('has-error')
                    .children('.help-block').remove();

                if(data.extra.formErrors.songArtist) {
                    popupBox.formGroupAddError($formGroups.has('[name="songArtist"]'), data.extra.formErrors.songArtist);
                }

                if(data.extra.formErrors.songTitle) {
                    popupBox.formGroupAddError($formGroups.has('[name="songTitle"]'), data.extra.formErrors.songTitle);
                }
            }
            else {
                $('#popup-box-window > .popup-box-results').text(data.content);
                //$('#popup-box-window').height($('#popup-box-window').height());
                $('#popup-box').addClass('results');
            }                
        }
    },

    order : {
        url : '',
        type : '',
        $form : null,

        show : function(type) {
            $('#navbar-collapse-menu').collapse('hide');
            if(popupBox.bussy || $('#' + type).hasClass('disabled')) {
                return;
            }

            switch(type) {
                case 'orderGreetings':
                    popupBox.order.$form = $('#popup-box-window > .popup-box-form > .popup-box-order-greetings');
                    popupBox.order.type = 'greetings';
                    break;

                case 'orderSong':
                    popupBox.order.$form = $('#popup-box-window > .popup-box-form > .popup-box-order-song');
                    popupBox.order.type = 'song';
                    break;

                default: return;
            }

            popupBox.bussy = true;
            popupBox.show(type);
        },

        submit : function(type) {

            var data = {
                type : popupBox.order.type,
                target : popupBox.order.$form.find('[name="target"]').val(),
                content : popupBox.order.$form.find('[name="content"]').val()
            };

            ajax.request('post', popupBox.order.url, data, popupBox.order.response, ['ok', 'error'], popupBox.order.$form);
        },

        response : function(data) {
            if(data.response == 'error' && data.formErrors) {
                var $formGroups = popupBox.order.$form.find('.form-group');

                $formGroups
                    .removeClass('has-error')
                    .children('.help-block').remove();

                if(data.formErrors.target) {
                    popupBox.formGroupAddError($formGroups.has('[name="target"]'), data.formErrors.target);
                }

                if(data.formErrors.content) {
                    popupBox.formGroupAddError($formGroups.has('[name="content"]'), data.formErrors.content);
                }

            }
            else {
                $('#popup-box-window > .popup-box-results').text(data.content);
                $('#popup-box').addClass('results');
            }
        }
    },

    history : {
        url : '',

        show : function() {
            $('#navbar-collapse-menu').collapse('hide');
            if(popupBox.bussy) {
                return;
            }
            popupBox.bussy = true;

            popupBox.show('history');

            ajax.request('post', popupBox.history.url, {}, popupBox.history.ajaxSuccess, ['ok', 'error'], $('#popup-box-window > .popup-box-form > .popup-box-history'));
         },

        ajaxSuccess : function(data) {
            var $results = $('#popup-box')
                .addClass('results')
                .find('.popup-box-results');

            if(data.response == 'error') {
                $results.text(data.content);
                return;
            }

            $.each(data.content, function(){
                    $results.append(
                            $(document.createElement('DIV')).text(this)
                        )
                });
            $results.scrollTop(0);
         },
     },

    schedule : {
        url : '',
        data : {},

        show : function() {
            $('#navbar-collapse-menu').collapse('hide');
            if(popupBox.bussy) {
                return;
            }
            popupBox.bussy = true;

            popupBox.show('schedule');

            ajax.request('post', popupBox.schedule.url , {}, popupBox.schedule.ajaxSuccess, ['ok', 'error'], $('#popup-box-window > .popup-box-form > .popup-box-schedule'));
         },

        ajaxSuccess : function(data) {
            var $results = $('#popup-box')
                .addClass('results')
                .find('.popup-box-results');

            if(data.response == 'error') {
                popupBox.schedule.data = {};
                $results.text(data.content);
                return;
            }

            popupBox.schedule.data = data.content;
            
            $results.append([
                    $(document.createElement('DIV'))
                        .addClass('popup-box-schedule-btn')
                        .addClass('btn-group')
                        .addClass('btn-group-sm'),
                    $(document.createElement('DIV'))
                        .addClass('popup-box-schedule-window')
                ]);

            var $btnGroup = $results.children('.popup-box-schedule-btn');
            var today = 0;

            $.each(data.content, function(id){
                    if(this.today) today = id;
                    $btnGroup.append(
                            $(document.createElement('BUTTON'))
                                .attr('class', this.today ? 'btn btn-today active' : 'btn')
                                .attr('onclick', 'popupBox.schedule.onclick(this, ' + id + ')')
                                //.attr('title', this.name + ' ' + this.dateEnc)
                                .text(this.nameShort)
                        );
                });

            popupBox.schedule.switchTo(today);
         },

        onclick : function(button, id) { 
            var jqButton = $(button);

            if(jqButton.hasClass('active')) return;
            jqButton.parent().children().removeClass('active');
            jqButton.addClass('active');

            popupBox.schedule.switchTo(id);
         },

        switchTo : function(id) {
            var $scheduleWindow = $('#popup-box-window > .popup-box-results > .popup-box-schedule-window');

            $scheduleWindow
                .text('')
                .append(
                        $(document.createElement('DIV'))
                            .attr('class', 'popup-box-schedule-header')
                            .text(popupBox.schedule.data[id].name + ' ' + popupBox.schedule.data[id].dateEnc)
                    );

            if(popupBox.schedule.data[id].sessions.length) {
                
                var $table = $(document.createElement('TABLE'))
                    .addClass('table-default table-schedule-ajax');

                $.each(popupBox.schedule.data[id].sessions, function(){
                    var $td = $(document.createElement('TD'))
                        .addClass('td-fas');
                    this.night
                        && $td.append($(document.createElement('I')).addClass('fa fa-moon-o'));
                    
                    $table.append(
                        $(document.createElement('TR')).append([
                            $(document.createElement('TD'))
                                .addClass('td-time')
                                .text(this.timeStartEnc + ' - ' + this.timeStopEnc),
                            $td,
                            $(document.createElement('TD'))
                                .addClass('td-username')
                                .text(this.username),
                            $(document.createElement('TD'))
                                .addClass('td-name')
                                .text(this.name)
                        ])
                    );
                });             
                
                $scheduleWindow.append($table);
            }
            else {
                $scheduleWindow.append('Brak audycji');
            }
         },
    },
     
    show : function(popupClass) {

        var $popupBox = $('#popup-box')
              .addClass(popupClass)
              .css('visibility', 'hidden')
              .css('display', 'block');

        popupBox.verticalAlign();
        $(window).bind('resize', popupBox.verticalAlign);
        
        var fadeInComplete = popupClass == 'input'
            ? function(){$('#popup-input-data').focus();}
            : null;

        $popupBox
            .css('display', 'none')
            .css('visibility', 'visible')
            .fadeIn('normal', fadeInComplete);
    },
    
    verticalAlign : function() {
        var windowHeight = $(window).height();
        var popupBoxWindowHeight = $('#popup-box-window').height() + 30;

        var top = (windowHeight - popupBoxWindowHeight)/2;
        top > 0 || (top = 0);

        $('#popup-box-window').parent().css('top', top);        
      
    },

    hide : function() {
        $('#popup-box').fadeOut('normal', function(){
                
                $(window).unbind('resize');
                
                $('#popup-box-window > .popup-box-form').find('.form-group.has-error')
                    .removeClass('has-error')
                    .children('.help-block').remove();
                
                $('#popup-box-window').find('[data-popup]').each(function(){
                        var jqInput = $(this);
                        jqInput.is('div')
                            ? jqInput.text('')
                            : jqInput.val('');
                    });

                $('#popup-box').attr('class', '');

                popupBox.bussy = false;
            })
    },

    formGroupAddError: function($formGroup, error) {
        $formGroup
            .addClass('has-error')
            .append(
                    $(document.createElement('SPAN'))
                        .addClass('help-block')
                        .append([
                                $(document.createElement('SPAN')).addClass('glyphicon glyphicon-exclamation-sign'),
                                $(document.createElement('SPAN')).text(error),
                            ])
                );
    },
}


ajax = {
    request : function(method, url, data, call, responses, obj) {
        if(obj) {
            $(obj)
                .addClass('ajax-request')
                .append($(document.createElement('DIV')).addClass('ajax-request-overlay'));
        }

        method = !method
            ? 'POST'
            : method.toUpperCase();

        data.ajax = true;
        $.ajax({
            'method'    : method,
            'url'       : url,
            'data'      : data,
            'dataType'  : 'json',
            'cache'     : false,
            'success'   : function(responseData, textStatus, jqXHR){
                                ajax.response(responseData, call, responses, obj)
                            },
            'error'     : function(jqXHR, textStatus, errorThrown){
                                var responseData = (jqXHR.status == 401 || jqXHR.status == 403) && textStatus == 'error'
                                    ? jqXHR.responseJSON
                                    : {response : 'error', content: 'Ajax error (' + textStatus + ')'};
                                ajax.response(responseData, call, responses, obj);
                            },
        });
    },

    response : function(data, call, responses, obj) {
        if(obj) {
            $(obj)
                .removeClass('ajax-request')
                .children('.ajax-request-overlay').remove();
        }
        
        if(typeof call == 'function' && (!responses || $.inArray(data.response, responses) != -1)) {
            call(data);
        }
        else {
            switch(data.response) {
                case 'offline':
                case 'location':
                    if(typeof data.notice == 'undefined')
                        document.location = data.content;
                    else
                        popupBox.msg.show('success', data.notice, function(){document.location = data.content;});
                    break;

                case 'reload':
                    if(typeof data.notice == 'undefined')
                        document.location.reload();
                    else
                        popupBox.msg.show('success', data.notice, function(){document.location.reload();});
                    break;

                case 'ok':
                    popupTTY.queue(data.content)
                    break;

                case 'error':
                    popupTTY.queue(data.content, 'error')
                    break;

                default:
                    popupTTY.queue('ajax error: nieznany typ odpowiedzi ' + data.response, 'error')
             }          
        }
    },
}


function ajaxRm(obj, container, url, confirm) {
    
    var $target = $(obj).closest(container);
    
    var ajaxRequest = function() {
            ajax.request(
                'post',
                url,
                {},
                function(data){
                      popupTTY.queue(data.content);
                      $target.fadeOut('normal', function(){
                          $(this).remove()
                      });
                },
                ['ok'],
                container == 'tr'
                    ? $target.closest('table')
                    : $target
            );
        }

    if(confirm) {
        popupBox.confirm.show(
                'Potwierdź usuniecie',
                confirm,
                ajaxRequest
            );
    }
    else {
        ajaxRequest();
    }
}


var widgets = {
    gamma : function(level) {
        var jqBody = $(document.body);
        level = level || jqBody.attr('data-gamma');
        jqBody.attr('data-gamma', level);
        cookieSet('gamma', level);
    },

    player : {
        url : '',
        streams     : {},
        stream      : null,
        me          : null,


        init : function() {
            if(!document.getElementById('sc-player')) {
                return;
            }

            ajax.request('POST', widgets.player.url, {}, widgets.player.initAjaxResponse, ['ok']);
        },

        initAjaxResponse : function(data) {
            if(data.content.length == 0) {
                popupTTY.queue('Brak strumieni do odtwarzania', 'error');
                $('#sc-player').slideUp('fast', function(){$(this).remove()});
                return;
            }


            var cookieStream = cookieGet('playerStream');
            if(cookieStream && typeof data.content[cookieStream] == 'undefined') {
              cookieStream = '';
            }

            var $playerQualityContainer = $('#sc-player').children('.sc-player-quality');

            $.each(data.content, function(stream, url){
                widgets.player.streams[stream] = url;

                var $a = $(document.createElement('A'))
                    .attr('href', '#')
                    .attr('onclick', 'widgets.player.onclickBtnQuality(this, \'' + stream + '\'); return false;')
                    .text(stream)
                
                if(!cookieStream || cookieStream == stream) {
                    widgets.player.stream = cookieStream = stream;
                    $a.addClass('active');
                }
                
                $playerQualityContainer.append($a);
            });

            
            var cookieVol = cookieGet('playerVol');
            if(!cookieVol || cookieVol < 0 || cookieVol > 100) {
                cookieVol = 80;
            }

            widgets.player.vol(cookieVol);

            $('#sc-player .sc-player-vol-slider').slider({
                    min: 0,
                    max: 100,
                    value: cookieVol,
                    slide: widgets.player.onslideVol,
                    orientation: 'horizontal',
                });


            var meAudio = document.createElement("audio");
            document.body.appendChild(meAudio);

            var meAudioSource = document.createElement("source");
            meAudioSource.src = "";
            meAudioSource.type = "audio/mpeg";
            meAudioSource.preload = "none";
            meAudio.appendChild(meAudioSource);

            $('#sc-player').css('visibility', 'visible');
 
            new MediaElement(meAudio, {
                success: function(mediaElement, domObject) {
                    //mediaElement.addEventListener('play', function(){});
                    //mediaElement.addEventListener('pause', function(){});

                    mediaElement.setVolume(cookieGet('playerVol')/100);

                    widgets.player.me = mediaElement;

                    if(cookieGet('playerStatus') == 'true') {                
                        widgets.player.play();
                    }
                },

                error: function() {
                    popupTTY.queue('Nie można załadować playera', 'error');
                }
            });
        },

        onclickBtnQuality : function(a, stream) {
            if(widgets.player.stream == stream) {
                return;
            }

            widgets.player.stream = stream;
            cookieSet('playerStream', stream);

            $a = $(a);
            $a.parent().children('a').removeClass('active');
            $a.addClass('active');

            if(widgets.player.me && !widgets.player.me.paused) {
                widgets.player.pause();
                widgets.player.play();
            }
        },

        onclickBtnOnOff : function() {
            if(!widgets.player.me) {
                return;
            }

            if(widgets.player.me.paused) {
                widgets.player.play();
            }
            else {
                widgets.player.pause();
            }
        },

        play : function() {
            if(!widgets.player.me || !widgets.player.me.paused) {
                return;
            }

            var src = widgets.player.streams[widgets.player.stream];
            if(widgets.player.me.src != src) {
                widgets.player.me.setSrc(src);              
            }
            widgets.player.me.play();
            
            $('#sc-player .sc-player-btn').addClass('playing');
            cookieSet('playerStatus', true);
        },

        pause : function() {
            if(!widgets.player.me || widgets.player.me.paused) {
                return;
            }

            widgets.player.me.setSrc('');              
            widgets.player.me.pause();
            
            $('#sc-player .sc-player-btn').removeClass('playing');
            cookieSet('playerStatus', false);
        },
        
        onslideVol : function(event, ui) {
            widgets.player.vol(ui.value);
        },
        
        onclickBtnVolMin : function() {
            $('#sc-player .sc-player-vol-slider').slider('option', 'value', 0);
            widgets.player.vol(0);
        },

        onclickBtnVolMax : function() {
            $('#sc-player .sc-player-vol-slider').slider('option', 'value', 100);   
            widgets.player.vol(100);
        },
        
        vol : function(value) {
            cookieSet('playerVol', value);

            if(value == 0) {
                $('#sc-player .sc-player-vol-l').addClass('sc-player-vol-muted');              
            }
            else {
                $('#sc-player .sc-player-vol-l').removeClass('sc-player-vol-muted');              
            }
            
            if(widgets.player.me) {
                widgets.player.me.setVolume(value/100);
            }
        }
    },
    
    status : {
        url : '',

        refresh : function() {
            ajax.request('GET', widgets.status.url, [], widgets.status.response);
        },

        response : function(data)  {
            if(data.status == 'ok') {

                var jQ_sc_stats = $('#sc-stats [data-sc-stats]');
                jQ_sc_stats.filter('[data-sc-stats="source"]').text(data.SOURCENAMEENCODED);
                jQ_sc_stats.filter('[data-sc-stats="song"]').text(data.SONGTITLE);

                if(data.orderingSongs) {
                    $('#orderSong').removeClass('disabled');                  
                }
                else {
                    $('#orderSong').addClass('disabled');                  
                }

                if(data.orderingGreetings) {
                    $('#orderGreetings').removeClass('disabled');
                }
                else {
                    $('#orderGreetings').addClass('disabled');                  
                }
            }

            setTimeout(widgets.status.refresh, 15000);
        },
    },
}


function toplistVote (idSong) {
    ajax.request('post', '/toplista-radia-441fm/vote', {idSong: idSong}, null, null, document.getElementById('toplist'));
}
 
function toplistGoogleSong() {
    var song = $('#form_songArtist').val() + ' ' + $('#form_songTitle').val();

    window.open('https://google.com/search?q=' + encodeURIComponent(song), '_blank').focus();
}

function toplistHighlight(tr) {
    var $tr = $(tr);

    if($tr.hasClass('tr-highlight')) {
        $tr.removeClass('tr-highlight');
    }
    else {
        $tr.parent().children().removeClass('tr-highlight');
        $tr.addClass('tr-highlight');
    }
}


/*
 funkcja BOT (wysyłanie wiadomości jako bot)
 */

chat = {
    options : {
        mute : false,
        pause : false,
    },
    me : null,    
    caps : {},
    

    init : function() {
        chat.me = new MediaElement(document.getElementById('chat-audio'), {startVolume: 1});
        chat.synchro.start();
    },
    
    onclickBtnOptions : function(btn, option) {
        var $btn = $(btn);
        
        if(chat.options[option]) {
            $btn.removeClass('active');
            chat.options[option] = false;
        }
        else {
            $btn.addClass('active');
            chat.options[option] = true;
        }
    },

    onclickBtnHistory : function() {
        chat.historyLoad();
    },

    historyLoad : function() {
        if(chat.ajax.bussy()) {
            return;
        }
        
        chat.options.pause = true;
        chat.messages.clear();
        chat.ajax.loadStatus('loading');
        chat.ajax.push({
                fromEnc : $('#fromEnc').val(),
                toEnc : $('#toEnc').val()
            });
    },

    synchro : {

        start : function() {
            setInterval(chat.synchro.request, 2500);
            chat.synchro.request();
        },
         
        request : function() {
            chat.ajax.bussy() || chat.ajax.push({lastId : chat.messages.lastId});
        }
    },

    ajax : {
        url : '',
        buffer : [],
        lock : false,
        last_status : '',

        push : function(data) {
            if(chat.ajax.buffer.length > 2) {
                return false;              
            }

            chat.ajax.buffer.push(data);
            if(!chat.ajax.lock) {
                chat.ajax.pop();
            }

            return true;
        },

        pop : function() {
            if(chat.ajax.buffer.length > 0) {
                chat.ajax.lock = true;
                ajax.request('POST', chat.ajax.url,  chat.ajax.buffer.shift(), chat.ajax.response, ['ok', 'error']);
             }
        },
        
        response : function(data) {
            chat.ajax.lock = false;
            
            if(data.response != 'ok') {
                return;
            }
            
            if(data.status != chat.ajax.last_status)
             {
                if(chat.ajax.last_status == 'online')
                 {
                    chat.ajax.clear();
                    chat.online.clear();
                    chat.messages.clear();
                 }
                 chat.ajax.loadStatus(data.status);
             }

            if(data.status == 'online')
             {
                chat.caps = data.caps;
                chat.online.handle(data.online);
                chat.messages.handle(data.messages);
             }
            
            chat.ajax.pop();          
        },

        bussy : function() {
            return chat.ajax.buffer.length > 0;
        },

        clear: function() {
            chat.ajax.buffer = [];
        },
        
        loadStatus: function (status) {
            $('#chat').attr('class', status);
            chat.ajax.last_status = status;          
        }
    },


    online : {
        cache : {},

        handle : function(online) {
            if(chat.online.cache.hash == online.hash) return;

            chat.online.cache = online;

            var $onlineList = $('#chat-online .chat-online-list');
            var username;
            $onlineList.children().remove();
            $.each(online.data, function(){
                    if(this.afk) {
                        username = '~' + this.username;                      
                    }
                    else {
                        username = this.username;                      
                    }
                    
                    $onlineList.append(
                            $(document.createElement('SPAN'))
                                .addClass('chat-online-user')
                                .html(username)
                                .append(
                                        $(document.createElement('SPAN'))
                                            .addClass('chat-online-user-delimiter')
                                            .html(', ')
                                    )
                        );
                });
         },

        clear : function() {
            chat.online.cache = {};
            $('#chat-online .chat-online-list').children().remove();
        }
    },

    messages : {
        lastId : 0,

        onclickBtnMsgSend : function() {
            var $chatMsg = $('#chat-msg');

            chat.messages.send($chatMsg.val())
                && $chatMsg.val('');
        },

        onclickBtnUrl : function() {
            popupBox.input.show('Wprowadź adres url', function(url){
                if(!url) {
                    return;
                }
                $('#chat-msg').insertAtCaret('[url]' + url + '[/url]');
            })
        },

        onclickBtnImg : function() {
            popupBox.input.show('Wprowadź adres grafiki', function(url){
                if(!url) {
                    return;
                }
                $('#chat-msg').insertAtCaret('[img]' + url + '[/img]');
            })
        },

        onclickAvatar : function(nick) {
            $('#chat-msg')
                .focus()
                .val('/prv ' + nick + ' ');
        },

        onclickBtnRm : function(id) {
            chat.messages.send('/delete ' + id);
        },

        onKeyDown : function(e) {
            if(chat.ajax.last_status != 'online') {
                typeof e.preventDefault == 'function'
                   && e.preventDefault();
                return false;
            }
                
            if(e.keyCode == 9) {
                chat.messages.autoNick.onKeyPress();
                
                typeof e.preventDefault == 'function'
                   && e.preventDefault();
                return false;
             }

            if(e.keyCode == 13 && !e.shiftKey)  {
                chat.messages.onclickBtnMsgSend();

                typeof e.preventDefault == 'function'
                   && e.preventDefault();
                return false;
            }

            chat.messages.autoNick.reset();
            return true;
        },

        autoNick : {
            cursorBegin : 0,
            cursorEnd : 0,
            usernames : [],
            id : -1,

            onKeyPress : function() {
                var chatMsg = document.getElementById('chat-msg');

                if(typeof chat.online.cache.data == 'undefined' || !chatMsg || chatMsg.selectionEnd < 1 || chatMsg.value.charAt(chatMsg.selectionEnd - 1) == ' ') {
                    this.reset();
                    return;
                }

                if(this.id == -1) {
                    this.cursorBegin = this.cursorEnd = chatMsg.selectionEnd;

                    // find next space or beginning from selectionEnd
                    while(this.cursorBegin > 0 && chatMsg.value.charAt(this.cursorBegin - 1) != ' ')
                        this.cursorBegin--;

                    // find next space or end from selectionEnd
                    while(this.cursorEnd < chatMsg.value.length && chatMsg.value.charAt(this.cursorEnd) != ' ')
                        this.cursorEnd++;

                    // nick (search) part
                    var nickPart = chatMsg.value.substring(this.cursorBegin, this.cursorEnd);

                    // find usersnames like nickPart*
                    this.id = 0;
                    this.usernames = [];
                    $.each(chat.online.cache.data, function(){
                            if(this.username.substring(0, nickPart.length) == nickPart)
                                chat.messages.autoNick.usernames.push(this.username);
                        });
                }

                // if usernames like nickPart*
                if(this.usernames.length > 0) {
                    // insert curen username (usernames[id])
                    chatMsg.value =
                        chatMsg.value.substring(0, this.cursorBegin)
                        + this.usernames[this.id]
                        + chatMsg.value.substring(this.cursorEnd);

                    // update pointers
                    chatMsg.selectionStart
                        = chatMsg.selectionEnd
                        = this.cursorEnd
                        = this.cursorBegin + this.usernames[this.id].length;

                    // next id (and rewind if @ end)
                    this.id++;
                    if(this.id >= this.usernames.length) this.id = 0;
                }
            },

            reset : function() {
                this.id = -1;
                this.usernames = [];
            },
        },

        send : function(msg) {
            if(!msg) {
                return false;
            }
            
            return chat.ajax.push({lastId : chat.messages.lastId, msg : msg});
        },

        handle : function(messages) {
            var $chatMessages = $('#chat-messages');
            var snd = chat.me && !chat.options.mute;

            $.each(messages, function(id) {
                id = parseInt(id);

                if(id > chat.messages.lastId) {
                    chat.messages.lastId = id;

                    // commands
                    if(this.message.charAt(0) == '/') {
                        var messageParts = this.message.split(' ');

                        switch(messageParts[0]) {
                          case '/delete':
                              $chatMessages.children('[data-id="' + messageParts[1] + '"]')
                                  .fadeOut('normal', function(){$(this).remove();});
                              chat.messages.scrollBottom();
                              break;
                        }

                        return;
                    }
                        
                    // message sound
                    if(snd) {
                        chat.me.play();
                        snd = false;
                    }
                    
                    // nl2br, bbc, emoticons
                    this.message = this.message.replace(/\n/g, '<br/>');
                    this.message = chat.messages.bbc.replaceBBCode(this.message);
                    this.message = chat.messages.emoticons.replaceEmoticons(this.message);

                    // message insert
                    var messageRowContent = [];
                    
                    if(this.user.id != 'bot' && chat.caps.delMsg) {
                        messageRowContent.push(
                            $(document.createElement('BUTTON'))
                                .attr('class', 'btn btn-xs pull-right')
                                .attr('onclick', 'chat.messages.onclickBtnRm(' + id + ')')
                                .append($(document.createElement('I')).attr('class', 'fa fa-lg fa-trash'))                              
                        );
                    }
                    messageRowContent.push(
                        $(document.createElement('IMG'))
                            .addClass('chat-message-img')
                            .attr('src', this.user.avatar)
                            .attr('onclick', 'chat.messages.onclickAvatar("' + this.user.username + '");')
                    );
                    messageRowContent.push(
                        $(document.createElement('DIV'))
                            .addClass('chat-message-info')
                            .append([
                                    $(document.createElement('SPAN')).addClass('chat-message-user').text(this.user.username),
                                    $(document.createElement('SPAN')).addClass('chat-message-time').text(this.time),
                                ])
                    );
                    messageRowContent.push(
                        $(document.createElement('DIV'))
                            .addClass('chat-message-content')
                            .html(this.message)
                    );
                    
                    $chatMessages
                        .append(
                              $(document.createElement('DIV'))
                                  .addClass('chat-message-row')
                                  .attr('data-id', id)
                                  .append(messageRowContent)
                        );

                    chat.messages.scrollBottom();
                }
            });
        },
        
        scrollBottom: function() {
            if(!chat.options.pause) {
                var $chatMessages = $('#chat-messages');
                $chatMessages.scrollTop($chatMessages.prop('scrollHeight'));                          
            }
        },

        clear : function() {
            chat.messages.lastId = 0;
            $('#chat-messages').children().remove();
            $('#chat-msg').blur();
        },

        bbc: {
            bbCodeTags : ['color', 'url', 'img', 'fa', 'u', 'b', 'i'],
            bbCodeColors : ['red', 'green', 'orange', 'yellow', 'white'],


            replaceBBCode: function(text) {
                //if(!chat.messages.bbc.settings['bbCode']) {
                //    // If BBCode is disabled, just strip the text from BBCode tags:
                //    return text.replace(/\[(?:\/)?(\w+)(?:=([^<>]*?))?\]/, '');
                //}

                // Replace the BBCode tags:
                return text.replace(
                    /\[(\w+)(?:=([^<>]*?))?\](.+?)\[\/\1\]/gm,
                    chat.messages.bbc.replaceBBCodeCallback
                );
            },

            replaceBBCodeCallback: function(str, tag, attribute, content) {
                // Only replace predefined BBCode tags:
                if($.inArray(tag, chat.messages.bbc.bbCodeTags) == -1) {
                    return str;
                }

                // Avoid invalid XHTML (unclosed tags):
                if(chat.messages.bbc.containsUnclosedTags(content)) {
                    return str;
                }

                switch(tag) {
                    case 'color':
                        return chat.messages.bbc.replaceBBCodeColor(content, attribute);
                    case 'url':
                        return chat.messages.bbc.replaceBBCodeUrl(content, attribute);
                    case 'img':
                        return chat.messages.bbc.replaceBBCodeImage(content);
                    case 'fa':
                        return chat.messages.bbc.replaceBBCodeFontAwesome(content);
                    case 'u':
                        return chat.messages.bbc.replaceBBCodeUnderline(content);
                }
                
                return '<' + tag + '>' + chat.messages.bbc.replaceBBCode(content) + '</' + tag + '>';      
            },

            replaceBBCodeColor: function(content, attribute) {
                // Only allow predefined color codes:
                if(!attribute || !$.inArray(attribute, chat.messages.bbc.colorCodes)) {
                    return content;                      
                }
                
                return  '<span style="color:' + attribute + ';">'
                    + chat.messages.bbc.replaceBBCode(content)
                    + '</span>';
            },

            replaceBBCodeUrl: function(content, attribute) {
                var url, link;
                
                url = attribute
                    ? attribute.replace(/\s/gm, encodeURIComponent(' '))
                    : chat.messages.bbc.stripBBCodeTags(content.replace(/\s/gm, encodeURIComponent(' ')));
                
                if(!url || !url.match(/^(?:(?:https?)|(?:ftp)|(?:irc)):\/\//i)) {
                    return content;                  
                }

                chat.messages.bbc.inUrlBBCode = true;
                link = '<a href="' + url + '" onclick="window.open(this.href); return false;">'
                    + chat.messages.bbc.replaceBBCode(content)
                    + '</a>';
                chat.messages.bbc.inUrlBBCode = false;

                return link;
            },

            replaceBBCodeImage: function(url) {
                if(!url || !url.match(/^https?:\/\//i)) {
                    return url;              
                }

                url = chat.messages.bbc.stripTags(url.replace(/\s/gm, encodeURIComponent(' ')));
          
                var img =  '<img src="' + url + '" alt="[grafika]" onload="chat.messages.scrollBottom();" onerror="this.src!=\'/public/img/notfound.png\'&&(this.src=\'/public/img/notfound.png\');"/>';
                if(!chat.messages.bbc.inUrlBBCode) {
                    img =  '<a href="' + url + '" onclick="window.open(this.href); return false;">' + img + '</a>';
                }

                return img;
            },

            replaceBBCodeFontAwesome: function(content) {
                if(!content) {
                    return '';
                }

                var faClass = '';
                var faArray = content.split(/\s+/);
                for(var i=0; i<faArray.length; i++) {
                    if(faArray[i]) {
                        faClass += 'fa-' + faArray[i] + ' ';
                    }
                }

                if(!faClass) {
                    return '';
                }
                
                return  '<i class="fa ' + faClass + '"></i>';
            },

            replaceBBCodeUnderline: function(content) {
                return  '<span style="text-decoration:underline;">'
                    + chat.messages.bbc.replaceBBCode(content)
                    + '</span>';
            },

            containsUnclosedTags: function(str) {
                var openTags, closeTags,
                    regExpOpenTags = /<[^>\/]+?>/gm,
                    regExpCloseTags = /<\/[^>]+?>/gm;

                openTags    = str.match(regExpOpenTags);
                closeTags   = str.match(regExpCloseTags);
                // Return true if the number of tags doesn't match:
                if((!openTags && closeTags) ||
                    (openTags && !closeTags) ||
                    (openTags && closeTags && (openTags.length !== closeTags.length))) {
                    return true;
                }
                return false;
            },

            stripTags: function(str) {
                if (!arguments.callee.regExp) {
                    arguments.callee.regExp = new RegExp('<\\/?[^>]+?>', 'g');
                }

                return str.replace(arguments.callee.regExp, '');
            },

            stripBBCodeTags: function(str) {
                if (!arguments.callee.regExp) {
                    arguments.callee.regExp = new RegExp('\\[\\/?[^\\]]+?\\]', 'g');
                }

                return str.replace(arguments.callee.regExp, '');
            },
        },
        
        emoticons: {
            url : '',
            data : {
                ':roll:'    : 'oczy.gif',
                ':pa:'      : 'papapa.gif',
                ':)'        : 'wesoly.gif',
                ':(('       : 'placze.gif',
                ':('        : 'smutny.gif',
                ';)'        : 'oczko2.gif',
                ':p'        : 'jezyk1.gif',
                ':P'        : 'jezyk1.gif',
                ':o'        : 'wow.gif',
                ':O'        : 'wow.gif',
                ':x'        : 'nie_powiem.gif',
                ':X'        : 'nie_powiem.gif',
                ':*'        : 'cmok.gif',
                ':/'        : 'kwasny.gif',
                ':D'        : 'zeby.gif',
                '8)'        : 'cfaniak.gif',
                'X|'        : 'dead.png',
                '&lt;3'     : 'serce.png'
            },
            regExpData : null,
            regExpEscape : null,

            replaceEmoticons: function(text) {
                if(!chat.messages.emoticons.regExpData) {

                    var reEmoticons = [];
                    $.each(chat.messages.emoticons.data, function(emoticon) {
                        reEmoticons.push('(?:' + chat.messages.emoticons.escapeRegExp(emoticon) + ')');
                    });
                    
                    chat.messages.emoticons.regExpData = new RegExp('^(.*)(' + reEmoticons.join('|') + ')(.*?)$', 'g');
                }

                return text.replace(/[\n\r]+/, ' ').replace(
                    chat.messages.emoticons.regExpData,
                    chat.messages.emoticons.replaceEmoticonsCallback
                );
            },

            replaceEmoticonsCallback: function(str, textBefore, emoticon, textAfter) {
                // skip inside ="", & character code, <a /a>
                if(!emoticon || textBefore.match(/(="[^"]*|&[^;]*)$/) || (textBefore.match(/<a/) || []).length > (textBefore.match(/\/a>/) || []).length) {
                    return chat.messages.emoticons.replaceEmoticons(textBefore) + emoticon + textAfter;
                }
                
                // replace
                return chat.messages.emoticons.replaceEmoticons(textBefore)
                    + '<img src="' + chat.messages.emoticons.url + chat.messages.emoticons.data[emoticon] + '" alt="' + emoticon + '" />'
                    + textAfter;
            },          

            escapeRegExp: function(text) {
                if (!chat.messages.emoticons.regExpEscape) {
                    var specials = new Array(
                        '^', '$', '*', '+', '?', '.', '|', '/',
                        '(', ')', '[', ']', '{', '}', '\\'
                    );
                    chat.messages.emoticons.regExpEscape = new RegExp(
                        '(\\' + specials.join('|\\') + ')', 'g'
                    );
                }
                return text.replace(chat.messages.emoticons.regExpEscape, '\\$1');
            },
        },
    },
}

panel = {

    tab : function(button, tab) {
        var $button = $(button);

        if($button.hasClass('active')) {
            return;
        }
        
        $button.removeClass('highlight');
        $button.parent().children().removeClass('active');
        $button.addClass('active');

        $('#panel-tabs').children().each(function(){
                var $tab = $(this);
                if($tab.attr('data-tab') == tab) {
                    $tab.show();
                }
                else {
                    $tab.hide();
                }
            });
    },

    synchro : {
        lastOrderId : 0,
        
        start : function() {
            setInterval(panel.synchro.request, 10000)
            this.request();
        },

        request : function() {
            ajax.request('post', '/speaker/panel/status', {lastOrderId: panel.synchro.lastOrderId}, panel.synchro.response, ['ok']);       
        },

        response : function(data) {

            if(data.status != 'online') {
                $('#panel-board').attr('class', 'offline');
                $('#panel-listeners').text('?');
                $('#panel-songs-btn, #panel-greetings-btn').removeClass('highlight');
                $('#panel-songs, #panel-greetings').children('.panel-order').remove();
                panel.synchro.lastOrderId = 0;
                return;
            }

            $('#panel-board').attr('class', 'online');
            $('#panel-listeners').text(data.totalUniqueListeners);

            if(data.orders.length > 0) {
                popupTTY.queue('UWAGA: Otrzymano nowe pozdrowienia i/lub zamówienia muzyczne.');

                $.each(data.orders, function(){
                    var order = this;
                    var idOrder = parseInt(this.idOrder);
                    
                    if(idOrder > panel.synchro.lastOrderId) {
                        panel.synchro.lastOrderId = idOrder;
                        
                        $btn = $(this.type == 'song' ? '#panel-songs-btn' : '#panel-greetings-btn');
                        if(!$btn.hasClass('active')) {
                            $btn.addClass('highlight');
                        }
                        

                        $(this.type == 'song' ? '#panel-songs' : '#panel-greetings').append(
                                $(document.createElement('DIV'))
                                    .attr('class', 'panel-order')
                                    .append(
                                          $(document.createElement('TABLE'))
                                              .append([
                                                  $(document.createElement('TR'))
                                                      .append(
                                                          $(document.createElement('TD'))
                                                              .attr('colspan', '2')
                                                              .append([
                                                                  $(document.createElement('BUTTON'))
                                                                      .attr('class', 'btn btn-xs pull-right')
                                                                      .on('click', function(){
                                                                          ajaxRm(this, '.panel-order', order.urlDelete, 'Czy chcesz usunąć ' + (order.type == 'song' ? 'utwór na życzenie' : 'pozdrowienia online') + ' "' + order.content + '"?');
                                                                      })
                                                                      .append($(document.createElement('I')).attr('class', 'fa fa-fw fa-trash')),
                                                                  $(document.createElement('I')).attr('class', this.type == 'song' ? 'fa fa-fw fa-music' : 'fa fa-fw fa-comments'),
                                                                  $(document.createElement('SPAN')).text(' ' + this.time),
                                                              ])
                                                      ),
                                                  $(document.createElement('TR'))
                                                      .append([
                                                          $(document.createElement('TD')).text('Od:'),
                                                          $(document.createElement('TD')).text(this.username)                                                         
                                                      ]),
                                                  $(document.createElement('TR'))
                                                      .append([
                                                          $(document.createElement('TD')).text('Dla:'),
                                                          $(document.createElement('TD')).text(this.target)                                                      
                                                      ]),
                                                  $(document.createElement('TR'))
                                                      .append([
                                                          $(document.createElement('TD')).text(this.type == 'song' ? 'Utwór:' : 'Treść:'),
                                                          $(document.createElement('TD')).text(this.content)                                                      
                                                      ])
                                              ])
                                     )
                            );
                    }
                });
            }
        },
    },
     
    settings : {
        btnToggle: function(button) {
            var $button = $(button);

            if($button.hasClass('active')) {
                $button.removeClass('active');
            }
            else {
                $button.addClass('active');
            }
        },

        subbmit: function(form) {
            var $form = $(form);
            var data = {};

            $form.find('input, button[type="button"]').each(function(){
                    var $input = $(this);
                    switch($input.attr('name')) {
                        case 'audition':
                            data.audition = $input.val();
                            break;

                        case 'orderingGreetings':
                            data.orderingGreetings = $input.hasClass('active') ? 1 : 0;
                            break;

                        case 'orderingSongs':
                            data.orderingSongs = $input.hasClass('active') ? 1 : 0;
                            break;
                    }
                });

            ajax.request('post', '/speaker/panel/settings', data, null, null, form)
         },
    }
}


