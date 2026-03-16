export function SettingsModal(onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100';

    const modal = document.createElement('div');
    modal.className = 'bg-card p-6 rounded-xl border border-border-color w-96 glass';
    modal.style.background = 'var(--bg-card)';
    modal.style.padding = '1.5rem';
    modal.style.borderRadius = 'var(--border-radius-xl)';
    modal.style.border = '1px solid var(--border-color)';
    modal.style.width = '24rem';

    const title = document.createElement('h2');
    title.textContent = 'Settings';
    title.className = 'text-xl font-bold mb-4';
    title.style.marginBottom = '1rem';

    // --- API Mode Toggle ---
    const modeContainer = document.createElement('div');
    modeContainer.style.marginBottom = '1rem';
    modeContainer.style.padding = '0.75rem';
    modeContainer.style.borderRadius = '0.5rem';
    modeContainer.style.border = '1px solid var(--border-color)';
    modeContainer.style.background = 'rgba(255,255,255,0.03)';

    const modeLabel = document.createElement('label');
    modeLabel.textContent = 'API Mode';
    modeLabel.className = 'block text-sm text-secondary mb-2';
    modeLabel.style.marginBottom = '0.5rem';
    modeLabel.style.fontSize = '0.875rem';

    const modeSelect = document.createElement('select');
    modeSelect.style.width = '100%';
    modeSelect.style.padding = '0.5rem';
    modeSelect.style.borderRadius = '0.375rem';
    modeSelect.style.border = '1px solid var(--border-color)';
    modeSelect.style.background = 'var(--bg-card)';
    modeSelect.style.color = 'inherit';

    const optExternal = document.createElement('option');
    optExternal.value = 'external';
    optExternal.textContent = 'External API (Muapi.ai)';
    const optInternal = document.createElement('option');
    optInternal.value = 'internal';
    optInternal.textContent = 'Internal API (Kaidol resource-gen)';
    modeSelect.appendChild(optExternal);
    modeSelect.appendChild(optInternal);
    modeSelect.value = localStorage.getItem('api_mode') || 'external';

    const internalUrlContainer = document.createElement('div');
    internalUrlContainer.style.marginTop = '0.5rem';
    internalUrlContainer.style.display = modeSelect.value === 'internal' ? 'block' : 'none';

    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Resource-gen URL';
    urlLabel.style.fontSize = '0.75rem';
    urlLabel.style.color = 'var(--text-secondary)';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.style.width = '100%';
    urlInput.style.padding = '0.5rem';
    urlInput.style.marginTop = '0.25rem';
    urlInput.style.borderRadius = '0.375rem';
    urlInput.style.border = '1px solid var(--border-color)';
    urlInput.style.background = 'var(--bg-card)';
    urlInput.style.color = 'inherit';
    urlInput.value = localStorage.getItem('kaidol_api_url') || 'http://localhost:8000';
    urlInput.placeholder = 'http://localhost:8000';

    internalUrlContainer.appendChild(urlLabel);
    internalUrlContainer.appendChild(urlInput);

    modeSelect.onchange = () => {
        internalUrlContainer.style.display = modeSelect.value === 'internal' ? 'block' : 'none';
    };

    modeContainer.appendChild(modeLabel);
    modeContainer.appendChild(modeSelect);
    modeContainer.appendChild(internalUrlContainer);

    // --- Muapi API Key ---
    const label = document.createElement('label');
    label.textContent = 'Muapi API Key';
    label.className = 'block text-sm text-secondary mb-2';

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'w-full mb-4 p-2 rounded bg-input border border-border-color';
    input.value = localStorage.getItem('muapi_key') || '';
    input.placeholder = 'sk-...';
    input.style.width = '100%';
    input.style.marginBottom = '1rem';

    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex justify-end gap-2';
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'flex-end';
    btnContainer.style.gap = '0.5rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'px-4 py-2 rounded hover:bg-white/5';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    };

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'px-4 py-2 rounded bg-primary text-black font-medium';
    saveBtn.style.backgroundColor = 'var(--color-primary)';
    saveBtn.style.color = 'black';
    saveBtn.style.fontWeight = '500';

    saveBtn.onclick = () => {
        const mode = modeSelect.value;
        localStorage.setItem('api_mode', mode);

        if (mode === 'internal') {
            const url = urlInput.value.trim();
            if (url) {
                localStorage.setItem('kaidol_api_url', url);
            }
            alert('Internal API mode saved!');
            document.body.removeChild(overlay);
            if (onClose) onClose();
            window.location.reload();
        } else {
            const key = input.value.trim();
            if (key) {
                localStorage.setItem('muapi_key', key);
                alert('API Key saved!');
                document.body.removeChild(overlay);
                if (onClose) onClose();
            } else {
                alert('Please enter a valid key');
            }
        }
    };

    modal.appendChild(title);
    modal.appendChild(modeContainer);
    modal.appendChild(label);
    modal.appendChild(input);

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(saveBtn);
    modal.appendChild(btnContainer);

    overlay.appendChild(modal);

    // Close on outside click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onClose) onClose();
        }
    });

    return overlay;
}
