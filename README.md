# [BEM hint](https://github.com/bem/bemhint) plugin for checking file entity

This plugin checks the BEM entity in the file. At this moment it can check only stylus files.

## For example

File name checkbox_type_button.styl, this is right:

```css
.checkbox.checkbox_type_button .checkbox__control {
    position: absolute;
}
```

and this is not:

```css
.checkbox.checkbox_type_button .checkbox__control {
    position: absolute;
}

.select {
    display: inline-block;
}
```

Because, here we have selector with another entity .select without checkbox.

## Config example

```json
{
    "levels": [
        "*.blocks"
    ],

    "excludePaths": [
        "node_modueles/**"
    ],

    "plugins": {
        "bemhint-plugins-check-file-entity": {
            "techs": {
                "styl": true
            }
        }
    }
}
```
