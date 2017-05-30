(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @description
 * Channels for basic $ionicModal manipulation
 */
var SHOW_MODAL = "ionicModalNav:show";
var HIDE_MODAL = "ionicModalNav:hide";
var REMOVE_MODAL = "ionicModalNav:remove";

/**
 * @description
 * Channels for reacting to modal events
 * * ionicModalNav:backdata - Fired when going back from a modal state
 * * ionicModalNav:closeData - Fired when the modal is closed
 */
var MODAL_BACK_DATA = "ionicModalNav:backData";
var MODAL_CLOSE_DATA = "ionicModalNav:closeData";

/**
 * @name IonicModalNavService
 * @module IonicModalNav
 * @description
 * Service used to orchestrate multiple states within an $ionicModal. This
 * can servce as the application's main modal but the user is free to spawn
 * other modals within the application or even within the IonicModalNav if desired
 */

var IonicModalNavService = function () {
    function IonicModalNavService($ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher, modalOptions) {
        var _this = this;

        _classCallCheck(this, IonicModalNavService);

        this._$rootScope = $rootScope.$new();
        this._$state = $state;
        this._$ionicHistory = $ionicHistory;
        this._$ionicViewSwitcher = $ionicViewSwitcher;

        this._backView = null;
        this._currentView = null;

        this._onBackCallbacks = {};
        this._onCloseCallbacks = {};


        init(_this, $ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher, modalOptions);
    }

    function init(_this, $ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher, modalOptions) {
        if (!_this._modal) {

            if (_this.removeCallback)
                _this.removeCallback();

            if (_this.showCallback)
                _this.showCallback();

            if (_this.hideCallback)
                _this.hideCallback();

            //Set up modal with a separate named ion-nav-view
            _this._modal = $ionicModal.fromTemplate("\n                <ion-modal-view> \n                    <ion-nav-view name=\"ionic-modal-nav\"></ion-nav-view>\n                </ion-modal-view>\n            ", {
                scope: _this._$rootScope,
                animation: modalOptions.animation,
                focusFirstInput: modalOptions.focusFirstInput,
                backdropClickToClose: modalOptions.backdropClickToClose,
                hardwareBackButtonClose: modalOptions.hardwareBackButtonClose
            });

            /**
             * Register basic modal events
             */
            _this.showCallback = _this._$rootScope.$on(SHOW_MODAL, function (event, data) {
                init(_this, $ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher, modalOptions);
                _this._modal.show();
            });

            _this.hideCallback = _this._$rootScope.$on(HIDE_MODAL, function (event, data) {
                _this._modal.hide();
            });

            _this.removeCallback = _this._$rootScope.$on(REMOVE_MODAL, function (event, data) {
                _this._modal.remove();
                delete _this._modal;
            });
        }
    }

    /**
     * Open the modal and transition to the given modal state with no animation.
     * Cache the `backView` and the `currentView` so we can restore proper state once
     * the modal is closed.
     *
     * @param {string} modalState
     * @params {Object} data
     */


    _createClass(IonicModalNavService, [{
        key: "show",
        value: function show(modalState, data) {
            this._backView = this._$ionicHistory.backView();
            this._currentView = this._$ionicHistory.currentView();

            this._$ionicHistory.nextViewOptions({
                disableAnimate: true
            });

            this._$rootScope.$emit(SHOW_MODAL);
            if (data) {
                this._$state.go(modalState, data);
            } else {
                this._$state.go(modalState);
            }
        }

        /**
         * Wrapper around the usual `$state.go()`. Force the animation direction to be
         * forward using `$ionicViewSwitcher`
         *
         * @param {string} modalState
         */

    }, {
        key: "go",
        value: function go(modalState, data) {
            this._$ionicViewSwitcher.nextDirection('forward');
            if (data) {
                this._$state.go(modalState, data);
            } else {
                this._$state.go(modalState);
            }
        }

        /**
         * Wrapper around usual `$ionicHistory.goBack()`. If data is passed, send it on
         * the `ionicModalNav:backData` channel.
         *
         * @param {Object} data
         */

    }, {
        key: "goBack",
        value: function goBack(data) {
            this._$ionicHistory.goBack();
            if (data) {
                this._$rootScope.$broadcast(MODAL_BACK_DATA, data);
            }
        }

        /**
         * Restore the cache `backView` and `currentView` to the `$ionicHistory` and
         * close the modal. If data is passed, send it on the
         * `ionicModalNav:closeData` channel.
         *
         * @param {any} data
         */

    }, {
        key: "hide",
        value: function hide(data) {
            this._$ionicHistory.backView(this._backView);
            this._$ionicHistory.currentView(this._currentView);
            this._backView = null;
            this._currentView = null;

            this._$rootScope.$emit(HIDE_MODAL);
            if (data) {
                this._$rootScope.$broadcast(MODAL_CLOSE_DATA, data);
            }
        }

        /**
         * Remove the modal (probably never used)
         */

    }, {
        key: "remove",
        value: function remove() {
            this._$rootScope.$emit(REMOVE_MODAL);
        }

        //-------------------------
        // Callbacks handlers

        /**
         * Register a callback function when a modal state goes back. To
         * ensure the correct callback is fired, the registering `viewId` is mapped to the passed
         * callback function. If data ia passed, it will be given to the callback function.
         *
         * @param {Function} callback
         */

    }, {
        key: "onBack",
        value: function onBack(callback) {
            var _this2 = this;

            var currentViewId = this._$ionicHistory.currentView().viewId;
            this._onBackCallbacks[currentViewId] = callback;

            this._$rootScope.$on(MODAL_BACK_DATA, function (event, data) {
                var currentViewId = _this2._$ionicHistory.currentView().viewId;

                var fn = _this2._onBackCallbacks[currentViewId];
                if (fn) {
                    fn(data);
                }
            });
        }

        /**
         * Register a callback function when the modal closes. To ensure the correct
         * callback is fired, the registering `viewId` is mapped to the passed
         * callback function. If data ia passed, it will be given to the callback function.
         *
         * @param {Function} callback
         */

    }, {
        key: "onClose",
        value: function onClose(callback) {
            var _this3 = this;

            var currentViewId = this._$ionicHistory.currentView().viewId;
            this._onCloseCallbacks[currentViewId] = callback;

            this._$rootScope.$on(MODAL_CLOSE_DATA, function (event, data) {
                //Get the current view id at the time this handler was fired
                var currentViewId = _this3._$ionicHistory.currentView().viewId;

                var fn = _this3._onCloseCallbacks[currentViewId];
                if (fn) {
                    fn(data);
                }
            });
        }
    }]);

    return IonicModalNavService;
}();

var IonicModalNavServiceConfig = function () {
    function IonicModalNavServiceConfig() {
        _classCallCheck(this, IonicModalNavServiceConfig);

        this.options = {
            animation: "slide-in-up",
            focusFirstInput: false,
            backdropClickToClose: true,
            hardwareBackButtonClose: true
        };
    }

    _createClass(IonicModalNavServiceConfig, [{
        key: "setModalOptions",
        value: function setModalOptions(options) {
            this.options.animation = options ? options.animation : this.options.animation;
            this.options.focusFirstInput = options ? options.focusFirstInput : this.options.focusFirstInput;
            this.options.backdropClickToClose = options ? options.backdropClickToClose : this.options.backdropClickToClose;
            this.options.hardwareBackButtonClose = options ? options.hardwareBackButtonClose : this.options.hardwareBackButtonClose;
        }
    }, {
        key: "$get",
        value: ['$ionicModal', '$rootScope', '$state', '$ionicHistory', '$ionicViewSwitcher', function($ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher) {
            return new IonicModalNavService($ionicModal, $rootScope, $state, $ionicHistory, $ionicViewSwitcher, this.options);
        }]
    }]);

    return IonicModalNavServiceConfig;
}();

// --- Declare module -- 

var moduleName = 'IonicModalNav';

angular.module(moduleName, []).provider('IonicModalNavService', IonicModalNavServiceConfig);

exports.default = moduleName;
},{}]},{},[1]);
