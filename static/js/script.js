(function () {
	function JQueryPlugin (name) {
		var Constructor = function ($el, config) {
			this.$el = $el;
			this.config = $.extend(config, this.defaults);
			
			if ('_init' in this && typeof this._init == 'function') {
				this._init.apply(this, arguments);
			}
		};
		
		$.fn[name] = function (command) {
			var instance, result;
	
			this.each(function (i, el) {
				var $el = $(el);

				if ($el.data(name)) {
					instance = $el.data(name);
					
					if (command[0] == '_' || !(command in instance && typeof instance[command] == 'function')) {
						throw new Error('Invalid command for plugin ' + name);
					} else {
						result = instance[command].apply(instance, Array.prototype.slice.call(arguments, 1));
					}
				} else {
					instance = new Constructor($el, command);
					$el.data(name, instance);
				}
			});
				
			return result ? result : this;
		};
		
		return Constructor;
	}

	var parallaxElements = [], parallaxStarted = false;

	function doParallax () {
		for (var i = 0; i < parallaxElements.length; i++) {
			var $el = parallaxElements[i].$el;
			var offset = parallaxElements[i].offset;
			var speed = parallaxElements[i].speed;
			var position = parallaxElements[i].position;
			var offsetTop = pageYOffset - $el.offset().top;
			var pos = -(offsetTop / speed);

			if (position === 'bottom') {
				pos -= $el.height();
			}

			$el.css('background-position-y', pos + offset);
		}
	}

	function registerElement (i, el) {
		var $el = $(el);
		var offset = $el.data('bg-offset');
		var speed = $el.data('parallax-speed');
		var position = $el.data('bg-position');
		offset = offset ? offset : 0;
		speed = speed ? speed : 10;
		position = position ? position : 'top';
		parallaxElements.push({
			$el: $el,
			offset: offset,
			speed: speed
		});
	}

	function startParallax () {
		if (parallaxStarted) {
			return;
		}

		$(window).on('scroll', doParallax);
	}

	var Parallax = JQueryPlugin('parallax');
	Parallax.prototype._init = function () {
		this.$el.each(registerElement);
		startParallax();
		doParallax();
	};


	var ScrollToSection = JQueryPlugin('scrollToSection');
	ScrollToSection.prototype._init = function () {
		if (this.$el.attr('href') && this.$el.attr('href')[0] === '#') {
			this.$el.on('click', this.goToLink.bind(this));
		}
	};
	ScrollToSection.prototype.goToLink = function (e) {
		e.preventDefault();
		var $dest = $(this.$el.attr('href'));
		var scrollTop = $dest.offset().top;
		$('body').animate({
			scrollTop: scrollTop
		});
	};
}());

$(function () {
	$('body>header').parallax();
	$('nav a').scrollToSection();

	$('#hamburger').click(function () {
		$('nav').toggleClass('down');
	});

	$(document).on('scroll', (function () {
		var $nav = $('nav');
		var navHeight = $nav.height();
		var $hero = $('#cover');
		var isOverlay = false;
		
		return function (e) {
			var bottomOfHero = $hero.height();
			if (pageYOffset >= bottomOfHero && !isOverlay) {
				$nav.slideDown();
			} else if (pageYOffset < bottomOfHero && isOverlay) {
				$nav.slideUp();
			}
		};
	})());
});
