/***************************************************
* Created on Mon Jan 14 15:32:43 GMT 2013 by:
*
* Copyright 2013 Broadsoft
* http://www.broadsoft.com
***************************************************/

var isCallActive = false;

/**
 * @name WebRTC
 * @namespace
 */
(function(window) {

var WebRTC = (function() {
  "use strict";

  var WebRTC = {};

  Object.defineProperties(WebRTC, {
    version: {
      get: function(){ return '0.1.0'; }
    },
    name: {
      get: function(){ return 'webrtc'; }
    }
  });

  $.cssHooks.backgroundColor = {
    get: function(elem) {
      var bg = null;
      if (elem.currentStyle) {
        bg = elem.currentStyle["backgroundColor"];
      }
      else if (window.getComputedStyle) {
        bg = document.defaultView.getComputedStyle(elem,
          null).getPropertyValue("background-color");
      }
      if (bg.search("rgb") === -1 || bg === 'transparent') {
        return bg;
      }
      else {
        bg = bg.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+).*\)$/);
        var hex = function(x) {
          return ("0" + parseInt(x, 10).toString(16)).slice(-2);
        };
        return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
      }
    }
  };

  (function($){
    $.isBlank = function(obj){
      return(!obj || $.trim(obj) === "");
    };
  })(jQuery);

  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  return WebRTC;
}());



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var EventBus;
//    LOG_PREFIX = WebRTC.name +' | '+ 'EventBus' +' | ';

  EventBus = function(options) {
    this.options = options || {};

    var events = [
      'message',
      'userMediaUpdated',
      'reInvite',
      'incomingCall',
      'connected',
      'registered',
      'registrationFailed',
      'disconnected',
      'progress',
      'failed',
      'started',
      'held',
      'resumed',
      'ended',
      'calling',
      'newDTMF',
      'viewChanged'
    ];

    this.initEvents(events);
  };

  EventBus.prototype = new ExSIP.EventEmitter();

  EventBus.prototype.viewChanged = function(sender, data) {
    this.emit("viewChanged", sender, data);
  };
  EventBus.prototype.message = function(text, level) {
    this.emit("message", this, {text: text, level: level});
  };
  EventBus.prototype.message = function(text, level) {
    this.emit("message", this, {text: text, level: level});
  };
  EventBus.prototype.userMediaUpdated = function(localStream) {
    this.emit("userMediaUpdated", this, {localStream: localStream});
  };
  EventBus.prototype.reInvite = function(data) {
    this.emit("reInvite", this, data);
  };
  EventBus.prototype.incomingCall = function(data) {
    this.emit("incomingCall", this, data);
  };
  EventBus.prototype.connected = function(data) {
    this.emit("connected", this, data);
  };
  EventBus.prototype.registered = function(data) {
    this.emit("registered", this, data);
  };
  EventBus.prototype.registrationFailed = function(data) {
    this.emit("registrationFailed", this, data);
  };
  EventBus.prototype.disconnected = function(data) {
    this.emit("disconnected", this, data);
  };
  EventBus.prototype.failed = function(sender, data) {
    this.emit("failed", sender, data);
  };
  EventBus.prototype.progress = function(sender, data) {
    this.emit("progress", sender, data);
  };
  EventBus.prototype.started = function(sender, data) {
    this.emit("started", sender, data);
  };
  EventBus.prototype.held = function(sender, data) {
    this.emit("held", sender, data);
  };
  EventBus.prototype.resumed = function(sender, data) {
    this.emit("resumed", sender, data);
  };
  EventBus.prototype.ended = function(sender, data) {
    this.emit("ended", sender, data);
  };
  EventBus.prototype.calling = function(sender, data) {
    this.emit("calling", sender, data);
  };
  EventBus.prototype.newDTMF = function(sender, data) {
    this.emit("newDTMF", sender, data);
  };
  EventBus.prototype.isDebug = function() {
    return this.options.isDebug();
  };

  WebRTC.EventBus = EventBus;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var Configuration,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'Configuration'),
    Flags = {
      enableHD: 1,
      enableCallControl: 2,
      enableCallTimer: 4,
      enableCallHistory: 8,
      enableFullScreen: 16,
      enableSelfView: 32,
      enableCallStats: 64,
      enableDialpad: 128,
      enableMute: 256,
      enableMessages: 512,
      enableRegistrationIcon: 1024,
      enableConnectionIcon: 2048,
      enableWindowDrag: 4096,
      enableSettings: 8192,
      enableAutoAnswer: 16384,
      enableAutoAcceptReInvite: 32768,
      enableConnectLocalMedia: 65536,
      enableTransfer: 131072,
      enableHold: 262144,
      enableIms: 524288
    };

  Configuration = function(eventBus, configObj) {
    logger.log('window.location.search : '+window.location.search, this);
    logger.log('configuration options : '+ExSIP.Utils.toString(configObj), this);
    jQuery.extend(this, configObj);

    // Default URL variables
    this.eventBus = eventBus;
    this.destination = this.destination || WebRTC.Utils.getSearchVariable("destination");
    this.hd = (WebRTC.Utils.getSearchVariable("hd") === "true") || $.cookie('settingHD');
    this.audioOnly = (WebRTC.Utils.getSearchVariable("audioOnly") === "true");
    this.sipDisplayName = this.displayName || WebRTC.Utils.getSearchVariable("name") || $.cookie('settingDisplayName');
    if(this.sipDisplayName) {
      this.sipDisplayName = this.sipDisplayName.replace(/%20/g," ");
    }
    this.maxCallLength = WebRTC.Utils.getSearchVariable("maxCallLength");
    this.hideCallControl = (WebRTC.Utils.getSearchVariable("hide") === "true");
    this.size = WebRTC.Utils.getSearchVariable("size") || $.cookie('settingSize') || 1;
    this.color = WebRTC.Utils.colorNameToHex(WebRTC.Utils.getSearchVariable("color")) || $.cookie('settingColor');
    this.offerToReceiveVideo = true;
    var features = WebRTC.Utils.getSearchVariable("features");
    if(features) {
      this.setClientConfigFlags(parseInt(features, 10));
    }
  };

  Configuration.prototype = {
    getClientConfigFlags: function(){
      var flags = 0;
      for(var flag in Flags) {
        var value = Flags[flag];
        if(this[flag]) {
          flags |= value;
        }
      }
      return flags;
    },
    setClientConfigFlags: function(flags){
      for(var flag in Flags) {
        var value = Flags[flag];
        if(flags & value) {
          this[flag] = true;
        } else {
          this[flag] = false;
        }
      }
    },
    isAudioOnlyView: function(){
      var view = this.getView();
      return view === 'audioOnly';
    },
    getView: function(){
      return this.view || WebRTC.Utils.getSearchVariable("view");
    },
    getBackgroundColor: function(){
      return this.color || $('body').css('backgroundColor');
    },
    getPassword: function(){
      return $.cookie('settingPassword');
    },
    isAutoAnswer: function(){
      return this.settings.settingAutoAnswer.is(':checked');
    },
    getDTMFOptions: function(){
      return {duration: WebRTC.C.DEFAULT_DURATION, interToneGap: WebRTC.C.DEFAULT_INTER_TONE_GAP};
    },
    getExSIPOptions: function(){
      // Options Passed to ExSIP
      var options =
      {
        mediaConstraints:
        {
          audio: true,
          video: this.getVideoConstraints()
        },
        createOfferConstraints: {mandatory:{
          OfferToReceiveAudio:true,
          OfferToReceiveVideo: !this.isAudioOnlyView() && this.offerToReceiveVideo
        }}
      };

      return options;
    },

    getVideoConstraints: function(){
      if (this.isAudioOnlyView() || this.audioOnly) {
        return false;
      } else {
        var constraints = this.getResolutionConstraints();
        return  constraints ? constraints : true;
      }
    },

    getResolutionConstraints: function(){
      if(this.hd === true) {
        return { mandatory: { minWidth: 1280, minHeight: 720 }};
      } else {
        var width = this.settings.getResolutionEncodingWidth();
        var height = this.settings.getResolutionEncodingHeight();
        if(width && height) {
          if(height <= 480) {
            return { mandatory: { maxWidth: width, maxHeight: height }};
          } else {
            return { mandatory: { minWidth: width, minHeight: height }};
          }
        } else {
          return false;
        }
      }
    },

    getExSIPConfig: function(authenticationUserId, password){
      var userid = this.settings.userId() || this.networkUserId || WebRTC.Utils.randomUserid();

      var sip_uri = encodeURI(userid);
      if ((sip_uri.indexOf("@") === -1))
      {
        sip_uri = (sip_uri + "@" + this.domainFrom);
      }

      var config  =
      {
        'uri': sip_uri,
        'authorization_user': authenticationUserId || this.settings.authenticationUserId() || userid,
        'ws_servers': this.websocketsServers,
        'stun_servers': 'stun:' + this.stunServer + ':' + this.stunPort,
        'trace_sip': this.debug,
        'enable_ims': this.enableIms
      };

      // Add Display Name if set
      if (this.sipDisplayName)
      {
        config.display_name = this.sipDisplayName;
      }

      // Modify config object based password
      if (!this.settings.userId())
      {
        config.register = false;
      }
      else
      {
        config.register = true;
        config.password = password || this.settings.password();
      }
      return config;
    },

    getRtcMediaHandlerOptions: function(){
      var options = {
        reuseLocalMedia: this.enableConnectLocalMedia,
        videoBandwidth: this.settings.getBandwidth(),
        disableICE: this.disableICE,
        RTCConstraints: {'optional': [],'mandatory': {}}
      };
      return options;
    },

    setSettings: function(settings){
      this.settings = settings;
    },

    isDebug: function(){
      return this.debug === true;
    },

    isHD: function(){
      return this.enableHD === true && this.hd === true;
    },

    isWidescreen: function() {
      return this.isHD() || this.settings.resolutionType.val() === WebRTC.C.WIDESCREEN;
    },

    setResolutionDisplay: function(resolutionDisplay) {
      this.hd = false;
      this.settings.setResolutionDisplay(resolutionDisplay);
      this.eventBus.viewChanged(this.settings);
    },

    getResolutionDisplay: function() {
      return this.isHD() ? WebRTC.C.R_1280x720 : this.settings.getResolutionDisplay();
    }
  };
  WebRTC.Configuration = Configuration;
  WebRTC.Configuration.Flags = Flags;
}(WebRTC));



/***************************************************
 * Created on Mon Jan 14 15:32:43 GMT 2013 by:
 * Nathan Stratton
 *
 * Copyright 2013 Broadsoft
 * http://www.broadsoft.com
 ***************************************************/
