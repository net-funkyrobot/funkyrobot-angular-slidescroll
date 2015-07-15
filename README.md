# funkyrobot-angular-slidescroll

Full screen slide based layout with scroll/keyboard event transition.

funkyrobot-angular-slidecroll is an Angular JS component that comprises a set of Angular directives.

To start create a `<slidescroll></slidescroll>` element within an Angular JS app. This will initialise the slide scroll 
layout and binds all the necessary events (keyboard, scroll events).

Within `<slidescroll></slidescroll>` create `<slide></slide>` elements and place your slide contents within this.

## Quick example

```HTML
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
```
