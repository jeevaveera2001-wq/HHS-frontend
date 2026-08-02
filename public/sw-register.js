(() => {
  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    return;
  }

  const localHosts = [
    "localhost",
    "127.0.0.1",
  ];

  const isLocalhost =
    localHosts.includes(
      window.location.hostname
    );

  const query =
    new URLSearchParams(
      window.location.search
    );

  const localTestingEnabled =
    query.get("pwa") === "1";

  const secureContext =
    window.location.protocol ===
      "https:" ||
    isLocalhost;

  const shouldRegister =
    secureContext &&
    (
      !isLocalhost ||
      localTestingEnabled
    );

  if (!shouldRegister) {
    return;
  }

  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator
            .serviceWorker
            .register(
              "/sw.js",
              {
                scope: "/",
              }
            );

        console.log(
          "HHS service worker registered:",
          registration.scope
        );
      } catch (error) {
        console.error(
          "HHS service worker registration failed:",
          error
        );
      }
    }
  );
})();