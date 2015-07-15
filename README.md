# funkyrobot-angular-slidescroll

Full screen slide based layout with scroll/keyboard event transition.

funkyrobot-angular-slidecroll is an Angular JS component that comprises a set of Angular directives.

To start create a `<slidescroll></slidescroll>` element within an Angular JS app. This will initialise the slide scroll 
layout and binds all the necessary events (keyboard, scroll events).

Within `<slidescroll></slidescroll>` create `<slide></slide>` elements and place your slide contents within this.

## Quick example

### HTML - demo.html
```HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Funkyrobot Angular Slidescroll UI</title>

    <!-- Angular slidescroll required resources -->
    <script type="text/javascript" src="angular.js"></script>
    <script type="text/javascript" src="angular-slidescroll.js"></script>
    <link rel="stylesheet" type="text/css" href="angular-slidescroll.css" />

    <!-- Demo related resources -->
    <script type="text/javascript" src="demo.js"></script>
    <link rel="stylesheet" type="text/css" href="demo.css">

</head>
<body ng-app="demoApp">
    <slidescroll>
        <slide>
            <h2>Slide #1</h2>
              <p>This will be the first slide, navigate slides by scrolling/arrow keys.</p>
        </slide>
        <slide>
            <h2>Slide #2</h2>
            <p>The second slide.</p>
        </slide>
    </slidescroll>
</body>
</html>
```

### Javascript - demo.js
```JS
angular.module('demoApp', ['frSlidescroll']);
```
