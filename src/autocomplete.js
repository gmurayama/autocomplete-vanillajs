var AutoComplete = (function () {
    var AutoComplete = function (htmlElement) {
        this.element = htmlElement;
    }

    AutoComplete.prototype = {
        loadConfiguration: function () {
            // Execute AutoComplete?
            var autoComplete = this.element.dataset['autocomplete'];

            if (autoComplete === false)
                return false;

            // variable name to send
            var dataAttrPostVarName = this.element.dataset['autocompletePostvarName'];
            var defaultPostVarName = 'text';
            var postVarName = !isEmpty(dataAttrPostVarName) ? dataAttrPostVarName : defaultPostVarName;

            var text = this.element.value;

            // minimum text length to execute autocomplete AJAX
            var defaultMinLength = 3;
            var dataAttrMinLength = this.element.dataset['autocomplete-minlength'];
            var minLength = !isEmpty(dataAttrMinLength) ? dataAttrMinLength : defaultMinLength;

            // endpoint
            var source = this.element.dataset['autocompleteSource'];

            if (isEmpty(source)) {
                console.log('ERROR autocomplete-source is a required data attribute');
                return;
            }

            var data = {};
            data[postVarName] = text;

            var configuration = {
                data: data,
                source: source,
                minLength: minLength,
                text: text
            };

            return configuration;
        },

        getSuggestionList: function () {
            var config = this.loadConfiguration();

            if (config.text.length >= config.minLength) {

                var objectContext = this;

                createHttpRequest(
                    config.source,
                    'POST',
                    config.data,
                    function (response) {
                        if (response.length > 0) {
                            var dropDown = objectContext.createDropDown();

                            objectContext.populateDropDown(
                                dropDown,
                                response,
                                config.text
                            );
                        } else {
                            objectContext.removeDropDown();
                        }
                    },
                    function (response) {
                        console.log(response);
                        alert("ERROR autocomplete.js");
                    }
                );
            } 
            else {
                this.removeDropDown();
            }
        },

        createDropDown: function () {
            var dropdown = this.element.parentNode.querySelector('.autocomplete.dropdown');

            if (isEmpty(dropdown)) {
                var dropdownNode = document.createElement('div');
                dropdownNode.setAttribute('tabindex', '0');
                dropdownNode.setAttribute('class', 'autocomplete dropdown');
                dropdownNode.innerHTML = '<ul></ul>';
                this.element.parentNode.appendChild(dropdownNode);
                dropdown = this.element.parentNode.querySelector('.autocomplete.dropdown');
            }

            dropdown.querySelector('ul').innerHTML = '';

            var elementPosition = { left: this.element.offsetLeft, top: this.element.offsetTop };
            var elementHeight = this.element.offsetHeight;
            var elementWidth = this.element.offsetWidth;

            dropdown.style.width = elementWidth + 'px';
            dropdown.style.left = elementPosition.left;
            dropdown.style.top = (elementHeight + elementPosition.top) + 'px';

            return dropdown;
        },

        populateDropDown: function (
            dropDownElement,
            list,
            textoToHighlight
        ) {
            var dropdownList = '';

            for (var i = 0; i < list.length; i++) {
                var item = list[i];

                var startIndex = item.toLowerCase().indexOf(textoToHighlight.toLowerCase());
                var endIndex = startIndex + textoToHighlight.length;
                var itemHighlight = item.slice(0, startIndex) + '<b>' + item.slice(startIndex, endIndex) + '</b>' + item.slice(endIndex, item.length);
                dropdownList += '<li data-value="' + item + '" tabindex="1">' + itemHighlight + '</li>';
            }

            dropDownElement.querySelector('ul').innerHTML += dropdownList;

            var element = this.element;

            var listItems = dropDownElement.querySelectorAll('ul li');
            
            for (var i = 0; i < listItems.length; i++) {
                listItems[i].onclick = (function () {
                    var text = this.dataset['value'];
                    element.value = text;
                });
            }
        },

        removeDropDown: function () {
            var parent = this.element.parentNode;
            var dropdown = parent.querySelector('.autocomplete.dropdown');

            if (!isEmpty(dropdown))
                parent.removeChild(dropdown);
        }
    }

    function isEmpty(variable) {
        return variable === null || variable === undefined || variable == '';
    }
    
    function createHttpRequest (
        url,
        method,
        data,
        success,
        error
    ) {
        httpRequest = new XMLHttpRequest();
        httpRequest.open(method.toUpperCase(), url);
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
        var dataSerialized = (function (obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        })(data);

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                var responseData = JSON.parse(httpRequest.responseText);
                if (httpRequest.status === 200) {
                    success(responseData);
                }
                else {
                    error(responseData);
                }
            }
        }

        httpRequest.send(dataSerialized);
    }

    return AutoComplete;
})();

window.addEventListener('click', function (event) {
    var dropdowns = document.querySelectorAll('.autocomplete.dropdown');

    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].parentNode.removeChild(dropdowns[i]);
    }
});