document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorMessage = document.getElementById('errorMessage');
    const priceSort = document.getElementById('priceSort');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const clearFilters = document.getElementById('clearFilters');

    // API Base URL - Usa a URL atual em produção ou localhost em desenvolvimento
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5173/api'
        : `${window.location.origin}/api`;

    let currentProducts = [];
    let activeFiltersCount = 0;

    // Search Products
    async function searchProducts(query) {
        try {
            showLoading(true);
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar produtos');
            }

            currentProducts = data.products;
            applyFiltersAndSort();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    // Apply Filters and Sort
    function applyFiltersAndSort() {
        let filteredProducts = [...currentProducts];
        
        // Reset active filters counter
        activeFiltersCount = 0;

        // Aplicar filtro de preço
        const min = parseFloat(minPrice.value) || 0;
        const max = parseFloat(maxPrice.value) || Infinity;
        
        if (min > 0 || max < Infinity) {
            activeFiltersCount++;
            filteredProducts = filteredProducts.filter(product => {
                const price = parseFloat(product.price.replace(/[^0-9,]/g, '').replace(',', '.'));
                return price >= min && price <= max;
            });
        }

        // Aplicar ordenação
        if (priceSort.value) {
            activeFiltersCount++;
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9,]/g, '').replace(',', '.'));
                const priceB = parseFloat(b.price.replace(/[^0-9,]/g, '').replace(',', '.'));
                return priceSort.value === 'asc' ? priceA - priceB : priceB - priceA;
            });

            // Atualizar visual do botão de ordenação
            const sortButton = document.querySelector('[data-sort-button]');
            if (sortButton) {
                sortButton.classList.add('bg-blue-100', 'border-blue-300');
            }
        }

        // Atualizar contador de filtros ativos de forma segura
        const filterCounter = document.querySelector('[x-data]');
        if (filterCounter && filterCounter.__x && filterCounter.__x.$data) {
            filterCounter.__x.$data.activeFilters = activeFiltersCount;
        }

        displayResults(filteredProducts);
    }

    // Display Results
    function displayResults(products) {
        resultsContainer.innerHTML = '';
        errorMessage.classList.add('hidden');

        if (products.length === 0) {
            showError('Nenhum produto encontrado com os filtros selecionados');
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'flex flex-col items-center justify-center bg-white border rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1';
            
            // Função auxiliar para gerar as estrelas
            const generateStars = (rating) => {
                const ratingNumber = parseFloat(rating) || 0;
                const fullStars = Math.min(Math.floor(ratingNumber), 5);
                let starsHtml = '';
                
                // Estrelas cheias
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += `
                        <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.675c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.675a1 1 0 00-.364-1.118l-3.974-2.89c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z" />
                        </svg>`;
                }
                
                // Estrelas vazias
                for (let i = fullStars; i < 5; i++) {
                    starsHtml += `
                        <svg class="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.675c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.675a1 1 0 00-.364-1.118l-3.974-2.89c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z" />
                        </svg>`;
                }
                
                return starsHtml;
            };

            card.innerHTML = `
                <!-- Imagem do produto -->
                <div class="flex items-center justify-center h-48 w-full mb-4">
                    <img 
                        src="${product.image || 'https://via.placeholder.com/300x200'}" 
                        alt="${product.name}"
                        class="object-contain max-h-full max-w-full rounded-md"
                        onerror="this.src='https://via.placeholder.com/300x200'"
                    >
                </div>
                <!-- Informações do produto -->
                <div class="mt-2 text-center w-full">
                    <h2 class="text-lg font-medium text-gray-800 line-clamp-2 h-14 mb-2">${product.name}</h2>
                    <div class="flex items-center justify-center mb-2">
                        <div class="flex items-center">
                            ${generateStars(product.rating)}
                        </div>
                        <span class="text-sm text-gray-600 ml-1">(${product.rating})</span>
                    </div>
                    <p class="text-sm text-gray-500">Menor preço disponível</p>
                    <p class="text-2xl font-bold text-blue-600 mt-2">${product.price}</p>
                    ${product.installment ? `<p class="text-sm text-gray-500 mt-1">${product.installment}</p>` : ''}
                    <button 
                        onclick="window.open('${product.link}', '_blank')"
                        class="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                        <span>Ver Produto</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // Show/Hide Loading State
    function showLoading(show) {
        loadingState.classList.toggle('hidden', !show);
        searchButton.disabled = show;
    }

    // Show Error Message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        resultsContainer.innerHTML = '';
    }

    // Reset Filters
    function resetFilters() {
        priceSort.value = '';
        minPrice.value = '';
        maxPrice.value = '';
        
        // Reset visual dos botões
        document.querySelectorAll('[data-filter-button]').forEach(button => {
            button.classList.remove('bg-blue-100', 'border-blue-300');
        });

        // Reset contador de filtros
        const filterCounter = document.querySelector('[x-data]');
        if (filterCounter && filterCounter.__x && filterCounter.__x.$data) {
            filterCounter.__x.$data.activeFilters = 0;
        }

        if (currentProducts.length > 0) {
            displayResults(currentProducts);
        }
    }

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchProducts(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchProducts(query);
            }
        }
    });

    // Filtros e Ordenação
    priceSort.addEventListener('change', applyFiltersAndSort);
    minPrice.addEventListener('input', applyFiltersAndSort);
    maxPrice.addEventListener('input', applyFiltersAndSort);
    clearFilters.addEventListener('click', resetFilters);
});