(function(WebRTC) {
  var Settings,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'Settings');

  Settings = function(client, configuration, sound, eventBus, sipStack) {
    this.settingsIcon = client.find(".settings");
    this.settingsUi = client.find('.settingsPopup');
    this.popup = this.settingsUi;
    this.localVideoTop = this.settingsUi.find(".settingLocalVideoTop");
    this.localVideoLeft = this.settingsUi.find(".settingLocalVideoLeft");
    this.userIdInput = this.settingsUi.find(".settingUserid");
    this.authenticationUserIdInput = this.settingsUi.find(".settingAuthenticationUserid");
    this.passwordInput = this.settingsUi.find(".settingPassword");
    this.save = this.settingsUi.find(".saveSettings");
    this.displayNameInput = this.settingsUi.find(".settingDisplayName");
    this.resolutionType = this.settingsUi.find('.resolutionTypeSelect');
    this.resolutionDisplayWidescreen = this.settingsUi.find('.resolutionDisplayWidescreenSelect');
    this.resolutionDisplayStandard = this.settingsUi.find('.resolutionDisplayStandardSelect');
    this.resolutionEncodingWidescreen = this.settingsUi.find('.resolutionEncodingWidescreenSelect');
    this.resolutionEncodingStandard = this.settingsUi.find('.resolutionEncodingStandardSelect');
    this.bandwidthLowInput = this.settingsUi.find('.settingBandwidthLow');
    this.bandwidthMedInput = this.settingsUi.find('.settingBandwidthMed');
    this.bandwidthHighInput = this.settingsUi.find('.settingBandwidthHigh');
    this.settingDisplayNameRow = this.settingsUi.find('.settingDisplayNameRow');
    this.settingUseridRow = this.settingsUi.find('.settingUseridRow');
    this.settingSelfViewDisableRow = this.settingsUi.find('.settingSelfViewDisableRow');
    this.settingHDRow = this.settingsUi.find('.settingHDRow');
    this.settingAutoAnswerRow = this.settingsUi.find('.settingAutoAnswerRow');
    this.settingResolutionTypeRow = this.settingsUi.find(".settingResolutionTypeRow");
    this.settingResolutionDisplayRow = this.settingsUi.find(".settingResolutionDisplayRow");
    this.settingResolutionEncodingRow = this.settingsUi.find(".settingResolutionEncodingRow");
    this.settingResolutionRow = this.settingsUi.find(".settingResolutionRow");
    this.settingBandwidthRow = this.settingsUi.find(".settingBandwidthRow");
    this.settingCallHistoryTop = this.settingsUi.find(".settingCallHistoryTop");
    this.settingCallHistoryLeft = this.settingsUi.find(".settingCallHistoryLeft");
    this.settingCallStatsTop = this.settingsUi.find(".settingCallStatsTop");
    this.settingCallStatsLeft = this.settingsUi.find(".settingCallStatsLeft");
    this.resolutionTypeSelect = this.settingsUi.find(".resolutionTypeSelect");
    this.settingSelfViewDisable = this.settingsUi.find(".settingSelfViewDisable");
    this.settingHD = this.settingsUi.find(".settingHD");
    this.settingSize = this.settingsUi.find(".settingSize");
    this.settingAutoAnswer = this.settingsUi.find(".settingAutoAnswer");
    this.colorInput = this.settingsUi.find(".settingColor");
    this.clearLink = this.settingsUi.find(".clear");

    this.configuration = configuration;
    this.sound = sound;
    this.client = client;
    this.eventBus = eventBus;
    this.sipStack = sipStack;
    this.toggled = false;
    this.settingsChanged = false;

    var self = this;
    this.cookiesMapper = {
      'settingDisplayName': {
        name: 'displayName',
        initValue: function(){return self.configuration.sipDisplayName || $.cookie('settingDisplayName');},
        inputSetter: function(val){self.displayNameInput.val(val);},
        inputGetter: function(){return self.displayNameInput.val();}},
      'settingUserId': {
        name: 'userId',
        inputSetter: function(val){self.userIdInput.val(val);},
        inputGetter: function(){return self.userIdInput.val();}},
      'settingPassword': {
        name: 'password',
        inputSetter: function(val){self.passwordInput.val(val);},
        inputGetter: function(){return self.passwordInput.val();}},
      'settingAuthenticationUserId': {
        name: 'authenticationUserId',
        inputSetter: function(val){self.authenticationUserIdInput.val(val);},
        inputGetter: function(){return self.authenticationUserIdInput.val();}},
      'settingSelfViewDisable': {
        name: 'selfViewDisable',
        initValue: function(){return $.cookie('settingSelfViewDisable') === "true";},
        inputSetter: function(val){self.settingSelfViewDisable.prop('checked', val);},
        inputGetter: function(){return self.settingSelfViewDisable.prop('checked');}},
      'settingHD': {
        name: 'hd',
        initValue: function(){return $.cookie('settingHD') === "true";},
        inputSetter: function(val){self.settingHD.prop('checked', val);},
        inputGetter: function(){return self.settingHD.prop('checked');}},
      'settingBandwidthLow': {
        name: 'bandwidthLow',
        initValue: function(){return self.configuration.bandwidthLow || $.cookie('settingBandwidthLow');},
        inputSetter: function(val){self.bandwidthLowInput.val(val);},
        inputGetter: function(){return self.bandwidthLowInput.val();}},
      'settingBandwidthMed': {
        name: 'bandwidthMed',
        initValue: function(){return self.configuration.bandwidthMed || $.cookie('settingBandwidthMed');},
        inputSetter: function(val){self.bandwidthMedInput.val(val);},
        inputGetter: function(){return self.bandwidthMedInput.val();}},
      'settingBandwidthHigh': {
        name: 'bandwidthHigh',
        initValue: function(){return self.configuration.bandwidthHigh || $.cookie('settingBandwidthHigh');},
        inputSetter: function(val){self.bandwidthHighInput.val(val);},
        inputGetter: function(){return self.bandwidthHighInput.val();}},
      'settingColor': {
        name: 'color',
        initValue: function(){return self.configuration.getBackgroundColor();},
        inputSetter: function(val){self.colorInput.val(val || '#ffffff');},
        inputGetter: function(){return self.colorInput.val();}},
      'settingResolutionDisplay': {
        name: 'resolutionDisplay',
        initValue: function(){return self.configuration.displayResolution || $.cookie('settingResolutionDisplay') || WebRTC.C.DEFAULT_RESOLUTION_DISPLAY;},
        inputSetter: function(val){self.setResolutionDisplay(val);},
        inputGetter: function(){return self.getResolutionDisplay();}},
      'settingResolutionEncoding': {
        name: 'resolutionEncoding',
        initValue: function(){return self.configuration.encodingResolution || $.cookie('settingResolutionEncoding') || WebRTC.C.DEFAULT_RESOLUTION_ENCODING;},
        inputSetter: function(val){self.setResolutionEncoding(val);},
        inputGetter: function(){return self.getResolutionEncoding();}},
      'settingSize': {
        name: 'size',
        initValue: function(){return self.configuration.size || $.cookie('settingSize');},
        inputSetter: function(val){self.settingSize.val(val);},
        inputGetter: function(){return self.settingSize.val();}},
      'settingAutoAnswer': {
        name: 'autoAnswer',
        initValue: function(){return $.cookie('settingAutoAnswer') === "true";},
        inputSetter: function(val){self.settingAutoAnswer.prop('checked', val);},
        inputGetter: function(){return self.settingAutoAnswer.prop('checked');}},
      'settingWindowPosition': {
        name: 'windowPosition',
        inputSetter: function(val){},
        inputGetter: function(){return ".localVideo" + "-" + self.localVideoTop.val() + "-" + self.localVideoLeft.val() + "|" +
          ".callHistory" + "-" + self.settingCallHistoryTop.val() + "-" + self.settingCallHistoryLeft.val() + "|" +
          ".callStats" + "-" + self.settingCallStatsTop.val() + "-" + self.settingCallStatsLeft.val();}}
    };

    function makeAccessor(cookie) {
      var mapping = self.cookiesMapper[cookie];
      self[mapping.name] = function(value){
        if(arguments.length === 1) {
          mapping.inputSetter(value);
          if(value) {
            $.cookie(cookie, value,  { expires: self.configuration.expires });
          } else {
            $.removeCookie(cookie);
          }
        } else {
          return mapping.inputGetter();
        }
      };
    }
    for(var cookie in this.cookiesMapper) {
      makeAccessor(cookie);
    }
    this.registerListeners();
    this.initUi();
    this.updateRowVisibility();
    this.updatePageColor();
  };

  Settings.prototype = {
    registerListeners: function() {
      var self = this;

      this.eventBus.on("ended", function(e){
        if(self.settingsChanged) {
          self.reload();
        }
      });
      this.resolutionTypeSelect.bind('change', function(e){
        self.updateResolutionSelectVisibility();
      });
      this.settingsIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.toggled = !self.toggled;
        self.client.updateClientClass();
      });

      this.colorInput.bind('change', function(e){
        self.updatePageColor();
      });
      this.clearLink.on('click', function(e) {
        e.preventDefault();
        self.clear();
        self.eventBus.message('Settings cleared');
      });
      this.save.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.persist();
        self.settingsUi.fadeOut(100);
        if(!self.sipStack.activeSession) {
          self.reload();
        } else {
          self.settingsChanged = true;
        }
      });
      this.bandwidthLowInput.bind('blur', function(e)
      {
        self.client.sipStack.updateRtcMediaHandlerOptions();
      });
      this.bandwidthMedInput.bind('blur', function(e)
      {
        self.client.sipStack.updateRtcMediaHandlerOptions();
      });
      this.bandwidthHighInput.bind('blur', function(e)
      {
        self.client.sipStack.updateRtcMediaHandlerOptions();
      });
      this.resolutionType.bind('change', function(e)
      {
        self.client.updateClientClass();
        self.client.sipStack.updateRtcMediaHandlerOptions();
        self.client.sipStack.updateUserMedia();
      });
      this.resolutionDisplayWidescreen.bind('change', function(e)
      {
        self.client.updateClientClass();
      });
      this.resolutionDisplayStandard.bind('change', function(e)
      {
        self.client.updateClientClass();
      });
      this.resolutionEncodingWidescreen.bind('change', function(e)
      {
        self.client.sipStack.updateRtcMediaHandlerOptions();
        self.client.sipStack.updateUserMedia();
      });
      this.resolutionEncodingStandard.bind('change', function(e)
      {
        self.client.sipStack.updateRtcMediaHandlerOptions();
        self.client.sipStack.updateUserMedia();
      });
    },
    updateRowVisibility: function(){
      this.settingAutoAnswerRow.toggle(this.configuration.enableAutoAnswer);
      this.settingSelfViewDisableRow.toggle(!this.configuration.hasOwnProperty("enableSelfView"));
      this.settingHDRow.toggle(!this.configuration.hasOwnProperty("enableHD"));
      this.settingResolutionRow.toggle(!this.configuration.hasOwnProperty("displayResolution") || !this.configuration.hasOwnProperty("encodingResolution"));
      this.settingResolutionDisplayRow.toggle(!this.configuration.hasOwnProperty("displayResolution"));
      this.settingResolutionEncodingRow.toggle(!this.configuration.hasOwnProperty("encodingResolution"));
      this.settingResolutionTypeRow.toggle(!this.configuration.hasOwnProperty("displayResolution") && !this.configuration.hasOwnProperty("encodingResolution"));
      this.bandwidthLowInput.toggle(!this.configuration.hasOwnProperty("bandwidthLow"));
      this.bandwidthMedInput.toggle(!this.configuration.hasOwnProperty("bandwidthMed"));
      this.bandwidthHighInput.toggle(!this.configuration.hasOwnProperty("bandwidthHigh"));
      this.settingBandwidthRow.toggle(!this.configuration.hasOwnProperty("bandwidthLow") || !this.configuration.hasOwnProperty("bandwidthMed") || !this.configuration.hasOwnProperty("bandwidthHigh"));
      this.settingDisplayNameRow.toggle(!this.configuration.hasOwnProperty("displayName"));
    },
    getBandwidth: function(){
      var height = this.getResolutionEncodingHeight();
      if(height <= 240) {
        return this.bandwidthLowInput.val();
      } else if(height <= 480) {
        return this.bandwidthMedInput.val();
      } else if(height <= 720) {
        return this.bandwidthHighInput.val();
      }
    },
    reload: function(){
      location.reload(0);
    },
    updatePageColor: function(){
      var color = this.configuration.getBackgroundColor();
      logger.log('updating page color : '+color, this.configuration);
      $('body').css('backgroundColor', color || '');
    },
    initUi: function(){
      WebRTC.Utils.addSelectOptions(WebRTC.C.RESOLUTION_TYPES, this.resolutionType);
      WebRTC.Utils.addSelectOptions(WebRTC.C.STANDARD_RESOLUTIONS, this.resolutionDisplayStandard);
      WebRTC.Utils.addSelectOptions(WebRTC.C.WIDESCREEN_RESOLUTIONS, this.resolutionDisplayWidescreen);
      WebRTC.Utils.addSelectOptions(WebRTC.C.STANDARD_RESOLUTIONS, this.resolutionEncodingStandard);
      WebRTC.Utils.addSelectOptions(WebRTC.C.WIDESCREEN_RESOLUTIONS, this.resolutionEncodingWidescreen);

      for(var cookie in this.cookiesMapper) {
        var mapping = this.cookiesMapper[cookie];
        var value = mapping.initValue ? mapping.initValue() : $.cookie(cookie);
        mapping.inputSetter(value);
      }
      this.updateViewPositions();
    },
    updateViewPositions: function(){
      var localVideoPosition = this.client.video.local.position();
      if (localVideoPosition && localVideoPosition.top !== 0 && localVideoPosition.left !== 0)
      {
        this.localVideoTop.val(localVideoPosition.top);
        this.localVideoLeft.val(localVideoPosition.left);
      }
      var callHistoryPosition = this.client.callHistory.position();
      if (callHistoryPosition && callHistoryPosition.top !== 0 && callHistoryPosition.left !== 0)
      {
        this.settingCallHistoryTop.val(callHistoryPosition.top);
        this.settingCallHistoryLeft.val(callHistoryPosition.left);
      }
      var callStatsPosition = this.client.callStats.position();
      if (callStatsPosition && callStatsPosition.top !== 0 && callStatsPosition.left !== 0)
      {
        this.settingCallStatsTop.val(callStatsPosition.top);
        this.settingCallStatsLeft.val(callStatsPosition.left);
      }
    },
    updateResolutionSelectVisibility: function(){
      var resolutionType = this.resolutionType.val();
      this.resolutionDisplayWidescreen.hide();
      this.resolutionDisplayStandard.hide();
      this.resolutionEncodingWidescreen.hide();
      this.resolutionEncodingStandard.hide();
      if(resolutionType === WebRTC.C.STANDARD) {
        this.resolutionDisplayStandard.show();
        this.resolutionEncodingStandard.show();
      } else if(resolutionType === WebRTC.C.WIDESCREEN) {
        this.resolutionDisplayWidescreen.show();
        this.resolutionEncodingWidescreen.show();
      }
    },

    setResolutionDisplay: function(resolution){
      this.setResolution(resolution, this.resolutionDisplayStandard, this.resolutionDisplayWidescreen);
    },
    setResolutionEncoding: function(resolution){
      this.setResolution(resolution, this.resolutionEncodingStandard, this.resolutionEncodingWidescreen);
    },
    setResolution: function(resolution, resolutionStandard, resolutionWidescreen){
      if(WebRTC.Utils.containsKey(WebRTC.C.STANDARD_RESOLUTIONS, resolution)) {
        this.resolutionType.val(WebRTC.C.STANDARD);
        resolutionStandard.val(resolution);
      } else if(WebRTC.Utils.containsKey(WebRTC.C.WIDESCREEN_RESOLUTIONS, resolution)) {
        this.resolutionType.val(WebRTC.C.WIDESCREEN);
        resolutionWidescreen.val(resolution);
      } else {
        logger.error('no resolution type for '+resolution);
      }
      this.updateResolutionSelectVisibility();
    },
    getResolutionDisplay: function(){
      return this.getResolution(this.resolutionDisplayStandard, this.resolutionDisplayWidescreen);
    },
    getResolutionEncodingWidth: function(){
      var resolution = this.getResolutionEncoding();
      if(!$.isBlank(resolution)) {
        var resolutions = resolution.split('x');
        return parseInt(resolutions[0], 10);
      }
    },
    getResolutionEncodingHeight: function(){
      var resolution = this.getResolutionEncoding();
      if(!$.isBlank(resolution)) {
        var resolutions = resolution.split('x');
        return parseInt(resolutions[1], 10);
      }
    },
    getResolutionEncoding: function(){
      return this.getResolution(this.resolutionEncodingStandard, this.resolutionEncodingWidescreen);
    },
    getResolution: function(resolutionStandard, resolutionWidescreen){
      var resolutionType = this.resolutionType.val();
      if(resolutionType === WebRTC.C.STANDARD) {
        return resolutionStandard.val();
      } else if(resolutionType === WebRTC.C.WIDESCREEN) {
        return resolutionWidescreen.val();
      } else {
        return false;
      }
    },
    clear: function(){
      for(var cookie in this.cookiesMapper) {
        var mapping = this.cookiesMapper[cookie];
        this[mapping.name](null);
      }
    },
    persist: function(){
      for(var cookie in this.cookiesMapper) {
        var mapping = this.cookiesMapper[cookie];
        $.cookie(cookie, mapping.inputGetter(), { expires: this.configuration.expires });
      }
    }
  };

  WebRTC.Settings = Settings;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function (WebRTC) {
  var History;

  History = function (client, sound, stats, sipStack, configuration) {
    this.callHistory = client.find('.callHistory');
    this.content = this.callHistory.find('.content');
    this.historyForward = this.callHistory.find('.historyForward');
    this.historyBack = this.callHistory.find('.historyBack');
    this.callHistoryDetails = this.callHistory.find('.callHistoryDetails');
    this.historyDetailsClose = this.callHistory.find('.historyDetailsClose');
    this.resolutionIn = this.callHistory.find('.resolutionIn');
    this.resolutionOut = this.callHistory.find('.resolutionOut');
    this.bitrateIn = this.callHistory.find('.bitrateIn');
    this.bitrateOut = this.callHistory.find('.bitrateOut');
    this.frameRateIn = this.callHistory.find('.frameRateIn');
    this.frameRateOut = this.callHistory.find('.frameRateOut');
    this.audioLostPer = this.callHistory.find('.audioLostPer');
    this.videoLostPer = this.callHistory.find('.videoLostPer');
    this.jitter = this.callHistory.find('.jitter');
    this.historyClear = this.callHistory.find(".historyClear");
    this.historyCallLink = this.callHistory.find(".historyCallLink");

    this.pageNumber = 0;
    this.historyToggled = false;
    this.configuration = configuration;
    this.client = client;
    this.sound = sound;
    this.stats = stats;
    this.sipStack = sipStack;
    this.callsPerPage = 10;
    this.maxPages = 25;
    this.rows = [];

    this.registerListeners();

    this.updateContent();
  };

  History.Page = function (number, callsValue) {
    this.number = number;
    this.calls = this.parseCalls(callsValue);
  };

  History.Page.prototype = {
    callsAsString: function () {
      return this.calls.map(function(call){return call.toString();}).join("~");
    },
    parseCalls: function (callsValue) {
      var calls = [];
      if(callsValue.trim().length > 0) {
        var callsArray = callsValue.split("~");
        for(var i=0; i<callsArray.length; i++){
          calls.push(new History.Call(callsArray[i]));
        }
      }
      return calls;
    }
  };

  History.Call = function (value) {
    var values = value ? value.split("|") : [];
    this.startTime = values[0];
    this.destination = values[1];
    this.direction = values[2];
    this.resolutionIn = values[3];
    this.resolutionOut = values[4];
    this.bitrateIn = values[5];
    this.bitrateOut = values[6];
    this.frameRateIn = values[7];
    this.frameRateOut = values[8];
    this.audioLostPer = values[9];
    this.videoLostPer = values[10];
    this.jitter = values[11];
    this.length = values[12];
  };

  History.Call.prototype = {
    startDate: function(){
      var date = new Date();
      date.setTime(this.startTime);
      return date.toLocaleString();
    },
    destinationWithoutSip: function(){
      return this.destination.replace(/sip:([^@]+)@.+/, "$1");
    },
    toString: function(){
      var values = [this.startTime, this.destination, this.direction, this.resolutionIn, this.resolutionOut, this.bitrateIn,
        this.bitrateOut, this.frameRateIn, this.frameRateOut, this.audioLostPer, this.videoLostPer, this.jitter, this.length];
      return values.join("|");
    }
  };

  History.prototype = {
    pages: function(){
      var pages = [];
      for(var i=0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var regex = new RegExp(/page_(.*)/g);
        var match = regex.exec(key);
        if(match != null && match.length > 1) {
          var value = localStorage.getItem(key);
          var page = new History.Page(parseInt(match[1], 10), value);
          pages.push(page);
        }
      }
      // sort pages descendingly
      pages.sort(function(page1, page2) {
        return page2.number - page1.number;
      });
      return pages;
    },

    updateButtonsVisibility: function() {
      var pages = this.pages();
      var pagesCount = pages ? pages.length - 1 : 0;
      if (this.pageNumber < pagesCount) {
        this.historyForward.show();
      }
      else {
        this.historyForward.hide();
      }
      if (this.pageNumber > 0) {
        this.historyBack.show();
      }
      else {
        this.historyBack.hide();
      }
    },

    updateContent: function() {
      this.content.html("");
      this.rows = [];
      this.updateButtonsVisibility();
      var calls = this.getAllCalls();
      var startPos = this.callsPerPage * this.pageNumber;
      for (var i = startPos; i < startPos + this.callsPerPage && i < calls.length; i++) {
        var row = this.client.find('.historyRowSample').clone();
        row.attr('id', '');
        row.attr('class', 'history-row');
        var call = calls[i];
        row.bind("click", this.callDetailsHandler(call));
        row.find(".historyCall").text((this.pageNumber * 10) + i + 1);
        row.find(".historyDestination").text(call.destinationWithoutSip());
        row.find(".historyDirection").text(call.direction);
        row.find(".historyDate").text(call.startDate());
        row.find(".historyLength").text(call.length);
        this.rows.push(row);
        row.appendTo(this.content);
      }
    },

    getAllCalls:function () {
      var pages = this.pages();
      var calls = [];
      for(var i=0; i<pages.length; i++) {
        calls = calls.concat(pages[i].calls);
      }
      return calls;
    },

    callDetailsHandler:function (call) {
      var self = this;
      return function (e) {
        e.preventDefault();
        self.resolutionIn.text(call.resolutionIn);
        self.resolutionOut.text(call.resolutionOut);
        self.bitrateIn.text(call.bitrateIn);
        self.bitrateOut.text(call.bitrateOut);
        self.frameRateIn.text(call.frameRateIn);
        self.frameRateOut.text(call.frameRateOut);
        self.audioLostPer.text(call.audioLostPer);
        self.videoLostPer.text(call.videoLostPer);
        self.jitter.text(call.jitter);
        self.historyCallLink.attr("data-destination", call.destination);
        self.historyCallLink.text("Call "+call.destinationWithoutSip());
        self.callHistoryDetails.fadeIn(100);
      };
    },

    setPageNumber: function(pageNumber) {
      this.pageNumber = pageNumber;
      this.updateContent();
    },

    registerListeners:function () {
      var self = this;

      this.historyForward.bind('click', function (e) {
        e.preventDefault();
        self.sound.playClick();
        self.setPageNumber(self.pageNumber + 1);
      });

      this.historyBack.bind('click', function (e) {
        e.preventDefault();
        self.sound.playClick();
        self.setPageNumber(self.pageNumber - 1);
      });

      this.historyDetailsClose.bind('click', function (e) {
        e.preventDefault();
        self.callHistoryDetails.fadeOut(100);
      });

      this.historyCallLink.bind('click', function (e) {
        e.preventDefault();
        if(self.sipStack.getCallState() === WebRTC.SIPStack.C.STATE_CONNECTED) {
          self.sound.playClick();
          var destination = self.historyCallLink.attr("data-destination");
          self.client.destination.val(destination);
          self.client.callUri(destination);
        }
        self.callHistoryDetails.hide();
      });

      this.historyClear.bind('click', function (e) {
        e.preventDefault();
        self.sound.playClick();
        var pages = self.pages();
        for (var i = 0; i < pages.length; i++) {
          localStorage.removeItem("page_" + (pages[i].number));
        }
        self.setPageNumber(0);
      });
    },

    persistPage:function (page) {
      var key = ("page_" + page.number);
      var value = page.callsAsString();
      localStorage[key] = value;
    },

    persistCall:function (rtcSession) {
      if (!this.configuration.enableCallHistory) {
        return;
      }
      // Get latest cookie
      var pages = this.pages();
      var page = null;
      if (pages.length > 0) {
        page = pages[0];
      }
      else {
        page = new History.Page(0, "");
      }

      if(page.calls.length >= this.callsPerPage) {
        if(page.number+1 >= this.maxPages) {
          // remove oldest call and reorder calls to each page
          for(var i=0; i<pages.length; i++) {
            var lastPageCall = pages[i].calls.pop();
            if(i+1 < pages.length) {
              pages[i+1].calls.unshift(lastPageCall);
            }
            this.persistPage(pages[i]);
          }
        } else {
          page = new History.Page(page.number+1, "");
        }
      }

      // cookie vars
      var call = this.createCall(rtcSession);
      page.calls.unshift(call);
      this.persistPage(page);
      this.updateContent();
    },

    createCall: function(rtcSession) {
      var call = new History.Call();
      var start = rtcSession.start_time;
      call.startTime = new Date(start).getTime();
      call.destination = rtcSession.remote_identity.uri;
      if (rtcSession.direction === "outgoing") {
        call.direction = "------>";
      }
      else {
        call.direction = "<------";
      }
      call.resolutionIn = this.stats.getValue("video", "googFrameWidthReceived")+"x"+this.stats.getValue("video", "googFrameHeightReceived");
      call.resolutionOut = this.stats.getValue("video", "googFrameWidthSent")+"x"+this.stats.getValue("video", "googFrameHeightSent");
      call.bitrateIn = this.stats.getAvg("video", "kiloBitsReceivedPerSecond");
      call.bitrateOut = this.stats.getAvg("video", "kiloBitsSentPerSecond");
      call.frameRateIn = this.stats.getAvg("video", "googFrameRateReceived");
      call.frameRateOut = this.stats.getAvg("video", "googFrameRateSent");
      call.audioLostPer = this.stats.getAvg("audio", "packetsLostPer");
      call.videoLostPer = this.stats.getAvg("video", "packetsLostPer");
      call.jitter = this.stats.getAvg("audio", "googJitterReceived");
      call.length = WebRTC.Utils.format(Math.round(Math.abs((rtcSession.end_time - start) / 1000)));
      return call;
    },

    toggle:function () {
      if (this.configuration.enableCallHistory === true) {
        if (this.historyToggled === false) {
          this.callHistory.fadeIn(100);
          this.historyClear.fadeIn(100);
        }
        else if (this.historyToggled === true) {
          this.callHistory.fadeOut(100);
          this.historyClear.fadeOut(100);
        }
      }
      this.historyToggled = !this.historyToggled;
    }
  };

  WebRTC.History = History;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function (WebRTC) {
  var Transfer;

  Transfer = function (client, sound, sipStack, configuration) {
    this.icon = client.find(".transfer");
    this.popup = client.find(".transferPopup");
    this.accept = this.popup.find(".acceptTransfer");
    this.reject = this.popup.find(".rejectTransfer");
    this.targetInput = this.popup.find(".transferTarget");
    this.typeAttended = this.popup.find(".transferTypeAttended");

    this.visible = false;
    this.client = client;
    this.sound = sound;
    this.sipStack = sipStack;
    this.configuration = configuration;

    this.registerListeners();
  };

  Transfer.prototype = {
    registerListeners: function () {
      var self = this;
      this.icon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.setVisible(!self.visible);
        if(self.visible) {
          self.targetInput.focus();
        }
      });

      this.accept.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        var targetInput = self.targetInput.val();
        if($.isBlank(targetInput)) {
          self.client.message(self.configuration.messageOutsideDomain, "alert");
          return;
        }
        targetInput = self.client.validateDestination(targetInput);
        self.setVisible(false);
        self.sipStack.transfer(targetInput, self.typeAttended.is(':checked'));
      });

      this.reject.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.setVisible(false);
      });
    },

    setVisible: function(visible){
      this.visible = visible;
      this.client.updateClientClass();
    }
  };

  WebRTC.Transfer = Transfer;
}(WebRTC));



