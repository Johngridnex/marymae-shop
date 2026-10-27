// ================= EDIT THIS PART =================
const WHATSAPP = "2348135055712"; // country code, no + and no leading 0 (e.g. 2349012345678)
const SHOP = "MARYMAE FABRICS & CLOTHING";

// Put each product photo in "images" and write its file name in "image".
// Leave image empty to use the woven-color artwork until a product photo is ready.
// category must be one of: Ankara, Senator, Lace, Casual
const STARTER_PRODUCTS = [
  { name: "Red Ankara Gown",   price: 25000, category: "Ankara",  sizes: ["S","M","L","XL"], image: "", image_path: null,
    desc: "A stunning Ankara gown with elegant sleeves and a classy slit. Perfect for weddings, parties and special occasions.", color: "#c0392b" },
  { name: "Green Senator Dress", price: 28000, category: "Senator", sizes: ["S","M","L","XL"], image: "", image_path: null,
    desc: "A rich green senator-style dress with a fitted waist and puffed sleeves.", color: "#1e8a6a" },
  { name: "Purple Lace Gown",  price: 32000, category: "Lace",    sizes: ["S","M","L","XL"], image: "", image_path: null,
    desc: "A graceful purple lace gown with an off-shoulder neckline and a flattering fit.", color: "#7b3fa0" },
  { name: "Blue Ankara Dress", price: 20000, category: "Ankara",  sizes: ["S","M","L","XL"], image: "", image_path: null,
    desc: "A bright blue Ankara dress, comfortable and stylish for everyday and events.", color: "#2c5aa0" }
];

const CATEGORIES = [   // tiles under "Shop by Category"
  { label: "Ankara Dresses", filter: "Ankara",  image: "images/cat-ankara.jpg",  color: "#c0392b" },
  { label: "Senator Styles", filter: "Senator", image: "images/cat-senator.jpg", color: "#1e8a6a" },
  { label: "Lace Gowns",     filter: "Lace",    image: "images/cat-lace.jpg",    color: "#d9546f" },
  { label: "Casual Wear",    filter: "Casual",  image: "",  color: "#2c5aa0" }
];
// ===================================================

const $ = id => document.getElementById(id);
const naira = n => "\u20A6" + n.toLocaleString("en-NG");
const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const validColor = color => /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#bd4d67";
const safeImage = image => /^(https:\/\/|images\/)[a-z0-9._/?=&%-]+$/i.test(image || "") ? image : "";
// Shows the photo; if the file is missing, the colour shows instead
const bg = (img, color) => img
  ? `background-image:url('${safeImage(img)}'),linear-gradient(135deg,${validColor(color)},#00000055)`
  : `background-image:radial-gradient(ellipse at 72% 20%,rgba(255,255,255,.45),transparent 32%),repeating-linear-gradient(135deg,rgba(255,255,255,.14) 0 1px,transparent 1px 5px),linear-gradient(135deg,${validColor(color)},#00000055)`;

let PRODUCTS = STARTER_PRODUCTS.map(product => ({ ...product }));
let filter = "All", current = null, size = null;

// floating WhatsApp button
const enquiryLink = waLink(`Hi ${SHOP}, I'd like to make an enquiry.`);
$("waFloat").href = enquiryLink;
$("waHeader").href = enquiryLink;
$("waFooter").href = enquiryLink;

// category tiles
$("catTiles").innerHTML = CATEGORIES.map(c =>
  `<button class="tile" data-f="${c.filter}"><div class="t-img" style="${bg(c.image, c.color)}"></div>${c.label}</button>`).join("");

// filter chips
const chipNames = ["All", "Ankara", "Senator", "Lace", "Casual"];
function drawChips() {
  $("chips").innerHTML = chipNames.map(n =>
    `<button class="chip ${n === filter ? "on" : ""}" data-f="${n}">${n === "Senator" ? "Senator Styles" : n}</button>`).join("");
}

