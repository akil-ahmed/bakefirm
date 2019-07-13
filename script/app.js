function multiplyNode(node, count, deep) {
    for (var i = 0, copy; i < count - 1; i++) {
        copy = node.cloneNode(deep);
        node.parentNode.insertBefore(copy, node);
    }
}
multiplyNode(document.querySelector('.curtain_grid'), 100, true);

$(function () {

    // Globals variables
    // 	An array containing objects with information about the products.
    var products = [],
        filters = {};

    var checkboxes = $('.all-products');
    // Single product page buttons
    var singleProductPage = $('.single-product');
    singleProductPage.on('click', function (e) {
        if (singleProductPage.hasClass('visible')) {
            var clicked = $(e.target);
            // If the close button or the background are clicked go to the previous page.
            if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
                // Change the url hash with the last used filters.
                createQueryHash(filters);
            }
        }
    });
    // These are called on page load
    // Get data about our products from products.json.
    $.getJSON("data.json", function (data) {
        // Write the data into our global variable.
        products = data.items;
        // Call a function to create HTML for all the products.
        generateAllProductsHTML(products);
        // Manually trigger a hashchange to start the app.
        $(window).trigger('hashchange');
    });

    // An event handler with calls the render function on every hashchange.
    // The render function will show the appropriate content of out page.
    $(window).on('hashchange', function () {
        render(decodeURI(window.location.hash));
    });

    // Navigation
    function render(url) {
        // Get the keyword from the url.
        var temp = url.split('/')[0];
        // Hide whatever page is currently shown.
        $('.main-content .page').removeClass('visible');
        var map = {
            // The "Homepage".
            '': function () {
                renderProductsPage(products);
            },
            // Single Products page.
            '#product': function () {
                // Get the index of which product we want to show and call the appropriate function.
                var index = url.split('#product/')[1].trim();
                renderSingleProductPage(index, products);
            }
        };

        // Execute the needed function depending on the url keyword (stored in temp).
        if (map[temp]) {
            map[temp]();
        }
        // If the keyword isn't listed in the above - render the error page.
        else {
            renderErrorPage();
        }
    }

    // This function is called only once - on page load.
    // It fills up the products list via a handlebars template.
    // It recieves one parameter - the data we took from products.json.
    function generateAllProductsHTML(data) {
        var list = $('.all-products .product_main');
        var theTemplateScript = $("#products-template").html();
        //Compile the template​
        var theTemplate = Handlebars.compile(theTemplateScript);
        list.append(theTemplate(data));
        // Each products has a data-index attribute.
        // On click change the url hash to open up a preview for this product only.
        // Remember: every hashchange triggers the render function.
        list.find('li').on('click', function (e) {
            e.preventDefault();
            var productIndex = $(this).data('index');
            window.location.hash = 'product/' + productIndex;
        })
    }

    // This function receives an object containing all the product we want to show.
    function renderProductsPage(data) {
        var page = $('.all-products'),
            allProducts = $('.all-products .product_main > li');
        // Hide all the products in the products list.
        allProducts.addClass('hidden');
        // Iterate over all of the products.
        // If their ID is somewhere in the data object remove the hidden class to reveal them.
        allProducts.each(function () {
            var that = $(this);
            data.forEach(function (item) {
                if (that.data('index') == item.id) {
                    that.removeClass('hidden');
                }
            });
        });
        // Show the page itself.
        // (the render function hides all pages so we need to show the one we want).
        page.addClass('visible');
    }
    // Opens up a preview for one of the products.
    // Its parameters are an index from the hash and the products object.
    function renderSingleProductPage(index, data) {
        var page = $('.single-product'),
            container = $('.preview-large');
        // Find the wanted product by iterating the data object and searching for the chosen index.
        if (data.length) {
            data.forEach(function (item) {
                if (item.id == index) {
                    // Populate '.preview-large' with the chosen product's data.
                    container.find('h3').text(item.name);
                    container.find('img').attr('src', item.img);
                    container.find('p').text(item.price);
                }
            });
        }
        // Show the page.
        page.addClass('visible');
    }
    // Get the filters object, turn it into a string and write it into the hash.
    function createQueryHash(filters) {
        if (!$.isEmptyObject(filters)) {
            window.location.hash = '#filter/' + JSON.stringify(filters);
        }
        else {
            window.location.hash = '#';
        }
    }
});