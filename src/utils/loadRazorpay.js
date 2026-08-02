const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let razorpayLoaderPromise =
  null;

/* =====================================
   Load Razorpay Checkout SDK
===================================== */

export const loadRazorpayCheckout =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return Promise.resolve(
        false
      );
    }

    if (window.Razorpay) {
      return Promise.resolve(
        true
      );
    }

    if (
      razorpayLoaderPromise
    ) {
      return razorpayLoaderPromise;
    }

    razorpayLoaderPromise =
      new Promise(
        (
          resolve,
          reject
        ) => {
          const existingScript =
            document.querySelector(
              `script[src="${RAZORPAY_SCRIPT_URL}"]`
            );

          if (existingScript) {
            const handleLoad =
              () => {
                if (
                  window.Razorpay
                ) {
                  resolve(true);
                } else {
                  reject(
                    new Error(
                      "Razorpay Checkout loaded incorrectly."
                    )
                  );
                }
              };

            const handleError =
              () => {
                razorpayLoaderPromise =
                  null;

                reject(
                  new Error(
                    "Unable to load Razorpay Checkout."
                  )
                );
              };

            existingScript.addEventListener(
              "load",
              handleLoad,
              {
                once: true,
              }
            );

            existingScript.addEventListener(
              "error",
              handleError,
              {
                once: true,
              }
            );

            return;
          }

          const script =
            document.createElement(
              "script"
            );

          script.src =
            RAZORPAY_SCRIPT_URL;

          script.async = true;

          script.onload =
            () => {
              if (
                window.Razorpay
              ) {
                resolve(true);
              } else {
                razorpayLoaderPromise =
                  null;

                reject(
                  new Error(
                    "Razorpay Checkout loaded incorrectly."
                  )
                );
              }
            };

          script.onerror =
            () => {
              razorpayLoaderPromise =
                null;

              reject(
                new Error(
                  "Unable to load Razorpay Checkout. Check your internet connection."
                )
              );
            };

          document.body.appendChild(
            script
          );
        }
      );

    return razorpayLoaderPromise;
  };

export default loadRazorpayCheckout;