// product grid
function drawGrid() {
  const list = PRODUCTS.filter(p => filter === "All" || p.category === filter);
  $("grid").innerHTML = list.length ? list.map(p => {
    const i = PRODUCTS.indexOf(p);
    return `<article class="card" data-i="${i}">
      <div class="c-img" style="${bg(p.image, p.color)}"><button class="heart-s" aria-label="Save">♡</button></div>
      <div class="c-info"><div class="c-name">${escapeHTML(p.name)}</div><div class="c-price">${naira(p.price)}</div>
      <div class="c-label">Available Sizes</div>
      <div class="sizes">${p.sizes.map(s => `<button data-s="${escapeHTML(s)}">${escapeHTML(s)}</button>`).join("")}</div></div></article>`;
  }).join("") : `<p style="grid-column:1/-1;color:var(--muted)">New styles coming soon.</p>`;
}

function setFilter(f) { filter = f; drawChips(); drawGrid(); }

// product detail
function openDetail(i, preSize) {
  current = PRODUCTS[i]; size = preSize || null;
  $("dImg").style.cssText = bg(current.image, current.color);
  $("dName").textContent = current.name;
  $("dPrice").textContent = naira(current.price);
  $("dDesc").textContent = current.desc;
  $("dSizes").innerHTML = current.sizes.map(s => `<button data-s="${escapeHTML(s)}" class="${s === size ? "on" : ""}">${escapeHTML(s)}</button>`).join("");
  updateOrder();
  $("sheet").hidden = false; $("sheet").scrollTop = 0;
  document.body.style.overflow = "hidden";
}
function closeDetail() { $("sheet").hidden = true; document.body.style.overflow = ""; }
function updateOrder() {
  const b = $("dOrder");
  b.textContent = size ? "Order on WhatsApp" : "Select a size";
  b.classList.toggle("off", !size);
}

// clicks
document.addEventListener("click", e => {
  const t = e.target;
  const tile = t.closest(".tile");
  if (tile) { setFilter(tile.dataset.f); $("shop").scrollIntoView(); return; }
  const chip = t.closest(".chip");
  if (chip) return setFilter(chip.dataset.f);
  const heart = t.closest(".heart-s");
  if (heart) { e.stopPropagation(); heart.textContent = heart.textContent === "♡" ? "♥" : "♡"; return; }
  const card = t.closest(".card");
  if (card) { const sb = t.closest(".sizes button"); openDetail(+card.dataset.i, sb && sb.dataset.s); return; }
  if (t.closest("#dBack")) return closeDetail();
  if (t.closest("#dHeart")) { const h = $("dHeart"); h.textContent = h.textContent === "♡" ? "♥" : "♡"; return; }
  const sb = t.closest("#dSizes button");
  if (sb) { size = sb.dataset.s; [...$("dSizes").children].forEach(b => b.classList.toggle("on", b === sb)); updateOrder(); return; }
  if (t.closest("#dOrder")) {
    if (!size) return;
    window.open(waLink(`Hi ${SHOP}, I want to order: ${current.name}, size ${size} (${naira(current.price)}).`), "_blank");
  }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetail(); });

drawChips(); drawGrid();

const config = window.MARYMAE_SUPABASE || {};
let configured = Boolean(config.url && config.anonKey && window.supabase);
let db = null, signedInUser = null, isAdmin = false;
if (configured) {
  try {
    db = window.supabase.createClient(config.url, config.anonKey);
  } catch (error) {
    configured = false;
    $("setupNotice").hidden = false;
    $("setupNotice").querySelector("p").textContent = `Supabase configuration is invalid: ${error.message}`;
  }
} else if (config.url && config.anonKey) {
  $("setupNotice").hidden = false;
  $("setupNotice").querySelector("p").textContent = "The Supabase JavaScript library could not be loaded. Check your internet connection and reload the page.";
}

function showAdminMessage(message, isError) {
  const box = $("adminMessage");
  box.textContent = message;
  box.classList.toggle("error", Boolean(isError));
  box.hidden = !message;
}

function publicImageUrl(path) {
  if (!path || !db) return "";
  return db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    image_path: row.image_path || null,
    image: publicImageUrl(row.image_path),
    desc: row.description || "",
    color: validColor(row.color)
  };
}

