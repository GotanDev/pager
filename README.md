# Pager JS

Display your *single page website* as a multi fullscreen magazine.

 

## Install 
```bash
npm install gotan/pager 
```

## Usage

Your HTML code should have following structure
```html
<div class="magazine">
    <section>
        <!-- Horizontal Slide level is optional -->
        <slide>Content 1</slide>
        <slide>Content 2</slide>
    </section>
    <section>
        Content 3 
    </section>
    <section>
        ...
    </section>
</div>
```
And add simple following javascript
```js
pager('.magazine') 
```

Look at [example](example.html).