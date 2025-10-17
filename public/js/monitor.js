// Monitor.js - Gerenciamento de monitoramento de preços no frontend

// API Base URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5173/api'
    : 'https://buscape-search-api.vercel.app/api';

// Variável global para armazenar o produto selecionado
let selectedProduct = null;

// Sistema de Toast Notifications
const Toast = {
    show: function(message, type = 'success', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        toast.className = 'pointer-events-auto transform transition-all duration-300 ease-in-out translate-x-full opacity-0';

        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
        };

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        toast.innerHTML = `
            <div class="flex items-center gap-3 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md">
                <div class="flex-shrink-0">
                    ${icons[type]}
                </div>
                <p class="flex-1 text-sm font-medium">${message}</p>
                <button onclick="Toast.hide('${toastId}')" class="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded p-1 transition-all">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto-remover após duration
        setTimeout(() => {
            this.hide(toastId);
        }, duration);

        return toastId;
    },

    hide: function(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;

        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    success: function(message, duration) {
        return this.show(message, 'success', duration);
    },

    error: function(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning: function(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info: function(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// Tornar Toast disponível globalmente
window.Toast = Toast;

// Função para abrir o modal de monitoramento
window.openMonitorModal = function(product) {
    selectedProduct = product;
    
    const modal = document.getElementById('monitorModal');
    const productImage = document.getElementById('modalProductImage');
    const productName = document.getElementById('modalProductName');
    const productPrice = document.getElementById('modalProductPrice');
    const emailInput = document.getElementById('monitorEmail');
    const targetPriceInput = document.getElementById('monitorTargetPrice');
    
    // Preencher informações do produto
    const imageSrc = product.image || 'https://via.placeholder.com/80';
    productImage.src = imageSrc;
    productImage.alt = product.name;
    
    // Atualizar também a imagem borrada
    const blurredImage = document.getElementById('modalProductImageBlurred');
    if (blurredImage) {
        blurredImage.src = imageSrc;
    }
    
    productName.textContent = product.name;
    productPrice.textContent = product.price;
    
    // Carregar e-mail salvo do localStorage
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
    }
    
    // Sugerir preço alvo (10% abaixo do preço atual) - removido para usar botões de escolha rápida
    const currentPrice = parsePrice(product.price);
    if (currentPrice > 0) {
        // Não preencher automaticamente, deixar usuário escolher
        targetPriceInput.placeholder = `Ex: ${(currentPrice * 0.8).toFixed(2)}`;
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Reinicializar ícones do Lucide
    setTimeout(() => lucide.createIcons(), 100);
};

// Função para definir preço rápido baseado em porcentagem
window.setQuickPrice = function(percentage) {
    if (!selectedProduct) {
        Toast.warning('Nenhum produto selecionado');
        return;
    }

    const currentPrice = parsePrice(selectedProduct.price);
    if (currentPrice <= 0) {
        Toast.error('Preço atual inválido');
        return;
    }

    // Calcular preço alvo baseado na porcentagem EXATA
    const targetPrice = (currentPrice * (percentage / 100)).toFixed(2);
    const discount = 100 - percentage;
    
    // Atualizar input
    const targetPriceInput = document.getElementById('monitorTargetPrice');
    targetPriceInput.value = targetPrice;

    // Feedback visual no botão clicado
    const buttons = document.querySelectorAll('[onclick^="setQuickPrice"]');
    buttons.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2');
    });
    event.target.closest('button').classList.add('ring-2', 'ring-offset-2');

    // Toast de confirmação
    Toast.info(`Preço alvo definido: R$ ${targetPrice} (${discount}% de desconto)`, 2000);
};

// Função para converter string de preço em número
function parsePrice(priceString) {
    if (!priceString) return 0;
    const cleanPrice = priceString.replace(/[^0-9,]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
}

// Função para validar e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para mostrar mensagem no modal (deprecated - usar Toast)
function showModalMessage(message, type = 'success') {
    // Usar sistema de Toast em vez de mensagem no modal
    if (type === 'success') {
        Toast.success(message);
    } else {
        Toast.error(message);
    }
}

// Função para salvar monitoramento
async function saveMonitor(email, targetPrice, product) {
    try {
        const currentPrice = parsePrice(product.price);
        
        const response = await fetch(`${API_URL}/monitor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail: email,
                productName: product.name,
                productUrl: product.link,
                currentPrice: currentPrice,
                targetPrice: parseFloat(targetPrice),
                productImage: product.image
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao adicionar monitoramento');
        }

        return data;
    } catch (error) {
        console.error('Erro ao salvar monitor:', error);
        throw error;
    }
}

