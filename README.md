# Pager JS

Display your *single page website* as a multi fullscreen sections magazine.

Fully responsive rendering. 

## Main features

* Hash management for section direct access
* Zoom management : you can view whole page by zoom out 
* Keyboard navigation

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
pager('.magazine', {}) 
```

    ### Options:  
* 'theme': string  
**Color theme**: *object* | *themeName*: string
Either a preset theme, or a custom set.  
Presets colors themes are 
  * *blue*: 
  * *persian*:   

  You can also customize colors
  * either by defining an odd/even model
     ```json
    {
      "theme": { 
        "odd": {
          "background": "#333333", 
          "foreground": "red"
        }, 
        "even": {
          "background": "#FF0000", 
          "foreground": "#FAFAFA" 
        }  
      }
    }
    ```
  * either by defining a color table :  
    ```json
    {
      "theme": [
        { // color 1
          "background": "#333333", 
          "foreground": "red"
        }, 
        { // color2
          "background": "#FF0000", 
          "foreground": "#FAFAFA" 
        } // ...  
      ]
    }
    ```
  * or by overriding `background-color` CSS rules 

* `keyboard`: boolean    
Enable keyboard navigation  
default: true
* `zoom`: boolean  
Enable zoom out for giving global section map.
default: false
* `infinite`
  * `.section`: boolean   
allow infinite vertical scrolling  
  default: false
  * `.slide`: boolean   
allow infinite horizontal scrolling   
  default: true
* `arrows`
  * `.section`: boolean   
displays arrows for vertical navigation
default: false
  * `.slide`: boolean
display arrow for horizontal navigation   
default: true


Look at [example](example.html).

## License

[Apache 2](https://www.apache.org/licenses/LICENSE-2.0)

## See also 

Quite same than
* [fullpage.js](https://alvarotrigo.com/fullPage/#firstPage): only main features but fully opensource