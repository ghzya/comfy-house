// set variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center')

// main cart
let cart = [];

// buttons
let buttonsDOM = [];

// getting the products
class Products {
    async getProducts() {
        try {
            // get products data from local file 
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;

            // clean the object products data
            products = products.map((item) => {
                const {price,title} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;

                // return clean object
                return {title,price,id,image}; 
            })

            return products;

        } catch (error) {
            // display the error in console
            console.log(error);
        }
    }
}

// displaying products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            // method 1: create an childnodes for productCenter containing div for each product
            // const div = document.createElement('div');
            // div.innerHTML = `
            //     <!-- single product -->
            //     <article class="product">
            //         <div class="img-container">
            //             <img src=${product.image} alt=${product.title} class="product-img">
            //             <button class="bag-btn" data-id=${product.id}>
            //                 <!-- <i class="fas fa-shopping-cart"></i> -->
            //                 <i class="las la-shopping-cart"></i>
            //                 add to cart
            //             </button>
            //         </div>
            //         <h3>${product.title}</h3>
            //         <h4>$${product.price}</h4>
            //     </article>
            //     <!-- end of single product -->
            // `;
            // productsDOM.appendChild(div);

            // method 2: create an innerhtml for productCenter from each product in products, that is stored as string in single variable
            result += `
                <!-- single product -->
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt=${product.title} class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <!-- <i class="fas fa-shopping-cart"></i> -->
                            <i class="las la-shopping-cart"></i>
                            add to cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                <!-- end of single product -->
            `;
        });
        
        productsDOM.innerHTML = result; // part of method 2
    }

    // add product to cart DOM when the add to cart button clicked
    getBagBtns() {
        // get all button in product DOM
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);

            if (inCart) {
                // if the item is in cart array, disable add to cart button in product DOM 
                button.innerText = "in cart";
                button.disabled = true;
            } 
            
            // when add to cart button clicked, add the product into cart array and display it on cart DOM
            button.addEventListener('click', (event) => {
                event.target.innerText = "in cart";
                event.target.disabled = true;

                // get product from products (that is stored in localstorage and get new object data amount set to 1)
                let cartItem = {...Storage.getProduct(id), amount:1};

                // add product to the cart
                cart = [...cart,cartItem];
                
                // save cart in localstorage 
                Storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // display cart item
                this.addCartItem(cartItem);
            })
        })
    } 

    // update the value on cart total and cart item 
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    // create a node for displaying cart item 
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <!-- cart item -->
                <img src=${item.image} alt=${item.title}>
                <div>
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div>
                    <i class="las la-chevron-up" data-id=${item.id}></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class="las la-chevron-down" data-id=${item.id}></i>
                </div>
            <!-- end cart item -->
        `;
        cartContent.appendChild(div);
    }

    // show cartDOM and cartOverlay using CSS class
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    // setup the cart data from localStorage if exist 
    setupAPP() {
        // get the cart array from localstorage
        cart = Storage.getCart();

        // set vale of the cart items and cart total according to the cart array on the localstorage
        this.setCartValues(cart);

        // populate the cart content dom with the cart item listed on the cart array from localstorage
        this.populateCart(cart);

        // show cart and cart overlay when the cart button clicked
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart )
    }

    // display each cart item that is stored in cart array into cart DOM
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    // hide cartDOM and cartOverlay using CSS class
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    // logic used to manage the cart
    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        // cart functionality (using event bubble)
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                // set removeItem to the target DOM (childnode of cart-content that contains remove-item class)
                let removeItem = event.target;

                // get the id of the removeItem node
                let id = removeItem.dataset.id;

                // remove the cart item node
                cartContent.removeChild(removeItem.parentElement.parentElement);

                // remove the cart item data according the id using method of this UI class
                this.removeItem(id);

            } else if (event.target.classList.contains('la-chevron-up')) {
                // set addAmount to the target DOM
                let addAmount = event.target;

                // get the id of the addAmount DOM
                let id = addAmount.dataset.id;

                // get the cart item object data and increase the item amount by 1 
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;

                // save the updated cart
                Storage.saveCart(cart);

                // update the cart items and cart total DOM
                this.setCartValues(cart);

                // set the (next sibling) item amount DOM innerText to the updated tempItem.amount 
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if (event.target.classList.contains('la-chevron-down')) {
                // set addAmount to the target DOM
                let lowerAmount = event.target;

                // get the id of the lowerAmount DOM
                let id = lowerAmount.dataset.id;

                // get the cart item object data and decrease the item amount by 1 
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;

                if (tempItem.amount > 0) {
                    // save the updated cart
                    Storage.saveCart(cart);

                    // update the cart items and cart total DOM
                    this.setCartValues(cart);

                    // set the (previous sibling) item amount DOM innerText to the updated tempItem.amount 
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;      

                } else {
                    // remove the cart item node
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);

                    // remove the cart item data according the id
                    this.removeItem(id);
                }
            }
        })
    }

    // clear all cart item 
    clearCart() {
        // map each value of item on cartItems to id of the item
        let cartItems = cart.map(item => item.id);

        // remove each item one by one according its id
        cartItems.forEach(id => this.removeItem(id));

        // remove each cart item one by one
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        // hide cart and cart overlay 
        this.hideCart();
    }

    // remove one cart item 
    removeItem(id) {
        // clear cart functionality
        cart = cart.filter(item => item.id !== id);

        // set cart items and cart total element to 0 (default)
        this.setCartValues(cart);
        
        // clear the cart on localstorage
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);

        // set bag button state to default
        button.disabled = false;
        button.innerHTML = `
            <i class="las la-shopping-cart"></i>
            add to cart
        `;
    }

    // get single button from buttons DOM (the button is used for changing back the text on add to cart button to the first state)
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

// managing local storage
class Storage {
    // save product from products data to localstorage
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    // access one product from localStorage
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    // save cart into localStorage
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // access cart on localStorage
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

// running the DOM when loading the web
document.addEventListener("DOMContentLoaded", () => {
    // instantiate the class
    const ui = new UI();
    const products = new Products();

    // setup app
    ui.setupAPP();

    // gett all product 
    products
    .getProducts()
    .then(products => {
        // display products into the web 
        ui.displayProducts(products);

        // save products to localStorage 
        Storage.saveProducts(products);
    })
    .then(() => {
        // run add to cart button listener
        ui.getBagBtns();

        // run cart logic 
        ui.cartLogic();
    });
});