async function loadStoreProducts() {
  if (!configured) return;
  const { data, error } = await db.from("products").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Unable to load products from Supabase:", error.message);
    $("shopStatus").textContent = "We couldn't refresh the product list. Please try again later.";
    $("shopStatus").hidden = false;
    return;
  }
  PRODUCTS = data.map(normalizeProduct);
  drawGrid();
  $("shopStatus").hidden = data.length > 0;
  $("shopStatus").textContent = data.length ? "" : "No products are available right now.";
}

function routeToAdmin() {
  const showAdmin = window.location.hash === "#admin";
  $("adminView").hidden = !showAdmin;
  $("app").hidden = showAdmin;
  $("waFloat").hidden = showAdmin;
  document.body.classList.toggle("admin-open", showAdmin);
  if (showAdmin) window.scrollTo(0, 0);
}

async function refreshAdminProducts() {
  if (!db || !isAdmin) return;
  showAdminMessage("Loading products…", false);
  const { data, error } = await db.from("products").select("*").order("created_at", { ascending: false });
  if (error) {
    showAdminMessage(`Could not load products: ${error.message}`, true);
    return;
  }
  PRODUCTS = data.map(normalizeProduct);
  drawGrid();
  renderAdminProducts();
  showAdminMessage("", false);
}

function renderAdminProducts() {
  const list = $("adminProductList");
  if (!PRODUCTS.length) {
    list.innerHTML = '<p class="admin-empty">No products yet. Add your first product above.</p>';
    return;
  }
  list.innerHTML = PRODUCTS.map((product, index) => `
    <article class="admin-product">
      <div class="admin-product-image" style="${bg(product.image, product.color)}" aria-hidden="true"></div>
      <div class="admin-product-copy">
        <strong>${escapeHTML(product.name)}</strong>
        <span>${escapeHTML(product.category)} · ${naira(product.price)} · ${product.sizes.map(escapeHTML).join(", ")}</span>
      </div>
      <div class="admin-product-actions">
        <button class="admin-button secondary edit-product" type="button" data-index="${index}">Edit</button>
        <button class="admin-button danger delete-product" type="button" data-id="${escapeHTML(product.id)}">Delete</button>
      </div>
    </article>`).join("");
}

function showSignedInState(user) {
  signedInUser = user;
  $("loginForm").hidden = Boolean(user) && isAdmin;
  $("adminDashboard").hidden = !user || !isAdmin;
  $("adminWelcome").textContent = user ? `Signed in as ${user.email}` : "";
  if (!user) {
    isAdmin = false;
    showAdminMessage("", false);
  }
}

async function verifyAdmin(user) {
  isAdmin = false;
  showSignedInState(user);
  const { data, error } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) {
    showAdminMessage(`Could not verify admin access: ${error.message}`, true);
    return;
  }
  isAdmin = Boolean(data);
  showSignedInState(user);
  if (!isAdmin) {
    showAdminMessage("This account does not have boutique admin access. Ask the project owner to add it in Supabase.", true);
    return;
  }
  await refreshAdminProducts();
}

function resetProductForm() {
  $("productForm").reset();
  $("productForm").elements.id.value = "";
  $("productForm").elements.image_path.value = "";
  $("productForm").elements.color.value = "#bd4d67";
  $("productFormTitle").textContent = "Add a product";
  $("saveProductButton").textContent = "Add product";
  $("cancelEditButton").hidden = true;
}

if (!configured) {
  $("setupNotice").hidden = false;
  $("loginForm").hidden = true;
} else {
  loadStoreProducts();
  db.auth.getSession().then(({ data, error }) => {
    if (error) {
      showAdminMessage(`Could not check your sign-in: ${error.message}`, true);
      return;
    }
    if (data.session) verifyAdmin(data.session.user);
  });
  db.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      if (session) verifyAdmin(session.user);
      else showSignedInState(null);
    }, 0);
  });
}

