const productPage = document.querySelector("[data-product-id]");
const addToBagButton = document.querySelector("#add-to-bag");
const bagStatus = document.querySelector("#bag-status");
const viewBagLink = document.querySelector("#view-bag");

addToBagButton.addEventListener("click", () => {
  const productId = productPage.dataset.productId;

  try {
    const serialized = localStorage.getItem("forme-cart");
    const cart = serialized ? JSON.parse(serialized) : {};
    if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
      throw new TypeError("Saved bag data has an unexpected format.");
    }

    const quantity = cart[productId] || 0;
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new TypeError("Saved bag quantity is invalid.");
    }

    cart[productId] = quantity + 1;
    localStorage.setItem("forme-cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Could not add this phone to the bag.", error);
    bagStatus.textContent = "We couldn't update your bag. Please try again.";
    return;
  }

  bagStatus.textContent = "Added to your bag.";
  viewBagLink.hidden = false;
});
