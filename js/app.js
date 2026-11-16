const products = [
  {
    id: "iphone-16-pro",
    brand: "Apple",
    name: "iPhone 16 Pro",
    detail: "For the all-in, all-day creator.",
    price: 999,
    was: 1099,
    badge: "A little bit special",
    best: true,
    colors: ["#d9d8cd", "#a9aa9e", "#ced2c4"],
    halo: "#e5e5dc",
    screen: "#b9c9a0",
    cameras: 3,
    mark: "",
    rating: "4.9",
  },
  {
    id: "galaxy-s25-ultra",
    brand: "Samsung",
    name: "Galaxy S25 Ultra",
    detail: "Big ideas need a big screen.",
    price: 1199,
    was: null,
    badge: "Worth a closer look",
    best: false,
    colors: ["#c2c9d0", "#989fa8", "#ced2d5"],
    halo: "#e1e4e6",
    screen: "#a7bfd0",
    cameras: 4,
    mark: "S",
    rating: "4.8",
  },
  {
    id: "iphone-16",
    brand: "Apple",
    name: "iPhone 16",
    detail: "Your everyday, upgraded.",
    price: 799,
    was: null,
    badge: "The crowd pleaser",
    best: false,
    colors: ["#d8a4a0", "#c6837e", "#e1b5b0"],
    halo: "#eee2df",
    screen: "#c9928b",
    cameras: 2,
    mark: "",
    rating: "4.9",
  },
  {
    id: "galaxy-z-flip6",
    brand: "Samsung",
    name: "Galaxy Z Flip6",
    detail: "A little flip. A lot of fun.",
    price: 999,
    was: 1099,
    badge: "Pocket-sized joy",
    best: false,
    colors: ["#b5c5b5", "#9eb09e", "#cad5c9"],
    halo: "#e1e7df",
    screen: "#a9c5ac",
    cameras: 2,
    mark: "S",
    rating: "4.8",
  },
  {
    id: "iphone-16-pro-max",
    brand: "Apple",
    name: "iPhone 16 Pro Max",
    detail: "Go big on the good stuff.",
    price: 1199,
    was: null,
    badge: "For the big-screen people",
    best: false,
    colors: ["#c7c4b8", "#aaa79c", "#d5d2c8"],
    halo: "#e7e5df",
    screen: "#b3b69a",
    cameras: 3,
    mark: "",
    rating: "4.9",
  },
  {
    id: "galaxy-s25",
    brand: "Samsung",
    name: "Galaxy S25",
    detail: "Small enough to go everywhere.",
    price: 799,
    was: null,
    badge: "Easy does it",
    best: false,
    colors: ["#c1b2c8", "#a695af", "#d0c4d5"],
    halo: "#e8e3e9",
    screen: "#bca8c6",
    cameras: 3,
    mark: "S",
    rating: "4.8",
  },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const grid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const filterButtons = [...document.querySelectorAll(".filter-tab")];
const cartOverlay = document.querySelector("#cart-overlay");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const toast = document.querySelector("#toast");
let activeBrand = "All";
let cart = loadCart();
let toastTimeout;

function loadCart() {
  const serialized = localStorage.getItem("forme-cart");
  if (!serialized) return {};

  let saved;
  try {
    saved = JSON.parse(serialized);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.error("Saved bag data is invalid and could not be restored.", error);
    return {};
  }

  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    console.error("Saved bag data has an unexpected format and could not be restored.");
    return {};
  }
  return Object.fromEntries(
    Object.entries(saved).filter(([id, quantity]) =>
      products.some((product) => product.id === id) &&
      Number.isInteger(quantity) &&
      quantity > 0,
    ),
  );
}

function saveCart() {
  localStorage.setItem("forme-cart", JSON.stringify(cart));
}

function phoneArtwork(product, compact = false) {
  const [top, bottom, cameraSurface] = product.colors;
  const cameraCount = product.cameras === 4 ? 4 : product.cameras;
  const cameras = Array.from({ length: cameraCount }, () => "<i></i>").join("");
  return `
    <div class="product-visual${compact ? " compact" : ""}" aria-hidden="true">
      <div class="device back" style="--device-top:${top};--device-bottom:${bottom}">
        <div class="device-cameras" style="background:${cameraSurface}">${cameras}</div>
        <span class="device-mark">${product.mark}</span>
      </div>
      <div class="device front" style="--screen:${product.screen}">
        <div class="device-screen"></div>
      </div>
    </div>`;
}

function renderProducts() {
  const search = searchInput.value.trim().toLowerCase();
  let visible = products.filter((product) => {
    const matchesBrand = activeBrand === "All" || product.brand === activeBrand;
    const matchesSearch = `${product.brand} ${product.name} ${product.detail}`.toLowerCase().includes(search);
    return matchesBrand && matchesSearch;
  });

  if (sortSelect.value === "price-low") visible = visible.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-high") visible = visible.sort((a, b) => b.price - a.price);

  grid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image" style="--halo:${product.halo}">
        <span class="product-badge${product.best ? " best" : ""}">${product.badge}</span>
        ${phoneArtwork(product)}
      </div>
      <div class="product-meta">
        <span class="product-brand">${product.brand}</span>
        <span class="product-rating"><span aria-label="5 stars">★★★★★</span> ${product.rating}</span>
      </div>
      <h3 class="product-name"><a href="products/${product.id}.html">${product.name}</a></h3>
      <p class="product-description">${product.detail}</p>
      <p class="product-delivery">Cash on delivery available</p>
      <div class="product-purchase">
        <span class="product-price">${money.format(product.price)}${product.was ? ` <del>${money.format(product.was)}</del>` : ""}</span>
        <button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  grid.hidden = visible.length === 0;
}

function renderCart() {
  const entries = Object.entries(cart);
  const totalItems = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  document.querySelector("#cart-count").textContent = totalItems;
  document.querySelector("#drawer-count").textContent = `(${totalItems})`;
  cartEmpty.hidden = totalItems > 0;
  cartFooter.hidden = totalItems === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `
      <div class="cart-row">
        <div class="cart-thumbnail">${phoneArtwork(product)}</div>
        <div>
          <h3 class="cart-item-title">${product.name}</h3>
          <span class="cart-item-price">${money.format(product.price)}</span>
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
            <button data-quantity="${id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
            <span>${quantity}</span>
            <button data-quantity="${id}" data-change="1" aria-label="Add one ${product.name}">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${id}" aria-label="Remove ${product.name} from bag">Remove</button>
      </div>`;
  }).join("");
  document.querySelector("#cart-subtotal").textContent = money.format(subtotal);
}

function updateCart(id, change) {
  const next = (cart[id] || 0) + change;
  if (next > 0) cart[id] = next;
  else delete cart[id];
  saveCart();
  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function openCart() {
  cartOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  cartOverlay.hidden = true;
  document.body.style.overflow = "";
  document.querySelector("#open-cart").focus();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeBrand = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    activeBrand = link.dataset.navFilter;
    filterButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === activeBrand));
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  updateCart(product.id, 1);
  showToast(`${product.name} added to your bag`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) updateCart(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  if (removeButton) updateCart(removeButton.dataset.remove, -(cart[removeButton.dataset.remove] || 0));
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#close-cart-scrim").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Checkout is coming soon. Your bag is saved.");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartOverlay.hidden) closeCart();
});

renderProducts();
renderCart();
if (new URLSearchParams(window.location.search).has("openCart")) openCart();
