import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

const defaultMetadata = {
  title:
    "Hogenakkal Home Stays | Book Trusted Stays Near Hogenakkal Falls",

  description:
    "Discover and book trusted homestays, cottages and resorts near Hogenakkal Falls with Hogenakkal Home Stays.",
};

const routeMetadata = {
  "/": {
    title:
      "Hogenakkal Home Stays | Stays Near Hogenakkal Falls",

    description:
      "Explore trusted homestays, cottages and resorts near Hogenakkal Falls.",
  },

  "/explore": {
    title:
      "Explore Hogenakkal Stays | Hogenakkal Home Stays",

    description:
      "Browse homestays, cottages and resorts near Hogenakkal Falls.",
  },

  "/about": {
    title:
      "About Us | Hogenakkal Home Stays",

    description:
      "Learn about Hogenakkal Home Stays and our mission to provide trusted local accommodation.",
  },

  "/contact": {
    title:
      "Contact Us | Hogenakkal Home Stays",

    description:
      "Contact Hogenakkal Home Stays for booking assistance, property listings and customer support.",
  },

  "/login": {
    title:
      "Login | Hogenakkal Home Stays",

    description:
      "Log in to manage your Hogenakkal Home Stays bookings, properties and account.",
  },

  "/register": {
    title:
      "Create Account | Hogenakkal Home Stays",

    description:
      "Create your Hogenakkal Home Stays account and start exploring trusted accommodation.",
  },

  "/bookings": {
    title:
      "My Bookings | Hogenakkal Home Stays",

    description:
      "View and manage your Hogenakkal Home Stays reservations.",
  },

  "/saved-properties": {
    title:
      "Saved Properties | Hogenakkal Home Stays",

    description:
      "View the Hogenakkal properties you have saved for later.",
  },

  "/profile": {
    title:
      "My Profile | Hogenakkal Home Stays",

    description:
      "Manage your Hogenakkal Home Stays profile and account information.",
  },

  "/support-tickets": {
    title:
      "Support Tickets | Hogenakkal Home Stays",

    description:
      "Create and manage your Hogenakkal Home Stays support requests.",
  },

  "/owner": {
    title:
      "Owner Dashboard | Hogenakkal Home Stays",

    description:
      "Manage your properties, bookings, reviews and earnings from the HHS Owner Centre.",
  },

  "/owner/properties": {
    title:
      "My Properties | Hogenakkal Home Stays",

    description:
      "View and manage properties listed through the HHS Owner Centre.",
  },

  "/owner/bookings": {
    title:
      "Property Bookings | Hogenakkal Home Stays",

    description:
      "Manage reservations made for your Hogenakkal properties.",
  },

  "/owner/reviews": {
    title:
      "Property Reviews | Hogenakkal Home Stays",

    description:
      "View and respond to guest reviews for your properties.",
  },

  "/owner/payout-settings": {
    title:
      "Payout Settings | Hogenakkal Home Stays",

    description:
      "Manage your property payout account and verification information.",
  },

  "/add-property": {
    title:
      "Add Property | Hogenakkal Home Stays",

    description:
      "Submit your homestay, cottage or resort for listing on Hogenakkal Home Stays.",
  },

  "/super-admin": {
    title:
      "Super Admin Dashboard | HHS",

    description:
      "Hogenakkal Home Stays administration and platform management dashboard.",
  },

  "/terms-and-conditions": {
    title:
      "Terms and Conditions | Hogenakkal Home Stays",

    description:
      "Read the terms and conditions governing the use of Hogenakkal Home Stays.",
  },

  "/privacy-policy": {
    title:
      "Privacy Policy | Hogenakkal Home Stays",

    description:
      "Learn how Hogenakkal Home Stays collects, uses and protects personal information.",
  },

  "/cancellation-refund-policy": {
    title:
      "Cancellation and Refund Policy | Hogenakkal Home Stays",

    description:
      "Read the booking cancellation and refund terms for Hogenakkal Home Stays.",
  },

  "/service-delivery-policy": {
    title:
      "Service Delivery Policy | Hogenakkal Home Stays",

    description:
      "Learn how booking confirmations and accommodation services are delivered.",
  },
};

const getPageMetadata = (
  pathname
) => {
  if (
    pathname.startsWith(
      "/property/"
    )
  ) {
    return {
      title:
        "Property Details | Hogenakkal Home Stays",

      description:
        "View property facilities, amenities, guest reviews, availability and booking information.",
    };
  }

  if (
    pathname.startsWith(
      "/booking/"
    )
  ) {
    return {
      title:
        "Booking Details | Hogenakkal Home Stays",

      description:
        "View your Hogenakkal Home Stays booking and payment information.",
    };
  }

  if (
    pathname.startsWith(
      "/super-admin/"
    )
  ) {
    return {
      title:
        "Administration | Hogenakkal Home Stays",

      description:
        "Hogenakkal Home Stays platform administration and management.",
    };
  }

  return (
    routeMetadata[pathname] ||
    defaultMetadata
  );
};

function App() {
  const location =
    useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    const metadata =
      getPageMetadata(
        location.pathname
      );

    document.title =
      metadata.title;

    let descriptionTag =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!descriptionTag) {
      descriptionTag =
        document.createElement(
          "meta"
        );

      descriptionTag.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        descriptionTag
      );
    }

    descriptionTag.setAttribute(
      "content",
      metadata.description
    );

    document.documentElement.setAttribute(
      "lang",
      "en"
    );
  }, [location.pathname]);

  return <AppRoutes />;
}

export default App;