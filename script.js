document.addEventListener('DOMContentLoaded', () => {
    const keysApiUrl = 'https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/keys';
    const menuApiUrl = 'https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/menu';
    const tenantApiUrl = 'https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/tenants';

    const menuContainer = document.getElementById('menu-container');
    const cartButton = document.querySelector('.cart-button');
    const cartSection = document.getElementById('cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const orderIdElement = document.getElementById('order-id');
    const orderEtaElement = document.getElementById('order-eta');
    const orderEtaValueElement = document.getElementById('order-eta-value');
    const orderIdValueElement = document.getElementById('order-id-value');
    const checkoutButton = document.getElementById('checkout-button');

    const menuItemTemplate = document.getElementById('menu-item-template');
    const menuSectionTemplate = document.getElementById('menu-section-template');
    const cartItemTemplate = document.getElementById('cart-item-template');


    // Show Menu Page
    function showMenuPage() {
    document.getElementById('menu-page').classList.remove('hidden');
    document.getElementById('cart-page').classList.add('hidden');
    document.getElementById('order-page').classList.add('hidden');
    document.getElementById('headerid').classList.remove('hidden');
}

// Show Cart Page
function showCartPage() {
    document.getElementById('menu-page').classList.add('hidden');
    document.getElementById('cart-page').classList.remove('hidden');
    document.getElementById('order-page').classList.add('hidden');
    document.getElementById('headerid').classList.add('hidden');
}

// Show Order Page
function showOrderPage() {
    document.getElementById('menu-page').classList.add('hidden');
    document.getElementById('cpage').classList.add('hidden');
    document.getElementById('order-page').classList.remove('hidden');
    document.getElementById('headerid').classList.add('hidden');
}

document.querySelector('.cart-button').addEventListener('click', showCartPage);
document.getElementById('checkout-button').addEventListener('click', showOrderPage);
document.getElementById('new-order-button').addEventListener('click', showMenuPage);


    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];;
    let globalApiKey = 'yum-PxtRFopRoKZwir25';
    let tenantIdd='q14p';

    function fetchMenu() {
        fetch(keysApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch API key');
                return response.json();
            })
            .then(apiKeyData => {
                //globalApiKey = apiKeyData.apiKey; 
                return fetch(menuApiUrl, {
                    headers: { 'x-zocom': globalApiKey },
                });
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch menu data');
                return response.json();
            })
            .then(menuData => {
                displayMenu(menuData.items);
            })
            .catch(error => {
                console.error('Error:', error);
                menuContainer.textContent = 'Failed to load menu. Please try again later.';
            });
    }

    function displayMenu(items) {
        menuContainer.innerHTML = '';

        const groupedItems = groupMenuItems(items);

        menuContainer.appendChild(createSection('WONTON', groupedItems.wonton));
        menuContainer.appendChild(createSectionWithCombinedPrice('DIPSÅS', groupedItems.dip, 19));
        menuContainer.appendChild(createSectionWithCombinedPrice('DRICKA', groupedItems.drink, 19));
    }

    function groupMenuItems(items) {
        return {
            wonton: items.filter(item => item.type === 'wonton'),
            dip: items.filter(item => item.type === 'dip'),
            drink: items.filter(item => item.type === 'drink'),
        };
    }

    function createSection(title, items) {
        const section = menuSectionTemplate.content.cloneNode(true);
        const titleElement = section.querySelector('.menu-section-title');
        const dipTitleElement = section.querySelector('.dip-section-title');
        
        if (title.toLowerCase() !== 'wonton') {
            dipTitleElement.textContent = title; // Set title for dip or drink
        } else {
            titleElement.textContent = ''; // Remove title for wonton section
        }
    
        const itemsContainer = section.querySelector('.menu-section-items');

        items.forEach(item => {
            const menuItem = createMenuItem(item);
            itemsContainer.appendChild(menuItem);
        });

        return section;
    }

    function createSectionWithCombinedPrice(title, items, combinedPrice) {
        const section = createSection(`${title} ${combinedPrice} SEK`, items);
        return section;
    }


    function createMenuItem(item) {
        let menuItem;
    
        if (item.type === 'wonton') {
            // Use Wonton template
            menuItem = document.getElementById('wonton-item-template').content.cloneNode(true);
            menuItem.querySelector('.wonton-item-name').textContent = item.name;
            menuItem.querySelector('.wonton-item-price').textContent = `${item.price} SEK`;
            menuItem.querySelector('.wonton-item-ingredients').textContent = item.ingredients
                ? item.ingredients.join(', ')
                : '';
        } else {
            // Use Dip/Drink template
            menuItem = document.getElementById('dip-drink-item-template').content.cloneNode(true);
            menuItem.querySelector('.dip-drink-item-name').textContent = item.name;
        }
    
        menuItem.querySelector('div').addEventListener('click', () => addToCart(item));
        return menuItem;
    }



    
    function addToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCartCount();
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    function showCart() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty!</p>';
            cartTotalElement.textContent = '';
            return;
        }

        let total = 0;

        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = `TOTALT ${total} SEK`;
        cartSection.classList.remove('hidden');
        cartSection.scrollIntoView({ behavior: 'smooth' });
    }

    function createCartItem(item) {
        const cartItem = cartItemTemplate.content.cloneNode(true);
        cartItem.querySelector('.cart-item-name').textContent = `${item.name}`;
        cartItem.querySelector('.cart-item-quantity').textContent = `${item.quantity} stycken`;
        cartItem.querySelector('.cart-item-total').textContent = `${(item.price * item.quantity)} SEK`;

        const decreaseButton = cartItem.querySelector('.decrease-button');
        const increaseButton = cartItem.querySelector('.increase-button');

        decreaseButton.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(cartItem => cartItem.name !== item.name);
            }
            updateCartDisplay();
        });

        increaseButton.addEventListener('click', () => {
            item.quantity += 1;
            updateCartDisplay();
        });

        return cartItem;
    }

    function updateCartDisplay() {
        updateCartCount();
        showCart();
    }


    async function postOrder(tenantIdd, items) {
        const orderApiUrl = `https://fdnzawlcf6.execute-api.eu-north-1.amazonaws.com/${tenantIdd}/orders`;
        //const apiKey = apiKey; // Replace with your actual API key
        console.log(`item `,items);
        const itemIds = items.map(item => item.id);
    
    const body = {
        items: itemIds, // Array of item IDs
    };
    console.log(`item `,itemIds);
        console.log(`body `,body);
        try {
            const response = await fetch(orderApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-zocom': globalApiKey,
                },
                body: JSON.stringify(body),
            });
    
            console.log(`Response status: ${response.status} ${response.statusText}`);

            let responseBody;
        try {
            responseBody = await response.json(); // Parse response as JSON
        } catch (parseError) {
            console.warn('Response is not JSON, trying as text:', parseError);
            responseBody = await response.text(); // Fall back to parsing as text
        }

        console.log('Response body:', responseBody);

            if (!response.ok) {
                console.error('Failed to place order:', response.statusText);
                return false;
            }
    
            return responseBody; // Indicate success
        } catch (error) {
            console.error('Error placing order:', error);
            return false;
        }
    }


    async function handleCheckout() {
        if (cart.length === 0) {
            showCustomDialog('Your cart is empty!');
            
            return;
        }

        console.log(`length of cart `,cart);
        
        const orderData = await postOrder(tenantIdd, cart);
        console.log(orderData);
        if (orderData && orderData.order && orderData.order.id && orderData.order.eta) {
            // Update the UI with the order ID
            const etaDate = new Date(orderData.order.eta);
            const minutes = etaDate.getMinutes();
            orderIdValueElement.textContent = orderData.order.id;
            orderEtaValueElement.textContent=`${minutes} MIN`;
           
            orderIdElement.classList.remove('hidden');
            orderEtaElement.classList.remove('hidden')
            // Display order confirmation to the user
            
        } else {
            showCustomDialog('Failed to place order. Please try again.');
        }
    }

    function showCustomDialog(message) {
        const dialog = document.getElementById('custom-dialog');
        const content = document.getElementById('dialog-content');
        const closeButton = document.getElementById('dialog-close');

        // Update content with the dynamic message
        content.textContent = message;

        // Show the dialog
        dialog.showModal();

        // Handle the close button click
        closeButton.addEventListener('click', () => {
            dialog.close();
        });
    }


  checkoutButton.addEventListener('click', () => { orderIdElement.classList.toggle('hidden');    
    handleCheckout(),showOrderPage});

    checkoutButton.addEventListener('click', handleCheckout);

  cartButton.addEventListener('click', () => {
    cartSection.classList.toggle('hidden');
    showCart();
});


document.getElementById('new-order-button').addEventListener('click', function() {
    // Clear session storage to reset the cart or any session data
    sessionStorage.clear();
    
    // Redirect to menu.html to start a new session
    window.location.href = 'index.html';  // Adjust the path to menu.html if needed
});



    fetchMenu();
});
