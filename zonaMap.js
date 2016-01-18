
(function($) {

  $.fn.zonaMap = function( options ){
    var that = this;
    var selector = this;
    var zonaMapObj = false;
    var zonaMapId;
    var zonaMapArea;
    var imgTransparent;
    var dataOpts = [];

    var defaults = {
      textReset: 'All',
      imgSrc: '',
      imgTransparent: '',
      htmlIconArrow: '',
      width: 'auto',
      height: 'auto',
      eventClick: function(l,e){  },
      eventHover: function(l,e){  }
    };
    var settings = $.extend( {}, defaults, options );

    that.zonaMapObj = false;

    that.createInterface = function(){

      var htmlInterface = '';

      htmlInterface += '<div id="'+zonaMapId+'" class="filterZonaMapContainer">';
        htmlInterface += '<div class="filterZonaMap_openFilter"><img width="40" height="40" class="zonaMapCustomSvg" src="'+settings.imgSrc+'"><div class="filterZonaMap_selected"></div><div class="filterZonaMap_arrow">'+settings.htmlIconArrow+'</div></div>';
        htmlInterface += '<div class="filterZonaMap_opts">';
          $.each( dataOpts , function( index, optData ) {
            if(optData.coords){
              htmlInterface += '<img width="'+settings.width+'" height="'+settings.height+'" class="zonaMapCustomSvg zonaMap zonaMap_'+optData.value+'" src="'+optData.image+'">';
            }
          });
          htmlInterface += '<img width="'+settings.width+'" height="'+settings.height+'" class="zonaMap_primary" src="'+settings.imgTransparent+'" usemap="#'+zonaMapArea+'">';
          htmlInterface += '<img width="'+settings.width+'" height="'+settings.height+'" class="zonaMap_map" src="'+settings.imgSrc+'">';

          htmlInterface += '<map id="'+zonaMapArea+'" name="'+zonaMapArea+'">';
          $.each( dataOpts , function( index, optData ) {
            if(optData.coords){
              htmlInterface += '<area shape="poly" data-term="'+optData.value+'" coords="'+optData.coords+'" target=""  />';
            }
          });
          htmlInterface += '</map>';

          htmlInterface += '<div class="zonaMap_title"></div>';
          htmlInterface += '<div class="zonaMap_reset">'+settings.textReset+'</div>';
        htmlInterface += '</div>';

      htmlInterface += '</div>';

      selector.parent().append(htmlInterface);
      selector.hide();
      zonaMapObj = $('#'+zonaMapId);
    }


    /*
      Genera un array de obj con las opciones seleccionadas
    */
    that.getOptValues = function( ){

      dataOpts = [];
      selector.find('option').each(function( index ) {
        var data = {
          name: $( this ).text(),
          coords: $( this ).attr('data-coords'),
          image: $( this ).attr('data-img'),
          selected: $( this ).is( ":selected" ),
          value: $( this ).val()
        }
        dataOpts.push(data);
      });

    }
    that.getZonaMapOpt = function( value ){
      return $.grep(dataOpts, function(e){
        return e.value == value;
      })[0];
    }
    that.getZonaMapOptSelected = function(){
      return $.grep(dataOpts, function(e){
        return e.selected == true;
      })[0];
    }
    that.openFilterZonaMap = function(){
      zonaMapObj.find('.zonaMap').hide();
      $.each( dataOpts , function( index, optData ) {
        if(optData.selected){
          zonaMapObj.find('.zonaMap_'+optData.value).show();
          zonaMapObj.find('.zonaMap_title').html(optData.name);
        }
      });

      //zonaMapObj.find('.filterZonaMap_openFilter').hide();
      zonaMapObj.find('.filterZonaMap_opts').show();
      $(document).mouseup(function (e){
          var container = zonaMapObj.find('.filterZonaMap_opts');
          if (!container.is(e.target) // if the target of the click isn't the container...
              && container.has(e.target).length === 0) // ... nor a descendant of the container
          {
              container.hide();
          }
      });

    }
    that.closeFilterZonaMap = function(){
      var zonaElem = that.getZonaMapOptSelected();
      if(zonaElem.value != ""){
        zonaMapObj.find('.filterZonaMap_selected').html(zonaElem.name);
      }else{
        zonaMapObj.find('.filterZonaMap_selected').html(" ");
      }
      zonaMapObj.find('.filterZonaMap_opts').hide();
    }
    that.reloadZonaMap = function( ){
      that.getOptValues();
      //that.zonaMapBinds();
    }

    that.zonaMapBinds = function(){
      $('#'+zonaMapArea).find('area').on( "click", function(){
        that.zonaMapClick( $(this).attr('data-term') );
      }).on( "mouseover", function(){
        that.zonaMapMouseOver( $(this).attr('data-term') );
      }).on( "mouseout", function(){
        that.zonaMapMouseOut();
      });

      zonaMapObj.find('.filterZonaMap_openFilter').on( "click", function (){
        that.openFilterZonaMap();
      });
      zonaMapObj.find('.zonaMap_reset').on( "click", function (){
        selector.find("option:selected").prop("selected", false);
        that.reloadZonaMap();
        that.closeFilterZonaMap();
      });
      selector.on("change", function (e) {
        that.reloadZonaMap();
      });

      jQuery('img.zonaMapCustomSvg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }        // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
            // Replace image with new SVG
            $img.replaceWith($svg);
        }, 'xml');
      });
    }


    that.zonaMapMouseOver = function(idNameTerm){
      var zonaElem = that.getZonaMapOpt(idNameTerm);
      zonaMapObj.find('.zonaMap_title').html(zonaElem.name);
      zonaMapObj.find('.zonaMap_'+idNameTerm).show();
      settings.eventHover();
    }

    that.zonaMapClick = function(idNameTerm){
      selector.find("option:selected").prop("selected", false);
      selector.find('option[value="'+idNameTerm+'"]').prop("selected", true);
      selector.trigger("change");
      that.reloadZonaMap();
      settings.eventClick();
      that.closeFilterZonaMap();
    }

    that.zonaMapMouseOut = function(){
      zonaMapObj.find('.zonaMap').hide();
      var zonaElem = that.getZonaMapOptSelected();
      if(zonaElem.value != ""){
        zonaMapObj.find('.zonaMap_'+zonaElem.value).show();
        zonaMapObj.find('.zonaMap_title').html(zonaElem.name);
      }else{
        zonaMapObj.find('.zonaMap_title').html('');
      }
    }


    /*
      Init
    */
    that.init = function(){
      if(typeof(zonaMapIdCount)!=="undefined"){
        zonaMapIdCount++;
      }else{
        zonaMapIdCount = 1;
      }
      zonaMapId = 'zonaMapId-'+zonaMapIdCount;
      zonaMapArea = 'zonaMapArea-'+zonaMapIdCount;

      that.getOptValues();
      that.createInterface();
      that.zonaMapMouseOut();
      that.zonaMapBinds();
    }

    that.init();
  };

}( jQuery ));
