/**
 * @author Jan Philipp Pietrzyk <mail@jpietrzyk.de>
 */
(function(win, $)  {

    "use strict";

    /**
     * Property type Boolean
     *
     * @type {string}
     * @private
     */
    var _BOOL_ = 'bool';

    /**
     * Property type Function
     *
     * @type {string}
     * @private
     */
    var _FUNCTION_ = 'fkt';

    /**
     * Relational operator AND
     *
     * @type {string}
     * @private
     */
    var _AND_ = 'and';

    /**
     * Relational operator NOT AND
     *
     * @type {string}
     * @private
     */
    var _AND_NOT_ = 'and-not';

    /**
     * State of event handler
     *
     * Init state since the initial app state should be defined in CSS
     *
     * @type {number}
     * @private
     */
    var _RUN_INIT_ = 1;

    /**
     * Currently running
     *
     * @see this.start()
     * @type {number}
     * @private
     */
    var _RUN_YES_ = 2;

    /**
     * Currently disabled
     *
     * @type {number}
     * @private
     */
    var _RUN_NO_ = 3;


    /**
     * Initiate all instance propertys
     *
     * @constructor
     */
    var CondQuery = function() {
        this._current = -1;
        this.reset();
    };

    /**
     * Determine whether a set condition is currently fulfilled.
     *
     * @param comp
     * @param prop
     * @returns boolean
     * @private
     */
    var _isConditionFulfilled = function(comp, prop) {
        switch(prop.type) {
            case _BOOL_:
                if(comp === _AND_) {
                    return prop.value;
                }

                return !prop.value;
            case _FUNCTION_:
                if(comp === _AND_) {
                    return prop.value();
                }

                return !prop.value();
        }

        throw new Error('Unknown type or undefined property found');
    };

    /**
     * Constructs Event-Handler functions
     *
     * * Test all conditions
     * * invoke reset handler if registered
     * * call user event handler
     *
     * @param currentEvent
     * @param evIndex
     * @returns {Function}
     * @private
     */
    var _createHandler = function(currentEvent, evIndex) {
        var that = this;

        return function(browserEvent) {
            var runState = _RUN_YES_;
            
            for(var j in currentEvent.conditions) {
                if(!currentEvent.conditions.hasOwnProperty(j)) {
                    continue;
                }

                var cond = currentEvent.conditions[j];

                if(!_isConditionFulfilled(cond, that._props[j])) {
                    runState = _RUN_NO_;
                }
            }
            
            if(currentEvent.resetter && that._running[evIndex] === _RUN_YES_ && runState === _RUN_NO_) {
                currentEvent.resetter.apply(this, [browserEvent]);
            }

            that._running[evIndex] = runState;

            if(runState === _RUN_YES_) {
                currentEvent.call.fkt.apply(this, [browserEvent, currentEvent.call.params]);
            }
        };
    };

    /**
     * Simple iterator
     * 
     * 
     * @param {int} start
     * @param {int} end
     * @param {type} context
     * @param {type} callback
     * @returns {undefined}
     */
    var _eachEvent = function(start, end, context, callback) {
        if(typeof start !== 'number') {
            throw new Error('Invalid parameter start');
        }

        if(typeof end !== 'number') {
            throw new Error('Invalid parameter start');
        }
        
        for(var i = start; i < end; i++) {
            var cur = context._events[i];
            var el = $(cur.event.el);
            var ev = cur.event.ev;

            callback.call(context, cur, i, el, ev);
        }
    };

    /**
     * Add a Property to set as condition for your event handlers.
     *
     * * can be a simple boolen value - something that never changes through the pages lifespan
     * * can be a function that returns a bool based on your application's logic
     *
     * @param name
     * @param value
     * @returns {CondQuery}
     */
    CondQuery.prototype.addProperty = function(name, value) {
        if(this._props[name]) {
            throw new Error('Trying to register "' + name + '" twice');
        }

        var property = {
            'value': value
        };

        switch((typeof value).toLowerCase()) {
            case 'function':
                property.type = _FUNCTION_;
                break;
            case 'boolean':
                property.type = _BOOL_;
                break;
            default:
                throw new Error('Unknown typeof property. Please use either a function or a beoolean.');
        }

        this._props[name] = property;

        return this;
    };

    /**
     * Add a multitude of properties. Format:
     *
     * {
     *   _NAME: bool|function
     * }
     *
     * @see addProperty
     * @param propertys
     * @returns {CondQuery}
     */
    CondQuery.prototype.addProperties = function(properties) {
        for(var i in properties) {
            if(propertys.hasOwnProperty(i)) {
                this.addProperty(i, properties[i]);
            }
        }

        return this;
    };

    /**
     * Start Here to add a new Event. All Options come after this method.
     *
     * @param element jQuery Object | DOM Node | selector
     * @param eventName
     * @returns {CondQuery}
     */
    CondQuery.prototype.on = function(element, eventName) {
        if(!eventName) {
            throw new Error('Missing required param eventName');
        }
        
        if(!element) {
            throw new Error('Missing required param element');
        }
        
        this._current++;
        
        
        this._events[this._current] = {
            'event': {
                'el': element,
                'ev': eventName
            },
            'conditions': [],
            'call': {
                'fkt': null,
                'params': []
            },
            'resetter': null
        };

        this._running[this._current] = _RUN_INIT_;

        return this;
    };

    /**
     * Set under which conditions your handler should be called.
     *
     * @param property
     * @returns {CondQuery}
     */
    CondQuery.prototype.when = function(property) {
        if(!this._props[property]) {
            throw new Error('Unknown property "' + property + '".');
        }

        this._events[this._current].conditions[property] = _AND_;

        return this;
    };

    /**
     * Set under which conditions your handler should be called.
     *
     * @type {Function}
     * @returns {CondQuery}
     */
    CondQuery.prototype.and = CondQuery.prototype.when;

    /**
     * Set under what property should be false, to enable your handler.
     *
     * @param property
     * @returns {CondQuery}
     */
    CondQuery.prototype.whenNot = function(property) {
        if(!this._props[property]) {
            throw new Error('Unknown property "' + property + '".');
        }

        this._events[this._current].conditions[property] = _AND_NOT_;

        return this;
    };

    /**
     * Set under what property should be false, to enable your handler.
     *
     * @param property
     * @returns {CondQuery}
     */
    CondQuery.prototype.andNot = CondQuery.prototype.whenNot;

    /**
     * Your handler to invoke
     *
     * Argument one will always be the event.
     *
     * @param fkt
     * @returns {CondQuery}
     */
    CondQuery.prototype.invoke = function(fkt) {
        if(typeof fkt !== 'function') {
            throw new Error('Only functions can be called.');
        }

        this._events[this._current].call.fkt = fkt;

        return this;
    };

    /**
     * Add a argument to use settings based on propertys.
     *
     * Will be argument index 1...n
     *
     * @param param
     * @returns {CondQuery}
     */
    CondQuery.prototype.with = function(param) {
        this._events[this._current].call.params.push(param);

        return this;
    };

    /**
     * Add a argument to use settings based on propertys.
     *
     * Will be argument index 2
     *
     * @param param
     * @returns {CondQuery}
     */
    CondQuery.prototype.andWith = CondQuery.prototype.with;

    /**
     * Add a reset function.
     *
     * Attention: will not be initially invoked! Your CSS should always contain the first reset.
     *
     * @param fkt
     * @returns {CondQuery}
     */
    CondQuery.prototype.resetWith = function(fkt) {
        if(typeof fkt !== 'function') {
            throw new Error('Only functions can be resetters');
        }
        
        this._events[this._current].resetter = fkt;

        return this;
    };


    /**
     * Last Call!!
     *
     * After everything is set up enable all handlers here.
     *
     * @param callAllHandlers
     */
    CondQuery.prototype.start = function(callAllHandlers) {
        var evMap = {};

        _eachEvent(this._startedFrom, this._current + 1, this, function(cur, index, element, domEvent) {
            var handler = _createHandler.call(this, cur, index);
            cur._handler = handler;

            element.on(domEvent, handler);

            if(!callAllHandlers) {
                return;
            }

            for(var j = 0; j < element.length; j++) {
                if(!element[j].id) {
                    element[j].id = 'condQuery' + (new Date()).getTime();
                }

                var id = '#' + element[j].id;

                if(!evMap[id]) {
                    evMap[id] = {};
                }

                evMap[id][domEvent] = element;
            }
        });
        
        //for next start()-call
        this._startedFrom = this._current;

        if(!callAllHandlers) {
            return this;
        }

        for(var elId in evMap) {
            for(var event in evMap[elId]) {
                $(evMap[elId][event]).trigger(event);
            }
        }

        return this;
    };

    /**
     * Reset and remove ALL handlers! Mostly for debugging reasons...
     *
     * @returns {CondQuery}
     */
    CondQuery.prototype.reset = function() {
        _eachEvent(0, this._current + 1, this, function(event, index, element, domEvent) {
            if(!event._handler) {
                return;
            }

            element.off(domEvent, event._handler);

        });

        this._props = {};
        this._events = [];
        this._current = -1;
        this._running = [];

        this._startedFrom = 0;

        return this;
    };


    // should be one instance per DOM!
    win.condQuery = new CondQuery();

} (window, jQuery));