/**
 * @fileoverview ExSIP Constants
 */

/**
 * ExSIP Constants.
 * @augments ExSIP
 */

(function(WebRTC) {
  var C= {
    WIDESCREEN: 'widescreen',
    STANDARD: 'standard',
    R_1280x720: '1280x720',
    R_640x360: '640x360',
    R_320x180: '320x180',
    R_960x720: '960x720',
    R_640x480: '640x480',
    R_320x240: '320x240',
    DEFAULT_DURATION:        200,
    DEFAULT_INTER_TONE_GAP:  50
  };
  C.DEFAULT_RESOLUTION_ENCODING = C.R_640x480;
  C.DEFAULT_RESOLUTION_DISPLAY = C.R_640x480;
  C.RESOLUTION_TYPES = {'standard': C.STANDARD, 'widescreen': C.WIDESCREEN};
  C.STANDARD_RESOLUTIONS = {'960 x 720': C.R_960x720, '640 x 480': C.R_640x480, '320 x 240': C.R_320x240};
  C.WIDESCREEN_RESOLUTIONS = {'1280 x 720': C.R_1280x720, '640 x 360': C.R_640x360, '320 x 180': C.R_320x180};

  WebRTC.C = C ;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var Timer,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'Timer');

  Timer = function(client, stats, configuration) {
    this.text = client.find(".timer");

    this.client = client;
    this.stats = stats;
    this.configuration = configuration;
    this.callTimer = null;
    this.startTime = null;

    this.updateText();
  };

  Timer.prototype = {
    start: function()
    {
      if(this.callTimer) {
        logger.log('timer '+this.callTimer+' already running', this.configuration);
        return;
      }

      var timer = this.runningTimer();
      this.callTimer = setInterval(timer, 1000);
      logger.log("started timer interval : "+this.callTimer, this.configuration);
    },

    stop: function()
    {
      this.startTime = null;
      clearInterval(this.callTimer);
      logger.log("cleared timer interval : "+this.callTimer, this.configuration);
      this.callTimer = null;
      this.updateText();
    },

    getSeconds: function()
    {
      return Math.round((new Date().getTime() - (this.startTime || new Date().getTime())) / 1000);
    },

    updateText: function()
    {
      var secs = this.getSeconds();
      this.text.text(WebRTC.Utils.format(secs));
    },

// Display the timer on the screen
    runningTimer: function()
    {
      var self = this;
      this.startTime = new Date().getTime();
      return function ()
      {
        var secs = self.getSeconds();
        if (self.configuration.maxCallLength && secs >= self.configuration.maxCallLength)
        {
          self.client.terminateSessions();
          self.client.endCall();
          return;
        }
        self.updateText();
        if (self.configuration.enableCallStats && WebRTC.Utils.isChrome())
        {
          self.stats.processStats();
        }
      };
    }
  };

  WebRTC.Timer = Timer;
}(WebRTC));



