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
      
      // Verificar se há frete selecionado
      let shippingCost = 0;
      const selectedShipping = localStorage.getItem('selectedShipping');
      if (selectedShipping) {
        try {
          const shipping = JSON.parse(selectedShipping);
          shippingCost = parseFloat(shipping.price) || 0;
        } catch (e) {
          console.error('Erro ao parsear frete selecionado:', e);
        }
      }
      
      const total = subtotal + shippingCost;
      
      const subtotalElement = document.getElementById('cart-subtotal-value');
      const totalElement = document.getElementById('cart-total-value');
      const shippingTotalElement = document.getElementById('shipping-total');
      const shippingTotalValueElement = document.getElementById('shipping-total-value');
      
      if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
      }
      
      if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
      }
      
      // Mostrar valor do frete se houver
      if (shippingTotalElement && shippingTotalValueElement) {
        if (shippingCost > 0) {
          shippingTotalElement.style.display = 'flex';
          shippingTotalValueElement.textContent = `R$ ${shippingCost.toFixed(2)}`;
        } else {
          shippingTotalElement.style.display = 'none';
        }
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
  
  // Função para fechar o modal do carrinho
  function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
      cartModal.classList.remove('active');
      document.body.classList.remove('modal-open');
      
      // Limpar seleção de frete
      localStorage.removeItem('selectedShipping');
    }
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
  
  // Adicionar event listeners para os componentes do carrinho
  initializeCartComponents();
}

// Função para inicializar os componentes do carrinho
function initializeCartComponents() {
  // Calcular frete por CEP
  const cepInput = document.getElementById('shipping-cep-input');
  const calcShippingBtn = document.getElementById('calc-shipping-btn');
  
  if (cepInput && calcShippingBtn) {
    cepInput.addEventListener('input', formatCep);
    calcShippingBtn.addEventListener('click', calculateShipping);
  }
  
  // Aplicar cupom
  const couponInput = document.getElementById('coupon-code-input');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  
  if (couponInput && applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCoupon);
  }
  
  // Finalizar compra
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Opções de entrega
  const deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
  deliveryOptions.forEach(option => {
    option.addEventListener('change', handleDeliveryOptionChange);
  });
}

// Função para formatar CEP (apenas números, sem hífen)
function formatCep(e) {
  let value = e.target.value.replace(/\D/g, '');
  // Limitar a 8 dígitos
  value = value.slice(0, 8);
  e.target.value = value;
}

// Função para calcular frete usando a API do Melhor Envio
async function calculateShipping() {
  const cepInput = document.getElementById('shipping-cep-input');
  const shippingResults = document.getElementById('shipping-results');
  const cep = cepInput.value.replace(/\D/g, '');
  
  if (cep.length !== 8) {
    shippingResults.innerHTML = '<span style="color: #dc3545;">CEP inválido</span>';
    return;
  }
  
  shippingResults.innerHTML = '<span>Calculando...</span>';
  
  try {
    // Obter quantidade de itens no carrinho
    const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
    const qtdItens = cart.reduce((sum, item) => sum + (item.qty || 1), 0) || 1;
    
    // Chamar API do Melhor Envio através do nosso backend
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cepDestino: cep,
        qtdItens: qtdItens,
        pesoPorItemKg: 0.3 // Peso médio por item em kg
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao calcular frete');
    }
    
    // Verificar se há serviços disponíveis
    if (!data.services || data.services.length === 0) {
      shippingResults.innerHTML = '<span style="color: #dc3545;">Nenhuma opção de frete disponível</span>';
      return;
    }
    
    // Ordenar por preço (do menor para o maior)
    const services = data.services.sort((a, b) => a.price - b.price);
    
    // Exibir opções de frete com seleção
    let html = '<div style="margin-top: 1rem;">';
    services.forEach((service, index) => {
      if (!service.error) {
        html += `
          <label style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem; cursor: pointer;">
            <div style="display: flex; align-items: center;">
              <input type="radio" name="shipping-option" value="${service.code}" data-price="${service.price}" data-name="${service.name}" data-company="${service.company}" style="margin-right: 0.75rem;">
              <div>
                <strong>${service.name}</strong>
                <div style="font-size: 0.8rem; color: #666;">${service.company}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <strong>R$ ${parseFloat(service.price).toFixed(2)}</strong>
              <div style="font-size: 0.8rem; color: #666;">${service.prazo} dias úteis</div>
            </div>
          </label>
        `;
      }
    });
    html += '</div>';
    
    // Se não houver serviços sem erro
    if (html === '') {
      html = '<span style="color: #dc3545;">Nenhuma opção de frete disponível</span>';
    }
    
    shippingResults.innerHTML = html;
    
    // Adicionar event listener para seleção de transportadora
    setTimeout(() => {
      const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');
      shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
          // Salvar a opção selecionada
          const selectedShipping = {
            code: this.value,
            name: this.dataset.name,
            company: this.dataset.company,
            price: parseFloat(this.dataset.price)
          };
          
          // Salvar no localStorage
          localStorage.setItem('selectedShipping', JSON.stringify(selectedShipping));
          
          // Atualizar totais do carrinho
          updateCartTotalsWithShipping(selectedShipping.price);
        });
      });
      
      // Selecionar automaticamente a primeira opção
      if (shippingOptions.length > 0) {
        shippingOptions[0].checked = true;
        shippingOptions[0].dispatchEvent(new Event('change'));
      }
    }, 100);
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    shippingResults.innerHTML = `<span style="color: #dc3545;">Erro ao calcular frete: ${error.message}</span>`;
  }
}

