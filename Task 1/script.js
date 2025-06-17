document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const errorMessage = document.getElementById('errorMessage');
    const searchResults = document.getElementById('searchResults');

    // Initial state - show some popular products
    fetchPopularProducts();

    // Form submission handler
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSearch();
    });

    // Input validation on blur
    searchInput.addEventListener('blur', function() {
        validateInput();
    });

    async function handleSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (!validateInput()) {
            return;
        }

        // Clear previous results and show loading state
        clearError();
        searchResults.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Searching for "${escapeHtml(searchTerm)}"...</p>
            </div>
        `;

        // Disable search button during API call
        searchButton.disabled = true;
        
        try {
            const products = await searchProducts(searchTerm);
            displayResults(products, searchTerm);
        } catch (error) {
            console.error('Search error:', error);
            showError('An error occurred while searching. Please try again.');
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Search Error</h2>
                    <p>We couldn't complete your search. Please try again later.</p>
                </div>
            `;
        } finally {
            searchButton.disabled = false;
        }
    }

    function validateInput() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            showError('Please enter a product name to search');
            searchInput.classList.add('invalid');
            searchInput.focus();
            return false;
        }
        
        if (searchTerm.length < 2) {
            showError('Search term must be at least 2 characters');
            searchInput.classList.add('invalid');
            searchInput.focus();
            return false;
        }
        
        clearError();
        return true;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.setAttribute('aria-invalid', 'true');
    }

    function clearError() {
        errorMessage.textContent = '';
        errorMessage.removeAttribute('aria-invalid');
        searchInput.classList.remove('invalid');
    }

    async function fetchPopularProducts() {
        try {
            searchResults.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading popular products...</p>
                </div>
            `;
            
            const response = await fetch('https://dummyjson.com/products?limit=6');
            const data = await response.json();
            displayResults(data.products, '', true);
        } catch (error) {
            console.error('Error fetching popular products:', error);
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Couldn't Load Products</h2>
                    <p>Try searching for specific products above.</p>
                </div>
            `;
        }
    }

    async function searchProducts(searchTerm) {
        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.products;
    }

    function displayResults(products, searchTerm = '', isInitialLoad = false) {
        if (!products || products.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h2>No Products Found</h2>
                    <p>No products matching "${escapeHtml(searchTerm)}" were found.</p>
                    <p>Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = `
            ${!isInitialLoad ? `<h2>Search Results for "${escapeHtml(searchTerm)}"</h2>` : '<h2>Popular Products</h2>'}
            <div class="product-grid">
                ${products.map(product => `
                    <div class="product-card">
                        <div class="product-image-container">
                            <img src="${product.thumbnail}" alt="${escapeHtml(product.title)}" class="product-image" loading="lazy">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${escapeHtml(product.title)}</h3>
                            <p class="product-brand">${escapeHtml(product.brand)}</p>
                            <p class="product-price">$${product.price.toFixed(2)}</p>
                            <div class="product-rating">
                                ${generateStarRating(product.rating)}
                                <span class="rating-value">(${product.rating.toFixed(1)})</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        searchResults.innerHTML = resultsHTML;
    }

    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        stars += '<i class="fas fa-star"></i>'.repeat(fullStars);
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        stars += '<i class="far fa-star"></i>'.repeat(emptyStars);
        
        return stars;
    }

    // Helper function to prevent XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});