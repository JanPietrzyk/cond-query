(function()
{
    "use strict";

    QUnit.module('Argument and interface tests');

    QUnit.test('Expected interface', function(assert) {
        var localInstance = new condQuery.constructor();

        assert.equal(jQuery.type(localInstance), 'object', 'Local instance created');
        assert.equal(jQuery.type(localInstance.on), 'function', 'Method exists "on"');
        assert.equal(jQuery.type(localInstance.when), 'function', 'Method exists "when"');
        assert.equal(jQuery.type(localInstance.and), 'function', 'Method exists "and"');
        assert.equal(jQuery.type(localInstance.andNot), 'function', 'Method exists "andNot"');
        assert.equal(jQuery.type(localInstance.invoke), 'function', 'Method exists "invoke"');
        assert.equal(jQuery.type(localInstance.with), 'function', 'Method exists "with"');
        assert.equal(jQuery.type(localInstance.resetWith), 'function', 'Method exists "resetWith"');
        assert.equal(jQuery.type(localInstance.start), 'function', 'Method exists "start"');
        assert.equal(jQuery.type(localInstance.addProperty), 'function', 'Method exists "addProperty"');    
    });

    QUnit.test('Property', function(assert) {
        var localInstance = new condQuery.constructor();

        assert.raises(localInstance.addProperty, 'addProperty without argument raised error');
        assert.raises(function() {localInstance.addProperty('test');}, 'addProperty with just one argument raised error');
        assert.equal(localInstance.addProperty('false', true), localInstance, 'Add boolean property');
        assert.equal(localInstance.addProperty('true', false), localInstance, 'Add boolean property');
        assert.equal(localInstance.addProperty('fkt', function(){}), localInstance, 'Add function property');

        localInstance.addProperty('double', false);
        assert.raises(function() {localInstance.addProperty('double', true);}, 'Registering same name twice raises error');   
    });

    QUnit.test('on', function(assert) {
        var li = new condQuery.constructor();

        li.addProperty('test', true);

        assert.raises(li.on, 'Call with no argument raises error');
        assert.raises(function() {li.on('test');}, 'with one param raises error');
        assert.raises(function() {li.when('test');}, 'Calling when without on raises error');
        assert.equal(li.on(jQuery('document'), 'ready'), li, 'call returns condquery instance');
    });

    QUnit.test('When, when not, and, andNot validation', function(assert) {
        var li = new condQuery.constructor();

        assert.raises(li.when, 'when without argument raised error');
        assert.raises(li.and, 'and without argument raised error');
        assert.raises(li.whenNot, 'whenNot without argument raised error');
        assert.raises(li.andNot, 'andNot without argument raised error');

        assert.raises(function() {li.when('test');}, 'when with invalid argument raises error');
        assert.raises(function() {li.and('test');}, 'and with invalid argument raises error');
        assert.raises(function() {li.whenNot('test');}, 'whenNot with invalid argument raises error');
        assert.raises(function() {li.andNot('test');}, 'andNot with invalid argument raises error');

        li.addProperty('test', true).on($(document), 'ready');

        assert.equal(li.when('test'), li, 'when with valid argument returned condquery instance');
        assert.equal(li.and('test'), li, 'and with valid argument returned condquery instance');
        assert.equal(li.whenNot('test'), li, 'whenNot with valid argument returned condquery instance');
        assert.equal(li.andNot('test'), li, 'andNot with valid argument returned condquery instance');

    });

    QUnit.test('invoke, resetwith', function(assert) {
        var li = new condQuery.constructor();
        var fkt = function() {};
        li.on($(document), 'custom-event');

        assert.raises(li.invoke, 'error invoke without arguments');
        assert.raises(li.resetWith, 'resetWith invoke without arguments');

        assert.raises(function() {li.invoke('string');}, 'invoke with wrong argument type raises error');
        assert.raises(function() {li.resetWith('string');}, 'resetWith with wrong argument type raises error');

        assert.equal(li.invoke(fkt), li, 'invoke returned conQuery');
        assert.equal(li.resetWith(fkt), li, 'resetWith returned conQuery');
    });

    QUnit.module('Behavioural tests');

    QUnit.test('simplest set up', function(assert) {
        var li = new condQuery.constructor();

        assert.expect(1);

        li.on(jQuery(document), 'test').invoke(function(event) {
            assert.equal(typeof event, 'object', 'Handler called with event object');
        });

        li.start(true);
    });


    QUnit.test('with propertys', function(assert) {
        var li = new condQuery.constructor();
        li.addProperty('isTrue', true);

        assert.expect(1);
        li.on(jQuery(document), 'test').when('isTrue').invoke(function(event) {
            assert.equal(typeof event, 'object', 'Handler called with event object');
        });
        li.on(jQuery(document), 'test').whenNot('isTrue').invoke(function(event) {
            assert.equal(false, true, 'Wrong');
        });

        li.start(true);
    });

    QUnit.test('mutiple propertys', function(assert) {
        var li = new condQuery.constructor();
        li.addProperty('isTrue', true)
                .addProperty('isFalse', false);

        assert.expect(1);
        li.on(jQuery(document), 'test')
                .when('isTrue')
                .andNot('isFalse')
                .invoke(function(event) {
                    assert.equal(typeof event, 'object', 'Handler called with event object');
                });

        li.start(true); 
    });


    QUnit.test('resetter test', function(assert) {
        var li = new condQuery.constructor();
        var cnt = 0;
        li.addProperty('dynamic', function() { return cnt++ % 2 === 0; });

        li.on(jQuery(document), 'test')
                .when('dynamic')
                .invoke(function(event) {
                    assert.equal(typeof event, 'object', 'active ' + cnt);
                })
                .resetWith(function() {
                    assert.ok(true, 'Reset ' + cnt);
                });

        li.start(); 

        assert.expect(4);
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
    });

    QUnit.test('resetter pause test', function(assert) {
        var li = new condQuery.constructor();
        var cnt = 0;

        li.addProperty('dynamic', function() { return cnt++ % 3 === 0; });

        li.on(jQuery(document), 'test')
                .when('dynamic')
                .invoke(function(event) {
                    assert.equal(typeof event, 'object', 'active ' + cnt);
                })
                .resetWith(function() {
                    assert.ok(true, 'Reset ' + cnt);
                });

        li.start(); 

        assert.expect(4);
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');
        jQuery(document).trigger('test');

    });
}());