// Função para atualizar totais do carrinho com frete
function updateCartTotalsWithShipping(shippingCost = 0) {
  try {
    const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.qty || 1)), 0);
    const total = subtotal + shippingCost;
    
    const subtotalElement = document.getElementById('cart-subtotal-value');
    const totalElement = document.getElementById('cart-total-value');
    const shippingTotalElement = document.getElementById('shipping-total');
    const shippingTotalValueElement = document.getElementById('shipping-total-value');
    
    if (subtotalElement) {
      subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
    
    if (totalElement) {
      totalElement.textContent = `R$ ${total.toFixed(2)}`;
    }
    
    // Mostrar valor do frete se houver
    if (shippingTotalElement && shippingTotalValueElement) {
      if (shippingCost > 0) {
        shippingTotalElement.style.display = 'flex';
        shippingTotalValueElement.textContent = `R$ ${shippingCost.toFixed(2)}`;
      } else {
        shippingTotalElement.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar totais do carrinho com frete:', error);
  }
}

// Função para aplicar cupom
async function applyCoupon() {
  const couponInput = document.getElementById('coupon-code-input');
  const couponMessage = document.getElementById('coupon-message');
  const couponCode = couponInput.value.trim();
  
  if (!couponCode) {
    couponMessage.innerHTML = '<span style="color: #dc3545;">Informe um código de cupom</span>';
    return;
  }
  
  couponMessage.innerHTML = '<span>Verificando...</span>';
  
  try {
    // Simular verificação de cupom
    setTimeout(() => {
      if (couponCode.toLowerCase() === 'desconto10') {
        couponMessage.innerHTML = '<span style="color: #28a745;">Cupom aplicado! 10% de desconto</span>';
        
        // Mostrar desconto no carrinho
        const discountElement = document.getElementById('coupon-discount');
        const discountValueElement = document.getElementById('coupon-discount-value');
        if (discountElement && discountValueElement) {
          discountElement.style.display = 'flex';
          discountValueElement.textContent = '-R$ 10,00';
        }
        
        // Atualizar totais do carrinho
        if (typeof updateCartTotals === 'function') {
          updateCartTotals();
        } else {
          // Se a função não estiver disponível no escopo atual, tentar encontrar o elemento e atualizar manualmente
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
      } else {
        couponMessage.innerHTML = '<span style="color: #dc3545;">Cupom inválido ou expirado</span>';
      }
    }, 1000);
  } catch (error) {
    couponMessage.innerHTML = '<span style="color: #dc3545;">Erro ao aplicar cupom</span>';
  }
}

// Função para lidar com mudança nas opções de entrega
function handleDeliveryOptionChange(e) {
  const pickupSection = document.getElementById('pickup-section');
  const motoUberSection = document.getElementById('moto-uber-section');
  const cepSection = document.getElementById('cep-section');
  
  // Esconder todas as seções
  if (pickupSection) pickupSection.style.display = 'none';
  if (motoUberSection) motoUberSection.style.display = 'none';
  if (cepSection) cepSection.style.display = 'none';
  
  // Mostrar a seção selecionada
  switch (e.target.value) {
    case 'pickup':
      if (pickupSection) pickupSection.style.display = 'block';
      break;
    case 'moto-uber':
      if (motoUberSection) motoUberSection.style.display = 'block';
      break;
    case 'cep':
    default:
      if (cepSection) cepSection.style.display = 'block';
      break;
  }
}

// Função para prosseguir para checkout
function proceedToCheckout() {
  try {
    const cart = JSON.parse(localStorage.getItem('hypex_cart') || '[]');
    
    if (cart.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }
    
    // Obter frete selecionado
    let selectedShipping = null;
    const selectedShippingStr = localStorage.getItem('selectedShipping');
    if (selectedShippingStr) {
      try {
        selectedShipping = JSON.parse(selectedShippingStr);
      } catch (e) {
        console.error('Erro ao parsear frete selecionado:', e);
      }
    }
    
    // Coletar dados para checkout
    const checkoutData = {
      items: cart,
      shipping: {
        type: document.querySelector('input[name="delivery-option"]:checked')?.value || 'cep'
      }
    };
    
    // Adicionar dados específicos de frete se for entrega via CEP
    if (checkoutData.shipping.type === 'cep' && selectedShipping) {
      checkoutData.shipping.cepDestino = document.getElementById('shipping-cep-input')?.value.replace(/\D/g, '') || '';
      checkoutData.shipping.service_code = selectedShipping.code;
      checkoutData.shipping.service_name = selectedShipping.name;
      checkoutData.shipping.price = selectedShipping.price;
      checkoutData.shipping.company = selectedShipping.company;
    }
    
    // Salvar dados no localStorage
    localStorage.setItem('hypex_checkout_data', JSON.stringify(checkoutData));
    
    // Redirecionar para página de checkout
    window.location.href = '/pages/checkout.html';
  } catch (error) {
    console.error('Erro ao prosseguir para checkout:', error);
    alert('Erro ao processar pedido');
  }
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