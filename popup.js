const environments = [
  {
    name: 'Development',
    topLevelDomain: 'me',
    protocol: 'http:',
    port: '8080',
    indicator: '🔧'
  },
  {
    name: 'Production',
    topLevelDomain: 'com',
    protocol: 'https:',
    port: '',
    indicator: '🚀'
  }
];

async function initializePopup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const buttonContainer = document.getElementById('environmentButtons');
  const errorMessage = document.getElementById('errorMessage');

  try {
    const currentUrl = new URL(tab.url);
    const currentEnvIndex = environments.findIndex(env => currentUrl.hostname.includes(env.topLevelDomain));

    environments.forEach((env, index) => {
      const button = document.createElement('button');
      button.className = `environment-button ${index === currentEnvIndex ? 'active' : ''}`;
      button.innerHTML = `
        <span>${env.name}</span>
        <span>${env.indicator}</span>
      `;
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          window.currentEnv = env;
          await switchToEnvironment(tab, currentUrl, env);
          // Update active state of buttons
          document.querySelectorAll('.environment-button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
          });
        } catch (err) {
          alert('Failed to switch environment:', err);
          const errorMessage = document.getElementById('errorMessage');
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Failed to switch environment';
        }
      });
      buttonContainer.appendChild(button);
    });

    // Show keyboard shortcut
    const isMac = navigator.platform.includes('Mac');
    document.getElementById('shortcutKey').textContent =
      isMac ? '⌘ + Shift + S' : 'Ctrl + Shift + S';

  } catch (error) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Invalid URL or unsupported environment';
  }
}

async function switchToEnvironment(tab, currentUrl, targetEnv) {
  try {
    const host = currentUrl.host
    const topLevelDomain = host.split(".")[2]
    const newUrl = new URL(currentUrl.toString());
    // Find current environment to replace its topLevelDomain
    const currentEnv = environments.find(env => topLevelDomain.includes(env.topLevelDomain));

    if (currentEnv) {
      if (currentEnv.name != targetEnv.name) {
        newUrl.host = newUrl.host.replace(currentEnv.topLevelDomain, targetEnv.topLevelDomain)
        newUrl.hostname = newUrl.hostname.replace(currentEnv.topLevelDomain, targetEnv.topLevelDomain);
        newUrl.port = targetEnv.port
        newUrl.origin = newUrl.origin.replace(currentEnv.topLevelDomain, targetEnv.topLevelDomain);
        newUrl.protocol = targetEnv.protocol;
        await chrome.tabs.update(tab.id, { url: newUrl.toString() });
        window.close(); // Close popup after switching
      }
    } else {
      alert('no env');
    }
  } catch (error) {
    console.log(error);
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Error switching environment!';
  }
}

initializePopup();
