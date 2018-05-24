# AutoComplete VanillaJS

Dropdown list with autocomplete function made only with Vanilla JavaScript.

![AutoComplete](https://github.com/gmurayama/autocomplete-vanillajs/blob/master/autocomplete.png)

## Getting Started

### Installing

* Download both autocomplete.js and autocomplete.css and import them to your HTML page.
* That's it!

### Usage

Instanciate a new AutoComplete variable and pass the DOM Element as parameter

```
var autoComplete = new AutoComplete(element);
```

The `data-attributes` availables are:

* `data-autocomplete` (optional) - if set to false, disable the dropdown.
* `data-autocomplete-source` - URL to make a HTTP Request.
* `data-autocomplete-postvar-name` (optional) - Rename the POST variable name to be sent to the server.
* `data-autocomplete-minlength` (optional) - Input value minimum length to make a HTTP Request. Default value is 3.

Use `autoComplete.getSuggestionList()` to start the autocomplete.

## License

This project is licensed under the *The Unlicense* License - see the [LICENSE](https://github.com/gmurayama/autocomplete-vanillajs/blob/master/LICENSE) file for details