(function(WebRTC) {
  var Stats;

  Stats = function(client, sipStack, configuration) {
    this.ui = client.find('.callStats');

    this.statsToggled = false;
    this.sipStack = sipStack;
    this.configuration = configuration;

    this.initialize();
  };

  Stats.prototype = {
    toggle: function()
    {
      if (this.configuration.enableCallStats)
      {
        if (this.statsToggled === false)
        {
          this.ui.fadeIn(100);
        }
        else if (this.statsToggled === true)
        {
          this.ui.fadeOut(100);
        }
      }
      this.statsToggled = !this.statsToggled;
    },

    getReportById: function(reports, id)
    {
      for(var i = 0; i < reports.length; i++)
      {
        if(reports[i].id === id)
        {
          return reports[i];
        }
      }
      return null;
    },

    processStats: function() {
      var self = this;

      var peerConnection = this.sipStack.activeSession.rtcMediaHandler.peerConnection;

      peerConnection.getStats(function (stats)
      {
        var results = stats.result();
        var reports = [];
        for (var i = 0; i < results.length; ++i)
        {
          var res = results[i];
          var report = self.getReportById(reports, res.id);
          if(!report)
          {
            report = {};
            report["type"] = res.type;
            report["id"] = res.id;
          }

          var names = res.names();
          var values = [];
          for(var j = 0; j < names.length; j++)
          {
            var name = names[j];
            if(!name)
            {
              continue;
            }
            var value = res.stat(name);
            values.push(name);
            values.push(value);
          }
          var valueObj = {};
          valueObj["timestamp"] = res.timestamp;
          valueObj["values"] = values;
          report["stats"] = valueObj;
          reports.push(report);
        }
        var data = {"lid":1,"pid":self.sipStack.getSessionId(),"reports":reports};
        addStats(data);
      });
    },

    getDataSerie: function(type, label, sessionId) {
      var dataSeries = getDataSeriesByLabel(sessionId || this.sipStack.getSessionId(), type, label);
      var result;
      for(var i = 0; i < dataSeries.length; i++) {
        var dataSerie = dataSeries[i];
        if(!result || dataSerie.getAvg() > result.getAvg()) {
          result = dataSerie;
        }
      }
      return result;
    },

    getStatValues: function(type, label, sessionId) {
      var dataSerie = this.getDataSerie(type, label, sessionId);
      return dataSerie ? dataSerie.dataPoints_.map(function(e){return e.value;}) : null;
    },

    getStatAvg: function(type, label, sessionId) {
      var dataSerie = this.getDataSerie(type, label, sessionId);
      return dataSerie ? dataSerie.getAvg() : null;
    },

    setSelected: function(id, parentSelector, selected) {
      if (arguments.length === 2) {
        selected = true;
      }
      var className = id.replace(/\d+/g, '');
      var classes = jQuery.grep($(parentSelector).attr('class').split(" "), function(n, i){
        return n.indexOf(className) === -1;
      });
      if(selected) {
        classes.push(id+'-selected');
        if(id !== className) {
          classes.push(className+'-selected');
        }
      }
      var classNames = classes.join(" ");
      $(parentSelector).attr('class', classNames);

    },

    getValue: function(type, name) {
      return $('[data-type="'+type+'"][data-var="'+name+'"]').text();
    },

    getAvg: function(type, name) {
      return Math.round(($('[data-type="'+type+'"][data-var="'+name+'"]').attr("data-avg") * 100)) / 100.0;
    },

    initialize: function() {
      var self = this;
      $("a.stats-var").click(function(){
        var index = $(".stats-var").index($(this)[0]);
        self.setSelected("stats"+index, this.callStats);
      });
    }
  };

  WebRTC.Stats = Stats;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
var Utils;

Utils= {
  format: function(seconds)
  {
    var hrs = Math.floor(seconds / 3600);
    seconds %= 3600;
    var mns = Math.floor(seconds / 60);
    seconds %= 60;
    var formatedDuration = (hrs < 10 ? "0" : "") + hrs + ":" + (mns < 10 ? "0" : "") + mns + ":" + (seconds < 10 ? "0" : "") + seconds;
    return(formatedDuration);
  },

  /* Pull the URL variables out of URL */
  getSearchVariable: function(variable)
  {
    var search = decodeURIComponent(window.location.search.substring(1));
    var vars = search.split("&");
    for (var i=0;i<vars.length;i++)
    {
      var pair = vars[i].split("=");
      if(pair[0] === variable)
      {
        return pair[1];
      }
    }
    return false;
  },

  containsKey: function(object, value) {
    return $.inArray(value, $.map(object, function(key, value) { return key; })) !== -1;
  },

  containsValue: function(object, value) {
    return $.inArray(value, $.map(object, function(key, value) { return value; })) !== -1;
  },

  addSelectOptions: function(options, selector) {
    $.each(options, function(key, value) {
      $(selector)
        .append($('<option>', { value : value })
        .text(key));
    });
  },

  // Generate a random userid
  randomUserid: function()
  {
    var chars = "0123456789abcdef";
    var string_length = 10;
    var userid = '';
    for (var i=0; i<string_length; i++)
    {
      var rnum = Math.floor(Math.random() * chars.length);
      userid += chars.substring(rnum,rnum+1);
    }
    return userid;
  },

  compatibilityCheck: function(client)
  {
    var isChrome = this.isChrome();
    var isFirefox = this.isFirefox();

    // Only Chrome 25+ and Firefox 22+ are supported
    if (!isChrome && !isFirefox)
    {
      return "Chrome or Firefox is required, please go to:<br>" +
        "<a href='http://chrome.google.com'>http://chrome.google.com</a> or <a href='http:www.mozilla.org'>http://www.mozilla.org</a>";
    }
    var major = this.majorVersion();
    if (isChrome && major < 25)
    {
      return "Your version of Chrome must be upgraded to at least version 25<br>" +
        "Please go to: <a href='http://chrome.google.com'>http://chrome.google.com</a>";
    }
    else
    {
      if (isFirefox && major < 22)
      {
        return "Your version of Firefox must be upgraded to at least version 22y<br>" +
          "Please go to: <a href='http://www.mozilla.org'>http://www.mozilla.org</a>";
      }
      client.configuration.enableStats = false;
    }
  },

  majorVersion: function(){
    return detect.parse(navigator.userAgent).browser.major;
  },

  isChrome: function(){
    var ua = detect.parse(navigator.userAgent);
    return (/chrom(e|ium)/).test(ua.browser.family.toLowerCase());
  },

  isFirefox: function(){
    var ua = detect.parse(navigator.userAgent);
    return (/firefox/).test(ua.browser.family.toLowerCase());
  },

  rebindListeners: function(type, elements, listener){
    for(var i=0; i<elements.length; i++) {
      this.rebindListener(type, elements[i], listener);
    }
  },

  rebindListener: function(type, element, listener){
    element.off(type);
    element.on(type, listener);
  },

  colorNameToHex: function(color){
    if(!color) {
      return false;
    }
    var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
      "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
      "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
      "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
      "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
      "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
      "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
      "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
      "honeydew":"#f0fff0","hotpink":"#ff69b4",
      "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
      "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
      "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
      "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
      "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
      "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
      "navajowhite":"#ffdead","navy":"#000080",
      "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
      "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
      "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
      "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
      "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
      "violet":"#ee82ee",
      "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
      "yellow":"#ffff00","yellowgreen":"#9acd32","transparent":"transparent"};

    if (typeof colors[color.toLowerCase()] !== 'undefined') {
      return colors[color.toLowerCase()];
    }

    return this.isHexColor(color) ? (color.indexOf("#") !== -1 ? color : "#"+color) : false;
  },

  isHexColor: function(color) {
    return (/(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(color));
  },

  parseDTMFTones: function(destination) {
    if(!destination) {
      return null;
    }
    var dtmfMatch = destination.match(/,[0-9A-D#*,]+/, '');
    return dtmfMatch ? dtmfMatch[0] : null;
  }
};

WebRTC.Utils = Utils;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var Sound;
//    LOG_PREFIX = WebRTC.name +' | '+ 'Configuration' +' | ';

  Sound = function(sipStack, configuration, eventBus) {
    this.sipStack = sipStack;
    this.eventBus = eventBus;
    this.soundOut = document.createElement("audio");
    this.soundOut.volume = configuration.volumeClick;
    this.soundOutDTMF = document.createElement("audio");
    this.soundOutDTMF.volume = configuration.volumeDTMF;
    this.muted = false;

    this.registerListeners();
  };

  Sound.prototype = {
    registerListeners: function() {
      var self = this;
      this.eventBus.on("resumed", function(e){
        self.updateLocalAudio();
      });
      this.eventBus.on("started", function(e){
        self.updateLocalAudio();
      });
      this.eventBus.on("userMediaUpdated", function(e){
        self.updateLocalAudio();
      });
    },
      
    setMuted: function(muted) {
      this.muted = muted;
      this.eventBus.viewChanged(this);
      this.updateLocalAudio();
    },
      
    updateLocalAudio: function() {
      this.enableLocalAudio(!this.muted);
    },

    enableLocalAudio: function(enabled) {
      var localStreams = this.sipStack.getLocalStreams();
      if(!localStreams) {
        return;
      }
      var localMedia = localStreams[0];
      var localAudio = localMedia.getAudioTracks()[0];
      localAudio.enabled = enabled;
    },

    pause: function(){
      this.soundOut.pause();
      this.soundOutDTMF.pause();
    },

    playDtmfRingback: function(){
      this.playDtmf("media/dtmf-ringback.ogg", {loop: true});
    },

    playRingtone: function(){
      this.play("media/ringtone.ogg", {loop: true});
    },

    playDtmfTone: function(tone){
      this.playDtmf("media/dtmf-" + tone + ".ogg");
    },

    playClick: function(){
      this.play("media/click.ogg");
    },

    play: function(media, options){
      this.playTone(this.soundOut, media, options);
    },

    playTone: function(audioSource, media, options){
      // avoid restarting same playing audio
      if(audioSource.getAttribute("src") === media && !audioSource.paused) {
        return;
      }
      options = options || {};
      audioSource.setAttribute("src", media);
      if(options.loop) {
        audioSource.setAttribute("loop", "true");
      } else {
        audioSource.removeAttribute("loop");
      }
      audioSource.play();
    },

    playDtmf: function(media, options){
      this.playTone(this.soundOutDTMF, media, options);
    }
  };

  WebRTC.Sound = Sound;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var Video,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'Video');

  Video = function(element, sipStack, eventBus, options) {
    this.ui = element;
    this.local = this.ui.find('.localVideo');
    this.remote = this.ui.find('.remoteVideo');
    this.eventBus = eventBus;

    this.options = options || {};
    this.sipStack = sipStack;
    this.registerListeners();
  };

  Video.prototype = {
    registerListeners: function(){
      var self = this;
      this.local.bind("playing", function(){
        self.options.onPlaying();
      });
      this.eventBus.on("userMediaUpdated", function(e){
        self.updateStreams([e.data.localStream], []);
      });
    },

    updateSessionStreams: function() {
      this.updateStreams(this.sipStack.getLocalStreams(), this.sipStack.getRemoteStreams());
    },

    updateStreams: function(localStreams, remoteStreams) {
      logger.log("updating video streams", this.eventBus);
      this.setVideoStream(this.local[0], localStreams);
      this.setVideoStream(this.remote[0], remoteStreams);
    },

    localWidth: function(){
      return this.local[0].videoWidth;
    },

    localHeight: function(){
      return this.local[0].videoHeight;
    },

    setVideoStream: function(video, streams) {
      var hasStream = streams && streams.length > 0 && typeof(streams[0]) !== 'undefined' && !streams[0].ended;
      if (video && video.mozSrcObject !== undefined) {
        if(hasStream) {
          video.mozSrcObject = streams[0];
          video.play();
        }  else {
          video.mozSrcObject = null;
        }
      } else if(video) {
        if(hasStream) {
          video.src = (window.URL && window.URL.createObjectURL(streams[0])) || streams[0];
        }
        else {
          video.src = "";
        }
      }
    }

};

  WebRTC.Video = Video;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function(WebRTC) {
  var SIPStack,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'SIPStack'),
    C = {
      // RTCSession states
      STATE_CONNECTED:    "connected",
      STATE_DISCONNECTED: "disconnected",
      STATE_CALLING:      "calling",
      STATE_STARTED:      "started",
      STATE_HELD:         "held"
    };

  SIPStack = function(configuration, eventBus) {
    this.configuration = configuration;
    this.eventBus = eventBus;
    this.ua = null;
    this.activeSession = null;
    this.sessions = [];
  };

  SIPStack.prototype = {
    getLocalStreams: function(){
      return this.activeSession ? this.activeSession.getLocalStreams() : null;
    },

    getRemoteStreams: function(){
      return this.activeSession ? this.activeSession.getRemoteStreams() : null;
    },

    getSessionId: function(){
      return this.activeSession.id.replace(/\./g,'');
    },

    terminateSession: function(session){
      session = session || this.activeSession;
      if(!session) {
        return;
      }
      var index = this.sessions.indexOf(session);
      if(index !== -1) {
        this.sessions.splice(index, index+1);
      }
      if(session.status !== ExSIP.RTCSession.C.STATUS_TERMINATED) {
        session.terminate();
      }
      if(session === this.activeSession) {
        logger.log("clearing active session", this.configuration);
        this.activeSession = null;
      }
      this.eventBus.viewChanged(this);
    },

    terminateSessions: function(){
      var allSessions = [];
      allSessions = allSessions.concat(this.sessions);
      for(var i=0; i<allSessions.length; i++){
        this.terminateSession(allSessions[i]);
      }
    },

    holdAndAnswer: function(session){
      var self = this;
      var firstSession = this.activeSession;
      session.on('ended', function(e) {
        self.eventBus.message("Resuming with " + firstSession.remote_identity.uri.user, "normal");
        logger.log("incoming call ended - unholding first call", self.configuration);
        firstSession.unhold(function() {
          logger.log("unhold first call successful", self.configuration);
        });
      });
      this.activeSession.hold(function(){
        logger.log("hold successful - answering incoming call", self.configuration);
        self.answer(session);
      });
    },

    answer: function(session){
      session.answer(this.configuration.getExSIPOptions());
    },

    hold: function(successCallback, failureCallback){
      if(this.activeSession) {
        this.activeSession.hold(successCallback, failureCallback);
      }
    },

    unhold: function(successCallback, failureCallback){
      if(this.activeSession) {
        this.activeSession.unhold(successCallback, failureCallback);
      }
    },

    call: function(destination){
      var self = this;
      var session = this.ua.call(destination, this.configuration.getExSIPOptions());
      session.on('failed', function(e)
      {
        self.eventBus.failed(e.sender, e.data);
      });
      this.eventBus.calling(session);
    },

    sendDTMF: function(digit) {
      this.activeSession.sendDTMF(digit, this.configuration.getDTMFOptions());
    },

    isStarted: function() {
      return this.getCallState() === C.STATE_STARTED;
    },

    transfer: function(transferTarget, isAttended) {
      if(isAttended) {
        this.ua.attendedTransfer(transferTarget, this.activeSession);
      } else {
        this.ua.transfer(transferTarget, this.activeSession);
      }
    },

    updateRtcMediaHandlerOptions: function(){
      if(typeof(this.ua) === 'undefined') {
        return;
      }

      this.ua.setRtcMediaHandlerOptions(this.configuration.getRtcMediaHandlerOptions());
    },

    getCallState: function(){
      if(this.sessions.length > 0) {
        if(this.sessions.length === 1 && !this.sessions[0].isStarted()) {
          return C.STATE_CALLING;
        } else {
          if(this.activeSession && this.activeSession.isHeld()) {
            return C.STATE_STARTED + " " + C.STATE_HELD;
          } else {
            return C.STATE_STARTED;
          }
        }
      } else {
        if(this.ua && this.ua.isConnected()) {
          return C.STATE_CONNECTED;
        } else {
          return C.STATE_DISCONNECTED;
        }
      }
    },

    updateUserMedia: function(userMediaCallback){
      var self = this;
      if(this.configuration.enableConnectLocalMedia || this.activeSession) {
        // Connect to local stream
        var options = this.configuration.getExSIPOptions();
        logger.log("updating user media ...", self.configuration);
        this.ua.getUserMedia(options, function(localStream){
          self.eventBus.userMediaUpdated(localStream);
          if(self.activeSession) {
            logger.log("changing active session ...", self.configuration);
            self.activeSession.changeSession({localMedia: localStream, createOfferConstraints: options.createOfferConstraints}, function(){
              logger.log('change session succeeded', self.configuration);
            }, function(){
              logger.log('change session failed', self.configuration);
            });
          }

          if(userMediaCallback) {
            userMediaCallback(localStream);
          }
        }, function(){
          self.eventBus.message(this.configuration.messageGetUserMedia || "Get User Media Failed", "alert");
        }, true);
      }
    },

    // Incoming reinvite function
    incomingReInvite: function(e) {
      if (this.configuration.enableAutoAcceptReInvite) {
        logger.log("auto accepting reInvite", this.configuration);
        e.data.session.acceptReInvite();
      } else {
        this.eventBus.reInvite(e.data);
      }
    },

    incomingCall: function(evt)
    {
      var session = evt.data.session;
      if (!this.activeSession && this.configuration.isAutoAnswer())
      {
        session.answer(this.configuration.getExSIPOptions());
      }
      else
      {
        this.eventBus.incomingCall(evt.data);
      }
    },

    init: function(userid, password){
      var self = this;

      if(this.ua) {
        logger.log('stopping existing UA', this.configuration);
        this.ua.stop();
      }

      this.ua = new ExSIP.UA(this.configuration.getExSIPConfig(userid, password));

      this.updateRtcMediaHandlerOptions();

      // Start SIP Stack
      this.ua.start();

      // sipStack callbacks
      this.ua.on('connected', function(e)
      {
        self.eventBus.viewChanged(self);
        self.eventBus.connected(e.data);
      });
      this.ua.on('disconnected', function(e)
      {
        self.eventBus.viewChanged(self);
        self.eventBus.disconnected(e.data);
      });
      this.ua.on('onReInvite', function(e) {
        logger.log("incoming onReInvite event", self.configuration);
        self.incomingReInvite(e);
      });
      this.ua.on('newRTCSession', function(e)
      {
        var session = e.data.session;
        self.sessions.push(session);
        self.eventBus.viewChanged(self);

        // call event handlers
        session.on('progress', function(e)
        {
          self.eventBus.progress(e.sender, e.data);
        });
        session.on('failed', function(e)
        {
          self.eventBus.failed(e.sender, e.data);
        });
        session.on('started', function(e) {
          self.eventBus.viewChanged(self);
          self.eventBus.started(e.sender, e.data);
        });
        session.on('resumed', function(e) {
          self.eventBus.viewChanged(self);
          self.eventBus.resumed(e.sender, e.data);
        });
        session.on('held', function(e) {
          self.eventBus.viewChanged(self);
          self.eventBus.held(e.sender, e.data);
        });
        session.on('ended', function(e)
        {
          self.eventBus.ended(e.sender, e.data);
        });
        session.on('newDTMF', function(e)
        {
          self.eventBus.newDTMF(e.sender, e.data);
        });
        // handle incoming call
        if (e.data.session.direction === "incoming")
        {
          self.incomingCall(e);
        } else {
          if(!self.activeSession) {
            logger.log('new active session : '+session.id, self.configuration);
            self.activeSession = session;
          }
        }
      });

      this.ua.on('registered', function(e)
      {
        self.eventBus.registered();
      });
      this.ua.on('registrationFailed', function(e)
      {
        self.eventBus.registrationFailed(e.data);
      });
    }
  };
  WebRTC.SIPStack = SIPStack;
  WebRTC.SIPStack.C = C;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function (WebRTC) {
  var Icon;

  Icon = function (element, sound) {
    this.element = element;
    this.sound = sound;
    this.disabled = false;
  };

  Icon.prototype = {
    css: function (name) {
      return this.element.css(name);
    },
    attr: function (name) {
      return this.element.attr(name);
    },
    disable: function () {
      this.disabled = true;
    },
    enable: function () {
      this.disabled = false;
    },
    onClick: function(handler) {
      var self = this;
      this.element.bind("click", function(e){
        e.preventDefault();
        if(self.disabled) {
          return;
        }
        self.sound.playClick();
        handler(e);
      });
    }
  };

  WebRTC.Icon = Icon;
}(WebRTC));



/**
 * @fileoverview Utils
 */

(function (WebRTC) {
  var Authentication;

  Authentication = function (element, eventBus, options) {
    this.popup = element;
    this.okButton = this.popup.find('.authPopupButton');
    this.userIdInput = this.popup.find('input.username');
    this.passwordInput = this.popup.find('input.password');
    this.alert = this.popup.find('.alert');

    this.visible = false;
    this.eventBus = eventBus;
    this.options = options || {};

    this.registerListeners();
  };

  Authentication.prototype = {
    registerListeners: function () {
      var self = this;

      this.eventBus.on("registrationFailed", function(e){
        var statusCode = e.data.response.status_code;
        if(statusCode === 403 && self.options.settingsUserId() && !self.options.settingsPassword()) {
          self.setVisible(true);
        }
      });

      this.okButton.bind('click', function()
      {
        var userId = self.userIdInput.val();
        if (!userId)
        {
          self.alert.text("Invalid Username").fadeIn(10).fadeOut(4000);
          return;
        }
        var password = self.passwordInput.val();
        self.setVisible(false);
        self.options.onAuthenticate({userId: userId, password: password});
        self.eventBus.once("registered", function(e){
          if(self.options.settingsUserId() !== userId) {
            self.options.settingsAuthenticationUserId(userId);
          }
          self.options.settingsPassword(password);
        });
      });

      this.popup.bind('keypress', function(e)
      {
        if (e.which === 13)
        {
          self.okButton.click();
        }
      });
    },

    show: function(){
      this.setVisible(true);
    },

    setVisible: function(visible){
      this.visible = visible;

      this.userIdInput.val(this.options.settingsAuthenticationUserId() || this.options.settingsUserId());

      this.eventBus.viewChanged(this);
    }
  };

  WebRTC.Authentication = Authentication;
}(WebRTC));



/***************************************************
 * Created on Mon Jan 14 15:32:43 GMT 2013 by:
 * Nathan Stratton
 *
 * Copyright 2013 Broadsoft
 * http://www.broadsoft.com
 ***************************************************/
(function(WebRTC) {
  var Client,
    logger = new ExSIP.Logger(WebRTC.name +' | '+ 'Client');

  Client = function(selector, config) {
    var self = this;
    this.client = $(selector || "#client");
    this.main = this.client.find(".main");
    this.muteAudioIcon = this.client.find('.muteAudioIcon');
    this.unmuteAudioIcon = this.client.find('.unmuteAudioIcon');
    this.hangup = this.client.find(".hangup");
    this.callControl = this.client.find(".callControl");
    this.destination = this.callControl.find("input.destination");
    this.callButton = this.client.find('.call');
    this.reInvitePopup = this.client.find('.reInvitePopup');
    this.acceptReInviteCall = this.client.find(".acceptReInviteCall");
    this.rejectReInviteCall = this.client.find(".rejectReInviteCall");
    this.messages = this.client.find(".messages");
    this.callPopup = this.client.find(".callPopup");
    this.incomingCallName = this.callPopup.find(".incomingCallName");
    this.incomingCallUser = this.callPopup.find(".incomingCallUser");
    this.acceptIncomingCall = this.callPopup.find(".acceptIncomingCall");
    this.rejectIncomingCall = this.callPopup.find(".rejectIncomingCall");
    this.holdAndAnswerButton = this.callPopup.find(".holdAndAnswerButton");
    this.dropAndAnswerButton = this.callPopup.find(".dropAndAnswerButton");
    this.errorPopup = this.client.find( ".errorPopup" );
    this.fullScreenExpandIcon = this.client.find(".fullScreenExpand");
    this.fullScreenContractIcon = this.client.find(".fullScreenContract");
    this.dialpadShowIcon = this.client.find(".dialpadIconShow");
    this.dialpadHideIcon = this.client.find(".dialpadIconHide");
    this.dialpad = this.client.find(".dialpad");
    this.selfViewEnableIcon = this.client.find(".selfViewEnable");
    this.selfViewDisableIcon = this.client.find(".selfViewDisable");
    this.connected = this.client.find(".connected-icon");
    this.registered = this.client.find(".registered-icon");
    this.historyClose = this.client.find(".historyClose");
    this.callHistory = this.client.find(".callHistory");
    this.callStats = this.client.find(".callStats");

    if(!config && typeof(ClientConfig) === 'undefined') {
      $('#unsupported').text("Could not read ClientConfig - make sure it is included and properly formatted");
      $('#unsupported').show();
      return;
    }

    config = config || ClientConfig;
    this.eventBus = new WebRTC.EventBus({
      isDebug: function(){
        return config.debug === true;
      }
    });
    this.configuration = new WebRTC.Configuration(this.eventBus, config);
    this.sipStack = new WebRTC.SIPStack(this.configuration, this.eventBus);
    this.sound = new WebRTC.Sound(this.sipStack, this.configuration, this.eventBus);
    this.video = new WebRTC.Video(this.client.find('.video'), this.sipStack, this.eventBus, {
      onPlaying: function(){
        self.validateUserMediaResolution();
      }
    });
    this.settings = new WebRTC.Settings(this, this.configuration, this.sound, this.eventBus, this.sipStack);
    this.stats = new WebRTC.Stats(this, this.sipStack, this.configuration);
    this.timer = new WebRTC.Timer(this, this.stats, this.configuration);
    this.history = new WebRTC.History(this, this.sound, this.stats, this.sipStack, this.configuration);
    this.transfer = new WebRTC.Transfer(this, this.sound, this.sipStack, this.configuration);
    this.authentication = new WebRTC.Authentication(this.client.find(".authPopup"), this.eventBus, {
      onAuthenticate: function(data) {
        self.sipStack.init(data.userId, data.password);
      },
      settingsUserId: self.settings.userId,
      settingsAuthenticationUserId: self.settings.authenticationUserId,
      settingsPassword: self.settings.password
    });
    this.hold = new WebRTC.Icon(this.client.find( ".hold" ), this.sound);
    this.resume = new WebRTC.Icon(this.client.find( ".resume" ), this.sound);
    this.fullScreen = false;
    this.selfViewEnabled = true;
    this.dialpadShown = false;

    this.configuration.setSettings(this.settings);

    this.registerListeners();

    this.init();
  };

  Client.prototype = {
    init: function() {
      var self = this;
      var unsupported = WebRTC.Utils.compatibilityCheck(this);
      if(unsupported)
      {
        $('#unsupported').html(unsupported).show();
      }

      // Allow some windows to be draggable, required jQuery.UI
      if (this.configuration.enableWindowDrag)
      {
        $(function()
        {
          self.video.local.draggable({
            snap: ".remoteVideo,.videoBar",
            stop: function( event, ui ) {self.settings.updateViewPositions();}
          });
          self.callStats.draggable({
            snap: ".remoteVideo,.videoBar",
            stop: function( event, ui ) {self.settings.updateViewPositions();}
          });
          self.callHistory.draggable({
            snap: ".remoteVideo,.videoBar",
            stop: function( event, ui ) {self.settings.updateViewPositions();}
          });
        });
      }

      if (this.configuration.destination)
      {
        this.configuration.hideCallControl = true;
      }

      this.updateClientClass();

      $.cookie.raw = true;

      window.onbeforeunload = function(e) {
        self.endCall({rtcSession: 'all'});
        return null;
      };

      this.onLoad();
    },

    showErrorPopup: function(error) {
      window.alert(error);
    },

    // Setup the GUI
    guiStart: function() {
      // Set size for Chrome and Firefox
      this.main.css("zoom", this.configuration.size);
      this.main.css("-moz-transform", "scale(" + this.configuration.size +")");
      if (($.cookie("settingWindowPosition")))
      {
        var windowPositions = $.cookie("settingWindowPosition").split('|');
        for (var i = 0; i < windowPositions.length; ++i)
        {
          var elementPosition = windowPositions[i].split('-');
          this.client.find(elementPosition[0]).css("top", elementPosition[1]);
          this.client.find(elementPosition[0]).css("left", elementPosition[2]);
        }
      }
      // Fade in UI elements
      this.client.find(".remoteVideo, .videoBar").fadeIn(1000);
      if (this.configuration.enableCallControl && !this.configuration.hideCallControl)
      {
        this.callControl.fadeIn(1000);
      }
      else {
        this.callControl.fadeOut(1000);
      }
    },

    find: function(selector) {
      return this.client.find(selector);
    },

    // Display status messages
    message: function(text, level)
    {
      if(!this.configuration.enableMessages)
      {
        return;
      }
      this.messages.stop(true, true).fadeOut();
      this.messages.removeClass("normal success warning alert");
      this.messages.addClass(level).text(text).fadeIn(10).fadeOut(10000);
    },

    // Make sure destination allowed and in proper format
    validateDestination: function(destination)
    {
      if (destination.indexOf("sip:") === -1)
      {
        destination = ("sip:" + destination);
      }
      if (!this.configuration.allowOutside && !new RegExp("[.||@]"+this.configuration.domainTo).test(destination) )
      {
        this.message(this.configuration.messageOutsideDomain, "alert");
        return(false);
      }
      if ((destination.indexOf("@") === -1))
      {
        destination = (destination + "@" + this.configuration.domainTo);
      }
      var domain = destination.substring(destination.indexOf("@"));
      if(domain.indexOf(".") === -1) {
        destination = destination + "." + this.configuration.domainTo;
      }

      // WEBRTC-35 : filter out dtmf tones from destination
      return destination.replace(/,[0-9A-D#*,]+/, '');
    },

    // URL call
    callUri: function(destinationToValidate)
    {
      if(this.sipStack.getCallState() !== WebRTC.SIPStack.C.STATE_CONNECTED) {
        logger.log('Already in call with state : '+this.sipStack.getCallState());
        return;
      }
      if (destinationToValidate === "")
      {
        this.message(this.configuration.messageEmptyDestination, "alert");
        return;
      }

      var destination = this.validateDestination(destinationToValidate);
      if (destination === false)
      {
        logger.log("destination is not valid : "+destinationToValidate, this.configuration);
        return;
      }

      logger.log("calling destination : "+destination, this.configuration);

      this.message(this.configuration.messageCall, "success");

      // Start the Call
      this.sipStack.call(destination);
    },

    setClientConfig: function(clientConfig) {
      var connectionChanged = this.configuration.websocketsServers[0].ws_uri !== clientConfig.websocketsServers[0].ws_uri;
      jQuery.extend(this.configuration, clientConfig);
      this.guiStart();
      this.updateClientClass();
      if(connectionChanged) {
        this.sipStack.init();
      }
    },

    endCall: function(options) {
      options = options || {};
      var rtcSession = options['rtcSession'];
      if(rtcSession === 'all') {
        this.sipStack.terminateSessions();
      } else if(rtcSession) {
        this.sipStack.terminateSession(rtcSession);
      } else {
        this.sipStack.terminateSession();
      }
      this.setEvent(null);
      this.sound.pause();
      this.video.updateSessionStreams();
      // Bring up the main elements
      if (this.configuration.enableCallControl === true)
      {
        this.configuration.hideCallControl = false;
        this.updateClientClass();
      }

      this.guiStart();

      this.timer.stop();
      this.checkEndCallURL();
    },

    // Initial startup
    checkEndCallURL: function() {
      if (this.configuration.endCallURL)
      {
        window.location = this.configuration.endCallURL;
      }
    },

    onLoad: function() {
      var self = this;
      logger.log("onLoad", this.configuration);

      this.sipStack.init();

      if(!this.configuration.enableConnectLocalMedia && this.configuration.destination) {
        this.eventBus.once("connected", function(e){
          self.callUri(self.configuration.destination);
        });
      }

      // Start the GUI
      this.guiStart();
    },

    // What we do when we get a digit during a call
    pressDTMF: function(digit)
    {
      if (digit.length !== 1)
      {
        return;
      }
      if (this.sipStack.isStarted())
      {
        this.destination.val(this.destination.val() + digit);
        this.sound.playClick();
        this.sipStack.sendDTMF(digit);
      }
    },

    resumeCall: function() {
      var self = this;
      this.resume.disable();
      var enable = function(){
        self.resume.enable();
      };
      this.sipStack.unhold(enable, enable);
    },

    holdCall: function() {
      var self = this;
      this.hold.disable();
      var enable = function(){
        self.hold.enable();
      };
      this.sipStack.hold(enable, enable);
    },

    hideSelfView: function() {
      this.selfViewEnabled = false;
      this.updateClientClass();
    },

    stopFullScreen: function() {
      if(document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      this.fullScreen = false;
      this.updateClientClass();
    },

    showSelfView: function() {
      this.selfViewEnabled = true;
      this.updateClientClass();
    },

    showFullScreen: function() {
      if(this.client.find('.video')[0].webkitRequestFullScreen) {
        this.client.find('.video')[0].webkitRequestFullScreen();
      }
      this.fullScreen = true;
      this.updateClientClass();
    },

    muteAudio: function() {
      this.sound.setMuted(true);
    },

    unmuteAudio: function() {
      this.sound.setMuted(false);
    },

    showDialpad: function() {
      this.dialpadShown = true;
      this.updateClientClass();
    },

    hideDialpad: function() {
      this.dialpadShown = false;
      this.updateClientClass();
    },

    updateFullScreen: function() {
      this.fullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
      this.updateClientClass();
    },

    getRemoteUser: function(rtcSession) {
      return rtcSession.remote_identity.uri.user || rtcSession.remote_identity.uri.host;
    },

    registerListeners: function() {
      var self = this;

      this.eventBus.on("viewChanged", function(e){
        self.updateClientClass();
      });
      this.eventBus.on("ended", function(e){
        self.message(self.configuration.messageEnded.replace('{0}', self.getRemoteUser(e.sender)), "normal");
        self.history.persistCall(e.sender);
        self.endCall({rtcSession: e.sender});
      });
      this.eventBus.on("resumed", function(e){
        self.onSessionStarted(e.sender);
        self.message(self.configuration.messageResume.replace('{0}', self.getRemoteUser(e.sender)), "success");
      });
      this.eventBus.on("started", function(e){
        self.onSessionStarted(e.sender);
        var dtmfTones = WebRTC.Utils.parseDTMFTones(self.configuration.destination);
        if(dtmfTones && e.data && !e.data.isReconnect) {
          logger.log("DTMF tones found in destination - sending DTMF tones : "+dtmfTones);
          self.sipStack.sendDTMF(dtmfTones);
        }
        //remove configuration.destination to avoid multiple calls
        delete self.configuration.destination;
        if(e.data && !e.data.isReconnect) {
          self.message(self.configuration.messageStarted.replace('{0}', self.getRemoteUser(e.sender)), "success");
          self.timer.start();
        }
      });
      this.eventBus.on("held", function(e){
        self.message(self.configuration.messageHold.replace('{0}', self.getRemoteUser(e.sender)), "success");
      });
      this.eventBus.on("disconnected", function(e){
        if (self.configuration.enableConnectionIcon)
        {
          self.connected.removeClass("success");
          self.connected.addClass("alert").fadeIn(100);
        }
        var msg = self.configuration.messageConnectionFailed;
        if(e.data && e.data.reason) {
          msg = e.data.reason;
        }
        if(e.data && e.data.retryAfter) {
          msg += " - Retrying in "+e.data.retryAfter+" seconds";
        }
        self.message(msg, "alert");
        self.endCall();
      });
      this.eventBus.on("failed", function(e){
        var error = e.data.cause;
        self.message(error, "alert");
        if (error === "User Denied Media Access")
        {
          self.showErrorPopup("WebRTC was not able to access your microphone/camera!");
        }
        else if (error === ExSIP.C.causes.CANCELED)
        {
          self.setEvent("incomingCall-done");
        }
        self.sound.pause();
        self.endCall({rtcSession: e.sender});
      });
      this.eventBus.on("progress", function(e){
        self.message(self.configuration.messageProgress, "normal");
        self.sound.playDtmfRingback();
      });
      this.eventBus.on("message", function(e){
        self.message(e.data.text, e.data.level);
      });
      this.eventBus.on("registrationFailed", function(e){
        if (self.configuration.enableRegistrationIcon)
        {
          //$("#registered").removeClass("success");
          self.registered.addClass("alert").fadeIn(100);
        }
        var statusCode = e.data.response.status_code;
        var msg = statusCode;
        if(statusCode === 403) {
          msg = "403 Authentication Failure";
        }
        self.message(self.configuration.messageRegistrationFailed.replace('{0}', msg), "alert");
      });
      this.eventBus.on("registered", function(e){
        if (self.configuration.enableRegistrationIcon)
        {
          self.registered.removeClass("alert");
          self.registered.addClass("success").fadeIn(10).fadeOut(3000);
        }
        self.message(self.configuration.messageRegistered, "success");
      });
      this.eventBus.on("connected", function(e){
        if (self.configuration.enableConnectionIcon)
        {
          self.connected.removeClass("alert");
          self.connected.addClass("success").fadeIn(10).fadeOut(3000);
        }
        self.message(self.configuration.messageConnected, "success");

        self.sipStack.updateUserMedia(function(){
          if (self.configuration.destination)
          {
            self.callUri(self.configuration.destination);
          }
        });
      });
      this.eventBus.on("incomingCall", function(evt){
        var incomingCallName = evt.data.request.from.display_name;
        var incomingCallUser = evt.data.request.from.uri.user;
        self.message("Incoming Call", "success");
        self.setEvent("incomingCall");
        self.incomingCallName.text(incomingCallName);
        self.incomingCallUser.text(incomingCallUser);
        WebRTC.Utils.rebindListeners("click",
          [self.rejectIncomingCall, self.acceptIncomingCall, self.holdAndAnswerButton, self.dropAndAnswerButton],
          function(e) {
            e.preventDefault();
            self.incomingCallHandler($(this), evt.data.session);
          }
        );
        self.sound.playRingtone();
      });
      this.eventBus.on("reInvite", function(e){
        self.setEvent("reInvite");
        var incomingCallName = e.data.request.from.display_name;
        var incomingCallUser = e.data.request.from.uri.user;
        var title = e.data.audioAdd ? "Adding Audio" : "Adding Video";
        self.message(title, "success");
        self.reInvitePopup.find(".incomingCallName").text(incomingCallName);
        self.reInvitePopup.find(".incomingCallUser").text(incomingCallUser);
        self.reInvitePopup.find(".title").text(title);
        self.acceptReInviteCall.off("click");
        self.acceptReInviteCall.on("click", function(){
          self.setEvent("reInvite-done");
          e.data.session.acceptReInvite();
        });
        self.rejectReInviteCall.off("click");
        self.rejectReInviteCall.on("click", function(){
          self.setEvent("reInvite-done");
          e.data.session.rejectReInvite();
        });
      });
      this.eventBus.on('message', function(e)
      {
        self.message();
      });
      this.eventBus.on('newDTMF', function(e)
      {
        var digit = e.data.tone;
        if(!digit) {
          return;
        }
        logger.log('DTMF sent : '+ digit, self.configuration);
        var file = null;
        if (digit === "*")
        {
          file = "star";
        }
        else if (digit === "#")
        {
          file = "pound";
        }
        else
        {
          file = digit;
        }
        self.sound.playDtmfTone(file);
      });

      // Buttons
      this.callButton.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.callUri(self.destination.val());
      });

      this.hangup.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.endCall();
        if (self.fullScreen)
        {
          self.fullScreenContractIcon.click();
        }
      });

      this.fullScreenExpandIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.showFullScreen();
      });

      this.fullScreenContractIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.stopFullScreen();
      });
      $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e)
      {
        self.updateFullScreen();
      });

      this.selfViewDisableIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.hideSelfView();
      });

      this.selfViewEnableIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.showSelfView();
      });

      this.hold.onClick(function(e)
      {
        self.holdCall();
      });

      this.resume.onClick(function(e)
      {
        self.resumeCall();
      });

      this.muteAudioIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.muteAudio();
      });

      this.unmuteAudioIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.unmuteAudio();
      });

      this.dialpadShowIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.showDialpad();
      });

      this.dialpadHideIcon.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.hideDialpad();
      });

      this.historyClose.bind('click', function(e)
      {
        e.preventDefault();
        self.sound.playClick();
        self.history.toggle();
      });

      // Dialpad digits
      this.dialpad.bind('click', function(e)
      {
        self.pressDTMF(e.target.textContent);
      });

      this.destination.keypress(function (e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          self.destination.blur();
          self.callUri(self.destination.val());
        }
      });

  // Digits from keyboard
      document.onkeypress=function(e)
      {
        e = e || window.event;
        if(self.transfer.targetInput.is(e.srcElement)) {
          return;
        }

        if ((e.charCode >= 48 && e.charCode <= 57) || e.charCode === 35 || e.charCode === 42)
        {
          var digit = String.fromCharCode(e.charCode);
          self.pressDTMF(digit);
        }
        else if (e.charCode === 83)
        {
          self.stats.toggle();
        }
        else if (e.charCode === 72)
        {
          self.history.toggle();
        }
      };
    },

    onSessionStarted: function(sender){
      logger.log("setting active session to "+ sender.id, this.configuration);
      this.sipStack.activeSession = sender;
      this.video.updateSessionStreams(sender);
      this.client.find('.stats-container').attr('id', this.sipStack.getSessionId()+'-1');
      this.sound.pause();
    },

    incomingCallHandler: function(source, session){
      this.setEvent("incomingCall-done");
      this.sound.pause();
      if (source.is(this.acceptIncomingCall)) {
        this.sipStack.answer(session);
      } else if (source.is(this.dropAndAnswerButton)) {
        this.sipStack.terminateSession();
        this.sipStack.answer(session);
      } else if (source.is(this.holdAndAnswerButton)) {
        this.sipStack.holdAndAnswer(session);
      } else if (source.is(this.rejectIncomingCall)) {
        this.sipStack.terminateSession(session);
      }
    },

    setEvent: function(event){
      this.event = event;
      this.updateClientClass();
    },

    validateUserMediaResolution: function(){
      var encodingWidth = this.settings.getResolutionEncodingWidth();
      var encodingHeight = this.settings.getResolutionEncodingHeight();
      var videoWidth = this.video.localWidth();
      var videoHeight = this.video.localHeight();
      logger.log("validating video resolution "+videoWidth+","+videoHeight+" to match selected encoding "+encodingWidth+","+encodingHeight, this.configuration);
      if(!videoWidth && !videoHeight) {
        return;
      }

      if(encodingWidth !== videoWidth || encodingHeight !== videoHeight) {
        var msg = "Video resolution "+videoWidth+","+videoHeight+" does not match selected encoding "+encodingWidth+","+encodingHeight;
        this.message(msg, "alert");
        logger.warn(msg, this.configuration);
      }
    },

    setAudioOnlyOfferAndRec: function(audioOnly){
      this.configuration.audioOnly = audioOnly;
      this.configuration.offerToReceiveVideo = !audioOnly;
      this.sipStack.updateUserMedia();
    },

    setAudioOnly: function(audioOnly){
      this.configuration.audioOnly = audioOnly;
      this.configuration.offerToReceiveVideo = true;
      this.sipStack.updateUserMedia();
    },

    updateClientClass: function(){
      var classes = ["client"];
      classes.push("r"+this.configuration.getResolutionDisplay());
      classes.push(this.configuration.isWidescreen() ? "widescreen" : "standard");
      var callState = this.sipStack.getCallState();
      
      if(callState !== WebRTC.SIPStack.C.STATE_CONNECTED 
    		  && callState !== WebRTC.SIPStack.C.STATE_DISCONNECTED){
    	  isCallActive = true;
      }else{
    	  isCallActive = false;
      }
      
      if(callState) {
        classes.push(callState);
      }
      if(this.event) {
        classes.push(this.event);
      }
      if (this.configuration.enableMute)
      {
        classes.push("enable-mute");
      }
      if (this.configuration.enableCallControl && !this.configuration.hideCallControl)
      {
        classes.push("enable-call-control");
      }
      if (this.configuration.enableTransfer)
      {
        classes.push("enable-transfer");
      }
      if (this.configuration.enableHold)
      {
        classes.push("enable-hold");
      }
      if (this.configuration.enableCallTimer)
      {
        classes.push("enable-timer");
      }
      if (this.configuration.enableSettings)
      {
        classes.push("enable-settings");
      }
      if (this.configuration.enableFullScreen)
      {
        classes.push("enable-full-screen");
      }
      if (this.configuration.enableSelfView)
      {
        classes.push("enable-self-view");
      }
      if (this.configuration.enableDialpad)
      {
        classes.push("enable-dialpad");
      }
      if (this.configuration.getView())
      {
        classes.push("view-"+this.configuration.getView());
      }
      if(this.sound.muted) { classes.push("muted"); } else { classes.push("unmuted"); }
      if(this.settings.toggled) { classes.push("settings-shown"); } else { classes.push("settings-hidden"); }
      if(this.selfViewEnabled) { classes.push("self-view-enabled"); } else { classes.push("self-view-disabled"); }
      if(this.dialpadShown) { classes.push("dialpad-shown"); } else { classes.push("dialpad-hidden"); }
      if(this.fullScreen) { classes.push("full-screen-expanded"); } else { classes.push("full-screen-contracted"); }
      if(this.transfer.visible) { classes.push("transfer-visible"); } else { classes.push("transfer-hidden"); }
      if(this.authentication.visible) { classes.push("auth-visible"); } else { classes.push("auth-hidden"); }
      this.client.attr("class", classes.join(" "));
    }
  };

  WebRTC.Client = Client;
}(WebRTC));



window.WebRTC = WebRTC;
}(window));

