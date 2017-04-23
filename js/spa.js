'use strict';
var spa = (function ($) {
  var
  // Services Methods

  // DOM Methods

  // Event Listeners

  // Public Methods
  initModule = function ($container) {
    spa.shell.initModule( $container );
  };
  return {
    initModule: initModule
  };
}(jQuery));