window.addEventListener("hashchange", routeToAdmin);
routeToAdmin();

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!db) return;
  const form = new FormData(event.currentTarget);
  const { error } = await db.auth.signInWithPassword({
    email: form.get("email"),
    password: form.get("password")
  });
  if (error) showAdminMessage(`Sign-in failed: ${error.message}`, true);
});

$("logoutButton").addEventListener("click", async () => {
  const { error } = await db.auth.signOut();
  if (error) showAdminMessage(`Could not sign out: ${error.message}`, true);
});

$("cancelEditButton").addEventListener("click", resetProductForm);

$("productForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!db || !isAdmin) return;
  const form = event.currentTarget;
  const fields = new FormData(form);
  const file = fields.get("image");
  const oldImagePath = fields.get("image_path") || null;
  let imagePath = oldImagePath;
  let uploadedPath = null;
  let productSaved = false;
  const saveButton = $("saveProductButton");
  saveButton.disabled = true;
  showAdminMessage("Saving product…", false);
  try {
    if (file instanceof File && file.size) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
        throw new Error("Choose a JPG, PNG, or WebP photo smaller than 5 MB.");
      }
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      imagePath = `${signedInUser.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await db.storage.from("product-images").upload(imagePath, file, { upsert: false });
      if (error) throw error;
      uploadedPath = imagePath;
    }
    const product = {
      name: String(fields.get("name")).trim(),
      price: Number(fields.get("price")),
      category: fields.get("category"),
      sizes: String(fields.get("sizes")).split(",").map(value => value.trim()).filter(Boolean),
      description: String(fields.get("description")).trim(),
      color: validColor(fields.get("color")),
      image_path: imagePath
    };
    if (!product.name || !product.price || !product.sizes.length || !product.description) {
      throw new Error("Please complete all required product details.");
    }
    const productId = fields.get("id");
    const query = productId
      ? db.from("products").update(product).eq("id", productId)
      : db.from("products").insert(product);
    const { error } = await query;
    if (error) throw error;
    productSaved = true;
    resetProductForm();
    await refreshAdminProducts();
    if (oldImagePath && imagePath !== oldImagePath) {
      const { error: removeError } = await db.storage.from("product-images").remove([oldImagePath]);
      if (removeError) showAdminMessage(`Product saved, but its previous photo could not be removed: ${removeError.message}`, true);
    }
  } catch (error) {
    if (uploadedPath && !productSaved) {
      const { error: cleanupError } = await db.storage.from("product-images").remove([uploadedPath]);
      if (cleanupError) console.error("Could not clean up an unused product photo:", cleanupError.message);
    }
    showAdminMessage(`Could not save product: ${error.message}`, true);
  } finally {
    saveButton.disabled = false;
  }
});

$("adminProductList").addEventListener("click", async event => {
  const editButton = event.target.closest(".edit-product");
  if (editButton) {
    const product = PRODUCTS[Number(editButton.dataset.index)];
    const form = $("productForm");
    form.elements.id.value = product.id;
    form.elements.image_path.value = product.image_path || "";
    form.elements.name.value = product.name;
    form.elements.price.value = product.price;
    form.elements.category.value = product.category;
    form.elements.sizes.value = product.sizes.join(", ");
    form.elements.description.value = product.desc;
    form.elements.color.value = product.color;
    $("productFormTitle").textContent = "Edit product";
    $("saveProductButton").textContent = "Save changes";
    $("cancelEditButton").hidden = false;
    form.scrollIntoView({ behavior: "smooth" });
    return;
  }
  const deleteButton = event.target.closest(".delete-product");
  if (!deleteButton || !window.confirm("Delete this product from the shop?")) return;
  const product = PRODUCTS.find(item => item.id === deleteButton.dataset.id);
  const { error } = await db.from("products").delete().eq("id", deleteButton.dataset.id);
  if (error) {
    showAdminMessage(`Could not delete product: ${error.message}`, true);
    return;
  }
  await refreshAdminProducts();
  if (product && product.image_path) {
    const { error: removeError } = await db.storage.from("product-images").remove([product.image_path]);
    if (removeError) showAdminMessage(`Product deleted, but its photo could not be removed: ${removeError.message}`, true);
  }
});