// Event listener para o formulário de monitoramento
document.addEventListener('DOMContentLoaded', () => {
    const monitorForm = document.getElementById('monitorForm');
    
    if (monitorForm) {
        monitorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('monitorEmail').value.trim();
            const targetPrice = document.getElementById('monitorTargetPrice').value;
            const submitButton = monitorForm.querySelector('button[type="submit"]');
            
            // Validações
            if (!validateEmail(email)) {
                Toast.error('Por favor, insira um e-mail válido');
                return;
            }
            
            if (!targetPrice || parseFloat(targetPrice) <= 0) {
                Toast.error('Por favor, insira um preço alvo válido');
                return;
            }
            
            if (!selectedProduct) {
                Toast.error('Produto não selecionado');
                return;
            }
            
            // Desabilitar botão durante o envio
            submitButton.disabled = true;
            submitButton.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Salvando...</span>';
            lucide.createIcons();
            
            try {
                const result = await saveMonitor(email, targetPrice, selectedProduct);
                
                // Salvar e-mail no localStorage para uso futuro
                localStorage.setItem('userEmail', email);
                
                // Mostrar toast de sucesso
                Toast.success('🎉 Produto adicionado ao monitoramento! Você receberá um e-mail quando o preço atingir seu objetivo.', 5000);
                
                // Fechar modal e resetar formulário
                document.getElementById('monitorModal').classList.add('hidden');
                monitorForm.reset();
                
            } catch (error) {
                Toast.error(error.message || 'Erro ao adicionar monitoramento. Tente novamente.');
            } finally {
                // Reabilitar botão
                submitButton.disabled = false;
                submitButton.innerHTML = '<i data-lucide="bell-ring" class="w-4 h-4"></i><span>Monitorar</span>';
                lucide.createIcons();
            }
        });
    }
});

// Função para carregar produtos monitorados (usada na página monitor.html)
window.loadMonitoredProducts = async function(email) {
    try {
        const response = await fetch(`${API_URL}/monitor?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar produtos monitorados');
        }

        return data.monitors || [];
    } catch (error) {
        console.error('Erro ao carregar produtos monitorados:', error);
        throw error;
    }
};

// Função para remover monitoramento
window.removeMonitor = async function(monitorId) {
    try {
        const response = await fetch(`${API_URL}/monitor/${monitorId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao remover monitoramento');
        }

        return data;
    } catch (error) {
        console.error('Erro ao remover monitor:', error);
        throw error;
    }
};

// Função para atualizar preço alvo
window.updateTargetPrice = async function(monitorId, newTargetPrice) {
    try {
        const response = await fetch(`${API_URL}/monitor/${monitorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                targetPrice: parseFloat(newTargetPrice)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar preço alvo');
        }

        return data;
    } catch (error) {
        console.error('Erro ao atualizar preço alvo:', error);
        throw error;
    }
};

// Função para verificar preço manualmente
window.checkPriceManually = async function(monitorId) {
    try {
        const response = await fetch(`${API_URL}/monitor/check/${monitorId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao verificar preço');
        }

        return data;
    } catch (error) {
        console.error('Erro ao verificar preço:', error);
        throw error;
    }
};

console.log('✅ Monitor.js carregado com sucesso');

