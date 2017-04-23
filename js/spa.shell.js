'use strict';

spa.shell = (function () {
  var
    configMap = {
      anchor_schema_map: {
        chat: { open: true, closed: true }
      },
      main_html: `<div class="spa-shell-head">
                    <div class="spa-shell-head-logo"></div>
                    <div class="spa-shell-head-acct"></div>
                  <div class="spa-shell-head-search"></div>
                  </div>
                  <div class="spa-shell-main">
                    <nav class="spa-shell-main-nav"></nav>
                    <div class="spa-shell-main-content"></div>
                  </div>
                  <div class="spa-shell-foot">
                    <div class="spa-shell-chat"></div>
                    <div class="spa-shell-modal"></div>
                  </div>`,
      chat_extend_time: 1000,
      chat_retracted_time: 300,
      chat_extend_height: 400,
      chat_retracted_height: 15,

      chat_extend_title: 'Click to extend',
      chat_retracted_title: 'Click to retract'
    },
    stateMap = {
      $container: null,
      anchor_map: {},
      is_chat_retracted: true
    },
    jqueryMap = {},
    copyAnchorMap, setJqueryMap, toggleChat,
    changeAnchorPart, onHashChange, onClickChat, initModule;

  // Services Methods
  copyAnchorMap = function () {
    return $.extend(true, {}, stateMap.anchor_map);
  };

  // DOM Methods
  // changeAnchorPart
  // Args:
  // * arg_map  - hash, describing which anchor part we want change
  // Return: Boolean
  // * true - URI anchor was will
  // * false - failed to update URI anchor
  changeAnchorPart = function (arg_map) {
    var
      arg_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    KEYVAL:
    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        if (key_name.indexOf('_') === 0) { continue KEYVAL; }

        // refresh value of independent key
        arg_map_revise[key_name] = arg_map[key_name];

        key_name_dep = '_' + key_name;

        // refresh value of same dependent key
        if (arg_map[key_name_dep]) {
          arg_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete arg_map_revise[key_name_dep];
          delete arg_map_revise['_s' + key_name_dep];
        }
      }

      // try to refresh URI
      try {
        $.uriAnchor.setAnchor(arg_map_revise);
      }
      catch (error) {
        $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
        bool_return = false;
      }

      return bool_return;
    }
  };

  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container: $container,
      $chat: $container.find('.spa-shell-chat')
    };
  };

  // State: set stateMap.is_chat_retracted
  // * true - chat is opened
  // * false - chat is closed
  toggleChat = function (do_extend, callback) {
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retracted_height,
      is_sliding = !is_open && !is_closed;

    // if animation in process do nothing
    if (is_sliding) {
      return false;
    }

    if (do_extend) {
      jqueryMap.$chat.animate(
        { height: configMap.chat_extend_height },
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr('title', configMap.chat_extend_title);

          stateMap.is_chat_retracted = false;

          if (callback) {
            callback( jqueryMap.$chat );
          }
        }
      );
      return true;
    }

    jqueryMap.$chat.animate(
      { height: configMap.chat_retracted_height },
      configMap.chat_retracted_time,
      function () {
        jqueryMap.$chat.attr('title', configMap.chat_retracted_title);

        stateMap.is_chat_retracted = true;

        if (callback) {
          callback( jqueryMap.$chat );
        }
      }
    );

    return true;
  } // end toggleChat

  // Event Listeners

  // onHashChange
  // Return: Boolean
  // * false
  onHashChange = function (e) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed;

    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
      // console.log(anchor_map_proposed);
    }
    catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }

    stateMap.anchor_map = anchor_map_proposed;

    // helper variables
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;

      switch (s_chat_proposed) {
        case 'open':
          toggleChat(true);
          break;
        case 'closed':
          toggleChat(false);
          break;
        default:
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    return false;
  };

  onClickChat = function (e) {
    if (toggleChat( stateMap.is_chat_retracted )) {
      changeAnchorPart({
        chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
      });
    }
    return false;
  };

  // Public Methods
  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr('title', configMap.chat_retracted_title)
      .on('click', onClickChat);

    // test toggleChat
    // setTimeout(function () { toggleChat( true ); }, 3000);
    // setTimeout(function () { toggleChat( false ); }, 8000);

    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    $(window)
      .on('hashchange', onHashChange)
      .trigger('hashchange');
  };

  return {
    initModule: initModule
  };
}());