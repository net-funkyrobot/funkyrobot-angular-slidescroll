// You need to rewrite this to use Angular JS events API
var app = angular.module('frSlidescroll', ['ngTouch']);

app.directive('frSlidescroll', ['$document', function($document) {

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

                console.log("Before callback about to fire");
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
            $scope.viewFinderElement.css("-webkit-transform", "translate3d(0, -" + pos + "%, 0)");
            $scope.viewFinderElement.css("-webkit-transition", "all 800ms ease");
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

        scope.$on('TransitionEvent', function(event, moveForward, numberSlides) {
            // Check arguments
            if (typeof moveForward !== 'boolean') {
                return;
            }
            if (typeof numberSlides !== 'number') {
                return;
            }

            // Move forward or backward by numberSlides
            if (moveForward) {
                controller.transformTo(scope.currentSlideIndex + numberSlides);
            } else {
                controller.transformTo(scope.currentSlideIndex - numberSlides);
            }
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
            var numberSlides = 0;

            switch (event.which) {
                case 34: // Page down
                case 38: // Up key

                    moveForward = false;
                    numberSlides = 1;
                    break;

                case 33: // Page up
                case 32: // Spacebar
                case 40: // Down arrow

                    moveForward = true;
                    numberSlides = 1;
                    break;

                case 36: // Home key

                    // Roll backward by the number of slides of the current slide index
                    moveForward = false;
                    numberSlides = scope.currentSlideIndex;
                    break;

                default:
                    return;
            }

            // Fire transition event to move
            scope.$emit('TransitionEvent', moveForward, numberSlides);

        });

        // Bind scroll event
        $document.on('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
            // Prevent event from bubbling up the chain
            event.preventDefault();

            // Don't process subsequent scroll events until transition has finished
            if (!scope.inTransition && !scope.quietPeriod) {

                // Determine if we're going forward or backward
                var moveForward = true;
                if (event.wheelDelta > 0) {
                    moveForward = false;
                }

                scope.$emit('TransitionEvent', moveForward, 1);

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

        element.css('background', 'url(' + scope.backgroundImage + ')');
    }

    return {
        require: "^slidescroll",
        transclude: true,
        link: link,
        scope: {
            backgroundImage: '=ssBackgroundImage'
        },
        template: "<div ng-transclude></div>"
    }

});