var app = angular.module('frSlidescroll', []);

app.directive('slidescroll', ['$document', function($document) {

    function controller($scope) {
        $scope.viewFinderElement = null;
        $scope.slides = [];
        $scope.numSlides = 0;
        $scope.currentSlideIndex = 0;
        $scope.inTransition = false;
        $scope.quietPeriod = false;

        function normaliseSlideIndex(index) {
            // Adapt for negative indexes and JavaScript's modulus function
            if (index < 0) {
                index = ($scope.numSlides - (Math.abs(index % $scope.numSlides))) % $scope.numSlides;
            } else {
                index = index % $scope.numSlides;
            }

            return index;
        }

        this.transformTo = function(index) {
            // Normalise slide indexes
            var fromSlide =  normaliseSlideIndex($scope.currentSlideIndex);
            var toSlide = normaliseSlideIndex(index);

            // Fire before transition callback if one is set
            if ($scope.beforeTransitionCallback !== null
                && typeof $scope.beforeTransitionCallback === 'function') {

                $scope.beforeTransitionCallback({toSlide: toSlide, fromSlide: fromSlide});
            }

            // We're now in slide transition
            $scope.inTransition = true;
            $scope.quietPeriod = true;

            // Create one-time fire event to set inTransition back to false
            $document.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                $scope.$apply(function() {
                    $scope.inTransition = false;

                    // Fire after transition callback if one is set
                    if ($scope.afterTransitionCallback !== null
                        && typeof $scope.afterTransitionCallback === 'function') {

                        $scope.afterTransitionCallback({fromSlide: fromSlide, toSlide: toSlide});
                    }

                    // Execute function after timeout to handle after transition logic @todo: use $timeout here!
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.quietPeriod = false;

                            // Fire after quiet period callback if one is set
                            if ($scope.afterQuietPeriodCallback !== null
                                && typeof $scope.afterQuietPeriodCallback === 'function') {

                                $scope.afterQuietPeriodCallback({fromSlide: fromSlide, toSlide: toSlide});
                            }
                        });
                    }, 800);
                });
            });

            // Update current slide index
            $scope.currentSlideIndex = index;

            // Get % position by multiplying index by 100 (how many screens to offset by)
            var pos = toSlide * 100;

            // Transform to position with ease transition animation
            $scope.viewFinderElement.css("transform", "translate3d(0, -" + pos + "%, 0)");
            $scope.viewFinderElement.css("transition", "all 800ms ease");
            $scope.viewFinderElement.css("-webkit-transform", "translate3d(0, -" + pos + "%, 0)");
            $scope.viewFinderElement.css("-webkit-transition", "all 800ms ease");
            $scope.viewFinderElement.css("-moz-transform", "translate3d(0, -" + pos + "%, 0)");
            $scope.viewFinderElement.css("-moz-transition", "all 800ms ease");
        };

        this.addSlide = function(slideScope, slideElement) {
            // Assign slide number to slide scope, incrementing count afterwards
            slideScope.slideNum = $scope.numSlides++;

            // Add css class to pick up static styles
            slideElement.addClass("slide");

            // Position dynamically at slideNum number of screen sizes from the top of the page
            slideElement.css("top", (slideScope.slideNum * 100) + '%');
        };

        this.removeSlide = function(slideNum) {
            // Remove slide from array and decrement counter
            $scope.slides.splice(slideNum, 1);
            $scope.numSlides--;
        };

    }

    function link(scope, element, attrs, controller) {
        // Keep a copy of the slidescroll element which will be the viewfinder
        // to our slides (the slidescroll element is what moves)
        scope.viewFinderElement = element;

        // Add css class for static styles
        element.addClass("slidescroll-root");

        var inTransition = false;

        scope.$on('TransitionEvent', function(event, slideDelta) {
            // Check argument
            slideDelta = parseInt(slideDelta);
            if (typeof slideDelta !== 'number') {
                return;
            }

            // Move forward or backward by numberSlides
            controller.transformTo(scope.currentSlideIndex + slideDelta);
        });

        scope.$on('TransitionToEvent', function(event, slideIndex) {
            // Check slideIndex argument
            slideIndex = parseInt(slideIndex);
            if (typeof slideIndex !== 'number') {
                return;
            }

            // Move controller to slideIndex
            controller.transformTo(slideIndex);
        });

        // Bind keyboard events
        $document.on('keydown', function(event) {
            // Key down is in input element (don't consume event)
            var tag = event.target.tagName.toLowerCase();
            if (tag == 'input' || tag == 'textarea') {
                return false;
            }

            // Determine transition info
            var moveForward = true;
            var slideDelta = 0;

            switch (event.which) {
                case 33: // Page up
                case 38: // Up key

                    slideDelta = -1;
                    break;

                case 34: // Page down
                case 32: // Spacebar
                case 40: // Down arrow

                    slideDelta = 1;
                    break;

                case 36: // Home key

                    // Roll backward by the number of slides of the current slide index
                    slideDelta = scope.currentSlideIndex;
                    break;

                case 35: // End key

                    // Roll forward by the number of slides of the current slide index
                    slideDelta = (scope.numSlides - scope.currentSlideIndex) - 1;
                    break;

                default:
                    return;
            }

            // Fire transition event to move
            scope.$emit('TransitionEvent', slideDelta);

        });

        // Bind scroll event
        $document.on('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
            // Prevent event from bubbling up the chain
            event.preventDefault();

            // Don't process subsequent scroll events until transition has finished
            if (!scope.inTransition && !scope.quietPeriod) {

                // Determine if we're going forward or backward
                if (event.wheelDelta > 0) {
                    scope.$emit('TransitionEvent', -1);
                } else {
                    scope.$emit('TransitionEvent', 1);
                }

            }

         });
    }

    return {
        transclude: true,
        controller: controller,
        link: link,
        scope: {
            beforeTransitionCallback: '=ssBefore',
            afterTransitionCallback: '=ssAfter',
            afterQuietPeriodCallback: '=ssAfterQuietPeriod'
        },
        template: '<div ng-transclude></div>'
    }

}]);

app.directive('slide', function() {

    function link(scope, element, attrs, slidescrollController) {
        // Add slide to slidescroll via it's controller
        slidescrollController.addSlide(scope, element);

        // On destroy (removed from DOM) remove slide from slidescroll via it's controller
        element.on('$destroy', function() {
            slidescrollController.removeSlide(scope.slideNum)
        });
    }

    return {
        require: "^slidescroll",
        transclude: true,
        link: link,
        template: "<div ng-transclude></div>"
    }

});