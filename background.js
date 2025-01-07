chrome.commands.onCommand.addListener((command) => {
  if (command === "switch-environment") {
    switchEnvironment();
    console.log('command found');
  } else {
    console.log('command not found');
  }
});

async function switchEnvironment() {
  console.log('switchEnvironment');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  try {
    const url = new URL(tab.url);
    const newUrl = getNextEnvironmentUrl(url);
    if (newUrl) {
      chrome.tabs.update(tab.id, { url: newUrl.toString() });
    }
  } catch (error) {
    console.error('Error switching environment:', error);
  }
}

function getNextEnvironmentUrl(currentUrl) {
  const environments = [
    {
      name: 'Development',
      topLevelDomain: 'me',
      port: '8080',
      protocol: 'http:',
      indicator: '🔧'
    },
    {
      name: 'Production',
      topLevelDomain: 'com',
      port: '',
      protocol: 'https:',
      indicator: '🚀'
    }
  ];

  const currentEnvIndex = environments.findIndex(env => currentUrl.hostname.includes(env.topLevelDomain));

  alert(currentEnvIndex);

  if (currentEnvIndex === -1) return null;

  const nextEnvIndex = (currentEnvIndex + 1) % environments.length;
  const nextEnv = environments[nextEnvIndex];

  const newUrl = new URL(currentUrl.toString());
  newUrl.hostname = currentUrl.hostname.replace(
    environments[currentEnvIndex].topLevelDomain,
    nextEnv.topLevelDomain
  );
  newUrl.protocol = nextEnv.protocol;

  return newUrl;
}
