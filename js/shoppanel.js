$(function(){

    var elBox;
    var panel = {
        open: function(e){
            e.preventDefault();
            e.stopPropagation();

            var self = $(this)
                edit = self.data(),
                text = self.text(),
                rows = text.split('\n').length;						

            //console.log('[open]', self, text, edit);

            // если открыто на редакцию, то ничего
            if(self.find('.shoppanel-input').length) return;

            // все др. редакторы закрыть
            panel.closeAll();

            if(edit.edit == 'txt') {
                self.text('');

                var textarea = $('<textarea>', {type: 'text', rows: rows/*, value: text*/})
                    .appendTo(self)
                    .wrap('<div class="shoppanel-input">')
                    .focus()
                    .val(text);

                // пересчёт высоты
                $.proxy(panel.resize, textarea.get(0))();

                // скрыть кнопку "загрузить фото"
                elBox.find('[data-upload]').hide()
                    .end()
                    .find('[data-format], [data-color], .btn-group .btn-group').show();
            }

            if(edit.edit == 'img') {
                //console.log('[open:img]', elBox.find('[data-upload]'));

                self.addClass('shoppanel-upload');
                self.parent().removeClass('shoppanel-imgedit');

                // скрыть кнопки форматирования
                elBox.find('[data-upload]').show()
                    .end()
                    .find('[data-format], [data-color], .btn-group .btn-group').hide();
            }
            
            var size = self.offset(),
                // видимая часть экрана:
                win = {
                    top: $(window).scrollTop(),
                    bottom: $(window).scrollTop() + $(window).height()
                };
            size.h = self.outerHeight();
            var top = size.top + size.h +5;

            if(win.bottom < top + elBox.outerHeight()) {
                top = size.top - elBox.outerHeight() -5;
            }
            //console.log('[open]', size.top, size.h, elBox.outerHeight());

            elBox.css({
                top: top,
                left: size.left
            });

            // подсветка кнопок
            var style = self.attr('style'),
                isset = 0;
            elBox.find('[data-format]').each(function(i, v){
                var btn  = $(v),
                    data = btn.data();
                switch(data.format) {
                    case 'bold'	: isset = /font-weight:/g.test(style) ? 1:0; break;
                    case 'size'	: isset = /font-size:/g.test(style) ? 1:0; break;
                    case 'color': isset = /color:/g.test(style) ? 1:0; break;
                }
                if(data.val) {
                    btn = btn.parent().prev();
                    btn.dropdown('hide');
                }
                if(isset) 
                        btn.addClass('btn-info').removeClass('btn-outline-info');
                else btn.addClass('btn-outline-info').removeClass('btn-info');						
            });
        },
        closeAll: function(){
            $('.shoppanel-input').each(function(i, v){

                var self = $(v),
                    text = self.find('textarea').val();

                //console.log('[clear]', i, text);

                self.parent().text(text);
            });
            $('.shoppanel-upload').removeClass('shoppanel-upload');
        },
        format: function(e){

            var self = $(this),
                data = self.data(),
                elem = $('.shoppanel-input').parent(),
                edit = elem.data(),
                text = elem.find('textarea').val(),
                wrap = data.val ? self.parent().prev() : self,
                isset= wrap.is('.btn-outline-info'); // нажата или нет

            //console.log('[format]', data, isset, wrap, elem);

            if(data.val) {
                wrap.addClass('btn-info').removeClass('btn-outline-info');
            }										
            else self.toggleClass('btn-outline-info btn-info');

            if(edit.group) {
                elem = $('[data-group="'+ edit.group +'"]');
            }

            switch(data.format) {
                case 'bold'	: elem.css('font-weight', isset ? 'bold' : ''); break;
                case 'size'	: elem.css('font-size', isset||data.val ? data.val : ''); break;
                case 'color': elem.css('color', isset||data.val ? data.val : ''); break;
            }
        },
        hoverOn: function(f) {
            $(this).not('.shoppanel-upload').parent().addClass('shoppanel-imgedit');
        },
        hoverOff: function(f) {
            $(this).parent().removeClass('shoppanel-imgedit');
        },
        file: function(e) {
            elBox.find('input:file').trigger('click');
            
            //console.log('[upload]', elBox.find('input:file'));
        },
        upload: function(e) {
            var files = e.target.files,
                elem  = $('.shoppanel-upload');

            elem.attr('src', URL.createObjectURL(files[0]));

            //console.log('[file]', files[0]);
        },
        color: function() {							
            // цвета поумолчанию
            var css 	= $('#css-main').text(),
                clrMain = /a {\s+color: ([#\w]+);/g.exec(css),
                clrFon	= /body {\s+background-color: ([#\w]+);/g.exec(css),
                clrHover= /a:hover {\s+color: ([#\w]+);/g.exec(css);

            $('[data-color]').each(function(i, v){
                switch(v.dataset.color) {
                    case 'main'	: v.dataset.initialcolor = clrMain[1]; break;
                    case 'fon'	: v.dataset.initialcolor = clrFon[1]; break;
                    case 'hover': v.dataset.initialcolor = clrHover[1]; break;
                }
            });

            // выбор цвета
            $('[data-color]').colorPick({
                paletteLabel: 'Выберите цвет',
                allowCustomColor: true,
                // initialColor: '#27ae60',
                // palette: ["#1abc9c", "#16a085", "#2ecc71"],
                // allowRecent: false,
                onColorShown: function() {
                    //console.log('[color:onColorOpened]', this);

                    // закрыть др. всплывающие окна в главном меню
                    $('#shoppanel .dropdown-toggle').dropdown('hide');
                },
                onColorSelected: function() {
                    var type = this.element.data('color'),
                        elem = $('#css-main'),
                        css  = elem.text();

                    if(type == 'elem') {
                        $('.shoppanel-input').parent().css('color', this.color);
                        return;
                    }                    
                                        
                    this.element.css({ backgroundColor: this.color });

                    switch(type) {
                        case 'main'	: css = css.replace(/(a {\s+color: )([#\w]+);/g, '$1'+ this.color +';'); break;
                        case 'fon'	: css = css.replace(/(body {\s+background-color: )([#\w]+);/g, '$1'+ this.color +';'); break;
                        case 'hover': css = css.replace(/(a:hover {\s+color: )([#\w]+);/g, '$1'+ this.color +';'); break;
                    }
                    
                    elem.html(css);                                       
                    //console.log('[colorPick]', this, this.color, type, css);						    
                },
            });
        },
        font: function(e) {
            e.preventDefault();

            var font = this.dataset.font, //.toLowerCase(),
                elem = $('#css-main'),
                css  = elem.text();

            font = font.replace(font[0], font[0].toUpperCase());
            css  = css.replace(/(\* {\s+font-family: )"([#\s\w]+)", sans-serif;/g, '$1"'+ font.replace('+', ' ') +'", sans-serif;');
            css  = css.replace(/@import url(.*);/g, '');
            css  = css.replace(/^\s+$/m, '');

            if(['Arial','Tahoma','Verdana'].indexOf(font) == -1) {
                css  = "\n\t\t@import url('https://fonts.googleapis.com/css2?family="+ font +":wght@400;700&display=swap');" + css;
            }
            
            elem.html(css);
            $(this).addClass('active').siblings().removeClass('active');
            //console.log('[font]', font, css);	
        },
        resize: function(e) {

            // var el = $('<span>');
            // el.html(
            // 	$(this).val().replace(/ /g,'&nbsp;')
            // ).insertAfter($(this));
            // $(this).width(el.width() +1);
            // el.remove();

            $(this)
                .attr('rows', 1)
                .height('auto')
                .height(this.scrollHeight +'px');
        },
        loader: function(msg) {
            // закрытие заставки
            if(false === msg) return $('.shoppanel-load').fadeOut(400);

            $('.shoppanel-load')
                .fadeIn(300)
                .find('h4').html(msg);
        },
        save: function() {
            panel.loader('Идёт сохранение');
            setTimeout(e => {
                panel.loader('Успешно сохранено!');
                setTimeout(e => {
                    panel.loader(false);
                }, 2000);
            }, 5000);
        },
        init: function() {
            elBox = $('.shoppanel-box');

            $(document)
                .on('click', '[data-edit]', panel.open)
                .on('click', '[data-format]', panel.format)
                .on('click', '[data-upload]', panel.file)
                .on('click', '[data-font]', panel.font)
                .on('change', elBox.find('input:file'), panel.upload)
                .on('keyup change drop paste focusin focusout', '[data-edit] textarea', panel.resize)
                .on('mouseenter', '[data-edit="img"]', panel.hoverOn)
                .on('mouseout', '[data-edit="img"]', panel.hoverOff)
                .on('click', '[data-save]', panel.save);            
            
            // сдвиг рабочей области на высоту панели
            $('body').css('margin-top','80px');

            // первый элемент на редакцию
            $('[data-edit]').not('[data-group], img').first().trigger('click');

            // глобальный цвет
            panel.color();

            // закрытие заставки
            panel.loader(false);

        },
    };


    console.clear();

    // загрузка и встака панели в шаблон
    $('<div>', {id: 'shoppanel'})
        .appendTo('body')
        .load('panel.html', null, panel.init);

});