// Generated by CoffeeScript 1.7.1

/*
  Shortcuts for Framer 1.0
  http://github.com/facebook/shortcuts-for-framer

  Copyright (c) 2014, Facebook, Inc.
  All rights reserved.

  Readme:
  https://github.com/facebook/shortcuts-for-framer

  License:
  https://github.com/facebook/shortcuts-for-framer/blob/master/LICENSE.md
 */


/*
  CONFIGURATION
 */

(function() {
  var Device;

  Framer.Shortcuts = {};

  Framer.Defaults.displayInDevice = {
    enabled: true,
    resizeToFit: true,
    canvasWidth: 640,
    canvasHeight: 1136,
    deviceWidth: 770,
    deviceHeight: 1610,
    deviceImage: 'http://shortcuts-for-framer.s3.amazonaws.com/iphone-5s-white.png',
    bobbleImage: 'http://shortcuts-for-framer.s3.amazonaws.com/bobble.png'
  };

  Framer.Defaults.FadeAnimation = {
    curve: "bezier-curve",
    time: 0.2
  };

  Framer.Defaults.SlideAnimation = {
    curve: "bezier-curve",
    time: 0.2
  };


  /*
    LOOP ON EVERY LAYER
  
    Shorthand for applying a function to every layer in the document.
  
    Example:
    ```Framer.Shortcuts.everyLayer(function(layer) {
      layer.visible = false;
    });```
   */

  Framer.Shortcuts.everyLayer = function(fn) {
    var layerName, _layer, _results;
    _results = [];
    for (layerName in window.Layers) {
      _layer = window.Layers[layerName];
      _results.push(fn(_layer));
    }
    return _results;
  };


  /*
    SHORTHAND FOR ACCESSING LAYERS
  
    Convert each layer coming from the exporter into a Javascript object for shorthand access.
  
    This has to be called manually in Framer3 after you've ran the importer.
  
    myLayers = Framer.Importer.load("...")
    Framer.Shortcuts.initialize(myLayers)
  
    If you have a layer in your PSD/Sketch called "NewsFeed", this will create a global Javascript variable called "NewsFeed" that you can manipulate with Framer.
  
    Example:
    `NewsFeed.visible = false;`
  
    Notes:
    Javascript has some names reserved for internal function that you can't override (for ex. )
   */

  Framer.Shortcuts.initialize = function(layers) {
    if (layers != null) {
      window.Layers = layers;
      Framer.Defaults.displayInDevice.containerLayer = Layers.Phone;
      return Framer.Shortcuts.everyLayer(function(layer) {
        var sanitizedLayerName;
        sanitizedLayerName = layer.name.replace(/[-+!?:*\[\]\(\)\/]/g, '').trim().replace(/\s/g, '_');
        window[sanitizedLayerName] = layer;
        Framer.Shortcuts.saveOriginalFrame(layer);
        return Framer.Shortcuts.initializeTouchStates(layer);
      });
    }
  };


  /*
    FIND CHILD LAYERS BY NAME
  
    Retrieves subLayers of selected layer that have a matching name.
  
    getChild: return the first sublayer whose name includes the given string
    getChildren: return all subLayers that match
  
    Useful when eg. iterating over table cells. Use getChild to access the button found in each cell. This is **case insensitive**.
  
    Example:
    `topLayer = NewsFeed.getChild("Top")` Looks for layers whose name matches Top. Returns the first matching layer.
  
    `childLayers = Table.getChildren("Cell")` Returns all children whose name match Cell in an array.
   */

  Layer.prototype.getChild = function(needle, recursive) {
    var subLayer, _i, _j, _len, _len1, _ref, _ref1;
    if (recursive == null) {
      recursive = false;
    }
    _ref = this.subLayers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subLayer = _ref[_i];
      if (subLayer.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
        return subLayer;
      }
    }
    if (recursive) {
      _ref1 = this.subLayers;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        subLayer = _ref1[_j];
        if (subLayer.getChild(needle, recursive)) {
          return subLayer.getChild(needle, recursive);
        }
      }
    }
  };

  Layer.prototype.getChildren = function(needle, recursive) {
    var results, subLayer, _i, _j, _len, _len1, _ref, _ref1;
    if (recursive == null) {
      recursive = false;
    }
    results = [];
    if (recursive) {
      _ref = this.subLayers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subLayer = _ref[_i];
        results = results.concat(subLayer.getChildren(needle, recursive));
      }
      if (this.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
        results.push(this);
      }
      return results;
    } else {
      _ref1 = this.subLayers;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        subLayer = _ref1[_j];
        if (subLayer.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
          results.push(subLayer);
        }
      }
      return results;
    }
  };


  /*
    CONVERT A NUMBER RANGE TO ANOTHER
  
    Converts a number within one range to another range
  
    Example:
    We want to map the opacity of a layer to its x location.
  
    The opacity will be 0 if the X coordinate is 0, and it will be 1 if the X coordinate is 640. All the X coordinates in between will result in intermediate values between 0 and 1.
  
    `myLayer.opacity = convertRange(0, 640, myLayer.x, 0, 1)`
  
    By default, this value might be outside the bounds of NewMin and NewMax if the OldValue is outside OldMin and OldMax. If you want to cap the final value to NewMin and NewMax, set capped to true.
    Make sure NewMin is smaller than NewMax if you're using this. If you need an inverse proportion, try swapping OldMin and OldMax.
   */

  Framer.Shortcuts.convertRange = function(OldMin, OldMax, OldValue, NewMin, NewMax, capped) {
    var NewRange, NewValue, OldRange;
    OldRange = OldMax - OldMin;
    NewRange = NewMax - NewMin;
    NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin;
    if (capped) {
      if (NewValue > NewMax) {
        return NewMax;
      } else if (NewValue < NewMin) {
        return NewMin;
      } else {
        return NewValue;
      }
    } else {
      return NewValue;
    }
  };


  /*
    ORIGINAL FRAME
  
    Stores the initial location and size of a layer in the "originalFrame" attribute, so you can revert to it later on.
  
    Example:
    The x coordinate of MyLayer is initially 400 (from the PSD)
  
    ```MyLayer.x = 200; // now we set it to 200.
    MyLayer.x = MyLayer.originalFrame.x // now we set it back to its original value, 400.```
   */

  Framer.Shortcuts.saveOriginalFrame = function(layer) {
    return layer.originalFrame = layer.frame;
  };


  /*
    SHORTHAND HOVER SYNTAX
  
    Quickly define functions that should run when I hover over a layer, and hover out.
  
    Example:
    `MyLayer.hover(function() { OtherLayer.show() }, function() { OtherLayer.hide() });`
   */

  Layer.prototype.hover = function(enterFunction, leaveFunction) {
    this.on('mouseenter', enterFunction);
    return this.on('mouseleave', leaveFunction);
  };


  /*
    SHORTHAND TAP SYNTAX
  
    Instead of `MyLayer.on(Events.TouchEnd, handler)`, use `MyLayer.tap(handler)`
   */

  Layer.prototype.tap = function(handler) {
    return this.on(Events.TouchEnd, handler);
  };


  /*
    SHORTHAND CLICK SYNTAX
  
    Instead of `MyLayer.on(Events.Click, handler)`, use `MyLayer.click(handler)`
   */

  Layer.prototype.click = function(handler) {
    return this.on(Events.Click, handler);
  };


  /*
    SHORTHAND ANIMATION SYNTAX
  
    A shorter animation syntax that mirrors the jQuery syntax:
    layer.animate(properties, [time], [curve], [callback])
  
    All parameters except properties are optional and can be omitted.
  
    Old:
    ```MyLayer.animate({
      properties: {
        x: 500
      },
      time: 500,
      curve: 'bezier-curve'
    })```
  
    New:
    ```MyLayer.animateTo({
      x: 500
    })```
  
    Optionally (with 1000ms duration and spring):
      ```MyLayer.animateTo({
      x: 500
    }, 1000, "spring(100,10,0)")
   */

  Layer.prototype.animateTo = function(properties, first, second, third) {
    var callback, curve, thisLayer, time;
    thisLayer = this;
    time = curve = callback = null;
    if (typeof first === "number") {
      time = first;
      if (typeof second === "string") {
        curve = second;
        callback = third;
      }
      if (typeof second === "function") {
        callback = second;
      }
    } else if (typeof first === "string") {
      curve = first;
      if (typeof second === "function") {
        callback = second;
      }
    } else if (typeof first === "function") {
      callback = first;
    }
    if ((time != null) && (curve == null)) {
      curve = 'bezier-curve';
    }
    if (curve == null) {
      curve = Framer.Defaults.Animation.curve;
    }
    if (time == null) {
      time = Framer.Defaults.Animation.time;
    }
    thisLayer.animationTo = new Animation({
      layer: thisLayer,
      properties: properties,
      curve: curve,
      time: time
    });
    thisLayer.animationTo.on('start', function() {
      return thisLayer.isAnimating = true;
    });
    thisLayer.animationTo.on('end', function() {
      thisLayer.isAnimating = null;
      if (callback != null) {
        return callback();
      }
    });
    return thisLayer.animationTo.start();
  };


  /*
    ANIMATE MOBILE LAYERS IN AND OUT OF THE VIEWPORT
  
    Shorthand syntax for animating layers in and out of the viewport. Assumes that the layer you are animating is a whole screen and has the same dimensions as your container.
  
    To use this, you need to place everything in a parent layer called Phone. The library will automatically enable masking and size it to 640 * 1136.
  
    Example:
    * `MyLayer.slideToLeft()` will animate the layer **to** the left corner of the screen (from its current position)
  
    * `MyLayer.slideFromLeft()` will animate the layer into the viewport **from** the left corner (from x=-width)
  
    Configuration:
    * Framer.Defaults.SlideAnimation.time
    * Framer.Defaults.SlideAnimation.curve
  
  
    How to read the configuration:
    ```slideFromLeft:
      property: "x"     // animate along the X axis
      factor: "width"
      from: -1          // start value: outside the left corner ( x = -width_phone )
      to: 0             // end value: inside the left corner ( x = width_layer )
    ```
   */

  _.defer(function() {
    var _phone;
    _phone = Framer.Defaults.displayInDevice.containerLayer;
    if (_phone != null) {
      _phone.x = 0;
      _phone.y = 0;
      _phone.width = Framer.Defaults.displayInDevice.canvasWidth;
      _phone.height = Framer.Defaults.displayInDevice.canvasHeight;
      return _phone.clip = true;
    }
  });

  Framer.Shortcuts.slideAnimations = {
    slideFromLeft: {
      property: "x",
      factor: "width",
      from: -1,
      to: 0
    },
    slideToLeft: {
      property: "x",
      factor: "width",
      to: -1
    },
    slideFromRight: {
      property: "x",
      factor: "width",
      from: 1,
      to: 0
    },
    slideToRight: {
      property: "x",
      factor: "width",
      to: 1
    },
    slideFromTop: {
      property: "y",
      factor: "height",
      from: -1,
      to: 0
    },
    slideToTop: {
      property: "y",
      factor: "height",
      to: -1
    },
    slideFromBottom: {
      property: "y",
      factor: "height",
      from: 1,
      to: 0
    },
    slideToBottom: {
      property: "y",
      factor: "height",
      to: 1
    }
  };

  _.each(Framer.Shortcuts.slideAnimations, function(opts, name) {
    return Layer.prototype[name] = function(time) {
      var _animationConfig, _curve, _factor, _phone, _property, _time;
      _phone = Framer.Defaults.displayInDevice.containerLayer;
      if (!_phone) {
        console.log("Please wrap your project in a layer named Phone, or set Framer.Defaults.displayInDevice.containerLayer to whatever your wrapper layer is.");
        return;
      }
      _property = opts.property;
      _factor = _phone[opts.factor];
      if (opts.from != null) {
        this[_property] = opts.from * _factor;
      }
      _animationConfig = {};
      _animationConfig[_property] = opts.to * _factor;
      if (time) {
        _time = time;
        _curve = "bezier-curve";
      } else {
        _time = Framer.Defaults.SlideAnimation.time;
        _curve = Framer.Defaults.SlideAnimation.curve;
      }
      return this.animate({
        properties: _animationConfig,
        time: _time,
        curve: _curve
      });
    };
  });


  /*
    EASY FADE IN / FADE OUT
  
    .show() and .hide() are shortcuts to affect opacity and pointer events. This is essentially the same as hiding with `visible = false` but can be animated.
  
    .fadeIn() and .fadeOut() are shortcuts to fade in a hidden layer, or fade out a visible layer.
  
    These shortcuts work on individual layer objects as well as an array of layers.
  
    Example:
    * `MyLayer.fadeIn()` will fade in MyLayer using default timing.
    * `[MyLayer, OtherLayer].fadeOut(4)` will fade out both MyLayer and OtherLayer over 4 seconds.
  
    To customize the fade animation, change the variables time and curve inside `Framer.Defaults.FadeAnimation`.
   */

  Layer.prototype.show = function() {
    this.opacity = 1;
    return this;
  };

  Layer.prototype.hide = function() {
    this.opacity = 0;
    this.style.pointerEvents = 'none';
    return this;
  };

  Layer.prototype.fadeIn = function(time) {
    if (time == null) {
      time = Framer.Defaults.FadeAnimation.time;
    }
    if (this.opacity === 1) {
      return;
    }
    if (!this.visible) {
      this.opacity = 0;
      this.visible = true;
    }
    return this.animateTo({
      opacity: 1
    }, time, Framer.Defaults.FadeAnimation.curve);
  };

  Layer.prototype.fadeOut = function(time) {
    var that;
    if (time == null) {
      time = Framer.Defaults.FadeAnimation.time;
    }
    if (this.opacity === 0) {
      return;
    }
    that = this;
    return this.animateTo({
      opacity: 0
    }, time, Framer.Defaults.FadeAnimation.curve, function() {
      return that.style.pointerEvents = 'none';
    });
  };

  _.each(['show', 'hide', 'fadeIn', 'fadeOut'], function(fnString) {
    return Object.defineProperty(Array.prototype, fnString, {
      enumerable: false,
      value: function(time) {
        _.each(this, function(layer) {
          if (layer instanceof Layer) {
            return Layer.prototype[fnString].call(layer, time);
          }
        });
        return this;
      }
    });
  });


  /*
    EASY HOVER AND TOUCH/CLICK STATES FOR LAYERS
  
    By naming your layer hierarchy in the following way, you can automatically have your layers react to hovers, clicks or taps.
  
    Button_touchable
    - Button_default (default state)
    - Button_down (touch/click state)
    - Button_hover (hover)
   */

  Framer.Shortcuts.initializeTouchStates = function(layer) {
    var hitTarget, _default, _down, _hover;
    _default = layer.getChild('default');
    if (layer.name.toLowerCase().indexOf('touchable') && _default) {
      if (!Framer.Utils.isMobile()) {
        _hover = layer.getChild('hover');
      }
      _down = layer.getChild('down');
      if (_hover != null) {
        _hover.hide();
      }
      if (_down != null) {
        _down.hide();
      }
      if (_hover || _down) {
        hitTarget = new Layer({
          background: 'transparent',
          frame: _default.frame
        });
        hitTarget.superLayer = layer;
        hitTarget.bringToFront();
      }
      if (_hover) {
        layer.hover(function() {
          _default.hide();
          return _hover.show();
        }, function() {
          _default.show();
          return _hover.hide();
        });
      }
      if (_down) {
        layer.on(Events.TouchStart, function() {
          _default.hide();
          if (_hover != null) {
            _hover.hide();
          }
          return _down.show();
        });
        return layer.on(Events.TouchEnd, function() {
          _down.hide();
          if (_hover) {
            return _hover.show();
          } else {
            return _default.show();
          }
        });
      }
    }
  };


  /*
    DISPLAY IN DEVICE
  
    If you're prototyping a mobile app, showing it in a device can be helpful for presentations.
  
    Wrapping everything in a top level layer (group in Sketch/PS) called "Phone" will enable this mode and wrap the layer in an iPhone image.
   */

  Device = (function() {
    function Device() {}

    Device.prototype.build = function(args) {
      _.extend(this, args);
      if (this.enabled && this.containerLayer && !Framer.Utils.isMobile() && navigator.userAgent.indexOf("FramerStudio") === -1) {
        this.enableCursor();
        this.backgroundLayer = new Layer({
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          image: this.backgroundImage,
          backgroundColor: 'white'
        });
        this.backgroundLayer.name = 'BackgroundLayer';
        this.backgroundLayer.style;
        this.handLayer = new Layer({
          midX: window.innerWidth / 2,
          midY: window.innerHeight / 2,
          width: this.handWidth,
          height: this.handHeight,
          image: this.handImage,
          backgroundColor: 'transparent'
        });
        this.handLayer.name = 'HandLayer';
        this.handLayer.superLayer = this.backgroundLayer;
        this.deviceLayer = new Layer({
          midX: window.innerWidth / 2,
          midY: window.innerHeight / 2,
          width: this.deviceWidth,
          height: this.deviceHeight,
          image: this.deviceImage
        });
        this.deviceLayer.name = 'DeviceLayer';
        window.addEventListener('resize', (function(_this) {
          return function() {
            return _this.resize();
          };
        })(this));
        window.addEventListener('keydown', (function(_this) {
          return function(e) {
            if (e.keyCode === 32) {
              _this.enabled = !_this.enabled;
              return _this.refresh();
            }
          };
        })(this));
        this.refresh();
        return this.resize();
      }
    };

    Device.prototype.enableCursor = function() {
      return document.body.style.cursor = "url(" + Framer.Defaults.displayInDevice.bobbleImage + ") 32 32, default";
    };

    Device.prototype.refresh = function() {
      if (this.enabled) {
        this.containerLayer.superLayer = this.deviceLayer;
        this.containerLayer.midX = this.deviceLayer.width / 2;
        this.containerLayer.midY = this.deviceLayer.height / 2;
        this.backgroundLayer.show();
        return this.deviceLayer.show();
      } else {
        this.containerLayer.superLayer = null;
        this.containerLayer.x = 0;
        this.containerLayer.y = 0;
        this.backgroundLayer.hide();
        return this.deviceLayer.hide();
      }
    };

    Device.prototype.resize = function() {
      var scaleFactor;
      this.backgroundLayer.width = window.innerWidth;
      this.backgroundLayer.height = window.innerHeight;
      this.deviceLayer.midX = this.handLayer.midX = window.innerWidth / 2;
      if (this.resizeToFit) {
        scaleFactor = window.innerHeight / this.deviceLayer.height * 0.95;
        this.deviceLayer.scale = this.handLayer.scale = scaleFactor;
      }
      if (this.resizeToFit || window.innerHeight > this.deviceLayer.height) {
        return this.deviceLayer.midY = this.handLayer.midY = window.innerHeight / 2;
      } else {
        this.deviceLayer.y = this.handLayer.y = 0;
        return this.backgroundLayer.height = this.deviceLayer.height;
      }
    };

    return Device;

  })();

  Framer.Device = new Device;

  _.defer(function() {
    return Framer.Device.build(Framer.Defaults.displayInDevice);
  });

}).call(this);