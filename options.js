document.addEventListener('DOMContentLoaded', () => {
  const openShortcutInput = document.getElementById('open-shortcut');
  const setOpenShortcutBtn = document.getElementById('set-open-shortcut');
  const resetOpenShortcutBtn = document.getElementById('reset-open-shortcut');
  const statusMessage = document.getElementById('status-message');
  const captureHint = document.getElementById('capture-hint');

  const COMMAND_NAME = '_execute_action';
  const DEFAULT_SHORTCUT = 'Ctrl+Shift+O';
  const BLOCKED_KEYS = ['Escape', 'Tab', 'Meta', 'Control', 'Alt', 'Shift'];

  let capturing = false;
  let keyHandler = null;

  function showStatus(msg, isError) {
    if (!statusMessage) return;
    statusMessage.textContent = msg;
    statusMessage.classList.add('show');
    statusMessage.classList.toggle('error', !!isError);
    setTimeout(() => {
      statusMessage.classList.remove('show');
      statusMessage.classList.remove('error');
    }, 2500);
  }

  function loadCurrentShortcut() {
    if (!openShortcutInput) return;
    if (!chrome.commands || !chrome.commands.getAll) {
      openShortcutInput.value = DEFAULT_SHORTCUT;
      return;
    }
    chrome.commands.getAll((commands) => {
      const command = commands.find((item) => item.name === COMMAND_NAME);
      openShortcutInput.value = command && command.shortcut
        ? command.shortcut
        : DEFAULT_SHORTCUT;
    });
  }

  function stopCapture() {
    capturing = false;
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    openShortcutInput.readOnly = true;
    openShortcutInput.blur();
    if (captureHint) captureHint.hidden = true;
    if (setOpenShortcutBtn) setOpenShortcutBtn.textContent = 'Set Shortcut';
  }

  function applyShortcut(shortcut) {
    if (!chrome.commands || !chrome.commands.update) {
      showStatus('Shortcuts can only be changed at chrome://extensions/shortcuts', true);
      stopCapture();
      return;
    }

    chrome.commands.update({ name: COMMAND_NAME, shortcut: shortcut }, () => {
      if (chrome.runtime.lastError) {
        showStatus(chrome.runtime.lastError.message, true);
        loadCurrentShortcut();
        stopCapture();
        return;
      }
      openShortcutInput.value = shortcut;
      showStatus('Shortcut updated');
      stopCapture();
    });
  }

  function startCapture() {
    if (capturing) {
      stopCapture();
      loadCurrentShortcut();
      return;
    }

    capturing = true;
    openShortcutInput.readOnly = false;
    openShortcutInput.value = '';
    openShortcutInput.focus();
    if (captureHint) captureHint.hidden = false;
    if (setOpenShortcutBtn) setOpenShortcutBtn.textContent = 'Cancel';

    keyHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        stopCapture();
        loadCurrentShortcut();
        showStatus('Shortcut change cancelled');
        return;
      }

      if (BLOCKED_KEYS.includes(e.key) || e.key.length === 0) {
        return;
      }

      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      if (!hasModifier) {
        showStatus('Use Ctrl, Command, or Alt plus a key', true);
        return;
      }

      let shortcut = '';
      if (e.ctrlKey) shortcut += 'Ctrl+';
      if (e.metaKey) shortcut += 'Command+';
      if (e.altKey) shortcut += 'Alt+';
      if (e.shiftKey) shortcut += 'Shift+';

      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (keyName.length === 1) keyName = keyName.toUpperCase();

      if (!/^[A-Z0-9]$/.test(keyName) &&
          !keyName.startsWith('F') &&
          !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Home', 'End', 'PageUp', 'PageDown'].includes(keyName)) {
        showStatus('That key cannot be used as a shortcut', true);
        return;
      }

      shortcut += keyName;
      applyShortcut(shortcut);
    };

    document.addEventListener('keydown', keyHandler, true);
  }

  if (setOpenShortcutBtn) {
    setOpenShortcutBtn.addEventListener('click', startCapture);
  }

  if (resetOpenShortcutBtn) {
    resetOpenShortcutBtn.addEventListener('click', () => {
      stopCapture();
      if (!chrome.commands || !chrome.commands.reset) {
        showStatus('Shortcuts can only be reset at chrome://extensions/shortcuts', true);
        return;
      }
      chrome.commands.reset(COMMAND_NAME, () => {
        if (chrome.runtime.lastError) {
          showStatus(chrome.runtime.lastError.message, true);
          return;
        }
        loadCurrentShortcut();
        showStatus('Shortcut reset to default');
      });
    });
  }

  window.addEventListener('blur', () => {
    if (capturing) {
      stopCapture();
      loadCurrentShortcut();
    }
  });

  loadCurrentShortcut();
});
