# Pager JS

Display your *single page website* as a multi fullscreen sections magazine.

Fully responsive rendering. 

## Install 
```bash
npm install gotan/pager 
```

## Usage

Your HTML code should have the following structure
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

## License

[Apache 2](https://www.apache.org/licenses/LICENSE-2.0)

## See also 

Quite same than
* [fullpage.js](https://alvarotrigo.com/fullPage/#firstPage): only main features but fully opensource