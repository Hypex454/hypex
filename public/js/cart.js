// cart.js - Gerenciamento do carrinho de compras

// Função para inicializar o carrinho
function initializeCart() {
  console.log('Inicializando carrinho...');
  // Verificar se o carrinho já foi inicializado
  if (window.cartInitialized) {
    console.log('Carrinho já inicializado');
    return;
  }
  window.cartInitialized = true;
  console.log('Carrinho inicializado com sucesso');

  // Função para abrir o modal do carrinho
  function openCartModal() {
    console.log('Tentando abrir o modal do carrinho...');
    const cartModal = document.getElementById('cart-modal');
    console.log('Elemento cart-modal encontrado:', cartModal);
    if (cartModal) {
      console.log('Abrindo modal do carrinho');
      cartModal.classList.add('active');
      document.body.classList.add('modal-open');
      renderCartItems();
    } else {
      console.log('Elemento cart-modal não encontrado');
    }
  }

  // Função para fechar o modal do carrinho
  function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
      cartModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  // Função para renderizar os itens do carrinho
  function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    try {
      const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <p>Seu carrinho está vazio</p>
            <a href="/" class="btn">Continuar comprando</a>
          </div>
        `;
        updateCartTotals();
        return;
      }

      // Renderizar itens do carrinho
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.product_id}">
          <div class="cart-item-image">
            <img src="${item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f8f9fa" width="100" height="100"/%3E%3C/svg%3E'}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2)}</p>
            <div class="cart-item-quantity">
              <button class="qty-btn minus" data-product-id="${item.product_id}">-</button>
              <span class="qty-value">${item.qty || 1}</span>
              <button class="qty-btn plus" data-product-id="${item.product_id}">+</button>
            </div>
          </div>
          <button class="remove-item" data-product-id="${item.product_id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('');

      // Adicionar event listeners para os botões de quantidade
      document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const productId = btn.dataset.productId;
          const isPlus = btn.classList.contains('plus');
          updateCartItemQuantity(productId, isPlus ? 1 : -1);
        });
      });

      // Adicionar event listeners para os botões de remover
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const productId = btn.dataset.productId;
          removeCartItem(productId);
        });
      });

      updateCartTotals();
    } catch (error) {
      console.error('Erro ao renderizar itens do carrinho:', error);
      cartItemsContainer.innerHTML = '<p>Erro ao carregar itens do carrinho</p>';
    }
  }

  // Função para atualizar a quantidade de um item no carrinho
  function updateCartItemQuantity(productId, change) {
    try {
      let cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
      const itemIndex = cart.findIndex(item => item.product_id === productId);
      
      if (itemIndex !== -1) {
        cart[itemIndex].qty = Math.max(1, (cart[itemIndex].qty || 1) + change);
        
        // Se a quantidade for 0 ou menos, remover o item
        if (cart[itemIndex].qty <= 0) {
          cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('hypex_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade do item:', error);
    }
  }

  // Função para remover um item do carrinho
  function removeCartItem(productId) {
    try {
      let cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
      cart = cart.filter(item => item.product_id !== productId);
      localStorage.setItem('hypex_cart', JSON.stringify(cart));
      updateCartCount();
      renderCartItems();
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
    }
  }

  // Função para atualizar os totais do carrinho
  function updateCartTotals() {
    try {
      const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
      const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.qty || 1)), 0);
      
      const subtotalElement = document.getElementById('cart-subtotal-value');
      const totalElement = document.getElementById('cart-total-value');
      
      if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
      }
      
      if (totalElement) {
        totalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
      }
    } catch (error) {
      console.error('Erro ao atualizar totais do carrinho:', error);
    }
  }

  // Função para atualizar o contador do carrinho
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
      });
    } catch (error) {
      console.error('Erro ao atualizar contador do carrinho:', error);
    }
  }

  // Event listeners para o botão do carrinho
  const cartButton = document.getElementById('cart-button');
  if (cartButton) {
    // Remover event listeners antigos para evitar duplicação
    cartButton.removeEventListener('click', handleCartButtonClick);
    cartButton.addEventListener('click', handleCartButtonClick);
  }

  // Função para lidar com o clique no botão do carrinho
  function handleCartButtonClick(e) {
    console.log('Botão do carrinho clicado');
    e.preventDefault();
    openCartModal();
  }

  // Event listeners para os botões de fechar o modal
  document.querySelectorAll('.close-modal').forEach(btn => {
    // Remover event listeners antigos para evitar duplicação
    btn.removeEventListener('click', handleCloseModalClick);
    btn.addEventListener('click', handleCloseModalClick);
  });

  // Função para lidar com o clique no botão de fechar modal
  function handleCloseModalClick(e) {
    e.preventDefault();
    closeCartModal();
  }

  // Fechar modal ao clicar fora
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    // Remover event listeners antigos para evitar duplicação
    cartModal.removeEventListener('click', handleModalClick);
    cartModal.addEventListener('click', handleModalClick);
  }

  // Função para lidar com o clique no modal
  function handleModalClick(e) {
    if (e.target === cartModal) {
      closeCartModal();
    }
  }

  // Atualizar contador do carrinho ao carregar a página
  updateCartCount();

  // Atualizar contador quando o armazenamento local mudar
  window.addEventListener('storage', (e) => {
    if (e.key === 'hypex_cart') {
      updateCartCount();
      if (cartModal && cartModal.classList.contains('active')) {
        renderCartItems();
      }
    }
  });
}

// Função para tentar inicializar o carrinho quando o DOM estiver pronto
function tryInitializeCart() {
  // Verificar se o elemento do carrinho existe na página
  if (document.getElementById('cart-button')) {
    initializeCart();
  }
}

// Inicializar o carrinho quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInitializeCart);
} else {
  // DOM já está pronto
  tryInitializeCart();
}

// Tentar inicializar o carrinho após um pequeno atraso para garantir que todos os elementos estejam carregados
setTimeout(tryInitializeCart, 100);