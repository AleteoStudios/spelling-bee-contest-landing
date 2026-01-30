const API_BASE = 'https://spelling-bee-contest-backend.vercel.app';
let selectedPackageId = null;

function getBadgeLabel(pkg) {
    if (pkg.id === 'PAQ1') return 'Mensual';
    if (pkg.id === 'PAQ2') return 'Anual';
    if (pkg.id === 'PAQ3') return 'Perpetua';
    return 'Licencia';
}

function getDurationLabel(pkg) {
    if (!pkg.duration_days) return 'Vigencia: Perpetua';
    if (pkg.duration_days === 30) return 'Vigencia: 30 días';
    if (pkg.duration_days >= 360) return 'Vigencia: 1 año';
    return 'Vigencia: ' + pkg.duration_days + ' días';
}

function formatPriceMXN(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
    }).format(value || 0);
}

// Abre el modal de compra
function openPurchaseModal(packageId, packageName) {
    selectedPackageId = packageId;
    const modal = document.getElementById('purchase-modal');
    const title = document.getElementById('modal-title');
    const emailInput = document.getElementById('purchase-email');

    if (!modal || !title || !emailInput) return;

    title.textContent = 'Comprar: ' + packageName;
    emailInput.value = '';
    modal.classList.remove('hidden');
    emailInput.focus();
}

// Carga los paquetes desde el backend
async function loadPackages() {
    const container = document.getElementById('plans-container');
    if (!container) return;

    container.innerHTML = '<p style="color:#9ca3af;font-size:.85rem;">Cargando paquetes de licenciamiento…</p>';

    try {
        const res = await fetch(`${API_BASE}/api/packages`);
        const json = await res.json();

        if (!json.ok) {
            console.error('Error al cargar paquetes:', json.error);
            container.innerHTML =
                '<p style="color:#f87171;font-size:.85rem;">Ocurrió un error al cargar los paquetes. Intenta más tarde.</p>';
            return;
        }

        const packages = json.packages || [];
        container.innerHTML = '';

        packages.forEach((pkg) => {
            const card = document.createElement('article');
            card.className = 'plan-card';

            const badge = document.createElement('span');
            badge.className = 'plan-badge';
            badge.textContent = getBadgeLabel(pkg);

            const title = document.createElement('h3');
            title.className = 'plan-title';
            title.textContent = pkg.name;

            const desc = document.createElement('p');
            desc.className = 'plan-desc';
            desc.textContent =
                'Incluye acceso al módulo de docentes, control de rondas y listas de palabras configurables.';

            const price = document.createElement('p');
            price.className = 'plan-price';
            price.textContent = formatPriceMXN(pkg.price_mxn);

            const meta = document.createElement('p');
            meta.className = 'plan-meta';
            meta.textContent = getDurationLabel(pkg);

            const footer = document.createElement('div');
            footer.className = 'plan-footer';

            const btn = document.createElement('button');
            btn.className = 'plan-button';
            btn.textContent = 'Comprar';
            btn.dataset.packageId = pkg.id;

            btn.addEventListener('click', () => {
                openPurchaseModal(pkg.id, pkg.name);
            });

            footer.appendChild(btn);
            card.appendChild(badge);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(price);
            card.appendChild(meta);
            card.appendChild(footer);

            container.appendChild(card);
        });

        if (packages.length === 0) {
            container.innerHTML =
                '<p style="color:#9ca3af;font-size:.85rem;">Por el momento no hay paquetes configurados.</p>';
        }
    } catch (err) {
        console.error('Error inesperado cargando paquetes:', err);
        container.innerHTML =
            '<p style="color:#f87171;font-size:.85rem;">Ocurrió un error al cargar los paquetes. Intenta más tarde.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Eventos del modal
    const modal = document.getElementById('purchase-modal');
    const btnClose = document.getElementById('close-modal');
    const btnConfirm = document.getElementById('confirm-purchase');

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            const emailInput = document.getElementById('purchase-email');
            const email = emailInput.value.trim();

            if (!email) {
                alert('Por favor ingresa un correo válido.');
                emailInput.focus();
                return;
            }

            try {
                const res = await fetch(
                    `${API_BASE}/api/checkout-test?package_id=${encodeURIComponent(
                        selectedPackageId
                    )}&email=${encodeURIComponent(email)}`
                );
                const data = await res.json();

                if (!data.ok) {
                    alert('Ocurrió un error al iniciar el pago.');
                    return;
                }

                // Aquí luego se reemplazará por la URL real de Mercado Pago
                window.location.href = data.fake_payment_url;
            } catch (err) {
                console.error(err);
                alert('Error inesperado al iniciar el pago.');
            }
        });
    }

    // Cargar planes
    loadPackages();
});
