# cond-query

This library helps you test layout components separate from their conditions, so you can test device agnostic and concentrate just on the things that matter!

# Reasoning

I created this little library, after completing my first one page responsive layout. I noticed several problems I had with testing the code on the various devices.

* Determining which handler is active in which orientation on which device
* Disabling several Effects on different device classes, due to performance problems
* Adding new features after deployment

In short, I created a mess :), and this fixed it. It helps decouple your handlers from their corresponding events and device conditions.

# Usage

After including the library in your page you can call the library as condQuery

The following adds a simple condition to the library called _isLandscape_. 
<pre>
condQuery.addProperty('isLandscape', function() { 
      return $(document).width() / $(document).height() > 1;
});
</pre>

Now we add a handler:

<pre>
condQuery.on($(window), 'orientationchange')
  .when('isLandscape')
  .invoke(function() {
    $('<div id="landscape">We are in Landscape mode</div>').appendTo($('body');
  })
  .resetWith(function() {
    $('#landscape').remove();
  });
</pre>

This handler is only called if _isLandscape_ is _true_. After it was true the resetter will be invoked once.
 
After your setup is complete, you just call

<pre>
condQuery.start(true);
</pre>

Where _true_ will call every active handler once.

# Recommendations

To tap into the intended features of this library, I recommend creating objects containing all handlers for a specific component.

<pre>

var navigationHandlers = {
  desktopInit: function() {},
  tabletInit: function() {},
  smallScreenInit: function() {},
  ...
};
</pre>

Then use the document ready event, to set up all handlers with their events and conditions. And for debugging and testing purpose disable _condQuery.start()_ and just call the handlers directy until everything works.

