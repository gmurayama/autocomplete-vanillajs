var AutoComplete = (function () {
    var AutoComplete = function (htmlElement) {
        this.htmlElement = htmlElement;
        this.loadSuggestionList = true;
        var objectContext = this;

        this.htmlElement.addEventListener('keyup', function (e) {
            objectContext.loadSuggestionList = selectItemFromSuggestionList(e);
        });
    }

    AutoComplete.prototype = {
        loadConfiguration: function () {
            // Execute AutoComplete?
            var autoComplete = this.htmlElement.dataset['autocomplete'];

            if (autoComplete === false)
                return false;

            // variable name to send
            var dataAttrPostVarName = this.htmlElement.dataset['autocompletePostvarName'];
            var defaultPostVarName = 'text';
            var postVarName = !isEmpty(dataAttrPostVarName) ? dataAttrPostVarName : defaultPostVarName;

            var text = this.htmlElement.value;

            // minimum text length to execute autocomplete AJAX
            var defaultMinLength = 3;
            var dataAttrMinLength = this.htmlElement.dataset['autocomplete-minlength'];
            var minLength = !isEmpty(dataAttrMinLength) ? dataAttrMinLength : defaultMinLength;

            // endpoint
            var source = this.htmlElement.dataset['autocompleteSource'];

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
            if (!this.loadSuggestionList) {
                this.loadSuggestionList = true;
                return;
            }

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
            var dropdown = this.htmlElement.parentNode.querySelector('.autocomplete.dropdown');

            if (isEmpty(dropdown)) {
                var dropdownNode = document.createElement('div');
                dropdownNode.setAttribute('tabindex', '0');
                dropdownNode.setAttribute('class', 'autocomplete dropdown');
                dropdownNode.innerHTML = '<ul></ul>';
                this.htmlElement.parentNode.appendChild(dropdownNode);
                dropdown = this.htmlElement.parentNode.querySelector('.autocomplete.dropdown');
            }

            dropdown.querySelector('ul').innerHTML = '';

            var elementPosition = { left: this.htmlElement.offsetLeft, top: this.htmlElement.offsetTop };
            var elementHeight = this.htmlElement.offsetHeight;
            var elementWidth = this.htmlElement.offsetWidth;

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
                dropdownList += '<li class="" data-value="' + item + '" tabindex="1">' + itemHighlight + '</li>';
            }

            dropDownElement.querySelector('ul').innerHTML += dropdownList;

            var element = this.htmlElement;

            var listItems = dropDownElement.querySelectorAll('ul li');

            for (var i = 0; i < listItems.length; i++) {
                listItems[i].onclick = (function () {
                    var text = this.dataset['value'];
                    element.value = text;
                });

                listItems[i].onmouseover = (function (evt) {
                    var item = evt.target;

                    var selectedItems = document.querySelectorAll('.autocomplete.dropdown ul li.selected');

                    if (selectedItems != null && selectedItems != undefined) {
                        for (var i = 0; i < selectedItems.length; i++) {
                            var selectedItem = selectedItems[i];
                            selectedItem.className = selectedItem.className.replace('selected', '');
                        }
                    }

                    if (item.tagName.toLowerCase() == 'li')
                        item.className += ' selected';
                    else
                        item.parentNode.className += ' selected';
                });

                listItems[i].onmouseout = (function () {
                    var selectedItems = document.querySelectorAll('.autocomplete.dropdown ul li.selected');

                    if (selectedItems != null && selectedItems != undefined) {
                        for (var i = 0; i < selectedItems.length; i++) {
                            var selectedItem = selectedItems[i];
                            selectedItem.className = selectedItem.className.replace('selected', '');
                        }
                    }
                });
            }
        },

        removeDropDown: function () {
            var parent = this.htmlElement.parentNode;
            var dropdown = parent.querySelector('.autocomplete.dropdown');

            if (!isEmpty(dropdown))
                parent.removeChild(dropdown);
        },

        preventSuggestionListToLoad: function () {
            this.loadSuggestionList = false;
        }
    }

    function selectItemFromSuggestionList (event) {
        var key = event.key | event.keyCode;
        var itemList = event.target.parentNode.querySelectorAll('.autocomplete.dropdown ul li');
        var itemSelected = event.target.parentNode.querySelector('.autocomplete.dropdown ul li.selected');

        var findIndex = (function (array, item) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        });

        var addSelectedClassToItem = (function (itemList, indexOfCurrentSelectedElement, indexOfElementToSelect) {
            var currentItem = itemList[indexOfCurrentSelectedElement];
            var itemToBeSelected = itemList[indexOfElementToSelect];

            if (currentItem)
                currentItem.className = currentItem.className.replace('selected', '');

            if (itemToBeSelected)
                itemToBeSelected.className += ' selected';
        });

        if (isArrowDown(key)) {
            var index = findIndex(itemList, itemSelected);
            addSelectedClassToItem(itemList, index, index + 1);
            return false;
        }
        else
            if (isArrowUp(key)) {
                var index = findIndex(itemList, itemSelected);
                addSelectedClassToItem(itemList, index, index - 1);
                AutoComplete.prototype.preventSuggestionListToLoad();
                return false;
            }
            else
                if (isEnter(key)) {
                    itemSelected.click();
                    AutoComplete.prototype.preventSuggestionListToLoad();
                    return false;
                }
                else
                    return true;
    }

    function isEmpty(variable) {
        return variable === null || variable === undefined || variable == '';
    }

    function isArrowDown(key) {
        return key === 'ArrowDown' || key === 40;
    }

    function isArrowUp(key) {
        return key === 'ArrowUp' || key === 38;
    }

    function isEnter(key) {
        return key === 'Enter' || key === 13;
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